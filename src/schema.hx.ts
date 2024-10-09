import { Schema } from "@effect/schema";

const Modifiers = Schema.Literal(
	"bold",
	"dim",
	"italic",
	"underlined",
	"slow_blink",
	"rapid_blink",
	"reversed",
	"hidden",
	"crossed_out",
);

const Style = Schema.Literal("line", "curl", "dashed", "dotted", "double_line");

const ScopeParam = Schema.Struct({
	foreground: Schema.String,
	background: Schema.String,
	underline: Schema.Struct({
		color: Schema.String,
		style: Style,
	}).pipe(Schema.optional),
	modifiers: Schema.Array(Modifiers),
}).pipe(
	Schema.rename({
		foreground: "fg",
		background: "bg",
	}),
);

const ScopeValue = Schema.Union(Schema.String, ScopeParam);

const Palette = Schema.Record({
	key: Schema.Literal(
		"default",
		"black",
		"red",
		"yellow",
		"green",
		"blue",
		"magenta",
		"cyan",
		"gray",
		"light-red",
		"light-green",
		"light-yellow",
		"light-blue",
		"light-magenta",
		"light-cyan",
		"light-gray",
		"white",
	),
	value: Schema.String,
});

const Scope = Schema.Record({
	key: Schema.String,
	value: ScopeValue,
});

export const HelixTheme = Schema.Struct({
	palette: Palette,
	scope: Scope,
});

type HelixTheme = typeof HelixTheme.Type;
type Palette = typeof Palette.Type;
