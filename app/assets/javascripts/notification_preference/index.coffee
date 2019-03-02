#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

MainController = Paloma.controller('Main',
  index: ->
    params = @params
    $container = $("body main")
    console.log(params)
)
