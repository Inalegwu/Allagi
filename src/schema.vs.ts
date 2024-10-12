import { Schema } from "@effect/schema";
import { Struct, Array, Literal, String, Union } from "@/schema";

const VSCodeScopeSetting = Struct({
	foreground: String.pipe(Schema.optional),
	background: String.pipe(Schema.optional),
	fontFamily: String.pipe(Schema.optional),
}).pipe(
	Schema.rename({
		fontFamily: "font_family",
	}),
);

export const Colors = Schema.Record({
	key: String,
	value: String,
});

const MultipleSchema = Array(Schema.String);
const SingleSchema = String;

export const VSCodeHighlightSchema = Struct({
	scope: Union(MultipleSchema, SingleSchema).pipe(Schema.optional),
	settings: VSCodeScopeSetting,
});

export const Token = Array(VSCodeHighlightSchema);

export const VSCodeTheme = Struct({
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
