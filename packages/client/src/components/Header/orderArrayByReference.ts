export function orderArrayByReference(ids: string[], reference: string[]): string[] {
  // Create a map from the reference array to its indices
  const referenceMap = new Map<string, number>()
  reference.forEach((id, index) => {
      referenceMap.set(id, index)
  })

  // Sort the ids array based on the indices in the referenceMap
  ids.sort((a, b) => {
      const indexA = referenceMap.get(a) ?? Infinity
      const indexB = referenceMap.get(b) ?? Infinity
      return indexA - indexB
  })

  return ids
}
