#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

class UserShowModel
  constructor: (user_state) ->
    @user_state = ko.observable(user_state)

  # disable / enable user
  toggleLockUser: (data, ev) ->
    href = $(ev.currentTarget).prop('href')
    $.ajax(href, {
      method: 'POST'
    }).fail((data, textStatus, err) ->
      Precision.alert.show("Permission Denied")
    ).done((data) ->
      Precision.alert.show("Successfully unlocked", "alert-success")
    )

UsersController = Paloma.controller('Users', {
  show: ->
    $container = $("body main")

    viewModel = new UserShowModel(@params.user_state)
    ko.applyBindings(viewModel, $container[0])

    $tabs = $container.find(".nav-tabs > li")
    if $tabs.length > 0 && !$tabs.hasClass("active")
      $tabs.first().find("a[data-toggle='tab']").trigger("click")
})
