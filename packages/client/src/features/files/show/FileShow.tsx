import { useQuery } from '@tanstack/react-query'
import queryString from 'query-string'
import { Link, useLocation } from 'react-router'
import { Button } from '@/components/Button'
import { CopyText } from '@/components/CopyText/CopyText'
import { HomeLabel } from '@/components/HomeLabel'
import { FileIcon } from '@/components/icons/FileIcon'
import { LockIcon } from '@/components/icons/LockIcon'
import { ActionsMenu } from '@/components/Menu'
import { toastInfo } from '@/components/NotificationCenter/ToastHelper'
import { Filler } from '@/components/Page/page.styles'
import { type ITab, TabsSwitch } from '@/components/TabsSwitch'
import { StyledPropertyItem, StyledPropertyKey, StyledTagItem, StyledTags } from '@/components/Tags'
import { theme } from '@/styles/theme'
import { sanitizeFileName } from '@/utils/formatting'
import { getBackPathNext } from '@/utils/getBackPath'
import { useAuthUser } from '../../auth/useAuthUser'
import { ActionsMenuContent } from '../../home/ActionMenuContent'
import { ActionModalsRenderer } from '../../home/ActionModalsRenderer'
import { defaultHomeContext, type HomeScopeContextValue } from '../../home/HomeScopeContext'
import { StyledBackLink } from '../../home/home.styles'
import {
  HeaderLeft,
  HomeLoader,
  LockedRow,
  MetadataItem,
  MetadataKey,
  MetadataRow,
  MetadataSection,
  MetadataVal,
  NotFound,
  PathSection,
  ResourceHeader,
  Title,
  Topbox,
} from '../../home/show.styles'
import type { HomeScope } from '../../home/types'
import { License } from '../../licenses/License'
import type { License as ILicense } from '../../licenses/types'
import type { ISpace } from '../../spaces/spaces.types'
import { FileBreadcrumb } from '../FileBreadcrumb'
import { getOriginHref } from '../file.utils'
import { fetchFile } from '../files.api'
import type { IFile } from '../files.types'
import { normalizePermissions } from '../normalizePermissions'
import { useFilesSelectActions } from '../useFilesSelectActions'
import { FileDescription, HeaderActions } from './files-show.styles'

const FileActionsDropdown = ({
  homeScope,
  space,
  file,
  folderId,
}: {
  homeScope?: HomeScope
  space?: ISpace
  file: IFile
  folderId?: string
}): React.ReactElement => {
  const { actions, modals } = useFilesSelectActions({
    homeScope,
    space,
    selectedItems: [file],
    resourceKeys: ['file', file.uid],
    folderId,
  })

  return (
    <>
      <ActionsMenu data-testid="file-show-actions-button">
        <ActionsMenuContent actions={actions} />
      </ActionsMenu>

      <ActionModalsRenderer modals={modals} />
    </>
  )
}

const getOriginLinkText = (file: IFile): string | undefined => {
  return typeof file.origin === 'object' && file.origin ? file.origin.text : undefined
}

