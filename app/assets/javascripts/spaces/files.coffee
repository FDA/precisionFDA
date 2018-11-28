class SpacesFilesView
  constructor: (@params) ->
    @scope = @params.scope
    @nodes = @params.nodes
    @filesIdsWithDescription = @params.filesIdsWithDescription
    @visibleIds = ko.observableArray([])
    @selectedItems = ko.observableArray([])
    @renameModal = $('#rename-modal-js')
    @moveModal = $('#move-modal')
    @deleteModal = $('#delete-files-modal')
    @downloadModal = $('#download-files-modal')
    @publishModal = $('#publish-files-modal')

    @moveFilesModal = new Precision.models.MoveFilesModal({
      selectedItems: @selectedItems,
      rootName: @params.rootName,
      nodes: @params.topNodes
    })

    @downloadFilesModal = new Precision.models.ActionsWithFilesModal({
      selectedItems: @selectedItems,
      selectedListURL: @params.selectedListURL,
      scope: @scope,
      task: 'download'
    })

    @deleteFilesModal = new Precision.models.ActionsWithFilesModal({
      selectedItems: @selectedItems,
      selectedListURL: @params.selectedListURL,
      scope: @scope,
      task: 'delete'
    })

    @publishFilesModal = new Precision.models.ActionsWithFilesModal({
      selectedItems: @selectedItems,
      selectedListURL: @params.selectedListURL,
      scope: @scope,
      task: 'publish'
    })

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

  updateSelectedNodes: (e) ->
    target = e.currentTarget
    checked = target.checked
    value = target.value

    if (checked)
      @selectedItems.push(value)
    else
      @selectedItems.remove(value)

  isRenamingAllowed: ->
    @selectedItems().length == 1

  showRenamingModal: ->
    if (@isRenamingAllowed())
      @renameModal.modal('show')

  focusInput: ->
    $('#rename_form [name="file[name]"]').focus()

  fillModal: ->
    selected = @nodes[@selectedItems()[0]]
    $('#rename_form [name="file[name]"]').val(selected.name)
    $('#rename_form [name="file[id]"]').val(selected.id)
    $('#rename_form').attr('action', selected.rename_path)

  isMovingAllowed: ->
    @selectedItems().length > 0

  showMoveModal: ->
    if (@isMovingAllowed())
      @moveModal.modal('show')

  isDownloadingAllowed: ->
    @selectedItems().length > 0

  showDownloadModal: ->
    if (@isDownloadingAllowed())
      @downloadFilesModal.getItems()
      @downloadModal.modal('show')

  isDeletingAllowed: ->
    @selectedItems().length > 0

  showDeleteModal: ->
    if (@isDeletingAllowed())
      @deleteFilesModal.getItems()
      @deleteModal.modal('show')

  isPublishingAllowed: ->
    @selectedItems().length > 0

  showPublishModal: ->
    if (@isPublishingAllowed())
      @publishFilesModal.getItems()
      @publishModal.modal('show')

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

SpacesController = Paloma.controller('Spaces', {
  files: () ->
    $container = $("#ko_spaces_files_container")
    viewModel = new SpacesFilesView({
      filesIdsWithDescription: @params.filesIdsWithDescription,
      rootName: @params.rootName,
      nodes: @params.nodes,
      topNodes: @params.topNodes,
      selectedListURL: @params.selectedListURL,
      scope: @params.scope
    })
    ko.applyBindings(viewModel, $container[0])

    $container.on('change', '[name="files[selected][]"]', (e) ->
      viewModel.updateSelectedNodes(e)
    )
    $container.on('show.bs.modal', '#rename-modal-js', (e) ->
      viewModel.fillModal()
    )

})
