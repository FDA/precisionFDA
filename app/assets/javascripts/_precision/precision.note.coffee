class NoteModel
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

    @files = new AttachmentsModel({
      heading: 'Files'
      className: 'attachment-files'
      iconClass: 'fa fa-file-o'
      items: _.map(attachments.files, (item) ->
        return new ItemModel(item)
      )
    })

    @comparisons = new AttachmentsModel({
      heading: 'Comparisons'
      className: 'attachment-comparisons'
      iconClass: 'fa fa-area-chart'
      items: _.map(attachments.comparisons, (item) ->
        return new ItemModel(item)
      )
    })

    @apps = new AttachmentsModel({
      heading: 'Apps'
      className: 'attachment-apps'
      iconClass: 'fa fa-cube'
      items: _.map(attachments.apps, (item) ->
        return new ItemModel(item)
      )
    })

    @jobs = new AttachmentsModel({
      heading: 'Jobs'
      className: 'attachment-jobs'
      iconClass: 'fa fa-tasks'
      items: _.map(attachments.jobs, (item) ->
        return new ItemModel(item)
      )
    })

    @assets = new AttachmentsModel({
      heading: 'Assets'
      className: 'attachment-assets'
      iconClass: 'fa fa-file-zip-o'
      items: _.map(attachments.assets, (item) ->
        return new ItemModel(item)
      )
    })

    @attachments = [@files, @comparisons, @apps, @jobs, @assets]

    @isFormReady = ko.computed(() =>
      !@saving() && (@title() != @title.cache() || @content.cache() != @content() || _.some(@attachments, (attachment) -> attachment.hasChanges()))
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

    @objectSelector = new Precision.models.SelectorModel({
      title: "Attach data to your note"
      onSave: (selected) =>
        deferred = $.Deferred()
        _.each(selected, (item) =>
          itemModel = new ItemModel({
            uid: item.uid
            klass: item.className()
            title: item.title()
            path: item.path()
          }, { isNew: true })
          this["#{itemModel.klass}s"].items.push(itemModel)
        )
        deferred.resolve()
      listRelatedParams:
        classes: ["file", "comparison", "app", "job", "asset"]
      listModelConfigs: [
        {
          className: "file"
          name: "Files"
          apiEndpoint: "list_files"
          apiParams:
            states: ["closed"]
        }
        {
          className: "comparison"
          name: "Comparisons"
          apiEndpoint: "list_comparisons"
        }
        {
          className: "app"
          name: "Apps"
          apiEndpoint: "list_apps"
        }
        {
          className: "job"
          name: "Jobs"
          apiEndpoint: "list_jobs"
        }
        {
          className: "asset"
          name: "Assets"
          apiEndpoint: "list_assets"
        }
      ]
    })
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
      .done((res) =>
        _.each(@attachments, (attachmentSection) ->
          _.each(attachmentSection.items(), (item) ->
            item.isNew(false)
          )
        )
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
    @hasChanges = ko.computed(=> _.some(@items(), (item) -> item.isChanged()))

class ItemModel
  constructor: (item, opts = {}) ->
    opts = _.defaults(opts, {
      isNew: false
    })
    @klass = item.klass
    @uid = item.uid
    @name = item.title
    @path = item.path
    @isNew = ko.observable(opts.isNew)
    @removed = ko.observable(false)
    @removed.cache = ko.observable(false)

    @isChanged = ko.computed(=>
      @removed() != @removed.cache() || @isNew()
    )

  toggleRemove: () ->
    @removed.cache(!@removed.cache())

window.Precision ||= {}
window.Precision.models ||= {}
window.Precision.models.NoteModel = NoteModel
