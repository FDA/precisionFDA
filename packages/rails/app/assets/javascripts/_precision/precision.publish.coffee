class PublishViewModel
  constructor: (graph, scope_to_publish_to, space, message = null) ->
    @treeHash = {}
    @rootID = graph[0].uid
    @message = message
    @publishingObjectsUids = ko.observableArray(@getObjectsIds(graph))
    @treeRoot = ko.observableArray(@generateTree(graph))
    @selectedScope = ko.observable(scope_to_publish_to)
    @isScopeASpace = ko.computed ( =>
      @selectedScope()?.match(new RegExp(/^space-(\d+)$/, "i"))
    )
    @space = ko.observable(space)

    @primaryButtonLabel = ko.computed(=>
      if @isScopeASpace() && @space()?
        "Share selected objects to \"#{@space().title}\""
      else
        "Publish selected objects"
    )

    @publishableItemLabel = ko.computed(=>
      if @isScopeASpace()
        "Share"
      else
        "Publish"
    )

  getObjectsIds: (graphList) ->
    _.map(graphList, (graph) -> graph.uid)

  generateSubTree: (node, isRoot = false) ->
    uid = node.uid
    children = node.children
    if !@treeHash[uid]?
      childTree = _.map(children, (child) => @generateSubTree(child))
      nodeModel = new NodeModel(node, childTree, isRoot)
      @treeHash[uid] = nodeModel

    return @treeHash[node.uid]

  generateTree: (graph) ->
    treeRoot = []
    for note in graph
      treeRoot.push @generateSubTree(note, true)
    return treeRoot

  confirm: (data, event) ->
    nodeModels = _.values(@treeHash)
    isRootAWorkflow = _.find(nodeModels, { isRoot: true, klass: 'workflow' })
    return true unless isRootAWorkflow
    apps = _.filter(nodeModels,
      (app) => app.klass == 'app' && !app.publish() && !app.isInSpace && !app.isPublic )
    return true if _.isEmpty(apps)
    if confirm(@message)
      _.each(apps, (app) => app.publish(true))
      true
    else
      false


class NodeModel
  constructor: (node, children, @isRoot) ->
    @klass = node.klass
    @uid = node.uid
    @title = node.title
    @children = ko.observableArray(children)
    @childrenToPublishCount = ko.computed(=>
      _.reduce(@children(), (total, child) ->
        total++ if child.publish()
        descendentCount = child.childrenToPublishCount()
        total += descendentCount if descendentCount > 0
        return total
      , 0)
    )
    @isPublished = node.public
    @isPublic = node.public
    @isInSpace = node.in_space
    @isOwned = node.owned
    @isPublishable = node.publishable

    @publish = ko.observable(@isRoot)
    
    @iconClass = switch node.klass
                  when 'app'
                    'fa fa-fw fa-cube'
                  when 'job'
                    'fa fa-fw fa-tasks'
                  when 'comparison'
                    'fa fa-fw fa-area-chart'
                  when 'asset'
                    'fa fa-fw fa-file-zip-o'
                  when 'note'
                    'fa fa-fw fa-sticky-note'
                  when 'discussion'
                    'fa fa-fw fa-comments-o'
                  when 'answer'
                    'fa fa-fw fa-commenting'
                  when 'space'
                    'fa fa-fw fa-object-group'
                  else
                    'fa fa-fw fa-file-o'

window.Precision ||= {}

window.Precision.PublishViewModel = PublishViewModel
