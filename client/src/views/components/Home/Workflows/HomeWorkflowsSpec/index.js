import React from 'react'
import PropTypes from 'prop-types'

import SpecTable from './SpecTable'

import './style.sass'


const renderEmptySpec = (type) => {
  return (
    <div className='home-workflow-spec__table-divider'>
      <div className='home-workflow-spec__table'>
        <div className='home-workflow-spec__table_title'>{type}</div>
        <div className='home-workflow-spec__table_row'>
          No fields specified
        </div>
      </div>
    </div>
  )
}

const renderSpecs = (stages) => {
  if (!stages.length) return renderEmptySpec('type')

  const list = stages.map((stage, i) => {

    return(
      <div key={`workflow-stage-${i}`}>
        <div className='home-workflow-spec__header'>
          <div className='home-workflow-spec__header_item'>
            <div className='home-workflow-spec__header_item_label'>stage</div>
            <div className='home-workflow-spec__header_item_value'>{`${stage.stageIndex +1 }`}</div>
          </div>
          <div className='home-workflow-spec__header_item'>
            <div className='home-workflow-spec__header_item_label'>name</div>
            <div className='home-workflow-spec__header_item_value'>{stage.name}</div>
          </div>
          <div className='home-workflow-spec__header_item'>
            <div className='home-workflow-spec__header_item_label'>default instance type</div>
            <div className='home-workflow-spec__header_item_value'>{stage.instanceType}</div>
          </div>
        </div>
        <div className='home-workflow-spec__table-block'>

          <SpecTable title={'inputs'} config={stage.inputs} />
          <SpecTable title={'outputs'} config={stage.outputs} />
        </div>
      </div>
    )
  })
  return (
    <>{ list }</>
  )
}

const HomeWorkflowsSpec = ({ spec = {}}) => {
  return (
    <div className='home-workflow-spec__container'>
      {spec.input_spec && renderSpecs(spec.input_spec.stages)}
    </div>
  )
}

HomeWorkflowsSpec.propTypes = {
  spec: PropTypes.object,
}

export default HomeWorkflowsSpec

export {
  HomeWorkflowsSpec,
}
