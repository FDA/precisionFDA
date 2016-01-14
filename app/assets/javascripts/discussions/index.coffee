#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

DiscussionsController = Paloma.controller('Discussions')
DiscussionsController::index = ->
  params = @params
  $container = $("body main")
