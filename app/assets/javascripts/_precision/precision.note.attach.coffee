class NoteAttachModel
  constructor: (@id, @type) ->
    @componentID = _.uniqueId('precision-component_')
    @modalSelector = ".#{@componentID} .note-attach-modal"

    @loading = ko.observable(false)
    @saving = ko.observable(false)
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
          return _.filter(notes, (note) -> note.name.match regexp)
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
            $modal.on("click", ".list-group-item", (e) =>
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

  getNotes: (params = {}) ->
    # TODO: Mark if a note has already been attached
    # params = {item_id: @id, item_type: @type}

    @loading(true)
    Precision.api '/api/list_notes', params, (notes) =>
      @loading(false)
      @notes(@createNoteModels(notes))
      firstNote = _.first(@notes.peek())
      @preview(firstNote) if firstNote?

  attach: () ->
    @saving(true)
    selectedNotes = @notes.selected.peek()
    return if !@canAttach.peek() && _.isEmpty(selectedNotes)
    params =
      note_ids: _.map(selectedNotes, (note) -> note.id)
      item_ids: [@id]
      item_type: @type

    Precision.api "/api/attach_to_notes", params, (res) =>
      location.reload()

class NoteModel
  constructor: (note, @parentModel) ->
    @id = note.id
    @slug = note.slug
    @title = note.title
    @content = ko.observable()

  getDescribe: () ->
    if _.isEmpty(@content.peek())
      Precision.api '/api/describe_note', {id: @id}, (describe) =>
        @content(Precision.md.render(describe.content))
        @parentModel.handleUpdate()


window.Precision ||= {}
window.Precision.models ||= {}
window.Precision.models.NoteAttachModel = NoteAttachModel
