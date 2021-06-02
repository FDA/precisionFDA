import { useQuery } from "react-query"
import { IApp } from '../types/app'
import { mapToApp } from "../views/shapes/AppShape"


interface IAppListPayload {
  apps: IApp[],
}

const makeAppFetchFunction = (url: string) => {
  return async function() {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error("Error fetching data: " + url)
    }
    const payload = await response.json()
    return {
      apps: payload.apps.map(mapToApp) as IApp[],
    }
  }
}

const queryRecentApps = () => {
  return useQuery<IAppListPayload, Error>(['apps', 'everybody'], makeAppFetchFunction('/api/apps/everybody/'))
}

const queryFeaturedApps = () => {
  return useQuery<IAppListPayload, Error>(['apps', 'featured'], makeAppFetchFunction('/api/apps/featured/'))
}

export type {
  IAppListPayload,
}

export {
  queryRecentApps,
  queryFeaturedApps,
}
