import { Args, Command } from "@effect/cli";
import { Effect, Array, Record } from "effect";
import { VSCodeTheme } from "./schema.vs";
import { Schema } from "@effect/schema";
import { convertHexToRGB, determineColorSpace } from "./utils";

const inputPath = Args.path({
	name: "Theme Path",
});

const outputPath = Args.path({
	name: "Output Path",
});

const toHelix = Command.make(
	"helix",
	{ inputPath, outputPath },
	({ inputPath, outputPath }) =>
		Effect.gen(function* () {
			yield* Effect.logInfo(
				`Attempting to Convert ${inputPath} to Helix Theme @${outputPath}`,
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
