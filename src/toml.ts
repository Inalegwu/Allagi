import { Context, Effect, Layer } from "effect";

type ITomlClient = {};

const make = Effect.gen(function* () {
	return {} as const;
});

export class TomlClient extends Context.Tag("toml-client")<
	TomlClient,
	ITomlClient
>() {
	static live = Layer.effect(this, make);
}
