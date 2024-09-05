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
    viewModel = new Precision.models.AppEditorModel(
      @params.app,
      @params.ubuntu_releases,
      (@params.instance_types.map (instance_type) -> window.Precision.utils.sanitizeInstanceTypeNbsp(instance_type)),
      'fork'
    )
    ko.applyBindings(viewModel, $container[0])
)