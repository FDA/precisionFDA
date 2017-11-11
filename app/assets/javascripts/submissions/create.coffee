class PublishSubmissionViewModel extends Precision.PublishViewModel
  constructor: (graph, scope_to_publish_to, space, sub_params) ->
    super(graph, scope_to_publish_to, space)
    @subParams = JSON.stringify(sub_params)

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

MainController = Paloma.controller('Submissions',
  create: ->

    $container = $("body main")
    publishViewModel = new PublishSubmissionViewModel(
      @params.graph,
      @params.scope_to_publish_to,
      @params.space,
      @params.params
    )
    ko.applyBindings(publishViewModel, $container[0])
)
