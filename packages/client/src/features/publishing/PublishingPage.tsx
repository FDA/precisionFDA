import { useMutation } from '@tanstack/react-query'
import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { toast } from 'react-toastify'
import { Button } from '../../components/Button'
import { Checkbox } from '../../components/Checkbox'
import { EntityIcon } from '../../components/EntityIcon'
import { UserLayout } from '../../layouts/UserLayout'
import { HomeLoader, NotFound } from '../home/show.styles'
import { getEntityTypeFromIdentifier } from '../tracks/TrackProvenanceContent'
import { publishFolder, publishObjects } from './publishing.api'
import { TreeRoot } from './publishing.types'
import {
  DepList,
  DepListBody,
  DepListCell,
  DepListHead,
  DepListHeadCell,
  DepListRow,
  ItemTitle,
  PublishingItemContent,
  PublishingWrapper,
  StyledCallout,
  StyledPageContainer,
} from './styles'
import { usePublishingTreeRootQuery } from './usePublishingTreeQuery'
import { AxiosError } from 'axios'
import { BackendError } from '../../api/errors'

const ShowParent = ({ tree, onSelectItem }: { tree: TreeRoot; onSelectItem: (identifier: string) => void }) => {
  const [selected, setSelected] = useState<boolean>(false)
  function selectPublishingDependencies() {
    onSelectItem(tree.data.identifier)
    setSelected(!selected)
  }

  return (
    <DepListRow>
      <DepListCell>
        {tree.data.scope !== 'public' && (
          <Button onClick={selectPublishingDependencies}>
            <Checkbox onChange={() => {}} checked={selected} /> Publish
          </Button>
        )}
        {tree.data.scope === 'public' && <span>Public</span>}
      </DepListCell>
      <DepListCell>
        <Link to={tree.data.url} target="_blank">
          <PublishingItemContent>
            <EntityIcon entityType={tree.data.type} />
            {tree.data.title}
          </PublishingItemContent>
        </Link>
        {selected && tree.parents && tree.parents.length > 0 && (
          <DepList>
            <DepListHead>
              <DepListRow>
                <DepListHeadCell colSpan={2}>
                  RELATED OBJECTS <span>(Publishing is recommended)</span>
                </DepListHeadCell>
              </DepListRow>
            </DepListHead>
            <DepListBody>
              {tree.parents.map(grandParent => (
                <ShowParent key={grandParent.data.identifier} tree={grandParent} onSelectItem={onSelectItem} />
              ))}
            </DepListBody>
          </DepList>
        )}
      </DepListCell>
    </DepListRow>
  )
}

const PublishingForm = ({ identifier, treeRoot }: { identifier: string; treeRoot: TreeRoot }) => {
  const navigate = useNavigate()
  const [publishedObjects, setPublishedObjects] = useState<string[]>([])

  const onSelectPublishingDependencies = (selectedIdentifier: string) => {
    if (publishedObjects.includes(selectedIdentifier)) {
      setPublishedObjects(publishedObjects.filter(id => id !== selectedIdentifier))
    } else {
      setPublishedObjects([...publishedObjects, selectedIdentifier])
    }
  }

  const folderMutation = useMutation({
    mutationKey: ['publish-objects'],
    mutationFn: () => publishFolder(identifier),
    onError: (e: AxiosError<BackendError>) => {
      toast.error(`${e.response?.data.error.message}`)
    },
    onSuccess: () => {
      navigate('/home/files?scope=everybody&per_page=20')
    },
  })

  const mutation = useMutation({
    mutationKey: ['publish-objects'],
    mutationFn: () => publishObjects(identifier!, publishedObjects),
    onError: () => {
      toast.error('Unable to publish selected object(s)')
    },
    onSuccess: res => {
      if (['comparison', 'note'].includes(treeRoot.data.type)) {
        window.location.href = res.data.path
      } else {
        navigate(res.data.path)
      }
    },
  })

  function publishSelectedObjects() {
    if (treeRoot.data.type === 'folder') {
      folderMutation.mutate()
    } else {
      mutation.mutate()
    }
    toast.success('Publishing of selected object(s) has started.')
  }

  return (
    <PublishingWrapper>
      <Button disabled={mutation.isPending} onClick={publishSelectedObjects} data-variant="primary">
        Publish selected objects
      </Button>
      <Link to={treeRoot?.data.url || ''} target="_blank">
        <ItemTitle>
          <EntityIcon entityType={treeRoot.data.type} />
          {treeRoot?.data.title}
        </ItemTitle>
      </Link>
      {treeRoot?.parents && treeRoot.parents.length > 0 && (
        <DepList>
          <DepListHead>
            <DepListRow>
              <DepListHeadCell colSpan={2}>
                RELATED OBJECTS <span>(Publishing is recommended)</span>
              </DepListHeadCell>
            </DepListRow>
          </DepListHead>
          <DepListBody>
            {treeRoot.parents.map(parent => (
              <ShowParent key={parent.data.identifier} tree={parent} onSelectItem={onSelectPublishingDependencies} />
            ))}
          </DepListBody>
        </DepList>
      )}
    </PublishingWrapper>
  )
}

const PublishingPage = () => {
  const [searchParams] = useSearchParams()
  const identifier = searchParams.get('identifier')
  let entityType = searchParams.get('type')

  if (!entityType) {
    entityType = getEntityTypeFromIdentifier(identifier!)
  }

  const { data: treeRoot, isLoading, isError } = usePublishingTreeRootQuery(identifier!, entityType)

  if (isLoading) {
    return <HomeLoader />
  }

  if (isError || !treeRoot) {
    return (
      <NotFound>
        <h1>Object not found</h1>
        <div>Sorry, this object does not exist or is not publishable.</div>
      </NotFound>
    )
  }

  return (
    <UserLayout mainScroll>
      <StyledPageContainer>
        <StyledCallout data-variant="info">
          Publishing items makes them publicly visible to all logged-in precisionFDA users.
          <br />
          <a href="/docs/guides/publishing" target="_blank">
            Review important information about publishing, and learn why it&apos;s a good idea to also publish related items.
          </a>
        </StyledCallout>
        <PublishingForm identifier={identifier!} treeRoot={treeRoot} />
      </StyledPageContainer>
    </UserLayout>
  )
}

export default PublishingPage
