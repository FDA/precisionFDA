loadFolderTree = (parentId = null) ->
  params = {
    parent_folder_id: parentId,
    states: ['closed'],
    scopes: ['private'],
    describe: {
      include: { user: true, all_tags_list: false }
    }
  }
  return $.post('/api/folder_tree', params)


class FileTree extends Precision.FileTree
  loadNodes: (data) ->
    $node = data.instance.get_node(data.node.id, true)
    children = data.node.children
    if !children or children.length == 0
      $node.addClass("jstree-loading")
      @disabled = true

      loadFolderTree().then(
        (nodes) =>
          @addNodes(data, @prepareNodes(nodes))
          @disabled = false
          $node.removeClass("jstree-loading")
        (error) =>
          Precision.alert.showAboveAll('Something went wrong!')
          @disabled = false
      )

  onChange: (e, data) =>
    if !@disabled and data.node.id != 'root'
      @loadNodes(data)

  prepareNodes: (nodes) ->
    return _.values(nodes).filter((node) -> node.type == 'folder').map((node) ->
      {
        icon: 'fa fa-folder',
        id: node.id,
        uid: node.uid,
        text: node.name.replace(/\//g, ''),
        type: node.type.toLowerCase(),
        name: node.name,
        highlighted: false
      }
    )

  constructor: (defaultNodes = [], container) ->
    jsTreeParams = {
      container: container,
      defaultNodes: @prepareNodes(defaultNodes),
      rootName: 'My accessible files'
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
