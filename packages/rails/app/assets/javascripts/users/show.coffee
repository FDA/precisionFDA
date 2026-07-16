#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

class UserShowView
  showDeactivateUserModal: (root, e) ->
    dxuser = $(e.target).attr('data-dxuser')
    @deactivateUserModal.showModal(dxuser)

  constructor: (user_state) ->
    @user_state = ko.observable(user_state)
    @deactivateUserModal = new Precision.DeactivateUserModal()


UsersController = Paloma.controller('Users', {
  show: ->
    $container = $("body main")

    viewModel = new UserShowView(@params.user_state)
    ko.applyBindings(viewModel, $container[0])

    $tabs = $container.find(".nav-tabs > li")
    if $tabs.length > 0 && !$tabs.hasClass("active")
      $tabs.first().find("a[data-toggle='tab']").trigger("click")
})
