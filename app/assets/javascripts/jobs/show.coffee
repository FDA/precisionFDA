#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

JobsController = Paloma.controller('Jobs',
  show: ->
    $container = $("body main")
    viewModel = {
      noteAttachModel: new Precision.models.NoteAttachModel(@params.id, 'Job')
    }

    ko.applyBindings(viewModel, $container[0])
)
