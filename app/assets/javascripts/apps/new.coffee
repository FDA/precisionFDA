#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

AppsController = Paloma.controller('Apps',
  new: ->
    $container = $("body main")
    viewModel = new Precision.models.AppEditorModel(@params.app, 'new')

    ko.applyBindings(viewModel, $container[0])

    $container.on "change.files.new", ".event-browse-files", (e) ->
      file = e.target.files[0]

      return unless file

      reader = new FileReader()
      reader.onload = (e) ->
        Precision.api '/api/apps/attributes_by_cwl', { cwl: e.target.result }
          , (data) =>
            if data.errors
              _.each(data.errors, (error) =>
                Precision.alert.show(error)
              )
            else
              viewModel.name(data.name)
              viewModel.title(data.title)
              viewModel.readme(data.readme)
              viewModel.code(data.code)
              viewModel.internetAccess(data.internet_access)
              viewModel.createInputs(data.input_spec)
              viewModel.createOutputs(data.output_spec)
              viewModel.packages(data.packages)
          , (data) =>
            Precision.alert.show('File is invalid')

      reader.readAsText(file)
      e.target.value = ''
)
