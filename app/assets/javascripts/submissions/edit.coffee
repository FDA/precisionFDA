class EditSubmissionModel
  constructor: (submission, name) ->
    @noteEditor = null

    @id = submission.id
    @content = ko.observable(submission.desc)
    @content.cache = ko.observable(submission.desc)
    @content.preview = ko.computed(() =>
      Precision.md.render(@content.cache())
    )
    @content.display = ko.computed(() =>
      Precision.md.render(@content())
    )
    @title = ko.observable(name)
    @title.cache = ko.observable(name)

    @saving = ko.observable(false)
    @editing = ko.observable(false)

    @isFormReady = ko.computed(() =>
      !@saving() && (@title() != @title.cache() || @content.cache() != @content())
    )

    @saveBtnText = ko.computed(() =>
      if @saving()
        "Saving..."
      else
        if @isFormReady()
          "Save"
        else
          "Saved"
    )

  bindEdit: ($container) ->
    @noteEditor = ko.aceEditors.get('note-editor')

    $container.on('click', '.note-editing .note-attachments .attachment a', (e) -> e.preventDefault())

    $container.on('click', 'a[data-method=delete]', (e) => @cancel())

    $container.on('click', '.event-edit', (e) => @toggleEdit())

  toggleEdit: () ->
    @editing(!@editing())
    @noteEditor.resize()

    if @editing()
      Precision.bind.save(this, @save)
      Precision.bind.traps()
    else
      Precision.unbind.traps()

  save: () ->
    @title(_.trim(@title.cache()))
    @content(@content.cache())
    @saving(true)

    params =
      id: @id
      content: @content.peek()
      title: @title.peek()

    Precision.api("/api/update_submission/", params)
      .done((res) =>
      ).fail((error) ->
        console.error(error)
      ).always(() =>
        @saving(false)
      )
#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

NotesController = Paloma.controller('Submissions',
  edit: ->
    $container = $("body main")

    editSubmissionModel = new EditSubmissionModel(@params.submission, @params.name)
    editSubmissionModel.editing(true)
    ko.applyBindings(editSubmissionModel, $container[0])

    editSubmissionModel.bindEdit($container)
    editSubmissionModel.toggleEdit()
)
