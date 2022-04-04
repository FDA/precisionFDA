import classNames from 'classnames'
import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'


const StyledInputsAndOutputs = styled.div`
  background-color: #f4f8fd;
  border: 1px solid #ddd;
  border-bottom-right-radius: 3px;
  border-bottom-left-radius: 3px;
  display: flex;
`

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: auto auto;
`

const StyledTable = styled.div`
  padding: 10px 15px;
  width: 50%;

  .title {
    color: #8198bc;
    text-transform: uppercase;
    font-weight: 400;
    font-size: 14px;
    margin-bottom: 10px;
    padding-left: 8px;
  }
  .row {
    display: flex;
    padding: 8px;
    border-top: 1px solid #ddd;
  }
  .even {
    background: #ebf3fb;
    display: flex;
    padding: 8px;
    border-top: 1px solid #ddd;
  }
  .type {
    color: #8198bc;
    font-family: 'PT Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
  }
`

const Table = ({ title, config }: { title: string; config: any[] }) => {
  const list = config.map((e, i) => {
    const classes = classNames({
      row: true,
      even: !(i % 2),
    })

    return (
      <Fragment key={i}>
        <div className={classNames(classes, 'type')}>{e.label}</div>
        {e.link ? (
          <Link to={e.link} className={classes}>
            {String(e.value)}
          </Link>
        ) : (
          <div className={classes}>{String(e.value)}</div>
        )}
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

      return {
        label: e.label || e.name,
        link,
        value,
      }
    })
  }

  const inputConfig = getConfig(runInputData)
  const outputConfig = getConfig(runOutputData)

  return (
    <StyledInputsAndOutputs>
      {<Table title="inputs" config={inputConfig} />}
      {<Table title="outputs" config={outputConfig} />}
    </StyledInputsAndOutputs>
  )
}
