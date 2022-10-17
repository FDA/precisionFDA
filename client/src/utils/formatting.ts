export const pluralize = (noun: string, count: number) => (count > 1) ? `${noun  }s` : noun

export const itemsCountString = (noun: string, count: number) => `${count} ${pluralize(noun, count)}`

export const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)
