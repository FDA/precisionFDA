import { formatDistance, parse } from 'date-fns'
import React, { FunctionComponent } from 'react'
import { UseQueryResult } from 'react-query'
import { Link } from 'react-router-dom'

import { IAppListPayload } from '../../../../api/apps'
import { IApp } from '../../../../types/app'
import GuestRestrictedLink from '../../Controls/GuestRestrictedLink'
import { QueryList } from '../../List/QueryList'
import './style.sass'


interface ITopAppsListProps {
  query: () => UseQueryResult<IAppListPayload, Error>,
}

const AppListItem = (app: IApp) => {
  const timeDistance = formatDistance(new Date(), app.updatedAt)

  // Blue icon = regular app
  // Yellow icon = https app
  const iconImage = app.entityType == 'regular' ? 'AppIconBlue.png' : 'AppIconYellow.png'
  const iconImageAlt = app.entityType == 'regular' ? 'Normal Application icon' : 'Interactive Workstation Application icon'
  const linkToApp = `/home${app.links.show}`
  const ariaLabel = `Click this to navigate to the ${app.title} page`

  return (
    <div className="top-apps-list" key={app.id}>
      <div className="top-apps-list__icon">
        <GuestRestrictedLink to={linkToApp} ariaLabel={ariaLabel}><img src={`/assets/apps/${iconImage}`} alt={iconImageAlt} /></GuestRestrictedLink>
      </div>
      <div className="top-apps-list__contents">
        <div className="top-apps-list__name"><GuestRestrictedLink to={linkToApp} ariaLabel={ariaLabel}>{app.title}</GuestRestrictedLink></div>
        <div className="top-apps-list__user">{app.org}</div>
        <div className="top-apps-list__date">Updated {timeDistance} ago</div>
      </div>
    </div>
  )
}

const TopAppsList: FunctionComponent<ITopAppsListProps> = ({query}) => {
  const limit = 4
  const appListExtractor = (payload: IAppListPayload) => {
    return payload.apps.slice(0, limit) as IApp[]
  }

  return <QueryList query={query} listExtractor={appListExtractor} template={AppListItem} />
}

export {
  TopAppsList,
}
