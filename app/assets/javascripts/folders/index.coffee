class FilesListView
  constructor: (filesIdsWithDescription) ->
    @filesIdsWithDescription = filesIdsWithDescription;
    @visibleIds = ko.observableArray([])

  isVisible: (id) ->
    return @visibleIds().indexOf(id) > -1

  toggle: (id) ->
    if @isVisible(id)
      @visibleIds.remove(id)
    else
      @visibleIds.push(id)

  toggleAll: ->
    if @visibleIds().length == @filesIdsWithDescription.length
      @visibleIds([])
    else
      @toggle(id) for id in @filesIdsWithDescription when !@isVisible(id)

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

FoldersController = Paloma.controller('Folders',
  index: ->
    $container = $("body main")
    viewModel = new FilesListView(@params.filesIdsWithDescription)
    ko.applyBindings(viewModel, $container[0])
)
