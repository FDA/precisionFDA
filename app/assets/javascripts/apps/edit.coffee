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
    viewModel = new Precision.models.AppEditorModel(@params.app, @params.ubuntu_releases, 'edit')

    ko.applyBindings(viewModel, $container[0])
)
