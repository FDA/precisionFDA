class NoteModel
  constructor: (note, attachments) ->
    @noteEditor = null
    md = new Remarkable({
      linkify: true
    })

    @id = note.id
    @content = ko.observable(note.content)
    @content.cache = ko.observable(note.content)
    @content.display = ko.computed(() =>
      md.render(@content())
    )
    @title = ko.observable(note.title)
    @title.cache = ko.observable(note.title)

    @saving = ko.observable(false)
    @editing = ko.observable(false)

    @isFormReady = ko.computed(() =>
      !_.isEmpty(@title.cache()) && !@saving()
    )

    @files = new AttachmentsModel({
      heading: 'Files'
      className: 'attachment-files'
      iconClass: 'fa fa-files-o'
      items: _.map(attachments.files, (item) ->
        _item =
          type: 'UserFile'
          id: item.id
          name: item.name
          path: "/files/#{item.dxid}"
        return new ItemModel(_item)
      )
    })

    @comparisons = new AttachmentsModel({
      heading: 'Comparisons'
      className: 'attachment-comparisons'
      iconClass: 'fa fa-area-chart'
      items: _.map(attachments.comparisons, (item) ->
        _item =
          type: 'Comparison'
          id: item.id
          name: item.name
          path: "/comparisons/#{item.id}"
          detail: item.stats
        return new ItemModel(_item)
      )
    })

    @apps = new AttachmentsModel({
      heading: 'Apps'
      className: 'attachment-apps'
      iconClass: 'fa fa-cubes'
      items: _.map(attachments.apps, (item) ->
        _item =
          type: 'App'
          id: item.id
          name: item.title
          path: "/apps/#{item.dxid}/jobs"
        return new ItemModel(_item)
      )
    })

    @jobs = new AttachmentsModel({
      heading: 'Jobs'
      className: 'attachment-jobs'
      iconClass: 'fa fa-tasks'
      items: _.map(attachments.jobs, (item) ->
        _item =
          type: 'Job'
          id: item.id
          name: item.name
          path: "/jobs/#{item.dxid}"
        return new ItemModel(_item)
      )
    })

    @attachments = [@files, @comparisons, @apps, @jobs]

  toggleEdit: () ->
    @editing(!@editing())
    @noteEditor.resize()

  save: () ->
    @toggleEdit()
    @title(_.trim(@title.cache()))
    @content(@content.cache())
    @saving(true)

    allItemModels = _.flatten(_.map(@attachments, (attachmentSection) -> attachmentSection.items()))
    attachmentsToSave = []
    for item in allItemModels
      if item.removed.cache()
        item.removed(true)
      else
        attachmentsToSave.push({id: item.id, type: item.type})

    params =
      note:
        content: @content.peek()
        title: @title.peek()
      attachments: attachmentsToSave

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

    allItemModels = _.flatten(_.map(@attachments, (attachmentSection) -> attachmentSection.items()))
    for item in allItemModels
      if item.removed.cache()
        item.removed.cache(false)

class AttachmentsModel
  constructor: (attachments) ->
    @heading = attachments.heading
    @className = attachments.className
    @iconClass = attachments.iconClass
    @items = ko.observableArray(attachments.items)

class ItemModel
  constructor: (item) ->
    @type = item.type
    @id = item.id
    @name = item.name
    @path = item.path
    @detail = item.detail
    @removed = ko.observable(false)
    @removed.cache = ko.observable(false)

  toggleRemove: () ->
    @removed.cache(!@removed.cache())

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

  noteModel = new NoteModel(params.note, params.attachments)
  ko.applyBindings(noteModel, $container[0])

  noteModel.noteEditor = ko.aceEditors.get('note-editor')

  noteModel.toggleEdit() if _.isEmpty(noteModel.content())

  if params.note?
    # FIXME: Only works on refresh
    # $(window).on('beforeunload', () ->
    #   if noteModel.editing()
    #     "If you leave this page you will lose your unsaved changes."
    #   else
    #     return
    # )

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
