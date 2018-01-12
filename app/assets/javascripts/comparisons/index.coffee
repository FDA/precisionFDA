class ComparisonsListView
  constructor: (comparisonsIdsWithDescription) ->
    @comparisonsIdsWithDescription = comparisonsIdsWithDescription;
    @visibleIds = ko.observableArray([])

  isVisible: (id) ->
    return @visibleIds().indexOf(id) > -1

  toggle: (id) ->
    if @isVisible(id)
      @visibleIds.remove(id)
    else
      @visibleIds.push(id)

  toggleAll: ->
    if @visibleIds().length == @comparisonsIdsWithDescription.length
      @visibleIds([])
    else
      @toggle(id) for id in @comparisonsIdsWithDescription when !@isVisible(id)

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

ComparisonsController = Paloma.controller('Comparisons',
  index: ->
    $container = $("body main")
    viewModel = new ComparisonsListView(@params.comparisonsIdsWithDescription)
    ko.applyBindings(viewModel, $container[0])
)
