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
  viewModel = new ComparisonsNewView()
  ko.applyBindings(viewModel, $("[data-controller=comparisons][data-action=new]")[0]);
