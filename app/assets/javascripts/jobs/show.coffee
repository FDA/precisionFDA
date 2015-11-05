#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

JobsController = Paloma.controller('Jobs')
JobsController::show = ->
  $container = $("body main")
  viewModel = {
    noteAttachModel: new Precision.models.NoteAttachModel(@params.id, 'Job')
  }

  ko.applyBindings(viewModel, $container[0])
