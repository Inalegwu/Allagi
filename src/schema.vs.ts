import { Schema } from "@effect/schema";

const VSCodeScopeSetting = Schema.Struct({
	foreground: Schema.String.pipe(Schema.optional),
	background: Schema.String.pipe(Schema.optional),
	fontFamily: Schema.String.pipe(Schema.optional),
}).pipe(
	Schema.rename({
		fontFamily: "font_family",
	}),
);

export const Colors = Schema.Record({
	key: Schema.String,
	value: Schema.String,
});

const MultipleSchema = Schema.Array(Schema.String);
const SingleSchema = Schema.String;

export const VSCodeHighlightSchema = Schema.Struct({
	scope: Schema.Union(MultipleSchema, SingleSchema).pipe(Schema.optional),
	settings: VSCodeScopeSetting,
});

export const Token = Schema.Array(VSCodeHighlightSchema);

export const VSCodeTheme = Schema.Struct({
	name: Schema.String,
	author: Schema.String,
	colors: Colors,
	tokenColors: Token,
}).pipe(
	Schema.annotations({
		message: () => "Error marshalling to theme",
		documentation: "TODO",
	}),
);
