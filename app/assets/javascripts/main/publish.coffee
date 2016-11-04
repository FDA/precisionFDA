class PublishViewModel
  constructor: (graph, scope_to_publish_to, space) ->
    @treeHash = {}
    @rootID = graph[0].uid
    @treeRoot = ko.observable(@generateTree(graph[0], graph[1], true))
    @selectedScope = ko.observable(scope_to_publish_to)
    @isScopeASpace = ko.computed (=>
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

  generateTree: (node, children, isRoot = false) ->
    if !@treeHash[node.uid]?
      @treeHash[node.uid] = new NodeModel(node, _.map(children, (child) => @generateTree(child[0], child[1])), isRoot)

    return @treeHash[node.uid]

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

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

MainController = Paloma.controller('Main',
  publish: ->
    $container = $("body main")
    publishViewModel = new PublishViewModel(@params.graph, @params.scope_to_publish_to, @params.space)
    ko.applyBindings(publishViewModel, $container[0])
)
