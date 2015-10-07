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

class NoteEditorModel
  constructor: (@noteInstance) ->
    @title = ko.observable()

    @isFormReady = ko.computed(() =>
      !_.isEmpty(@title())
    )

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

NotesController = Paloma.controller('Notes')
NotesController::new = ->
  $container = $("body main")

  ATTACHMENTS = [
    {
      name: 'File 1'
      path: '/files/1'
      icon: 'fa fa-file-o'
      type: 'file'
    }
    {
      name: 'Comparison A vs B'
      path: '/comparisons/1'
      icon: 'fa fa-crosshairs'
      type: 'comparison'
      score: '99%'
    }
    {
      name: 'BWA'
      path: '/apps/1'
      icon: 'fa fa-cube'
      type: 'app'
    }
  ]

  # When an item in the contact list is dragged, copy its data into drag and drop data transfer.
  # This data is later read by the editor#paste listener in the attachment-inline plugin defined above.
  CKEDITOR.document.getById('attachment-list').on 'dragstart', (evt) ->
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
    dataTransfer.setData 'attachment', ATTACHMENTS[target.data('attachment')]
    # We need to set some normal data types to backup values for two reasons:
    # * In some browsers this is necessary to enable drag and drop into text in editor.
    # * The content may be dropped in another place than the editor.
    dataTransfer.setData 'text/html', target.getText()
    return

  NOTE_INSTANCE_NAME = 'note-editor'
  CKEDITOR.disableAutoInline = true
  CKEDITOR.inline(NOTE_INSTANCE_NAME, ckConfig)
  noteInstance = CKEDITOR.instances[NOTE_INSTANCE_NAME]

  noteEditorModel = new NoteEditorModel(noteInstance)
  ko.applyBindings(noteEditorModel, $container[0])
