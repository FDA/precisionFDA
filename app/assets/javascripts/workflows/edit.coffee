
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
    viewModel = new Precision.wfEditor.WorkflowEditorModel(@params.apps, @params.workflow, @params.scope, 'edit')
    ko.applyBindings(viewModel, $container[0])
    window.viewModel = viewModel
})
