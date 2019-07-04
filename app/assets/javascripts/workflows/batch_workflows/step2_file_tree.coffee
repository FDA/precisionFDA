TYPE_FILE = 'UserFile'
TYPE_FOLDER = 'Folder'


loadFolderTree = (parentId = null) ->
  params = {
    parent_folder_id: parentId,
    scopes: ['private'],
  }
  return $.post('/api/folder_tree', params)


class FileTree extends Precision.FileTree
  onSelectNodeCallback: (e, data) ->

  onDeselectNodeCallback: (e, data) ->

  loadNodes: (data) ->
    $node = data.instance.get_node(data.node.id, true)
    children = data.node.children
    if !children or children.length == 0
      $node.addClass("jstree-loading")
      @disabled = true

      loadFolderTree(data.node.original.id).then(
        (nodes) =>
          @addNodes(data, @prepareNodes(nodes))
          @disabled = false
          $node.removeClass("jstree-loading")
        (error) =>
          Precision.alert.showAboveAll('Something went wrong!')
          @disabled = false
      )

  onSelectNode: (e, data) =>
    if !@disabled and data.node.id != 'root' and data.node.data.type == TYPE_FOLDER
      @loadNodes(data)
    @onSelectNodeCallback(e, data)

  onDeselectNode: (e, data) =>
    @onDeselectNodeCallback(e, data)

  prepareNodes: (nodes) ->
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
        }
      }
    ).sort((a, b) ->
      return 1 if a.type > b.type
      return -1 if a.type < b.type
      return 0
    )

  constructor: (defaultNodes = [], container) ->
    jsTreeParams = {
      container: container,
      defaultNodes: @prepareNodes(defaultNodes),
      rootName: 'My accessible files',
      addCheckboxes: true
    }
    super(jsTreeParams)
    @disabled = false
    do @initTree


class BatchWorkflowFileTree
  createNewTree: (container) ->
    tree = new FileTree(@rootNodes, container)
    @folderTrees.push(tree)
    return tree

  constructor: () ->
    @folderTrees = []
    @rootNodes = []
    loadFolderTree().then(
      (nodes) => @rootNodes = nodes || []
      (error) -> Precision.alert.showAboveAll('Something went wrong!')
    )

window.Precision ||= {}
window.Precision.BatchWorkflowFileTree = BatchWorkflowFileTree
