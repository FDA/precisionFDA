class ComparisonShowView
  constructor: (meta) ->
    # Data points
    @weightedROC = meta["weighted_roc"]

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

ComparisonsController = Paloma.controller('Comparisons')
ComparisonsController::show = ->
  $container = $("body main")
  viewModel = new ComparisonShowView(@params.meta)
  ko.applyBindings(viewModel, $container[0])
