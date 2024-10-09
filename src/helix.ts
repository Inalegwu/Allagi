import { Args, Command } from "@effect/cli";
import { Console, Effect, Option } from "effect";
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

						const test = yield* Effect.try({
							try: () => convertHexToRGB(schema.colors["editor.foreground"]),
							catch: (error) =>
								Effect.logError(`Error converting hex to RGB ${error}`),
						});

						const colorSpace = yield* Effect.try({
							try: () => determineColorSpace({ ...test }),
							catch: (error) =>
								Effect.logError(`Error determining color space ${error}`),
						});

						console.log({ test, colorSpace });

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
