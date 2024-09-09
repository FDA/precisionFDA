import classNames from 'classnames'
import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { getBasePathFromScope } from '../home/utils'


const StyledInputsAndOutputs = styled.div`
  border-bottom-right-radius: 3px;
  border-bottom-left-radius: 3px;
  display: flex;
  flex-wrap: wrap;
`

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: auto auto;
`

const StyledTable = styled.div`
  padding: 10px 15px;
  font-size: 14px;
  flex: 0 1 auto;
  min-width: 300px;

  .title {
    text-transform: uppercase;
    font-weight: 400;
    font-size: 14px;
    margin-bottom: 10px;
    padding-left: 8px;
  }
  .row {
    display: flex;
    padding: 8px;
    border-top: 1px solid var(--c-layout-border);
  }
  .even {
    display: flex;
    padding: 8px;
    border-top: 1px solid var(--c-layout-border);
  }
  .type {
    font-family: 'PT Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
  }
`

const Table = ({ title, config, dataTestId }: { title: string; config: any[], dataTestId: string }) => {
  const list = config.map((elementConfig, i) => {
    const classes = classNames({
      row: true,
      even: !(i % 2),
    })

    const item = () => {
      switch (elementConfig.type) {
        case 'file':
          return (elementConfig.state !== 'deleted') ? <Link to={elementConfig.link} className={classes}>
            {String(elementConfig.value)}
          </Link> : <div className={classNames(classes, 'text-muted')}>{String(elementConfig.value)}</div>
        case 'array:file':
          return <div>{elementConfig.value.map((name:any, index: any) => <Link key={elementConfig.link[index]} to={elementConfig.link[index]} className={classes}>
            {String(name)}
          </Link>)}</div>
        default:
          return <div className={classes}>{String(elementConfig.value)}</div>
      }
    }

    return (
        <Fragment key={i}>
          <div className={classNames(classes, 'type')}>{elementConfig.label}</div>
          { item() }
        </Fragment>
    )
  })

  return (
    <StyledTable data-testid={dataTestId}>
      <div className="title">{title}</div>
      <StyledGrid>{list}</StyledGrid>
    </StyledTable>
  )
}

export const InputsAndOutputs = ({
  runInputData,
  runOutputData,
}: {
  runInputData: any[]
  runOutputData: any[]
}) => {
  const getConfig = (config: any[]) => {
    return config.map((e: any) => {
      let link = ''
      let { value } = e
      const { state } = e
      
      if (e.class === 'file') {
        value = (e.state !== 'deleted') ? e.file_name : 'Output file has been deleted'
        link = (e.state !== 'deleted') ? `${getBasePathFromScope(e.scope)}/files/${e.file_uid}`: ''
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

  return (
    <StyledInputsAndOutputs>
      <Table title="inputs" config={inputConfig} dataTestId="execution-inputs" />
      <Table title="outputs" config={outputConfig} dataTestId="execution-outputs" />
    </StyledInputsAndOutputs>
  )
}
