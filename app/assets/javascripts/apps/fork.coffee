#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

AppsController = Paloma.controller('Apps',
  fork: ->
    $container = $("body main")
    viewModel = new Precision.models.AppEditorModel(@params.app, 'fork')

    ko.applyBindings(viewModel, $container[0])
)
