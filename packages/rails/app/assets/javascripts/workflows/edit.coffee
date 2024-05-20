
#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

WorkflowsController = Paloma.controller('Workflows', {
  edit: ->
    $container = $("body main")
    viewModel = new Precision.wfEditor.WorkflowEditorModel(
      @params.apps,
      @params.workflow,
      @params.scope,
      @params.instance_types.map (instance_type) -> window.Precision.utils.sanitizeInstanceTypeNbsp(instance_type),
      'edit'
    )
    ko.applyBindings(viewModel, $container[0])
    Precision.wfEditor.addLoadAppsOnScroll(viewModel)
    window.viewModel = viewModel
})
