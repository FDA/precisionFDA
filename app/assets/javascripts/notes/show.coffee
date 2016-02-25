#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

NotesController = Paloma.controller('Notes')
NotesController::show = ->
  params = @params
  $container = $("body main")

  noteModel = new Precision.models.NoteModel(params.note, params.attachments)
  ko.applyBindings(noteModel, $container[0])
