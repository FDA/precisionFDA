class MoveFilesModal extends Precision.FileTree

  getPath: (data) ->
    ids = data.instance.get_path(data.node, false, true)
    names = data.instance.get_path(data.node)
    path = []
    for id, index in ids
      path.push({
        id: id,
        name: names[index]
      })
    return path

  loadNodes: (data) ->
    $node = data.instance.get_node(data.node.id, true)
    children = data.node.children
    if !children or children.length == 0
      $node.addClass("jstree-loading")
      @disabled = true
      $.ajax(data.node.original.foldersPath, {
        dataType: 'json',
        context: @,
        success: (nodes) ->
          @showError(false)
          @addNodes(data, @processChildren(nodes))
          @disabled = false
          $node.removeClass("jstree-loading")
        error: (e) ->
          @showError(true)
          @disabled = false
      })

  onSelectNode: (e, data) =>
    if !@disabled
      @targetId(data.node.id)
      @fullFoldersPath(@getPath(data))
      if data.node.id != 'root'
        @loadNodes(data)

  processChildren: (nodes) ->
    rebuilt = _.values(nodes).filter((node) -> node.type == "folder").map((node) ->
      {
        foldersPath: node.foldersPath,
        icon: 'fa fa-folder',
        id: node.id,
        text: node.name,
      }
    )

    _.sortBy(rebuilt, (node) -> node.text)

  constructor: (data) ->
    jsTreeParams = {
      container: $('#move_files_tree'),
      defaultNodes: @processChildren(data.nodes),
      rootName: data.rootName
    }
    super(jsTreeParams)

    @disabled = false

    @fullFoldersPath = ko.observableArray('')
    @targetId = ko.observable('')

    @selectedItems = data.selectedItems
    @selectedItemsCnt = ko.computed( => @selectedItems().length )

    @showError = ko.observable(false)
    @defaultErrorText = 'Something went wrong.'
    @errorText = ko.observable(@defaultErrorText)

    do @initTree

window.Precision ||= {}
window.Precision.models ||= {}
window.Precision.models.MoveFilesModal = MoveFilesModal
