
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
      'edit'
    )
    ko.applyBindings(viewModel, $container[0])
    Precision.wfEditor.addLoadAppsOnScroll(viewModel)
    window.viewModel = viewModel
})
