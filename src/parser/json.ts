import { Context, Effect, Layer, Data } from "effect";

export class JSONError extends Data.TaggedError("TomlError")<{
	cause: unknown;
}> {}

type IJSONClient = Readonly<{
	parse: (value: string) => Effect.Effect<unknown, JSONError, never>;
	stringify: (
		value: Record<string, unknown>,
	) => Effect.Effect<string, JSONError, never>;
}>;

const make = Effect.gen(function* () {
	const parse = (value: string) =>
		Effect.try({
			try: () => JSON.parse(value),
			catch: (error) => new JSONError({ cause: error }),
		});

	const stringify = (value: Record<string, unknown>) =>
		Effect.try({
			try: () => JSON.stringify(value),
			catch: (error) => new JSONError({ cause: error }),
		});

	return {
		parse,
		stringify,
	} as const satisfies IJSONClient;
});

export class JSONClient extends Context.Tag("toml-client")<
	JSONClient,
	IJSONClient
>() {
	static live = Layer.effect(this, make);
}
