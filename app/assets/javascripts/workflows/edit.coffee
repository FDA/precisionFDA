
#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

WorkflowsController = Paloma.controller('Workflows',
  edit: ->
    $container = $("body main")
    viewModel = new Precision.models.WorkflowEditorModel(@params.apps, @params.workflow, 'edit')
    ko.applyBindings(viewModel, $container[0])
)
