class PageAdminOrgsView
  showChangeAdminModal: (root, e) ->
    orgid = e.target.getAttribute('data-orgid')
    @changeAdminModal.showChangeAdminModal(orgid)

  constructor: () ->
    @changeAdminModal = new Precision.ChangeAdminModal()

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################


ParticipantsController = Paloma.controller('Admin/Organizations', {
  index: ->
    $container = $("body main")
    viewModel = new PageAdminOrgsView()
    ko.applyBindings(viewModel, $container[0])
    initWiceGrid()
})
