import PropTypes from 'prop-types'


const HomeWorkflowsDiagramShape = {
  stages: PropTypes.arrayOf(HomeWorkflowsDiagramStageShape),
  specs: PropTypes.array,
}

const HomeWorkflowsDiagramStageShape = {
  title: PropTypes.string,
  inputs: PropTypes.bool,
  app: PropTypes.object,
  outputs: PropTypes.bool,
}

const mapToHomeWorkflowDiagramShape = (data) => ({
  data: data,
})

export default HomeWorkflowsDiagramShape

export {
  mapToHomeWorkflowDiagramShape,
  HomeWorkflowsDiagramShape,
}
