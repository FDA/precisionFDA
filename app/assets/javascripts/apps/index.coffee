#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

AppsController = Paloma.controller('Apps')
AppsController::index = ->
  $container = $("body main")
  viewModel = {}
  if @params.app?
    viewModel.noteAttachModel = new Precision.models.NoteAttachModel(@params.app.id, 'App')

    if @params.releaseable
      viewModel.appReleaseModel = new Precision.models.AppReleaseModel(@params.app.dxid)

  ko.applyBindings(viewModel, $container[0])
