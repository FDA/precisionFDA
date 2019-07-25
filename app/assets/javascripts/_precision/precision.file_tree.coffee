class FileTree
  #should be redefined in child class
  onSelectNode: (e, data) ->
    return data
  onDeselectNode: (e, data) ->
    return data

  addNodes: (data, nodes, cb) ->
    for node in nodes
      data.instance.create_node(data.node, node, 'last', (n) ->
        data.instance.select_node(n) if n.state.selected
      )
    data.instance.open_node(data.node)

  selectNode: (id) ->
    node = @treeContainer.jstree('get_node', id)
    @treeContainer.jstree('deselect_all')
    @treeContainer.jstree('select_node', node)

  initTree: ->
    config = {
      core: {
        check_callback: true,
        animation: 0,
        data: @TREE,
        worker: false,
      },
      checkbox: {
        whole_node: false
      },
      plugins: []
    }
    config.plugins.push('checkbox') if @params.addCheckboxes
    config.plugins.push('search') if @params.addSearch
    config.plugins.push('sort') if @params.addSort
    @treeContainer.jstree(config)

    @treeContainer.on 'open_node.jstree', (e, data) ->
      if data.node.id != 'root'
        data.instance.set_icon(data.node, 'fa fa-folder-open')

    @treeContainer.on 'close_node.jstree', (e, data) ->
      if data.node.id != 'root'
        data.instance.set_icon(data.node, 'fa fa-folder')

    @treeContainer.on 'changed.jstree', (e, data) =>
      if data.action == 'select_node'
        @onSelectNode(e, data)
      if data.action == 'deselect_node'
        @onDeselectNode(e, data)

  constructor: (@params) ->
    @TREE = {
      id: 'root',
      text: @params.rootName,
      icon: 'fa fa-files-o',
      state: { opened: true },
      children: @params.defaultNodes
    }
    @treeContainer = @params.container

window.Precision ||= {}
window.Precision.FileTree = FileTree
