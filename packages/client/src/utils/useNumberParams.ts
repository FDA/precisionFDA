import { useParams, Params } from 'react-router-dom'
import { map, when } from 'ramda'

type RecordUndefinedVal<T> = Record<keyof T, number | undefined>

export function useNumberParams<T extends Record<string, string | number | undefined>>(): RecordUndefinedVal<T> {
  const params = useParams<Params<string>>()

  const convertedParams = map(
    when(
      (value) => !Number.isNaN(Number(value)),
      Number,
    ),
    params,
  )

  return convertedParams as RecordUndefinedVal<T>
}
