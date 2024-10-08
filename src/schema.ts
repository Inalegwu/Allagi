import { Schema } from "@effect/schema";

export const ColorsSchema = Schema.Map({
	key: Schema.String,
	value: Schema.String,
}).pipe(Schema.optional);

export const VSCodeThemeSchema = Schema.Struct({
	colors: ColorsSchema,
});

export type VSCodeTheme = typeof VSCodeThemeSchema.Type;
