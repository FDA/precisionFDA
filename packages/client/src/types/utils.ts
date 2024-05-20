export interface Location { pathname: string, state: { from: string, fromSearch: string } }

export type MutationErrors = {
  errors: string[],
  fieldErrors: Record<string, string[]>
}
