import React from 'react'
import classNames from 'classnames'
import { Link } from 'react-router-dom'
import Xarrow from 'react-xarrows'
import uniqid from 'uniqid'
import { CubeIcon } from '../../../../components/icons/CubeIcon'
import { Loader } from '../../../../components/Loader'
import { StyledWorkflowDiagram } from './styles'
import { useWorkflowDiagramQuery } from './useWorkflowDiagramQuery'

const NoData = () => {
  return <div className="text-center">No data found</div>
}

const AppOutputs = ({
  outputs,
  slotId,
}: {
  outputs: any[]
  slotId: string
}) => {
  if (outputs.length === 0) return null

  return (
    <>
      {outputs.map((output, idx) => {
        const refs = !!(output && output.values && output.values.id)
        const outputRef = refs && `from-${slotId}${output.name}`
        const title = output.name

        const outputClass = classNames({
          'fa fa-arrow-down': true,
          'text-muted': !refs,
          'workflow-digaram-gly': refs,
        })

        return (
          <div key={uniqid(`${idx}`)} className="shifted-io">
            <i
              id={outputRef.toString()}
              className={outputClass}
              title={title}
            />
          </div>
        )
      })}
    </>
  )
}

const AppInputs = ({ inputs, slotId }: { inputs: any[]; slotId: string }) => {
  if (inputs.length === 0) return null

  return (
    <>
      {inputs.map((input, idx) => {
        const refs = !!(input && input.values && input.values.id)
        const inputRef = refs && `to-${slotId}${input.name}`
        const outputRef = refs && `from-${input.values.id}${input.values.name}`
        const title = input.name

        const inputClass = classNames({
          'glyphicon glyphicon-filter': true,
          'text-muted': !refs,
          'workflow-digaram-gly': refs,
        })

        const appArrows = refs ? (
          <Xarrow
            start={outputRef as any}
            end={inputRef as any}
            startAnchor="bottom"
            endAnchor="top"
            curveness={1.5}
            headSize={2}
            color="#1F70B5"
            strokeWidth={1}
          />
        ) : null

        return (
          <div key={uniqid(`${idx}`)} className="shifted-io">
            <i id={inputRef.toString()} className={inputClass} title={title} />
            {appArrows}
          </div>
        )
      })}
    </>
  )
}

const SlotApp = ({ app }: { app: any }) => {
  const appUri = `/home/apps/${app.app_uid}`

  return (
    <>
      <div className="wf-diagram-arrows">
        <div className="shifted-io">
          <AppInputs inputs={app.inputs} slotId={app.slotId} />
        </div>
      </div>
      <div className="workflow input-configured">
        <div className="workflows input-item">
          <Link to={{ pathname: appUri }}>
            <CubeIcon width={14} />
            <span>{app.name}</span>
          </Link>
        </div>
      </div>
      <div className="wf-diagram-arrows">
        <div className="shifted-io">
          <AppOutputs outputs={app.outputs} slotId={app.slotId} />
        </div>
      </div>
    </>
  )
}

const Stage = ({ apps, stageIndex }: { apps?: any; stageIndex: number }) => {
  if (apps.length === 0) return <NoData />

  const stageApps = apps.map((app: any, idx: string) => {
    return (
      <div key={uniqid(idx)} className="wf-diagram-slot">
        <SlotApp app={app} />
      </div>
    )
  })

  return (
    <>
      <h3>{`Stage ${stageIndex + 1}`}</h3>
      <div className="wf-diagram-slots">{stageApps}</div>
    </>
  )
}

const WorkflowsDiagram = ({ workflowId }: { workflowId: string }) => {
  const { data, isLoading } = useWorkflowDiagramQuery(workflowId)
  if (isLoading) return <Loader />

  const stageList = Object.entries(data!.stages).map((apps, idx) => {
    return (
      <Stage key={uniqid(`${idx}`)} stageIndex={idx} apps={apps[1] as any} />
    )
  })

  return (
    <StyledWorkflowDiagram className="<form form-horizontal">
      <div className="workflows standard container">
        <div className="workflows">
          <div className="wf-diagram">
            <div className="wf-diagram-stages">{stageList}</div>
          </div>
        </div>
      </div>
    </StyledWorkflowDiagram>
  )
}

export default WorkflowsDiagram
