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
    viewModel = new Precision.models.WorkflowEditorModel(@params.apps, null, 'new')
    ko.applyBindings(viewModel, $container[0])
})
