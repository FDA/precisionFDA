export interface Searchable<ENTITY extends object> {
  search(query: string): Promise<ENTITY[]>
}
