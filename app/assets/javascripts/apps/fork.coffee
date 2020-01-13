#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

AppsController = Paloma.controller('Apps',
  fork: ->
    $container = $("body main")
    viewModel = new Precision.models.AppEditorModel(@params.app, @params.ubuntu_releases, 'fork')

    ko.applyBindings(viewModel, $container[0])
)
