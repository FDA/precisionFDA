#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

MainController = Paloma.controller('Main')
MainController::guidelines = ->
  $container = $("body main")

  Precision.carousel.setHeight("#guidelines-carousel")
