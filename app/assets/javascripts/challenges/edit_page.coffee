### Show error for ContentTools dialog ###
#= require ./content_tools/dialog_errors.coffee

### ContentTools VideoDialog Monkeypatch ###
### Aim - add url validation ###
#= require ./content_tools/video_dialog.coffee

### ContentTools ImageDialog Monkeypatch ###
### Aim - change upload image dialog ###
#= require ./content_tools/image_dialog.coffee

class EditorModel

  constructor: (challenge_id) ->

    FIXTURE_TOOLS = undefined
    IMAGE_FIXTURE_TOOLS = undefined
    LINK_FIXTURE_TOOLS = undefined
    editor = undefined
    req = undefined

    ContentTools.StylePalette.add [
      new (ContentTools.Style)('By-line', 'article__by-line', [ 'p' ])
      new (ContentTools.Style)('Caption', 'article__caption', [ 'p' ])
      new (ContentTools.Style)('Example', 'example', [ 'pre' ])
      new (ContentTools.Style)('Example + Good', 'example--good', [ 'pre' ])
      new (ContentTools.Style)('Example + Bad', 'example--bad', [ 'pre' ])
    ]

    editor = ContentTools.EditorApp.get()
    editor.init '[data-editable], [data-fixture]', 'data-name'
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
    ContentEdit.Root.get().bind 'focus', (element) ->
      tools = undefined
      if element.isFixed()
        if element.type() == 'ImageFixture'
          tools = IMAGE_FIXTURE_TOOLS
        else if element.tagName() == 'a'
          tools = LINK_FIXTURE_TOOLS
        else
          tools = FIXTURE_TOOLS
      else
        tools = ContentTools.DEFAULT_TOOLS
      if editor.toolbox().tools() != tools
        return editor.toolbox().tools(tools)
      return

    editor.addEventListener 'saved', (ev) ->
      name = undefined
      onStateChange = undefined
      passive = undefined
      payload = undefined
      regions = undefined
      xhr = undefined
      # Check if this was a passive save
      passive = ev.detail().passive
      # Check to see if there are any changes to save
      regions = ev.detail().regions
      if Object.keys(regions).length == 0
        return
      # Set the editors state to busy while we save our changes
      @busy true

      # Collect the contents of each region into a FormData instance
      payload = {}
      payload.regions = regions
      payload.id = challenge_id

      route = "/challenges/#{challenge_id}/editor/save_page"
      Precision.api(route, payload)
        .done((data) =>
          if !passive
            new (ContentTools.FlashUI)('ok')
        )
        .fail((error) =>
          # Save failed, notify the user with a flash
          new (ContentTools.FlashUI)('no')
          errorObject = JSON.parse error.responseText
          @errorMessage(errorObject.error.message)
          console.error(error)
        )
        .always(=>
          editor.busy false
        )

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
      console.log viewModel.editor._state
      confirm 'page:before-change'

)
