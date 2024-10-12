import { Array, Literal, Record, String, Struct, Union } from "@/schema";
import { Schema } from "@effect/schema";

const Modifiers = Literal(
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

const Style = Literal("line", "curl", "dashed", "dotted", "double_line");

const ScopeParam = Struct({
	foreground: String,
	background: String,
	underline: Struct({
		color: String,
		style: Style,
	}).pipe(Schema.optional),
	modifiers: Array(Modifiers),
}).pipe(
	Schema.rename({
		foreground: "fg",
		background: "bg",
	}),
);

// const ScopeValue = Schema.Union(Schema.String, ScopeParam);

const Palette = Union(
	Record({
		key: String,
		value: String,
	}),
	Struct({
		default: String,
		black: String,
		red: String,
		green: String,
		blue: String,
		yellow: String.pipe(Schema.optional),
		magenta: String.pipe(Schema.optional),
		cyan: String.pipe(Schema.optional),
		gray: String.pipe(Schema.optional),
		lightRed: String.pipe(Schema.optional),
		lightGreen: String.pipe(Schema.optional),
		lightYellow: String.pipe(Schema.optional),
		lightBlue: String.pipe(Schema.optional),
		lightMagenta: String.pipe(Schema.optional),
		lightCyan: String.pipe(Schema.optional),
		lightGray: String.pipe(Schema.optional),
		white: String,
	}).pipe(
		Schema.rename({
			lightBlue: "light-blue",
			lightRed: "light-red",
			lightYellow: "light-yellow",
			lightGreen: "light-green",
			lightCyan: "light-cyan",
			lightGray: "light-gray",
		}),
	),
);

const Scope = Record({
	key: String,
	value: ScopeParam,
});

export const HelixTheme = Struct({
	scope: Scope,
	palette: Palette,
	"ui.background": Struct({
		background: String.pipe(Schema.optional),
		foreground: String,
	}).pipe(
		Schema.rename({
			background: "bg",
			foreground: "fg",
		}),
	),
});

// export const HelixTheme = Schema.Record({
// 	key: Schema.String,
// 	value: Schema.Union(
// 		Schema.String,
// 		Schema.Record({
// 			key: Schema.String,
// 			value: Schema.String,
// 		}),
// 	),
// });

export type HelixTheme = typeof HelixTheme.Type;
export type Palette = typeof Palette.Type;
