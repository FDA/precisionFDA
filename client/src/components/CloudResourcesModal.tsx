import React from 'react'
import styled, { css } from 'styled-components'
import { Loader } from './Loader'
import { colors, theme } from '../styles/theme'
import { Modal } from '../features/modal'
import { CloudResourcesResponse, useCloudResourcesQuery } from '../hooks/useCloudResourcesCondition'

type Props = {
  isShown: boolean
  hide: () => void
}

const StyledTable = styled.table`
  width: 100%;
`

const StyledHeaderCell = styled.th`
  background-color: ${theme.colors.darkBlue};
  color: ${theme.colors.textWhite};
  text-align: center;
`
const StyledBodyCell = styled.td<{
  bold?: boolean,
  textAlign: 'left' | 'right'
  bgColor: string
}>`
  ${({ bold }) => bold && css`
    font-weight: bold;
  `}
  ${({ textAlign, bgColor }) => (
    css`
      text-align: ${textAlign};
      background-color: ${bgColor};
    `
  )}
  padding: 0 20px;
`

type CloudUsageReportProps = {
  stats: CloudResourcesResponse
}

const CloudUsageReport = ({ stats }: CloudUsageReportProps) => {
  const tableBodyConfig = [
    {
      resource: 'Compute',
      usage: stats.computeCharges,
    },
    {
      resource: 'Storage',
      usage: stats.storageCharges,
    },
    {
      resource: 'Data Egress',
      usage: stats.dataEgressCharges,
    },
    {
      resource: 'Total',
      usage: stats.totalCharges,
      bold: true,
    },
    {
      resource: 'Usage Limit',
      usage: stats.usageLimit,
    },
    {
      resource: 'Usage Available',
      usage: stats.usageAvailable,
      bold: true,
    },
    {
      resource: 'Job Limit',
      usage: stats.jobLimit,
      bold: true,
    },
  ]
  return (
    <StyledTable>
      <thead>
        <tr>
          <StyledHeaderCell>
            Resource
          </StyledHeaderCell>
          <StyledHeaderCell>
            Usage
          </StyledHeaderCell>
        </tr>
      </thead>
      <tbody>
        {tableBodyConfig.map((row, index) => (
          <tr key={row.resource}>
            <StyledBodyCell bold={row.bold} textAlign='left' bgColor={
              index % 2 === 0 ? colors.borderDefault : colors.backgroundLightGray
            }>
              {row.resource}
            </StyledBodyCell>
            <StyledBodyCell bold={row.bold} textAlign='right' bgColor={
              index % 2 === 0 ? colors.borderDefault : colors.backgroundLightGray
            }>
              {`$${row.usage.toFixed(2)}`}
            </StyledBodyCell>
          </tr>
        ))}
      </tbody>
    </StyledTable>
  )
}

export const CloudResourceModal = ({ isShown, hide }: Props) => {
  const query = useCloudResourcesQuery()
  return (
    <Modal
      data-test-id="cloud-resource-modal"
      headerText="Cloud usage report"
      isShown={isShown}
      hide={hide}
    >
      {query.isLoading && <Loader height={14} />}
      {query.error && (
        <div>
          {JSON.stringify(query.error, null, 2)}
        </div>
      )}
      {!query.error && !query.isLoading && <CloudUsageReport stats={query.data!} />}
    </Modal>
  )

}

