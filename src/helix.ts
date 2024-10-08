import { Args, Command } from "@effect/cli";
import { Console, Effect } from "effect";
import { VSCodeThemeSchema } from "./schema";
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

			const schema = yield* Schema.decodeUnknown(VSCodeThemeSchema)(file);
			yield* Console.log(schema);
		}),
);

export default toHelix;
