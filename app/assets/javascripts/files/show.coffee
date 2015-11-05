#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

FilesController = Paloma.controller('Files')
FilesController::show = ->
  $container = $("body main")
  viewModel = {
    noteAttachModel: new Precision.models.NoteAttachModel(@params.id, 'UserFile')
  }

  ko.applyBindings(viewModel, $container[0])
