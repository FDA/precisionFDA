class ExpertsEditView
  constructor: (params) ->
    @modalUploader = new window.Precision.ModalImageUploader(params.imageUrl, params.fileId)

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

ExpertsController = Paloma.controller('Experts',
  edit: ->
    $container = $("body main")
    viewModel = new ExpertsEditView(@params)
    ko.applyBindings(viewModel, $container[0])

  new: ->
    $container = $("body main")
    viewModel = new ExpertsEditView(@params)
    ko.applyBindings(viewModel, $container[0])
)
