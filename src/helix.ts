import { Args, Command } from "@effect/cli";
import { Console, Effect, Option } from "effect";
import { VSCodeThemeSchema, type VSCodeTheme } from "./schema.vs";
import { Schema } from "@effect/schema";

const vscodeThemePath = Args.path({
	name: "VSCode Theme Path",
});

const outputPath = Args.path({
	name: "Helix Theme Output Path",
});

const toHelix = Command.make(
	"helix",
	{ vscodeThemePath, outputPath },
	({ vscodeThemePath, outputPath }) =>
		Effect.gen(function* () {
			const file = yield* Effect.tryPromise(() =>
				Bun.file(vscodeThemePath).text(),
			);

			const schema = Schema.decodeUnknownOption(VSCodeThemeSchema)(
				JSON.parse(file),
				{
					onExcessProperty: "ignore",
				},
			);

			yield* Option.match(schema, {
				onSome: (a) => Effect.gen(function* () {
				yield* Effect.logInfo(a);
				}),
				onNone: () =>
					Effect.gen(function* () {
						yield* Effect.logInfo("Unable To Read Theme");
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
