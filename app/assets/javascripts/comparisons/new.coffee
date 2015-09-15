class ComparisonsNewView
  constructor: () ->

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

ComparisonsController = Paloma.controller('Comparisons')
ComparisonsController::new = ->
  new ComparisonsNewView()
