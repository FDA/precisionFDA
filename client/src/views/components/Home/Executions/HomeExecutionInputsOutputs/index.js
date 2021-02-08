import React, { Fragment } from 'react'
import classNames from 'classnames'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import './style.sass'


const Table = ({ title, config }) => {
  const list = config.map((e, i) => {
    const classes = classNames({
      'home-execution-inp-out__table_row': true,
      'home-execution-inp-out__table_row_even': !(i % 2),
    })

    return (
      <Fragment key={i}>
        <div className={classNames(classes, 'home-execution-inp-out__table_type')}>{e.label}</div>
        {e.link ?
          <Link to={e.link} className={classes}>{String(e.value)}</Link> :
          <div className={classes}>{String(e.value)}</div>
        }
      </Fragment>
    )
  })

  return (
    <div className='home-execution-inp-out__table'>
      <div className='home-execution-inp-out__table_title'>{title}</div>
      <div className='home-execution-inp-out__grid'>
        {list}
      </div>
    </div>
  )
}

const HomeExecutionInputsOutputs = ({ runInputData, runOutputData }) => {
  const getConfig = (config) => {
    return config.map((e) => {
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
    <div className='home-execution-inp-out__container'>
      {<Table title='inputs' config={inputConfig} />}
      {<Table title='outputs' config={outputConfig} />}
    </div>
  )
}

HomeExecutionInputsOutputs.propTypes = {
  runDataUpdates: PropTypes.object,
  runInputData: PropTypes.array,
  runOutputData: PropTypes.array,
}

HomeExecutionInputsOutputs.defaultProps = {
  runDataUpdates: {},
  runInputData: [],
  runOutputData: [],
}

Table.propTypes = {
  config: PropTypes.array,
  title: PropTypes.string,
}

export default HomeExecutionInputsOutputs
