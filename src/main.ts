import { Command } from "@effect/cli";
import { Effect } from "effect";
import pkg from "../package.json";
import toHelix from "./helix";
import { BunContext, BunRuntime } from "@effect/platform-bun";

const main = Command.make("allagi").pipe(Command.withSubcommands([toHelix]));

const program = Command.run(main, {
	name: "Allagi",
	version: `v${pkg.version}`,
});

program(process.argv).pipe(
	Effect.provide(BunContext.layer),
	BunRuntime.runMain,
);
