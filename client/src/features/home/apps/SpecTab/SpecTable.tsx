import React from 'react'
import classNames from 'classnames'


export const SpecTable = ({ title, config }: { title: string, config: any}) => {
  if (!config.length) {
    return (
      <div className='__table'>
        <div className='__table_title'>{title}</div>
        <div className='__table_row'>
          <div className='__table_row_type'>No fields specified</div>
        </div>
      </div>
    )
  }

  const data = config.map((spec: any, i: number) => {
    const classes = classNames({
      '__table_row': true,
      '__table_row_even': !(i % 2),
    })

    const choices = spec.choices ? spec.choices.join(', ') : null
    const title = spec.label.length ? spec.label : spec.name

    let defaultValue
    if (spec.default !== undefined) {
      defaultValue = spec.default.toString()
    }

    return (
      <div className={classes} key={i}>
        <div className='__table_type'>{spec.class}</div>
        <div className='__table_value'>
          <span className='__table_value-label'>{title}</span>
          <span className='__table_value-help'>{spec.help}</span>
          {defaultValue && <span className='__table_value-default'>{`Default: ${defaultValue}`}</span>}
          {choices && <span className='__table_value-default'>{`Choices: [${choices}]`}</span>}
        </div>
        {!spec.optional &&
          <div className='__table_required'>
            <span className='__table_required-label'>required</span>
          </div>
        }
      </div>
    )
  })

  return (
    <div className='__table'>
      <div className='__table_title'>{title}</div>
      {data}
    </div>
  )
}

