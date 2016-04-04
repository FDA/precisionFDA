#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

AppsController = Paloma.controller('Apps',
  edit: ->
    $container = $("body main")
    viewModel = new Precision.models.AppEditorModel(@params.app, 'edit')

    ko.applyBindings(viewModel, $container[0])
)
