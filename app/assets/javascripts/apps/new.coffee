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
  viewModel = new Precision.models.AppEditorModel(@params.app, 'new')

  ko.applyBindings(viewModel, $container[0])
