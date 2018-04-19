### Show error for ContentTools dialog ###
#= require ./content_tools/dialog_errors.coffee

### ContentTools VideoDialog Monkeypatch ###
### Aim - add url validation ###
#= require ./content_tools/video_dialog.coffee

### ContentTools ImageDialog Monkeypatch ###
### Aim - change upload image dialog ###
#= require ./content_tools/image_dialog.coffee

### ContentTools PropertiesDialog Monkeypatch ###
### Aim - prohibit to insert DOM nodes ###
#= require ./content_tools/properties_dialog.coffee

class EditorModel

  showError: (message) ->
    Precision.alert.show(message)
    new (ContentTools.FlashUI)('no')
    window.location.reload()

  initEditor: ->
    @editor = ContentTools.EditorApp.get()
    @editor.init '[data-editable], [data-fixture]', 'data-name'

    @editor.addEventListener 'saved', (ev) =>
      # Check if this was a passive save
      passive = ev.detail().passive
      # Check to see if there are any changes to save
      regions = ev.detail().regions
      if Object.keys(regions).length == 0
        return
      # Set the editors state to busy while we save our changes
      @editor.busy true

      # Collect the contents of each region into a FormData instance
      payload = {}
      payload.regions = regions
      payload.id = @challenge_id

      route = " /api/challenges/#{@challenge_id}/save_editor_page"
      Precision.api(route, payload)
        .done((data) =>

          if data?.errors
            @showError(data.errors)
          else if !passive
            new (ContentTools.FlashUI)('ok')
        )
        .fail((error) =>

          try
            errorObject = JSON.parse error.responseText
            message = errorObject.error.message
          catch
            message = 'Something went wrong!'

          @showError(message)
        )
        .always( =>
          @editor.busy false
        )

  constructor: (challenge_id) ->

    @challenge_id = challenge_id

    ContentTools.StylePalette.add [
      new (ContentTools.Style)('By-line', 'article__by-line', [ 'p' ])
      new (ContentTools.Style)('Caption', 'article__caption', [ 'p' ])
      new (ContentTools.Style)('Example', 'example', [ 'pre' ])
      new (ContentTools.Style)('Example + Good', 'example--good', [ 'pre' ])
      new (ContentTools.Style)('Example + Bad', 'example--bad', [ 'pre' ])
    ]

    @initEditor()

    FIXTURE_TOOLS = [ [
      'undo'
      'redo'
      'remove'
    ] ]
    IMAGE_FIXTURE_TOOLS = [ [
      'undo'
      'redo'
      'image'
    ] ]
    LINK_FIXTURE_TOOLS = [ [
      'undo'
      'redo'
      'link'
    ] ]
    ContentEdit.Root.get().bind 'focus', (element) =>
      if element.isFixed()
        if element.type() == 'ImageFixture'
          tools = IMAGE_FIXTURE_TOOLS
        else if element.tagName() == 'a'
          tools = LINK_FIXTURE_TOOLS
        else
          tools = FIXTURE_TOOLS
      else
        tools = ContentTools.DEFAULT_TOOLS
      if @editor.toolbox().tools() != tools
        return @editor.toolbox().tools(tools)
      return

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

EditorController = Paloma.controller('Challenges',
  edit_page: ->
    $container = $("body main")
    params = @params
    viewModel = new EditorModel(params.challenge.id)
    ko.applyBindings(viewModel, $container[0])

    $(document).on 'page:before-change', ->
      if viewModel.editor.getState() == 'editing' and !window.Precision.SESSION_CHECKER_MODAL_OPEN
        if confirm 'Changes you made may not be saved.'
          viewModel.editor.unmount()
          viewModel.initEditor()

          $(document).on 'page:update', ->
            window.location.reload()

          return true
        else
          return false

)
