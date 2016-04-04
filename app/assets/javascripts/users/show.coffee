#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

UsersController = Paloma.controller('Users',
  show: ->
    $container = $("body main")

    $tabs = $container.find(".nav-tabs > li")
    if $tabs.length > 0 && !$tabs.hasClass("active")
      $tabs.first().find("a[data-toggle='tab']").trigger("click")
)
