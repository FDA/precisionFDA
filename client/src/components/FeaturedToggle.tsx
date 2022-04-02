import React from 'react'
import styled, { css } from 'styled-components'
import { useFeatureMutation } from '../features/home/actionModals/useFeatureMutation'
import { APIResource } from '../features/home/types'
import { HeartOutlineIcon, HeartSolidIcon } from './icons/HeartIcon'

const StyledFeaturedToggle = styled.div<{ pointer: boolean }>`
  ${({ pointer }) => pointer && css`cursor: pointer;`} 
  display: flex;
  justify-content: center;
`

export const FeaturedToggle = ({
  featured,
  resource,
  onSuccess,
  uids,
  disabled = true,
}: {
  featured: boolean
  resource: APIResource
  onSuccess?: (res: any) => void
  uids: string[]
  disabled?: boolean
}) => {
  const featureMutation = useFeatureMutation({ resource, onSuccess })
  const handleClick = () => !disabled && featureMutation.mutateAsync({ featured: !featured, uids })
  return (
    <StyledFeaturedToggle onClick={handleClick} pointer={!disabled}>
      {featured ? <HeartSolidIcon /> : <HeartOutlineIcon />}
    </StyledFeaturedToggle>
  )
}
