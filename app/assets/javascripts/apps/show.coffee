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
  viewModel = {
    noteAttachModel: new Precision.models.NoteAttachModel(@params.app.id, 'App')
  }
  if @params.releaseable
    viewModel.appReleaseModel = new Precision.models.AppReleaseModel(@params.app.dxid)

  ko.applyBindings(viewModel, $container[0])

  $container.find('[data-toggle="tooltip"]').tooltip({
    container: 'body'
  })
