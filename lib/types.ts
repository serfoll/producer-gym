// this is just a type for the states in our ActionState
export type ActionState = {
  message: string;
  data: unknown;
  errors?: Record<string, string[]>;
} | null;

export type NewChallge = {
  title: string | undefined;
  file: File | undefined;
};
