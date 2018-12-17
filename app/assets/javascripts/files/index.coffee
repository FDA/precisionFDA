class FilesListView
  constructor: (filesIdsWithDescription, rootName, nodes, topNodes, selectedListURL, scope) ->
    @filesIdsWithDescription = filesIdsWithDescription
    @selectedListURL = selectedListURL
    @visibleIds = ko.observableArray([])
    @selectedItems = ko.observableArray([])
    @renameModal = $('#rename-modal-js')
    @moveModal = $('#move-modal')
    @downloadModal = $('#download-files-modal')
    @deleteModal = $('#delete-files-modal')
    @publishModal = $('#publish-files-modal')
    @nodes = nodes
    self.nodes = @nodes
    @scope = scope

    @moveFilesModal = new Precision.models.MoveFilesModal({
      selectedItems: @selectedItems,
      rootName: rootName,
      nodes: topNodes
    })

    @downloadFilesModal = new Precision.models.ActionsWithFilesModal({
      selectedItems: @selectedItems,
      selectedListURL: @selectedListURL,
      scope: scope,
      task: 'download'
    })

    @deleteFilesModal = new Precision.models.ActionsWithFilesModal({
      selectedItems: @selectedItems,
      selectedListURL: @selectedListURL,
      scope: scope,
      task: 'delete'
    })

    @publishFilesModal = new Precision.models.ActionsWithFilesModal({
      selectedItems: @selectedItems,
      selectedListURL: @selectedListURL,
      scope: scope,
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

  anyInVerifiedSpace: (ids) ->
    ids.some((node) ->
      @nodes[node].in_verified_space == true
    )

  isRenamingAllowed: ->
    return false if @anyInVerifiedSpace(@selectedItems())
    @selectedItems().length == 1

  showRenamingModal: ->
    if (@isRenamingAllowed())
      @renameModal.modal('show')

  focusInput: ->
    $('#rename_form [name="name"]').focus()

  fillModal: ->
    selected = @nodes[@selectedItems()[0]]
    $('#rename_form [name="file[name]"]').val(selected.name)
    $('#rename_form').attr('action', selected.rename_path)

  isMovingAllowed: ->
    return false if @anyInVerifiedSpace(@selectedItems())
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
    return false if @anyInVerifiedSpace(@selectedItems())
    @selectedItems().length > 0

  showDeleteModal: ->
    if (@isDeletingAllowed())
      @deleteFilesModal.getItems()
      @deleteModal.modal('show')

  isPublishingAllowed: ->
    return false if @anyInVerifiedSpace(@selectedItems())
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

FilesController = Paloma.controller('Files',
  index: ->
    $container = $("body main")
    viewModel = new FilesListView @params.filesIdsWithDescription,
                                  @params.rootName,
                                  @params.nodes,
                                  @params.topNodes,
                                  @params.selectedListURL,
                                  @params.scope

    ko.applyBindings(viewModel, $container[0])
    $container.on('change', '[name="files[selected][]"]', (e) ->
      viewModel.updateSelectedNodes(e)
    )
    $container.on('show.bs.modal', '#rename-modal-js', (e) ->
      viewModel.fillModal()
    )
    $container.on('shown.bs.modal', '#rename-modal-js', (e) ->
      viewModel.focusInput()
    )
)
