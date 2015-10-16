ckConfig =
  height: 400
  extraPlugins: 'widget,autogrow,attachment'
  toolbarGroups: [
    {name: 'clipboard', groups: ['clipboard', 'undo']}
    {name: 'styles', groups: ['styles']}
    {name: 'basicstyles', groups: ['basicstyles', 'cleanup']}
    {name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi', 'paragraph']}
    {name: 'links', groups: ['links']}
    {name: 'insert', groups: ['insert']}
    {name: 'editing', groups: ['find', 'selection', 'spellchecker', 'editing']}
    {name: 'forms', groups: ['forms']}
    {name: 'tools', groups: ['tools']}
    {name: 'document', groups: ['mode', 'document', 'doctools']}
    {name: 'others', groups: ['others']}
    {name: 'colors', groups: ['colors']}
    {name: 'about', groups: ['about']}
  ]
  removeButtons: 'Subscript,Superscript,Cut,Copy,Paste,PasteText,PasteFromWord,SpecialChar,Source,Strike,Underline,Styles,About,Scayt'
  on:
    insertElement: (e) ->
      el = $(e.data.$)
      if (el.is('table'))
        el.addClass('table table-bordered').removeAttr('cellpadding').removeAttr('cellspacing')
  autoGrow_minHeight: 400
  autoGrow_onStartup: true

class NoteModel
  constructor: (note) ->
    @editorInstance = null

    @id = note.id
    @slug = note.slug
    @content = note.content ? ''
    @title = ko.observable(note.title)
    @title.cache = ko.observable(note.title)

    @saving = ko.observable(false)
    @editing = ko.observable(false)

    @isFormReady = ko.computed(() =>
      !_.isEmpty(@title.cache()) && !@saving()
    )

  toggleEdit: () ->
    @editing(!@editing())
    $("#note-editor").attr('contenteditable', @editing())

  save: () ->
    @toggleEdit()
    @title(_.trim(@title.cache()))
    @content = @editorInstance.getData()
    @editorInstance.destroy()
    @saving(true)

    params =
      note:
        content: @content
        title: @title()

    $.ajax("/notes/#{@slug}", {
      method: "PUT"
      data: params
    }).done((res) =>
      if res.note.slug != @slug
        window.location.replace("/notes/#{res.note.slug}")
    ).fail((error) ->
      console.error(error)
    ).always(() =>
      @saving(false)
    )

  cancel: () ->
    @editorInstance.setData(@content)
    @editorInstance.destroy(true)
    @toggleEdit()
    @title.cache(@title())

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

  if params.note?
    $(window).on('beforeunload', () ->
      if noteModel.editing()
        "If you leave this page you will lose your unsaved changes."
      else
        return
    )

    # Prepare data for CKEDITOR
    params.comparisons = _.map(params.comparisons, (comparison) ->
      comparison.type = "comparison"
      comparison.icon = "fa fa-area-chart"
      comparison.path = "/comparisons/#{comparison.id}"
      comparison.stats.precision = "#{parseFloat(comparison.stats.precision) * 100}%"
      comparison.stats.recall = "#{parseFloat(comparison.stats.recall) * 100}%"
      comparison.stats['f-measure'] = "#{parseFloat(comparison.stats['f-measure']) * 100}%"
      return comparison
    )

    params.files = _.map(params.files, (file) ->
      file.type = "file"
      file.icon = "fa fa-file-o"
      file.path = "/files/#{file.dxid}"
      return file
    )

    $container.on('click', '.note-editing .note-attachments .attachment a', (e) -> e.preventDefault())
    $container.on('click', 'a[data-method=delete]', (e) -> noteModel.cancel())

    $container.on('click', '.event-edit', (e) ->
      noteModel.toggleEdit()

      # When an item in the contact list is dragged, copy its data into drag and drop data transfer.
      # This data is later read by the editor#paste listener in the attachment-inline plugin defined above.
      CKEDITOR.document.getById('note-attachments').on 'dragstart', (evt) ->
        # The target may be some element inside the draggable div (e.g. the image), so get the div.h-card.
        target = evt.data.getTarget().getAscendant((el) ->
          el.hasClass?('attachment')
        , true)
        # Initialization of CKEditor data transfer facade is a necessary step to extend and unify native
        # browser capabilities. For instance, Internet Explorer does not support any other data type than 'text' and 'URL'.
        # Note: evt is an instance of CKEDITOR.dom.event, not a native event.
        CKEDITOR.plugins.clipboard.initDragDataTransfer evt
        dataTransfer = evt.data.dataTransfer
        # Pass an object with contact details. Based on it, the editor#paste listener in the attachment-inline plugin
        # will create HTML to be inserted into the editor. We could set text/html here as well, but:
        # * It is a more elegant and logical solution that this logic is kept in the attachment-inline plugin.
        # * We do not know now where the content will be dropped and the HTML to be inserted
        # might vary depending on the drop target.
        data = target.data('attachment').split("/")
        attachmentType = data[1]
        attachmentID = data[2]
        attachmentData = _.find(params[attachmentType], (item) ->
          switch attachmentType
            when "files"
              item.dxid == attachmentID
            else
              item.id == parseInt(attachmentID)
        )
        dataTransfer.setData 'attachment', attachmentData
        # We need to set some normal data types to backup values for two reasons:
        # * In some browsers this is necessary to enable drag and drop into text in editor.
        # * The content may be dropped in another place than the editor.
        dataTransfer.setData 'text/html', target.getText()

      NOTE_INSTANCE_NAME = 'note-editor'
      CKEDITOR.disableAutoInline = true
      CKEDITOR.inline(NOTE_INSTANCE_NAME, ckConfig)
      editorInstance = CKEDITOR.instances[NOTE_INSTANCE_NAME]
      noteModel.editorInstance = editorInstance
    )
