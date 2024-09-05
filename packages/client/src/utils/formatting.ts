export const pluralize = (noun: string, count: number, suffix = 's') => `${noun}${count !== 1 ? suffix : ''}`

export const itemsCountString = (noun: string, count: number) => `${count} ${pluralize(noun, count)}`

/*
 * Generates a string combining a count and a noun, unpluralizing the noun if the count is one.
 */
export const resourceCountString = (noun: string, count: number) => `${count} ${unpluralizeIfOne(noun, count)}`
const unpluralizeIfOne = (noun: string, count: number) => `${count === 1 ? noun.slice(0, -1) : noun}`

export const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

export const formatDate = (date: Date) => new Date(date).toLocaleDateString('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
  hour12: true,
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
})
