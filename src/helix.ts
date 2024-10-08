import { Args, Command } from "@effect/cli";
import { Console, Effect, Option } from "effect";
import { VSCodeTheme } from "./schema.vs";
import { Schema } from "@effect/schema";

const vscodeThemePath = Args.path({
	name: "VSCode Theme Path",
}).pipe(Args.optional);

const outputPath = Args.path({
	name: "Helix Theme Output Path",
});

const themeGithub = Args.text({
	name: "VSCode Theme Github",
}).pipe(Args.optional);

const toHelix = Command.make(
	"helix",
	{ vscodeThemePath, outputPath, themeGithub },
	({ vscodeThemePath, outputPath, themeGithub }) =>
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

						yield* Console.log(schema);
					}),
				onNone: () =>
					Effect.gen(function* () {
						yield* Option.match(themeGithub, {
							onSome: (githubUrl) =>
								Effect.gen(function* () {
									yield* Console.log(githubUrl);
								}),
							onNone: () =>
								Effect.gen(function* () {
									yield* Effect.logError(
										"Neither 'Theme Github Url' nor 'Theme Path' discovered",
									);
								}),
						});
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
