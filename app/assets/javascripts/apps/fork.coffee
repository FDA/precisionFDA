#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

AppsController = Paloma.controller('Apps')
AppsController::new = ->
  $container = $("body main")
  viewModel = new Precision.models.AppEditorModel(@params.app, true)

  ko.applyBindings(viewModel, $container[0])
