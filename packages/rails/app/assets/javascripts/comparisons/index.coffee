class ComparisonsListView
  constructor: () ->
    @descToggle = new Precision.DescriptionToggleModel('comparisons_grid')

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

ComparisonsController = Paloma.controller('Comparisons', {
  index: ->
    $container = $("body main")
    viewModel = new ComparisonsListView()
    ko.applyBindings(viewModel, $container[0])
})
