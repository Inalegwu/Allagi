import { Args, Command } from "@effect/cli";
import { Effect, Array } from "effect";
import { VSCodeTheme } from "./schema.vs";
import { Schema } from "@effect/schema";
import { convertHexToRGB, determineColorSpace } from "./utils";

const vscodeThemePath = Args.path({
	name: "Theme Path",
});

const outputPath = Args.path({
	name: "Output Path",
});

const toHelix = Command.make(
	"helix",
	{ vscodeThemePath, outputPath },
	({ vscodeThemePath, outputPath }) =>
		Effect.gen(function* () {
			yield* Effect.logInfo(
				`Attempting to Convert ${vscodeThemePath} to Helix Theme @${outputPath}`,
			);

			const file = yield* Effect.tryPromise(() =>
				Bun.file(vscodeThemePath).text(),
			);

			yield* Effect.logInfo("Parsing Theme File");
			const vscodeSchema = yield* Schema.decodeUnknown(VSCodeTheme)(
				JSON.parse(file),
				{
					onExcessProperty: "ignore",
				},
			);

			yield* Effect.logInfo(
				`Converting ${vscodeSchema.name} by ${vscodeSchema.author}`,
			);

			yield* Effect.logInfo("Discovering and marshalling colors");
			const colors = Array.fromRecord(vscodeSchema.colors)
				.map((v) => ({
					key: v[0],
					rgb: convertHexToRGB(v[1]),
					hex: v[1],
				}))
				.map((value) => ({
					key: value.key,
					rgb: value.rgb,
					hex: value.hex,
					colorSpace: determineColorSpace({ ...value.rgb }),
				}));

			const background = colors
				.filter((value) => value.key === "editor.background")
				.at(0);

			yield* Effect.logInfo({ background });

			// yield* Console.log(schema);
		}).pipe(Effect.tapError((error) => Effect.logError(error))),
);

export default toHelix;
