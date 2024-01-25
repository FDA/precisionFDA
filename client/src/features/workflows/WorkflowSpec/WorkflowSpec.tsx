import React from 'react'
import PropTypes from 'prop-types'
import { StyledWorkflowSpec } from './styles'
import { WorkflowSpecTable } from './WorkflowSpecTable'


const renderEmptySpec = (type: string) => {
  return (
    <div className='__table-divider'>
      <div className='__table'>
        <div className='__table_title'>{type}</div>
        <div className='__table_row'>
          No fields specified
        </div>
      </div>
    </div>
  )
}

const renderSpecs = (stages: any[]) => {
  if (!stages.length) return renderEmptySpec('type')

  const list = stages.map((stage, i) => {

    return(
      <div key={`workflow-stage-${i}`}>
        <div className='__header'>
          <div className='__header_item'>
            <div className='__header_item_label'>stage</div>
            <div className='__header_item_value'>{`${stage.stageIndex +1 }`}</div>
          </div>
          <div className='__header_item'>
            <div className='__header_item_label'>name</div>
            <div className='__header_item_value'>{stage.name}</div>
          </div>
          <div className='__header_item'>
            <div className='__header_item_label'>default instance type</div>
            <div className='__header_item_value'>{stage.instanceType}</div>
          </div>
        </div>
        <div className='__table-block'>

          <WorkflowSpecTable title={'inputs'} config={stage.inputs} />
          <WorkflowSpecTable title={'outputs'} config={stage.outputs} />
        </div>
      </div>
    )
  })
  return (
    <>{ list }</>
  )
}

const HomeWorkflowsSpec = ({ spec = {}}: { spec: any}) => {
  return (
    <StyledWorkflowSpec>
      {spec.input_spec && renderSpecs(spec.input_spec.stages)}
    </StyledWorkflowSpec>
  )
}

HomeWorkflowsSpec.propTypes = {
  spec: PropTypes.object,
}

export default HomeWorkflowsSpec

export {
  HomeWorkflowsSpec,
}
