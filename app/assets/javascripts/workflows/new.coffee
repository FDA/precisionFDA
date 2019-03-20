#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

WorkflowsController = Paloma.controller('Workflows', {
  new: ->
    $container = $("body main")
    viewModel = new Precision.wfEditor.WorkflowEditorModel(@params.apps, null, 'new')
    ko.applyBindings(viewModel, $container[0])
    window.viewModel = viewModel
})
