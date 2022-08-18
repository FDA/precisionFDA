
#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

WorkflowsController = Paloma.controller('Workflows', {
  fork: ->
    $container = $("body main")
    viewModel = new Precision.wfEditor.WorkflowEditorModel(
      @params.apps,
      @params.workflow,
      @params.scope,
      @params.instance_types,
      'fork'
    )
    ko.applyBindings(viewModel, $container[0])
    Precision.wfEditor.addLoadAppsOnScroll(viewModel)
})
