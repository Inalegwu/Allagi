import { Context, Effect, Layer, Data } from "effect";
import TOML, { type TomlPrimitive } from "smol-toml";

export class TomlError extends Data.TaggedError("TomlError")<{
	cause: unknown;
}> {}

type ITomlClient = Readonly<{
	parse: (
		value: string,
	) => Effect.Effect<Record<string, TomlPrimitive>, TomlError, never>;
	stringify: (value: TomlPrimitive) => Effect.Effect<string, TomlError, never>;
}>;

const make = Effect.gen(function* () {
	const parse = (value: string) =>
		Effect.try({
			try: () => TOML.parse(value),
			catch: (error) => new TomlError({ cause: error }),
		});

	const stringify = (value: TomlPrimitive) =>
		Effect.try({
			try: () => TOML.stringify(value),
			catch: (error) => new TomlError({ cause: error }),
		});

	return {
		parse,
		stringify,
	} as const satisfies ITomlClient;
});

export class TomlClient extends Context.Tag("toml-client")<
	TomlClient,
	ITomlClient
>() {
	static live = Layer.effect(this, make);
}
