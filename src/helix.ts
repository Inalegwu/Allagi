import { Args, Command } from "@effect/cli";
// biome-ignore lint/suspicious/noShadowRestrictedNames: useful
import { Effect, Option, Array } from "effect";
import { VSCodeTheme } from "./schema.vs";
import { Schema } from "@effect/schema";
import { convertHexToRGB, determineColorSpace } from "./utils";

const vscodeThemePath = Args.path({
	name: "VSCode Theme Path",
}).pipe(Args.optional);

const outputPath = Args.path({
	name: "Helix Theme Output Path",
});

const toHelix = Command.make(
	"helix",
	{ vscodeThemePath, outputPath },
	({ vscodeThemePath, outputPath }) =>
		Effect.gen(function* () {
			yield* Option.match(vscodeThemePath, {
				onSome: (themePath) =>
					Effect.gen(function* () {
						const file = yield* Effect.tryPromise(() =>
							Bun.file(themePath).text(),
						);

						const vscodeSchema = yield* Schema.decodeUnknown(VSCodeTheme)(
							JSON.parse(file),
							{
								onExcessProperty: "ignore",
							},
						);

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

						// yield* Console.log(schema);
					}),
				onNone: () =>
					Effect.gen(function* () {
						yield* Effect.logError("Incomplete Arguments Provided");
					}),
			});
		}).pipe(
			Effect.tapError((error) => Effect.logError(error)),
			Effect.annotateLogs({
				command: "helix",
			}),
		),
);

export default toHelix;