export const FileShow = ({
  fileId,
  space,
  homeContext = defaultHomeContext,
}: {
  fileId: string
  space?: ISpace
  homeContext?: HomeScopeContextValue
}): React.ReactElement => {
  const { homeScope, setDisplayScope, isHome } = homeContext
  const user = useAuthUser()
  const location = useLocation()
  const { data: file, isLoading } = useQuery({
    queryKey: ['file', fileId],
    queryFn: () =>
      fetchFile(fileId).then(d => {
        if (isHome) {
          setDisplayScope(d.scope, d.featured)
        }
        return d
      }),
  })
  const params = queryString.parse(location?.state?.fromSearch)
  const folderId = params?.folderId as string | undefined

  if (isLoading) {
    return <HomeLoader />
  }

  if (!file?.id)
    return (
      <NotFound>
        <h1>File not found</h1>
        <div>Sorry, this file does not exist or is not accessible by you.</div>
      </NotFound>
    )

  const licenseLink = file.fileLicense ? `/licenses/${file.fileLicense.id}` : undefined
  const tabsConfig = [
    {
      header: `License: ${file.fileLicense?.title ?? ''}`,
      tab: <License license={file.fileLicense as unknown as ILicense} link={licenseLink} />,
      hide: !file.fileLicense?.uid,
    },
  ] as ITab[]

  const scopeParamLink = `?scope=${homeScope?.toLowerCase()}`
  const backPath = getBackPathNext({ spaceId: space?.id, location, resourceLocation: 'files', homeScope })

  const spaceLink = file.spaceId ? `/spaces/${file.spaceId}` : null
  const userLink = file.addedByDxuser ? `/users/${file.addedByDxuser}` : '#'
  const filePermissions = normalizePermissions(file, user, space)
  const showLicensePending = file.fileLicense?.acceptanceStatus === 'pending'
  const originHref = getOriginHref(file.originObject)
  const originLinkText = getOriginLinkText(file)

  return (
    <>
      <StyledBackLink linkTo={backPath} data-testid="file-back-link">
        Back to Files
      </StyledBackLink>
      <Topbox>
        <ResourceHeader>
          <HeaderLeft>
            <Title>
              <FileIcon height={22} />
              <span data-testid="file-name">{file.name}</span>
              {showLicensePending && (
                <div data-testid="file-license-pending">
                  <HomeLabel
                    value="License Pending Approval"
                    icon="fa-clock-o"
                    type="warning"
                    className=""
                    state={file.state ?? undefined}
                  />
                </div>
              )}
            </Title>
          </HeaderLeft>
          <HeaderActions>
            <Button
              type="button"
              onClick={() => {
                const win = window.open(
                  `/api/v2/files/${file.uid}/${sanitizeFileName(file.name)}?inline=true`,
                  '_blank',
                )
                win?.focus()
              }}
              disabled={!filePermissions.canDownload}
              data-testid="file-open-button"
            >
              Open
            </Button>
            <FileActionsDropdown homeScope={homeScope} space={space} file={file} folderId={folderId} />
          </HeaderActions>
        </ResourceHeader>

        <PathSection>
          <FileBreadcrumb
            fileName={file.name}
            basePath={`/${space ? `spaces/${space.id}` : 'home'}/files`}
            labelText="File Path:"
            scope={homeScope}
            metaPath={file.folderPath}
          />
        </PathSection>

        <MetadataSection>
          <MetadataRow>
            <MetadataItem>
              <MetadataKey>Location</MetadataKey>
              <MetadataVal data-testid="file-location">
                {spaceLink ? (
                  <Link target="_blank" to={spaceLink}>
                    {file.location}
                  </Link>
                ) : (
                  <Link to={`/home/files${scopeParamLink}`}>
                    {homeScope === 'featured' ? 'Featured' : file.location}
                  </Link>
                )}
              </MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>ID</MetadataKey>
              <MetadataVal data-testid="file-uid">
                <CopyText
                  className="inline-flex items-center gap-2 cursor-pointer text-[color:var(--c-link)]"
                  value={file.uid}
                  onCopy={() => toastInfo('File ID copied to clipboard')}
                >
                  <span>{file.uid}</span>
                </CopyText>
              </MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>Added By</MetadataKey>
              <MetadataVal data-testid="file-added-by">
                <Link target="_blank" to={userLink}>
                  {file.addedBy}
                </Link>
              </MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>Origin</MetadataKey>
              <MetadataVal data-testid="file-origin">
                {originHref ? (
                  <Link target="_blank" to={originHref}>
                    {originLinkText || originHref}
                  </Link>
                ) : typeof file.origin === 'object' ? (
                  file.origin?.text
                ) : (
                  file.origin
                )}
              </MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>File Size</MetadataKey>
              <MetadataVal data-testid="file-size">{file.fileSize ?? 'N/A'}</MetadataVal>
            </MetadataItem>

            <MetadataItem>
              <MetadataKey>Created On</MetadataKey>
              <MetadataVal data-testid="file-created-on">{file.createdAtDateTime}</MetadataVal>
            </MetadataItem>
          </MetadataRow>
        </MetadataSection>
        {file.tags.length > 0 && (
          <MetadataSection>
            <MetadataRow>
              <MetadataItem>
                <MetadataKey>Tags</MetadataKey>
                <StyledTags data-testid="tags-container">
                  {file.tags.map(tag => (
                    <StyledTagItem data-testid="file-tag-item" key={tag}>
                      {tag}
                    </StyledTagItem>
                  ))}
                </StyledTags>
              </MetadataItem>
            </MetadataRow>
          </MetadataSection>
        )}
        {Object.entries(file.properties).length > 0 && (
          <MetadataSection>
            <MetadataRow>
              <MetadataItem>
                <MetadataKey>Properties</MetadataKey>
                <StyledTags data-testid="properties-container">
                  {Object.entries(file.properties).map(([key, value]) => (
                    <StyledPropertyItem key={key}>
                      <StyledPropertyKey data-testid="file-property-key">{key}</StyledPropertyKey>
                      <span data-testid={`file-property-value-${key}`}>{value}</span>
                    </StyledPropertyItem>
                  ))}
                </StyledTags>
              </MetadataItem>
            </MetadataRow>
          </MetadataSection>
        )}
        <FileDescription data-testid="file-description">
          {file.locked && (
            <LockedRow data-testid="file-locked">
              <LockIcon height={14} color={theme.colors.darkYellow} />
              File is locked
            </LockedRow>
          )}
          {file.description ? file.description : 'No description provided.'}
        </FileDescription>
      </Topbox>

      <Filler $size={40} />
      <TabsSwitch tabsConfig={tabsConfig} />
    </>
  )
}
