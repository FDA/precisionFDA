import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import { Button } from '../../../components/Button'
import { Loader } from '../../../components/Loader'
import { UserLayout } from '../../../layouts/UserLayout'
import { Row } from '../../home/home.styles'
import { ButtonRow } from '../../modal/styles'
import { EditAlertForm } from './EditAlertForm'
import { getAlertRequest } from './alerts.api'
import { AlertItem, Content, PageTop, StyledAlertList, Title } from './alerts.styles'
import { Alert } from './alerts.types'
import { useAlertDismissed } from './useAlertDismissedLocalStorage'

const AlertList = ({
  list,
  isLoading,
  selected,
  setSelected,
}: {
  list?: Alert[]
  isLoading: boolean
  selected?: number
  setSelected: (id: number) => void
}) => {
  if (isLoading) return <Loader />
  return (
    <StyledAlertList>
      {list?.map(a => {
        return (
          <AlertItem
            $active={selected === a.id}
            key={a.id}
            onClick={() => {
              setSelected(a.id)
            }}
          >
            <Title>{a.title}</Title>
            <Content>{a.content}</Content>
          </AlertItem>
        )
      })}
    </StyledAlertList>
  )
}

export function AlertsPage() {
  const { setIsAlertDismissed } = useAlertDismissed()
  const [selected, setSelected] = useState<number>()
  const [createMode, setCreateMode] = useState(false)

  const { data: alertsData, isLoading } = useQuery({
    queryKey: ['alerts-list'],
    queryFn: getAlertRequest,
  })

  return (
    <UserLayout innerScroll>
      <PageTop>
        <ButtonRow>
          <Button
            onClick={() => {
              setCreateMode(true)
              setSelected(undefined)
            }}
          >
            Create New Alert
          </Button>
          <Button
            onClick={() => {
              setIsAlertDismissed(false)
            }}
          >
            Reset dismissed alert for current user
          </Button>
        </ButtonRow>
        {!selected ? (
          <h1>Site Alert Editor</h1>
        ) : (
          <h1>
            {createMode ? 'New' : 'Edit'} Alert {selected}
          </h1>
        )}
      </PageTop>
      <Row>
        <AlertList
          isLoading={isLoading}
          list={alertsData}
          selected={selected}
          setSelected={(id: number) => {
            setSelected(id)
            setCreateMode(false)
          }}
        />
        {isLoading ? (
          <Loader />
        ) : (
          (selected || createMode) && (
            <EditAlertForm
              alertItem={alertsData?.find(i => i.id === selected)}
              onSuccess={id => {
                setCreateMode(false)
                setSelected(id)
              }}
              isNew={createMode}
            />
          )
        )}
      </Row>
    </UserLayout>
  )
}
