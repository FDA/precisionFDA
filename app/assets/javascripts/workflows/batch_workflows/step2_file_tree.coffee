
class BatchWorkflowFileTree extends window.Precision.FileTree
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

window.Precision ||= {}
window.Precision.BatchWorkflowFileTree = BatchWorkflowFileTree
