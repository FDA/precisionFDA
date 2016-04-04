#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

AnswersController = Paloma.controller('Answers',
  show: ->
    params = @params
    $container = $("body main")

    noteModel = new Precision.models.NoteModel(params.note, params.attachments)
    ko.applyBindings(noteModel, $container[0])

    if params.editable
      noteModel.bindEdit($container)
      noteModel.toggleEdit() if params.edit?
)
