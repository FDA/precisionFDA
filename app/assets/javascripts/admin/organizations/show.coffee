class PageAdminOrgView
  showChangeAdminModal: () ->
    @changeAdminModal.showChangeAdminModal()

  showDeactivateUserModal: (root, e) ->
    dxuser = $(e.target).attr('data-dxuser')
    @deactivateUserModal.showModal(dxuser)

  constructor: (orgid = null) ->
    @changeAdminModal = new Precision.ChangeAdminModal(orgid)
    @deactivateUserModal = new Precision.DeactivateUserModal()

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################


ParticipantsController = Paloma.controller('Admin/Organizations', {
  index: ->
    modals = []
    for org in @params.orgs
      modal = $($("#change_admin_modal")[0]).clone()
      modal.prop("id",null)
      modal.appendTo("body main")
      modals.push(modal)

    for org in @params.orgs
      modal = modals.shift()
      $container = $('#org-' + org.handle)

      console.log($container)
      console.log(org)
      viewModel = new PageAdminOrgView(org.handle, modal)
      ko.applyBindings(viewModel, $container[0])
      ko.applyBindings(viewModel, modal[0])

  show: ->
    $container = $("body main")
    modal = $($("#change_admin_modal")[0])
    viewModel = new PageAdminOrgView(@params.org.dxid, modal)
    ko.applyBindings(viewModel, $container[0])
})
