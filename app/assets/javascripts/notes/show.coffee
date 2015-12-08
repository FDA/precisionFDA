class NoteViewModel
  constructor: (note, attachments) ->
    @noteEditor = null

    @id = note.id
    @content = ko.observable(note.content)
    @content.cache = ko.observable(note.content)
    @content.preview = ko.computed(() =>
      Precision.md.render(@content.cache())
    )
    @content.display = ko.computed(() =>
      Precision.md.render(@content())
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
      iconClass: 'fa fa-file-o'
      items: _.map(attachments.files, (wrapper) ->
        return new ItemModel(wrapper)
      )
    })

    @comparisons = new AttachmentsModel({
      heading: 'Comparisons'
      className: 'attachment-comparisons'
      iconClass: 'fa fa-area-chart'
      items: _.map(attachments.comparisons, (wrapper) ->
        return new ItemModel(wrapper)
      )
    })

    @apps = new AttachmentsModel({
      heading: 'Apps'
      className: 'attachment-apps'
      iconClass: 'fa fa-cube'
      items: _.map(attachments.apps, (wrapper) ->
        return new ItemModel(wrapper)
      )
    })

    @jobs = new AttachmentsModel({
      heading: 'Jobs'
      className: 'attachment-jobs'
      iconClass: 'fa fa-tasks'
      items: _.map(attachments.jobs, (wrapper) ->
        return new ItemModel(wrapper)
      )
    })

    @assets = new AttachmentsModel({
      heading: 'Assets'
      className: 'attachment-assets'
      iconClass: 'fa fa-file-zip-o'
      items: _.map(attachments.assets, (wrapper) ->
        return new ItemModel(wrapper)
      )
    })

    @attachments = [@files, @comparisons, @apps, @jobs, @assets]

  toggleEdit: () ->
    @editing(!@editing())
    @noteEditor.resize()

    if @editing()
      Precision.bind.save(this, @save)
      Precision.bind.traps()
    else
      Precision.unbind.traps()

  save: () ->
    @toggleEdit()
    @title(_.trim(@title.cache()))
    @content(@content.cache())
    @saving(true)

    allItemModels = _.flatten(_.map(@attachments, (attachmentSection) -> attachmentSection.items()))
    attachmentsToSave = []
    attachmentsToDelete = []
    for item in allItemModels
      if item.removed.cache()
        attachmentsToDelete.push(item.uid)
        item.removed(true)
      else
        attachmentsToSave.push(item.uid)

    params =
      id: @id
      content: @content.peek()
      title: @title.peek()
      attachments_to_save: attachmentsToSave
      attachments_to_delete: attachmentsToDelete

    Precision.api("/api/update_note/", params)
      .done((res) ->
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
  constructor: (wrapper) ->
    @klass = wrapper.klass
    @uid = wrapper.uid
    @name = wrapper.item?.title ? wrapper.uid
    @path = if wrapper.item? then (switch wrapper.klass
      when "app" then "/apps/#{wrapper.uid}"
      when "asset" then "/app_assets/#{wrapper.uid}"
      when "comparison" then "/comparisons/#{wrapper.uid.replace /^comparison-/, ''}"
      when "file" then "/files/#{wrapper.uid}"
      when "job" then "/jobs/#{wrapper.uid}"
      else null) else null
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

  noteModel = new NoteViewModel(params.note, params.attachments)
  ko.applyBindings(noteModel, $container[0])

  noteModel.noteEditor = ko.aceEditors.get('note-editor')

  noteModel.toggleEdit() if params.edit?

  if params.note?
    $container.on('click', '.note-editing .note-attachments .attachment a', (e) -> e.preventDefault())

    $container.on('click', 'a[data-method=delete]', (e) -> noteModel.cancel())

    $container.on('click', '.event-edit', (e) ->
      noteModel.toggleEdit())
