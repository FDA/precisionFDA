import { Injectable } from '@nestjs/common'
import { spaceMembershipTypeToNameMap } from '@shared/domain/space-membership/space-membership-type-to-name.map'
import { SpaceReportPartUserTileHtmlResult } from '@shared/domain/space-report/model/space-report-part-user-tile-result'
import { SpaceReportResultPartHtmlContentProvider } from '@shared/domain/space-report/service/result/space-report-result-part-html-content.provider'

@Injectable()
export class SpaceReportResultPartUserHtmlContentProvider extends SpaceReportResultPartHtmlContentProvider<'user'> {
  protected async addContent(
    result: SpaceReportPartUserTileHtmlResult,
    document: Document,
    container: HTMLDivElement,
  ): Promise<void> {
    const role = document.createElement('strong')
    role.textContent = spaceMembershipTypeToNameMap[result.role]
    container.appendChild(role)

    container.appendChild(document.createElement('br'))
    container.appendChild(document.createElement('br'))

    const userName = document.createElement('p')
    const userNameLabel = document.createElement('span')
    userNameLabel.textContent = 'Username: '
    userName.appendChild(userNameLabel)
    const userNameLink = document.createElement('a')
    userNameLink.href = result.link
    userNameLink.setAttribute('target', '_blank')
    userNameLink.textContent = result.dxuser
    userName.appendChild(userNameLink)
    container.appendChild(userName)

    if (result.memberSince) {
      const memberSince = document.createElement('p')
      memberSince.textContent = `Member since: ${new Date(result.memberSince).toLocaleString()}`
      container.appendChild(memberSince)
    }
  }
}
