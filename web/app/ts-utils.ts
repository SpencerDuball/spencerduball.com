export type StringEnum<T> = T | (string & Record<never, never>);
