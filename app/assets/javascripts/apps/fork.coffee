#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

AppsController = Paloma.controller('Apps')
AppsController::fork = ->
  $container = $("body main")
  viewModel = new Precision.models.AppEditorModel(@params.app, 'fork')

  ko.applyBindings(viewModel, $container[0])
