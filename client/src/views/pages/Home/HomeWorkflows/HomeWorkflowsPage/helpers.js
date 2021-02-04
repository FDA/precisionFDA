export const handleAddWorkflowClick = () => {
  window.location = '/workflows/new'
}
const workflows = []

export const checkedWorkflows = workflows.filter((workflow) => workflow.isChecked)


