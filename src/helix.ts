import { Args, Command } from "@effect/cli";
import { Schema } from "@effect/schema";
import { Array, Data, Effect } from "effect";
import { VSCodeTheme } from "./schema.vs";
import { convertHexToRGB, determineColorSpace } from "./utils";

// @ts-ignore
class HelixError extends Data.TaggedError("helix-error")<{
	cause: unknown;
}> {}

const inputPath = Args.path({
	name: "Theme Path",
});

const outputPath = Args.path({
	name: "Output Path",
});

const helix = Command.make(
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
			const palette = Array.fromRecord(vscodeSchema.colors)
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

			const reds = palette.filter((color) => color.colorSpace === "red");
			const greens = palette.filter((color) => color.colorSpace === "green");
			const blues = palette.filter((color) => color.colorSpace === "blue");

			// yield* Console.log(schema);
		}).pipe(
			Effect.tapError((error) =>
				Effect.logError(
					`Error occured converting VSCode Theme to Helix ${error}`,
				),
			),
		),
);

export default helix;
