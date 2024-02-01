import classNames from 'classnames'
import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'


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


const Table = ({ title, config }: { title: string; config: any[] }) => {
  const list = config.map((e, i) => {
    const classes = classNames({
      row: true,
      even: !(i % 2),
    })

    const item = () => {
      switch (e.type) {
        case 'file':
          return <Link to={e.link} className={classes}>
            {String(e.value)}
          </Link>
        case 'array:file':
          return <div>{e.value.map((name:any, index: any) => <Link key={e.link[index]} to={e.link[index]} className={classes}>
            {String(name)}
          </Link>)}</div>
        default:
          return <div className={classes}>{String(e.value)}</div>
      }
    }

    return (
        <Fragment key={i}>
          <div className={classNames(classes, 'type')}>{e.label}</div>
          { item() }
        </Fragment>
    )
  })

  return (
    <StyledTable>
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
      let value = e.value

      if (e.class === 'file') {
        value = e.file_name
        link = `/home/files/${e.file_uid}`
      }
      if (e.class === 'array:file') {
        value = e.file_names
        link = e.file_uids.map(uid => `/home/files/${uid}`)
      }

      return {
        label: e.label || e.name,
        type: e.class,
        link,
        value,
      }
    })
  }

  const inputConfig = getConfig(runInputData)
  const outputConfig = getConfig(runOutputData)

  return (
    <StyledInputsAndOutputs>
      <Table title="inputs" config={inputConfig} />
      <Table title="outputs" config={outputConfig} />
    </StyledInputsAndOutputs>
  )
}
