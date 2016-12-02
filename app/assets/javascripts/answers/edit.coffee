#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

AnswersController = Paloma.controller('Answers',
  edit: ->
    params = @params
    $container = $("body main")

    noteModel = new Precision.models.NoteModel(params.note, params.attachments)
    noteModel.editing(true)
    ko.applyBindings(noteModel, $container[0])

    noteModel.bindEdit($container)
    noteModel.toggleEdit()
)
