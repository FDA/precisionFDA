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
  show: ->
    $container = $("body main")
    modal = $($("#change_admin_modal")[0])
    viewModel = new PageAdminOrgView(@params.org.dxid, modal)
    ko.applyBindings(viewModel, $container[0])
})
