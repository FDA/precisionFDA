#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

ParticipantsController = Paloma.controller('Admin/Organizations',
  index: ->
    $container = $("body main")
    initWiceGrid()  #for some reason explicit init needed otherwise filters don't work
)