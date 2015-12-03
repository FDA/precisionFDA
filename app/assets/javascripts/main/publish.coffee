class PublishViewModel
  constructor: (graph) ->
    @treeHash = {}
    @rootID = graph[0].uid
    @treeRoot = ko.observable(@generateTree(graph[0], graph[1], true))

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
                  else
                    'fa fa-fw fa-file-o'
#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

MainController = Paloma.controller('Main')
MainController::publish = ->
  $container = $("body main")
  publishViewModel = new PublishViewModel(@params.graph)
  ko.applyBindings(publishViewModel, $container[0])
