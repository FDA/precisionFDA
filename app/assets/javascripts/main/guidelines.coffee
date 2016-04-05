#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

MainController = Paloma.controller('Main',
  guidelines: ->
    $container = $("body main")

    Precision.carousel.setHeight("#guidelines-carousel")
)
