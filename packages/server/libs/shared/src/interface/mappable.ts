export interface Mappable<INPUT, OUTPUT> {
  map(input: INPUT): OUTPUT
}
