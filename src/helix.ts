import { Args, Command, Options } from "@effect/cli";
import { Schema } from "@effect/schema";
import { Array, Data, Effect } from "effect";
import { convertHexToRGB, determineColorSpace } from "@/utils";
import { TomlClient } from "@/parser";
import { HelixTheme, VSCodeTheme, type UIPalette } from "@/schema/index";

class HelixError extends Data.TaggedError("helix-error")<{
	cause: unknown;
}> {}

const inputPath = Args.path({
	name: "Theme Path",
});

const transparent = Options.boolean("transparent");

const helix = Command.make(
	"helix",
	{ inputPath, transparent },
	({ inputPath, transparent }) =>
		Effect.gen(function* () {
			const toml = yield* TomlClient;
			yield* Effect.logInfo(
				`Attempting to Convert ${inputPath} to Helix Theme`,
			);
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

			const red = reds.reduce((prev, next) =>
				prev.rgb.r < next.rgb.r ? next : prev,
			);
			const green = greens.reduce((prev, next) =>
				prev.rgb.g < next.rgb.g ? next : prev,
			);
			const blue = blues.reduce((prev, next) =>
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

			// TODO: fully expand and figure out how to achieve key={key=value,key=value} syntax
			// // @ts-expect-error
			const newTheme = yield* Schema.encode(HelixTheme)({
				"ui.background": {
					bg: transparent ? "" : backgroundColor?.hex || "",
					fg: foregroundColor?.hex || "",
				},
				"ui.selection": {
					fg: backgroundColor?.hex || "",
				},
				palette: {
					red: red.hex,
					green: green.hex,
					blue: blue.hex,
				},
			});

			yield* Effect.log(newTheme);

			const asToml = yield* toml.stringify(newTheme);

			yield* Effect.try({
				try: () =>
					Bun.write(
						`${vscodeSchema.name.toLowerCase().split(" ").join("_")}.toml`,
						asToml,
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
