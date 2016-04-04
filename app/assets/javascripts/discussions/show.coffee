#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

DiscussionsController = Paloma.controller('Discussions',
  show: ->
    params = @params
    $container = $("body main")

    noteModel = new Precision.models.NoteModel(params.note, params.attachments)
    ko.applyBindings(noteModel, $container[0])

    $tooltips = $container.find("[data-toggle='tooltip']")
    if $tooltips.length > 0
      $tooltips.tooltip({container: 'body'})

    if params.editable
      noteModel.bindEdit($container)
      noteModel.toggleEdit() if params.edit?
)
