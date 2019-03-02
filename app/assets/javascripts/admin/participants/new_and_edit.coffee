class editView
  constructor: (params) ->
    @modalUploader = new window.Precision.ModalImageUploader(params.imageUrl, params.fileId)

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

ParticipantsController = Paloma.controller('Admin/Participants',
  new: ->
    $container = $("body main")
    viewModel = new editView(@params)
    ko.applyBindings(viewModel, $container[0])

  edit: ->
    $container = $("body main")
    viewModel = new editView(@params)
    ko.applyBindings(viewModel, $container[0])
)
