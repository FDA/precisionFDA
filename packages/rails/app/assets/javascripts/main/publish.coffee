#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

MainController = Paloma.controller('Main',
  publish: ->

    PublishViewModel = Precision.PublishViewModel

    $container = $("body main")
    publishViewModel = new PublishViewModel(
      @params.graph,
      @params.scope_to_publish_to,
      @params.space
      @params.message
    )
    ko.applyBindings(publishViewModel, $container[0])
)
