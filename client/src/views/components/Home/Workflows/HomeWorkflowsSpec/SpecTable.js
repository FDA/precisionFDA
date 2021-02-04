import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'


const SpecTable = ({ title, config }) => {
  if (!config.length) {
    return (
      <div className='home-workflow-spec__table'>
        <div className='home-workflow-spec__table_title'>{title}</div>
        <div className='home-workflow-spec__table_row'>
          <div className='home-workflow-spec__table_row_type'>No fields specified</div>
        </div>
      </div>
    )
  }

  const data = config.map((spec, i) => {
    const classes = classNames({
      'home-workflow-spec__table_row': true,
      'home-workflow-spec__table_row_even': !(i % 2),
    })

    const choices = spec.choices ? spec.choices.join(', ') : null
    const title = spec.label.length ? spec.label : spec.name

    let defaultValue
    if (spec.default_workflow_value && spec.default_workflow_value !== null) {
      defaultValue = spec.default_workflow_value.toString()
    }

    return (
      <div className={classes} key={i}>
        <div className='home-workflow-spec__table_type'>{spec.class}</div>
        <div className='home-workflow-spec__table_value'>
          <span className='home-workflow-spec__table_value-label'>{title}</span>
          <span className='home-workflow-spec__table_value-help'>{spec.help}</span>
          {defaultValue && <span className='home-workflow-spec__table_value-default'>{`Default: ${defaultValue}`}</span>}
          {choices && <span className='home-workflow-spec__table_value-default'>{`Choices: [${choices}]`}</span>}
        </div>
        {!spec.optional &&
          <div className='home-workflow-spec__table_required'>
            <span className='home-workflow-spec__table_required-label'>required</span>
          </div>
        }
      </div>
    )
  })

  return (
    <div className='home-workflow-spec__table'>
      <div className='home-workflow-spec__table_title'>{title}</div>
      {data}
    </div>
  )
}

SpecTable.propTypes = {
  title: PropTypes.string,
  config: PropTypes.array,
}

export default SpecTable
