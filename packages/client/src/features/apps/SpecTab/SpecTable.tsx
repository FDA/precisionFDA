/* eslint-disable eqeqeq */
import classNames from 'classnames'
import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { IAccessibleFile } from '../../databases/databases.api'
import { IOSpec, InputSpec } from '../apps.types'

const StyledDefaultValue = styled.div`
  a {
    white-space: nowrap;
  }
`
const StyledSpecName = styled.td`
  font-weight: bold;
  font-size: 14px;
`

const SpecDefault = ({
  spaceId,
  value,
  sClass,
}: {
  spaceId?: string
  value: boolean | number | string | IAccessibleFile[] | null
  sClass: IOSpec['class']
}) => {
  let defaultValues = null
  if (sClass === 'array:file') {
    defaultValues = value && (
      <StyledDefaultValue>
        {value.map(f => {
          return (
            <div key={f}>
              <Link to={`/${spaceId ? `spaces/${spaceId}` : 'home'}/files/${f}`}>{f}</Link>
            </div>
          )
        })}
      </StyledDefaultValue>
    )
  }
  if (sClass === 'file') {
    defaultValues = value && (
      <StyledDefaultValue>
        <Link to={`/${spaceId ? `spaces/${spaceId}` : 'home'}/files/${value}`}>
          {value}
        </Link>
      </StyledDefaultValue>
    )
  }
  if (
    sClass === 'array:string' ||
    sClass === 'array:float' ||
    sClass === 'array:int'
  ) {
    defaultValues = value && (
      <StyledDefaultValue>{`[ ${value.map(v => ` ${v}`).toString()} ]`}</StyledDefaultValue>
    )
  }
  if (sClass === 'boolean') {
    defaultValues = (
      <StyledDefaultValue>
        {value === false ? 'false' : 'true'}
      </StyledDefaultValue>
    )
  }
  if (sClass === 'string' || sClass === 'float' || sClass === 'int') {
    defaultValues = value && (
      <StyledDefaultValue>{value as string}</StyledDefaultValue>
    )
  }

  return defaultValues
}

export const SpecTable = ({
  spaceId,
  title,
  config,
  dataTestId,
}: {
  spaceId?: string,
  title: string
  config: InputSpec[] | IOSpec[]
  dataTestId: string
}) => {
  if (!config.length) {
    return (
      <div className="__table" data-testid={dataTestId}>
        <div className="__table_title">{title}</div>
        <div className="__table_row">
          <div className="__table_row_none">No {title} specified</div>
        </div>
      </div>
    )
  }

  const data = config.map((spec, i) => {
    const classes = classNames({
      __table_row: true,
      __table_row_even: !(i % 2),
    })

    const choices = spec?.choices

    return (
      <div className={classes} key={spec.name}>
        <div className="__table_type">{spec.class}</div>
        <div className="__table_value">
          <table className="__table_value-default">
            <tbody>
              <tr>
                <th> </th>
                <StyledSpecName>{spec.name}</StyledSpecName>
              </tr>
              {spec?.label && (
                <tr>
                  <th>Label :</th>
                  <td>{spec.label}</td>
                </tr>
              )}
              {spec?.help && (
                <tr>
                  <th>Help :</th>
                  <td>{spec.help}</td>
                </tr>
              )}
              {spec?.default != undefined && (
                <tr>
                  <th>Default :</th>
                  <td>
                    <SpecDefault spaceId={spaceId} value={spec.default} sClass={spec.class} />
                  </td>
                </tr>
              )}
              {spec?.choices && (
                <tr>
                  <th>Choices :</th>
                  <td>
                    {choices
                      ? `[ ${choices.map(v => ` ${v}`).toString()} ]`
                      : ''}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {!spec.optional && (
          <div className="__table_required">
            <span className="__table_required-label">required</span>
          </div>
        )}
      </div>
    )
  })

  return (
    <div className="__table" data-testid={dataTestId}>
      <div className="__table_title">{title}</div>
      {data}
    </div>
  )
}
