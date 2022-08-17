export const pluralize = (noun: string, count: number) => (count > 1) ? `${noun  }s` : noun

export const itemsCountString = (noun: string, count: number) => `${count} ${pluralize(noun, count)}`
