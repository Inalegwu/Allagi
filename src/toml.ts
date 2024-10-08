import { Context, Effect, Layer } from "effect";
import TOML, { type TomlPrimitive } from "smol-toml";

type ITomlClient = Readonly<{
	parse: (value: string) => Record<string, TomlPrimitive>;
}>;

const make = Effect.gen(function* () {
	const parse = (value: string) => TOML.parse(value);
	const encode = (value: TomlPrimitive) => TOML.stringify(value);

	return {
		parse,
	} as const satisfies ITomlClient;
});

export class TomlClient extends Context.Tag("toml-client")<
	TomlClient,
	ITomlClient
>() {
	static live = Layer.effect(this, make);
}
