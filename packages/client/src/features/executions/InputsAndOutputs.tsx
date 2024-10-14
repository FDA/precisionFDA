import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { FileIcon } from '../../components/icons/FileIcon'
import { getBasePathFromScope } from '../home/utils'
import { JobState } from './executions.types'


const StyledIOTable = styled.div`
  padding: 32px 15px;
  flex: 0 1 auto;
  min-width: 600px;

  table {
    font-size: 14px;
    font-weight: 400;
    line-height: 1.7;
    font-family: 'PT Mono', monospace;
    border-collapse: separate;
    width: 100%;
    border-collapse: separate;
    border-spacing: 0px;
    border-bottom: 1px solid #e0e0e0;
  }

  th {
    font-weight: 900;
    min-width: 100px;
    vertical-align: baseline;
    text-align: left;
    padding: 4px 8px;
    text-transform: uppercase;
  }

  tbody {
    tr:hover {
      background-color: var(--tertiary-70);
    }
  }

  tr {
    th {
      font-family: 'Courier New', monospace;
      border-bottom: 1px solid #e0e0e0;
    }
  }
  td {
    vertical-align: baseline;
    padding: 8px;
  }
  .noio {
    padding: 16px 0;
    font-style: italic;
    font-size: 16px;
    font-weight: 900;
  }
  .empty {
    height: 32px;
  }
  .title {
    text-transform: uppercase;
    font-weight: 900;
    font-size: 14px;
  }
  .label {
    min-width: 130px;
    overflow-wrap: anywhere;
    overflow: hidden;
    min-width: 180px;
  }
  .cont {
    display: flex;
    align-items: center;
  }
  .type {
    padding-right: 24px;
  }
  .value > * {
    overflow-wrap: anywhere;
    overflow: hidden;
  }
  .link-file {
    width: fit-content;
    gap: 4px;
    svg {
      box-sizing: content-box;
      padding-top: 5px;
      align-self: flex-start;
      flex-shrink: 0;
    }
  }
`

const Table = ({ title, config, dataTestId }: { title: string; config: any[]; dataTestId: string }) => {
  const list = config.map((elementConfig, i) => {
    const item = () => {
      switch (elementConfig.type) {
        case 'file':
          return elementConfig.state !== 'deleted' ? (
            <Link to={elementConfig.link} className="cont link-file">
              <FileIcon height={12} />
              {String(elementConfig.value)}
            </Link>
          ) : (
            <div className="cont text-muted">{String(elementConfig.value)}</div>
          )
        case 'array:file':
          return (
            <>
              {elementConfig.value.map((name: any, index: any) => (
                <Link key={elementConfig.link[index]} to={elementConfig.link[index]} className="cont link-file">
                  <FileIcon height={12} />
                  {String(name)}
                </Link>
              ))}
            </>
          )
        default:
          return <div className="cont">{String(elementConfig.value)}</div>
      }
    }

    return (
      <tr key={i} data-testid={dataTestId}>
        <td className="label">{elementConfig.label}</td>
        <td className="type">{elementConfig.type}</td>
        <td className="value">{item()}</td>
      </tr>
    )
  })

  return (
    <table>
      <thead>
        <tr>
          <th className="label">{title}</th>
          <th className="type">type</th>
          <th>value</th>
        </tr>
      </thead>
      <tbody>{list}</tbody>
      <tr className="empty" />
    </table>
  )
}

export const InputsAndOutputs = ({
  executionState,
  runInputData,
  runOutputData,
}: {
  executionState: JobState
  runInputData: any[]
  runOutputData: any[]
}) => {
  const getConfig = (config: any[]) => {
    return config.map((e: any) => {
      let link = ''
      let { value } = e
      const { state } = e

      if (e.class === 'file') {
        value = e.state !== 'deleted' ? e.file_name : 'Output file has been deleted'
        link = e.state !== 'deleted' ? `${getBasePathFromScope(e.scope)}/files/${e.file_uid}` : ''
      }
      if (e.class === 'array:file') {
        value = e.file_names
        link = e.file_uids.map((uid, index) => `${getBasePathFromScope(e.scopes[index])}/files/${uid}`)
      }

      return {
        label: e.label || e.name,
        type: e.class,
        link,
        value,
        state,
      }
    })
  }

  const inputConfig = getConfig(runInputData)
  const outputConfig = getConfig(runOutputData)

  const noInputs = inputConfig.length === 0
  const noOutputs = outputConfig.length === 0

  return (
    <StyledIOTable>
      {noInputs ? (
        <div className="noio">No input parameters have been configured for this app.</div>
      ) : (
        <Table title="inputs" config={inputConfig} dataTestId="execution-inputs" />
      )}
      {noOutputs ? (
        <div className="noio">
          {executionState !== 'done'
            ? 'Outputs will be visible after the execution completes.'
            : 'No ouputs from this execution run.'}
        </div>
      ) : (
        <Table title="outputs" config={outputConfig} dataTestId="execution-outputs" />
      )}
    </StyledIOTable>
  )
}
