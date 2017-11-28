class MoveFilesModal

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

  addNodes: (data, nodes, cb) ->
    for node in nodes
      data.instance.create_node(data.node, node, 'last')
    data.instance.open_node(data.node)

  selectNode: (id) ->
    node = @treeContainer.jstree('get_node', id)
    @treeContainer.jstree('deselect_all')
    @treeContainer.jstree('select_node', node)

  initTree: ->
    @treeContainer.jstree({
      core: {
        check_callback: true,
        animation: 0,
        data: @TREE,
        worker: false
      }
    })
    @treeContainer.on 'open_node.jstree', (e, data) ->
      if data.node.id != 'root'
        data.instance.set_icon(data.node, 'fa fa-folder-open')

    @treeContainer.on 'close_node.jstree', (e, data) ->
      if data.node.id != 'root'
        data.instance.set_icon(data.node, 'fa fa-folder')

    @treeContainer.on 'changed.jstree', (e, data) =>
      if data.action == 'select_node' and !@disabled
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

    @TREE = {
      id: 'root',
      text: data.rootName,
      icon: 'fa fa-files-o',
      state: { opened: true },
      children: @processChildren(data.nodes)
    }

    @treeContainer = $('#move_files_tree')
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
