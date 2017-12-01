class SpacesContentView
  constructor: (@space_uid, filesIdsWithDescription, rootName, nodes, topNodes, selectedListURL, scope) ->
    @objectSelector = new Precision.models.SelectorModel({
      title: "Move data to space"
      help: "Only private data can be moved to a Space. Data in a Space can be published, but cannot be made private again."
      onSave: (selected) =>
        Precision.api("/api/publish/", {
          scope: @space_uid,
          uids: _.map(selected, "uid")
        })
      onAfterSave: () ->
        window.location.reload(true)
      listRelatedParams:
        editable: true
        scopes: ["private"]
        classes: ["file", "note", "comparison", "app", "asset", "job"]
      listModelConfigs: [
        {
          className: "file"
          name: "Files"
          apiEndpoint: "list_files"
          apiParams:
            editable: true
            scopes: ["private"]
            states: ["closed"]
        }
        {
          className: "note"
          name: "Notes"
          apiEndpoint: "list_notes"
          apiParams:
            editable: true
            scopes: ["private"]
            note_types: ["Note"]
        }
        {
          className: "comparison"
          name: "Comparisons"
          apiEndpoint: "list_comparisons"
          apiParams:
            editable: true
            scopes: ["private"]
        }
        {
          className: "app"
          name: "Apps"
          apiEndpoint: "list_apps"
          apiParams:
            editable: true
            scopes: ["private"]
        }
        {
          className: "asset"
          name: "Assets"
          apiEndpoint: "list_assets"
          apiParams:
            editable: true
            scopes: ["private"]
        }
        {
          className: "job"
          name: "Jobs"
          apiEndpoint: "list_jobs"
          apiParams:
            editable: true
            scopes: ["private"]
        }
      ]
    })
    @filesIdsWithDescription = filesIdsWithDescription;
    @visibleIds = ko.observableArray([])
    @selectedItems = ko.observableArray([])
    @selectedListURL = selectedListURL
    @renameModal = $('#rename-modal-js')
    @moveModal = $('#move-modal')
    @deleteModal = $('#delete-files-modal')
    @downloadModal = $('#download-files-modal')
    @publishModal = $('#publish-files-modal')
    @nodes = nodes
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

SpacesController = Paloma.controller('Spaces',
  content: ->
    params = @params
    $container = $("body main")
    viewModel = new SpacesContentView(
      params.space_uid,
      params.filesIdsWithDescription,
      @params.rootName,
      @params.nodes,
      @params.topNodes,
      @params.selectedListURL,
      @params.scope
    )
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
