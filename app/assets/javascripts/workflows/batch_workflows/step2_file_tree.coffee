TYPE_FILE = 'UserFile'
TYPE_FOLDER = 'Folder'


loadFolderTree = (parentId = null, scope = ['private']) ->
  params = {
    parent_folder_id: parentId,
    scoped_parent_folder_id: parentId,
    scopes: scope,
  }
  return $.post('/api/folder_tree', params)


class FileTree extends Precision.FileTree
  onSelectNodeCallback: (e, data) ->

  onDeselectNodeCallback: (e, data) ->

  onRootNodesReady: (e, data) ->

  onRootNodesLoad: (e, data) ->

  loadNodes: (e, data) ->
    $node = data.instance.get_node(data.node.id, true)
    children = data.node.children
    if !children or children.length == 0
      $node.addClass("jstree-loading")
      @disabled = true

      loadFolderTree(data.node.original.id, @folderTreeScope).then(
        (nodes) =>
          @addNodes(data, @prepareNodes(nodes, data.node.state.selected))
          @disabled = false
          $node.removeClass("jstree-loading")
          @onSelectNodeCallback(e, data)
        (error) =>
          Precision.alert.showAboveAll('Something went wrong while loading nodes!')
          @disabled = false
          @onSelectNodeCallback(e, data)
      )
    else
      @onSelectNodeCallback(e, data)

  onSelectNode: (e, data) =>
    if !@disabled and data.node.id != 'root' and data.node.data.type == TYPE_FOLDER
      @loadNodes(e, data)
    else
      @onSelectNodeCallback(e, data)

  onDeselectNode: (e, data) =>
    @onDeselectNodeCallback(e, data)

  prepareNodes: (nodes, selected = false) ->
    return _.values(nodes).map((node) ->
      {
        icon: if node.type == TYPE_FOLDER then 'fa fa-folder' else 'fa fa-file-o',
        id: node.id,
        text: node.name.replace(/\//g, ''),
        type: node.type,
        name: node.name,
        data: {
          uid: node.uid,
          type: node.type
        },
        state: {
          selected: selected
        }
      }
    ).sort((a, b) ->
      return 1 if a.type > b.type
      return -1 if a.type < b.type
      return 0
    )

  constructor: (defaultNodes = [], container, @folderTreeScope, isLoadingRootNodes, @onRootNodesLoad) ->
    jsTreeParams = {
      container: container,
      defaultNodes: @prepareNodes(defaultNodes),
      rootName: 'My accessible files',
      addCheckboxes: true
    }
    super(jsTreeParams)
    @disabled = false
    do @onRootNodesLoad if isLoadingRootNodes
    do @initTree


class BatchWorkflowFileTree
  createNewTree: (container, onRootNodesLoad) ->
    tree = new FileTree(@rootNodes, container, @folderTreeScope, @isLoadingRootNodes, onRootNodesLoad)
    @folderTrees.push(tree)
    return tree

  constructor: (scope) ->
    @folderTrees = []
    @rootNodes = []
    @folderTreeScope = scope
    @isLoadingRootNodes = true
    loadFolderTree(null, scope).then(
      (nodes) =>
        @isLoadingRootNodes = false
        @rootNodes = nodes || []
        @folderTrees.forEach((tree) =>
          fileTree = tree.treeContainer.jstree(true)
          tree.onRootNodesReady()
          defaultNodes = tree.prepareNodes(@rootNodes)
          data = Object.assign(tree.TREE, { children: defaultNodes })
          fileTree.settings.core.data = data
          fileTree.refresh()
        )
      (error) -> Precision.alert.showAboveAll('Something went wrong!')
    )

window.Precision ||= {}
window.Precision.BatchWorkflowFileTree = BatchWorkflowFileTree
