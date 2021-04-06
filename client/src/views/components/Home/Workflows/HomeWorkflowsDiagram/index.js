import React, { useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import classNames from 'classnames/bind'
import Xarrow from 'react-xarrows'
import uniqid from 'uniqid'

import { fetchWorkflowDiagram } from '../../../../../actions/home/workflows'
import { getSpacesIcon } from '../../../../../helpers/spaces'
import { homeWorkflowsWorkflowDiagramSelector } from '../../../../../reducers/home/workflows/selectors'
import Icon from '../../../Icon'
import Loader from '../../../Loader'
import './style.scss'


const HomeWorkflowsDiagram = (props) => {
  const { workflowDiagram, uid, fetchWorkflowDiagram } = props
  const { isFetching, stages } = workflowDiagram

  useLayoutEffect(() => {
    if (uid) {
      fetchWorkflowDiagram(uid)
    }
  }, [uid])

  if (isFetching) return <div className='text-center'><Loader/></div>

  const stageList = Object.entries(stages).map((apps, idx) => {
    return (
      <Stage key={uniqid(idx)} stageIndex={idx} apps={apps[1]}/>
    )
  })

  return (
    <div className='<form form-horizontal'>
      <div className='workflows standard container'>
        <div className='workflows'>
          <div className='wf-diagram'>
            <div className='wf-diagram-stages'>
              <>
                {stageList}
              </>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Stage = ({ apps, stageIndex }) => {
  if (apps.length === 0) return <NoData/>

  const stageApps = apps.map((app, idx) => {
    return (
      <div key={uniqid(idx)} className='wf-diagram-slot'>
        <SlotApp app={app}/>
      </div>
    )
  })

  return (
    <>
      <h3>{`Stage ${stageIndex + 1}`}</h3>
      <div className='wf-diagram-slots'>
        <>{stageApps}</>
      </div>
    </>
  )
}

const NoData = () => {
  return <div className='text-center'>No data found</div>
}

const AppOutputs = ({ outputs, slotId }) => {
  if (outputs.length === 0) return null

  const outputsList = outputs.map((output, idx) => {
    const refs = !!(output && output.values && output.values.id)
    const outputRef = refs && 'from-' + slotId + output.name
    const title = output.name

    const outputClass = classNames({
      'fa fa-arrow-down': true,
      'text-muted': !refs,
      'workflow-digaram-gly': refs,
    })

    return (
      <div key={uniqid(idx)} className='shifted-io'>
        <i id={outputRef.toString()} className={outputClass} title={title}/>
      </div>
    )
  })

  return (
    <>{outputsList}</>
  )
}

const AppInputs = ({ inputs, slotId }) => {
  if (inputs.length === 0) return null

  const inputsList = inputs.map((input, idx) => {
    const refs = !!(input && input.values && input.values.id)
    const inputRef = refs && 'to-' + slotId + input.name
    const outputRef = refs && 'from-' + input.values.id + input.values.name
    const title = input.name

    const inputClass = classNames({
      'glyphicon glyphicon-filter': true,
      'text-muted': !refs,
      'workflow-digaram-gly': refs,
    })

    const appArrows = (
      refs ?
        <Xarrow
          start={outputRef}
          end={inputRef}
          startAnchor="bottom"
          endAnchor="top"
          curveness={1.5}
          headSize={2}
          color='#1F70B5'
          strokeWidth={1}
        /> :
        null
    )

    return (
      <div key={uniqid(idx)} className='shifted-io'>
        <i id={inputRef.toString()} className={inputClass} title={title}/>
        {appArrows}
      </div>
    )
  })

  return (
    <>{inputsList}</>
  )
}

const SlotApp = ({ app }) => {
  const appUri = `/home/apps/${app.app_uid}`

  return (
    <>
      <div className='wf-diagram-arrows'>
        <div className='shifted-io'>
          <AppInputs inputs={app.inputs} slotId={app.slotId}/>
        </div>
      </div>
      <div className='workflow input-configured'>
        <div className='workflows input-item'>
          <Link to={ { pathname: appUri } }>
            <Icon icon={getSpacesIcon('apps')} fw/>
            <span>{app.name}</span>
          </Link>
        </div>
      </div>
      <div className='wf-diagram-arrows'>
        <div className='shifted-io'>
          <AppOutputs outputs={app.outputs} slotId={app.slotId}/>
        </div>
      </div>
    </>
  )
}

Stage.propTypes = {
  apps: PropTypes.array.isRequired,
  stageIndex: PropTypes.number,
}

AppInputs.propTypes = {
  inputs: PropTypes.array,
  slotId: PropTypes.string,
}

AppOutputs.propTypes = {
  outputs: PropTypes.array,
  slotId: PropTypes.string,
}

SlotApp.propTypes = {
  app: PropTypes.object,
}

HomeWorkflowsDiagram.propTypes = {
  uid: PropTypes.string,
  workflowDiagram: PropTypes.object,
  fetchWorkflowDiagram: PropTypes.func,
}

const mapDispatchToProps = (dispatch) => ({
  fetchWorkflowDiagram: (uid) => dispatch(fetchWorkflowDiagram(uid)),
})

const mapStateToProps = (state) => ({
  workflowDiagram: homeWorkflowsWorkflowDiagramSelector(state),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeWorkflowsDiagram)
