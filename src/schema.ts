import { Schema } from "@effect/schema";

const VSCodeScopeSettingSchema=Schema.Struct({
	foreground:Schema.String.pipe(Schema.optional),
	background:Schema.String.pipe(Schema.optional),
	fontFamily:Schema.String.pipe(Schema.optional)
}).pipe(Schema.rename({
	fontFamily:"font_family"
}))

export const ColorSchema = Schema.Record({
	key: Schema.String,
	value: Schema.String,
});

const MultipleSchema=Schema.Array(Schema.String);
const SingleSchema=Schema.String

export const VSCodeHighlightSchema=Schema.Struct({
	scope:Schema.Union(MultipleSchema,SingleSchema).pipe(Schema.optional),
	settings:VSCodeScopeSettingSchema
})

export const TokenSchema=Schema.Array(VSCodeHighlightSchema)

export const VSCodeThemeSchema = Schema.Struct({
	colors: ColorSchema,
	tokenColors:TokenSchema
});

export type VSCodeTheme = typeof VSCodeThemeSchema.Type;
