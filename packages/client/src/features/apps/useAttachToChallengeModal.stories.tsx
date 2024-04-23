import { Meta, StoryObj } from '@storybook/react'
import React, { useEffect } from 'react'
import { WithListData } from '../../stories/helpers'
import { StorybookProviders } from '../../stories/StorybookProviders'
import { fetchApps } from './apps.api'
import { IApp } from './apps.types'
import { useAttachToChallengeModal } from './useAttachToChallengeModal'

const meta: Meta = {
  title: 'Modals/Apps',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
}
type Props = {
  data: IApp
}
type Story = StoryObj<Props>

const AttachToChallengeModalWrapper = (props: Props) => {
  const { modalComp, setShowModal } = useAttachToChallengeModal({ resource: 'apps', selected: props.data })

  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const AttachToChallengeModal: Story = {
  render: () => {
    return (
      <WithListData resource="apps" fetchList={fetchApps}>
        {({ data }) => <AttachToChallengeModalWrapper data={data['apps'][0]} />}
      </WithListData>
    )
  },
}

export default meta
