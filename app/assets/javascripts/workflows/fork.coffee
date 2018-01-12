
#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

WorkflowsController = Paloma.controller('Workflows',
  fork: ->
    $container = $("body main")
    viewModel = new Precision.models.WorkflowEditorModel(@params.apps, @params.workflow, 'fork')
    ko.applyBindings(viewModel, $container[0])
)
