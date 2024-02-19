import { Injectable } from '@nestjs/common'
import { spaceMembershipTypeToNameMap } from '@shared/domain/space-membership/space-membership-type-to-name.map'
import { SpaceReportPartUserTileResult } from '@shared/domain/space-report/model/space-report-part-user-tile-result'
import { SpaceReportResultPartContentProvider } from '@shared/domain/space-report/service/result/space-report-result-part-content.provider'

@Injectable()
export class SpaceReportResultPartUserContentProvider extends SpaceReportResultPartContentProvider<'user'> {
  protected addContent(
    result: SpaceReportPartUserTileResult,
    document: Document,
    container: HTMLDivElement,
  ): void {
    const role = document.createElement('strong')
    role.innerHTML = spaceMembershipTypeToNameMap[result.role]
    container.appendChild(role)

    container.appendChild(document.createElement('br'))
    container.appendChild(document.createElement('br'))

    const userName = document.createElement('p')
    const userNameLabel = document.createElement('span')
    userNameLabel.innerHTML = 'Username: '
    userName.appendChild(userNameLabel)
    const userNameLink = document.createElement('a')
    userNameLink.href = result.link
    userNameLink.setAttribute('target', '_blank')
    userNameLink.innerHTML = result.dxuser
    userName.appendChild(userNameLink)
    container.appendChild(userName)

    const memberSince = document.createElement('p')
    memberSince.innerHTML = `Member since: ${new Date(result.memberSince).toLocaleString()}`
    container.appendChild(memberSince)
  }
}
