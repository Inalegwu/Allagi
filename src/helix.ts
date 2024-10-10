import { Args, Command } from "@effect/cli";
import { Schema } from "@effect/schema";
import { Array, Data, Effect } from "effect";
import { JSONClient } from "./parser/json";
import { HelixTheme } from "./schema.hx";
import { VSCodeTheme } from "./schema.vs";
import { convertHexToRGB, determineColorSpace } from "./utils";
import { TomlClient } from "./parser/toml";

class HelixError extends Data.TaggedError("helix-error")<{
	cause: unknown;
}> {}

const inputPath = Args.path({
	name: "Theme Path",
});

const helix = Command.make("helix", { inputPath }, ({ inputPath }) =>
	Effect.gen(function* () {
		const json = yield* JSONClient;
		const toml = yield* TomlClient;
		yield* Effect.logInfo(`Attempting to Convert ${inputPath} to Helix Theme`);
		const file = yield* Effect.tryPromise(() => Bun.file(inputPath).text());

		yield* Effect.logInfo("Reading Theme File");
		const vscodeSchema = yield* Schema.decodeUnknown(VSCodeTheme)(
			JSON.parse(file),
			{
				onExcessProperty: "ignore",
			},
		);

		yield* Effect.logInfo(
			`Converting ${vscodeSchema.name} by ${vscodeSchema.author}`,
		);

		yield* Effect.logInfo("Discovering Palette");
		const palette = Array.fromRecord(vscodeSchema.colors)
			.map((v) => ({
				key: v[0],
				rgb: convertHexToRGB(v[1]),
				hex: v[1],
			}))
			.map(
				(value) =>
					({
						key: value.key,
						rgb: value.rgb,
						hex: value.hex,
						colorSpace: determineColorSpace({ ...value.rgb }),
					}) as const,
			);

		const reds = palette.filter((a) => a.colorSpace === "red");
		const blues = palette.filter((a) => a.colorSpace === "blue");
		const greens = palette.filter((a) => a.colorSpace === "green");
		const grays = palette.filter((a) => a.colorSpace === "gray");

		const red = reds.reduce((prev, next) =>
			prev.rgb.r < next.rgb.r ? next : prev,
		);
		const green = greens.reduce((prev, next) =>
			prev.rgb.g < next.rgb.g ? next : prev,
		);
		const blue = reds.reduce((prev, next) =>
			prev.rgb.b < next.rgb.b ? next : prev,
		);

		const foregroundColor = palette.find(
			(color) => color.key === "editor.foreground",
		);
		const backgroundColor = palette.find(
			(color) => color.key === "editor.background",
		);

		yield* Effect.logInfo("Successfully Discovered Palette");

		yield* Effect.logInfo(
			`Preparing to convert and save to ${vscodeSchema.name.toLowerCase().split(" ").join("_")}.toml`,
		);

		const scopes = vscodeSchema.tokenColors
			.map((token) => {
				if (typeof token.scope === "string") {
					return {
						[token.scope]: token.settings,
					};
				}

				if (Array.isArray(token.scope)) {
					return {
						null: "void",
					};
				}
				return {
					null: "void",
				};
			})
			.reduce(
				(acc, tok) => ({
					// biome-ignore lint/performance/noAccumulatingSpread: <explanation>
					...acc,
					...tok,
				}),
				{} as Record<string, any>,
			);

		const newTheme = yield* Schema.encode(HelixTheme)({
			...scopes,
			palette: {
				bg: backgroundColor?.hex!,
				fg: foregroundColor?.hex!,
				red: red.hex,
				green: green.hex,
				blue: blue.hex,
			},
		});

		const asToml = yield* toml.parse(JSON.stringify(newTheme));

		const asString = yield* json.stringify(newTheme);

		yield* Effect.try({
			try: () =>
				Bun.write(
					`${vscodeSchema.name.toLowerCase().split(" ").join("_")}.toml`,
					JSON.stringify(asToml),
				),
			catch: (error) => new HelixError({ cause: error }),
		});
	}).pipe(
		Effect.tapError((error) =>
			Effect.logError(
				`Error occured converting VSCode Theme to Helix ${error}`,
			).pipe(
				Effect.annotateLogs({
					command: "helix",
				}),
			),
		),
	),
);

export default helix;
