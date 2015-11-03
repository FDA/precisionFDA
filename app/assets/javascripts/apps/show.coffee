#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

AppsController = Paloma.controller('Apps')
AppsController::show = ->
  $container = $("body main")
  viewModel = {}
  if @params.releaseable
    viewModel.appReleaseModel = new Precision.models.AppReleaseModel(@params.app.dxid)

  ko.applyBindings(viewModel, $container[0])
