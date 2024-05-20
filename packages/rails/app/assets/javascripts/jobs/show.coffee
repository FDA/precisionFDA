class JobViewModel
  constructor: (desc) ->
    @descriptionDisplay = Precision.md.render(desc)

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
      jobViewModel: new JobViewModel(@params.desc)
    }
    ko.applyBindings(viewModel, $container[0])
)
