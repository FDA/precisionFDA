class NoteModel
  constructor: (note) ->
    @noteEditor = null
    @id = note.id
    @content = ko.observable(note.content)
    @content.cache = ko.observable(note.content)
    @title = ko.observable(note.title)
    @title.cache = ko.observable(note.title)

    @saving = ko.observable(false)
    @editing = ko.observable(false)

    @isFormReady = ko.computed(() =>
      !_.isEmpty(@title.cache()) && !@saving()
    )

  toggleEdit: () ->
    @editing(!@editing())
    @noteEditor.resize()

  save: () ->
    @toggleEdit()
    @title(_.trim(@title.cache()))
    @content(@content.cache())
    @saving(true)

    params =
      note:
        content: @content.peek()
        title: @title.peek()

    $.ajax("/notes/#{@id}", {
      method: "PUT"
      data: params
    }).done((res) =>
      window.location.replace(res.path) if window.location.pathname != res.path
    ).fail((error) ->
      console.error(error)
    ).always(() =>
      @saving(false)
    )

  cancel: () ->
    @toggleEdit()
    @title.cache(@title())
    @content.cache(@content())

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

  noteModel = new NoteModel(params.note)
  ko.applyBindings(noteModel, $container[0])

  noteModel.noteEditor = ko.aceEditors.get('note-editor')

  noteModel.toggleEdit() if _.isEmpty(noteModel.content())

  if params.note?
    $(window).on('beforeunload', () ->
      if noteModel.editing()
        "If you leave this page you will lose your unsaved changes."
      else
        return
    )

    $container.on('click', '.note-editing .note-attachments .attachment a', (e) -> e.preventDefault())

    $container.on('click', 'a[data-method=delete]', (e) -> noteModel.cancel())

    $container.on('click', '.event-edit', (e) ->
      noteModel.toggleEdit())

    # # Prepare data for CKEDITOR
    # params.comparisons = _.map(params.comparisons, (comparison) ->
    #   comparison.type = "comparison"
    #   comparison.icon = "fa fa-area-chart"
    #   comparison.path = "/comparisons/#{comparison.id}"
    #   comparison.stats.precision = "#{parseFloat(comparison.stats.precision) * 100}%"
    #   comparison.stats.recall = "#{parseFloat(comparison.stats.recall) * 100}%"
    #   comparison.stats['f-measure'] = "#{parseFloat(comparison.stats['f-measure']) * 100}%"
    #   return comparison
    # )

    # params.files = _.map(params.files, (file) ->
    #   file.type = "file"
    #   file.icon = "fa fa-file-o"
    #   file.path = "/files/#{file.dxid}"
    #   return file
    # )
