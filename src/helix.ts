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

						const schema = yield* Schema.decodeUnknown(VSCodeTheme)(
							JSON.parse(file),
							{
								onExcessProperty: "ignore",
							},
						);

						const colors = Array.fromRecord(schema.colors)
							.map((v) => convertHexToRGB(v[1]))
							.map((v) => determineColorSpace({ ...v }));

						console.log(colors);
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
