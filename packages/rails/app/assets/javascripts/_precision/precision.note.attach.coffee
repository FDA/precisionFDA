class NoteAttachModel
  constructor: (@id, @type) ->
    @componentID = _.uniqueId('precision-component_')
    @modalSelector = ".#{@componentID} .note-attach-modal"

    @loading = ko.observable(false)
    @saving = ko.observable(false)
    @refreshing = ko.observable(false)
    @query = ko.observable()

    @notes = ko.observableArray()
    @notes.selected = ko.observableArray()
    @notes.searchedIDs = ko.observableArray()
    @notes.filtered = ko.computed(=>
      notes = @notes()
      query = @query()
      if query?
        notesSearchIDs = @notes.searchedIDs()
        if notesSearchIDs.length
          return _.filter(notes, (note) -> _.includes(notesSearchIDs, note.dxid))
        else
          regexp = new RegExp(query, "i")
          return _.filter(notes, (note) -> !_.isBlank(note.title) && note.title.match regexp)
      else
        return notes
    )

    @notes.filtered.subscribe((filtered) =>
      @handleUpdate()
    )

    @previewedNote = ko.observable()

    @canAttach = ko.computed(=>
      !@loading() && !@saving() && @notes.selected().length > 0
    )

    @attachText = ko.computed(=>
      if @saving() then 'Attaching...' else 'Attach'
    )

    @queryActionClasses = ko.computed(=>
      if @loading()
        return 'disabled'
      else if !_.isEmpty(@query())
        return 'btn-link-danger'
      else
        return 'disabled'
    )

    @queryIconClasses = ko.computed(=>
      if @loading()
        return 'fa fa-fw fa-spinner fa-spin'
      else if !_.isEmpty(@query())
        return 'fa fa-fw fa-times'
      else
        return 'fa fa-fw fa-search'
    )

  handleUpdate: () =>
    $(@modalSelector).modal('handleUpdate')

  open: () =>
    if $(@modalSelector).length == 0
      @getNotes()
      $div = $("<div class='#{@componentID}'>")
      $("body").append($div)
      ko.renderTemplate("template-note-attach-modal",
        this,
        {
          afterRender: () =>
            $modal = $(@modalSelector)
            $modal.modal()
            $modal.on("click", ".event-note-preview", (e) =>
              @preview(ko.dataFor(e.currentTarget))
            )
        },
        $div[0]
      )
    else
      @notes.selected([])
      $(@modalSelector).modal('show')

  preview: (noteModel) =>
    @previewedNote(noteModel)
    noteModel.getDescribe()

  createNoteModels: (notes) =>
    return _.map(notes, (note) => new NoteModel(note, this))

  refreshNotes: () ->
    @refreshing(true)
    @getNotes()

  getNotes: (params = {}) ->
    # TODO: Mark if a note has already been attached
    # params = {item_id: @id, item_type: @type}
    params = _.defaults(params, {
      fields: ["title", "note_type"]
      editable: true
    })
    @loading(true)
    Precision.api '/api/list_notes', params, (notes) =>
      @loading(false)
      @refreshing(false)
      @notes(@createNoteModels(notes))
      firstNote = _.first(@notes.peek())
      @preview(firstNote) if firstNote?

  attach: () ->
    @saving(true)
    selectedNotes = @notes.selected.peek()
    return if !@canAttach.peek() && _.isEmpty(selectedNotes)
    params =
      note_uids: _.map(selectedNotes, (note) -> note.uid)
      items: [{
        id: @id
        type: @type
      }]
    Precision.api "/api/attach_to_notes", params, (res) =>
      location.reload()

  queryAction: () =>
    @clearQuery() if !_.isEmpty(@query())

  clearQuery: () =>
    @query("")

class NoteModel
  constructor: (note, @parentModel) ->
    @uid = note.uid
    @id = note.id
    @className = note.className
    @path = note.path
    @title = note.title
    @content = ko.observable()
    @loading = ko.observable(false)

  getDescribe: () ->
    if _.isUndefined(@content.peek()) && !@loading()
      @loading(true)
      params =
        uid: @uid
        describe:
          fields: ["content"]
      Precision.api '/api/describe', params, (describe) =>
        @loading(false)
        @content(Precision.md.render(describe.content))
        @parentModel.handleUpdate()


window.Precision ||= {}
window.Precision.models ||= {}
window.Precision.models.NoteAttachModel = NoteAttachModel
