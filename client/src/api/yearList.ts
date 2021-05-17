import { useQuery } from "react-query"


interface IYearListPayload {
  yearList: number[],
}

const makeYearListFetchFunction = (url: string) => {
  return async function() {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error("Error fetching " + url)
    }
    const payload = await response.json()
    return {
      yearList: payload,
    }
  }
}

const queryYearList = (url: string) => {
  return useQuery<IYearListPayload, Error>(url, makeYearListFetchFunction(url))
}

export type {
  IYearListPayload,
}

export {
  queryYearList,
}  
