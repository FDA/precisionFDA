
class BatchWorkflowFileTree extends window.Precision.FileTree
  loadNodes: (data) ->
    $node = data.instance.get_node(data.node.id, true)
    children = data.node.children
    if !children or children.length == 0
      $node.addClass("jstree-loading")
      @disabled = true
      $.ajax('/', {
        dataType: 'json',
        success: (nodes) ->
          @addNodes(data, @prepareNodes(nodes))
          @disabled = false
          $node.removeClass("jstree-loading")
        error: (e) ->
          Precision.alert.showAboveAll('Something went wrong!')
          @disabled = false
      })

  onChange: (e, data) =>
    if !@disabled and data.node.id != 'root'
      @loadNodes(data)

  prepareNodes: (nodes) ->
    return _.values(nodes).filter((node) -> node.type == 'folder').map((node) ->
      {
        icon: 'fa fa-folder',
        id: node.id,
        text: node.name
      }
    )

  constructor: (defaultNodes = []) ->
    jsTreeParams = {
      container: $('#accessible_files_tree'),
      defaultNodes: @prepareNodes(data.nodes),
      rootName: 'My accessible files'
    }
    super(jsTreeParams)

    @disabled = false

window.Precision ||= {}
window.Precision.BatchWorkflowFileTree = BatchWorkflowFileTree
