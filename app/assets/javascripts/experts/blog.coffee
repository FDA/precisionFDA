class ExpertBlogModel
  constructor: (expert) ->
    if expert?
      @blogDisplay = Precision.md.render(expert._blog)
      @blogTitleDisplay = Precision.md.render(expert._blog_title)

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

AppsController = Paloma.controller('Experts',
  blog: ->
    $container = $("body main")
    viewModel = new ExpertBlogModel(@params.expert)

    ko.applyBindings(viewModel, $container[0])
)
