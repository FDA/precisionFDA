import PropTypes from 'prop-types'

import { getWorkflowState } from '../../helpers/home'


const HomeJobShape = {
  id: PropTypes.number,
  name: PropTypes.string,
  state: PropTypes.string,
  appTitle: PropTypes.string,
  workflowTitle: PropTypes.string,
  instanceType: PropTypes.string,
  duration: PropTypes.string,
  energyConsumption: PropTypes.string,
  createdAt: PropTypes.string,
  scope: PropTypes.string,
  links: PropTypes.object,
  launchedBy: PropTypes.string,
  location: PropTypes.string,
  createdAtDateTime: PropTypes.string,
  workflowUid: PropTypes.string,
  durationInSeconds: PropTypes.number,
  uid: PropTypes.string,
  tags: PropTypes.array,
  appRevision: PropTypes.number,
  featured: PropTypes.bool,
  isChecked: PropTypes.bool,
  isWorkflow: PropTypes.bool,
}

const HomeWorkflowShape = {
  name: PropTypes.string,
  addedBy: PropTypes.string,
  location: PropTypes.string,
  createdAtDateTime: PropTypes.string,
  tags: PropTypes.array,
  uid: PropTypes.string,
  id: PropTypes.number,
  links: PropTypes.object,
  launchedOn: PropTypes.string,
  title: PropTypes.string,
  isChecked: PropTypes.bool,
  isExpanded: PropTypes.bool,
  isWorkflow: PropTypes.bool,
  key: PropTypes.string,
}

const getExecution = (data) => ({
  id: data.id,
  name: data.name,
  state: data.state,
  appTitle: data.app_title,
  workflowTitle: data.workflow_title,
  instanceType: data.instance_type,
  duration: data.duration,
  energyConsumption: data.energy_consumption,
  createdAt: data.created_at,
  scope: data.scope,
  links: data.links,
  launchedBy: data.launched_by,
  location: data.location,
  createdAtDateTime: data.created_at_date_time,
  workflowUid: data.workflow_uid,
  durationInSeconds: data.duration_in_seconds,
  runDataUpdates: data.run_data_updates,
  runInputData: data.run_input_data,
  runOutputData: data.run_output_data,
  uid: data.uid,
  tags: data.tags,
  appRevision: data.app_revision,
  featured: data.featured,
  isChecked: false,
  isWorkflow: false,
  key: PropTypes.string,
})

const getWorkflow = (data) => ({
  name: data.name,
  addedBy: data.added_by,
  location: data.location,
  createdAtDateTime: data.created_at_date_time,
  tags: data.tags,
  uid: data.uid,
  id: data.id,
  links: data.links,
  launchedOn: data.launched_on,
  title: data.title,
  isChecked: false,
  isExpanded: false,
  isWorkflow: true,
})

const mapToJob = (data, i) => {
  if (data.uid && data.uid.includes('workflow')) {
    const executions = data.jobs.map(getExecution)

    const workflowAdditionalData = executions.reduce((acc, e) => {
      acc.duration += e.durationInSeconds
      acc.energy += Number(e.energyConsumption)
      return acc
    }, { duration: 0, energy: 0 })

    const states = executions.map(e => e.state)
    const state = getWorkflowState(states)

    return {
      ...getWorkflow(data),
      duration: workflowAdditionalData.duration || 'N/A',
      energy: workflowAdditionalData.energy || 'TBD',
      state,
      executions,
      key: i + data.uid,
    }
  } else {
    return {
      ...getExecution(data),
      key: i + data.uid,
    }
  }
}

export default HomeJobShape

export {
  HomeJobShape,
  HomeWorkflowShape,
  getExecution,
  mapToJob,
}

