class PageAdminOrgsView
  constructor: () ->
    @changeAdminModal = new Precision.ChangeAdminModal()
    @approveRequestModal = $("#approve_dissolve_org_modal")
    @approveRequestButtonDisabled = ko.observable(false)

  showChangeAdminModal: (root, e) ->
    orgid = e.target.getAttribute('data-orgid')
    @changeAdminModal.showChangeAdminModal(orgid)

  showApproveModal: (root, e) =>
    @requestId = e.currentTarget.dataset.request_id
    @approveRequestModal.modal("show")

  closeApproveModal: () =>
    @approveRequestModal.modal("hide")

  approveRequest: () =>
    $.ajax({
      method: "PUT",
      url: "/admin/org_requests/" + @requestId + "/approve"
      success: () =>
        window.location = '/admin/organizations'
      error: (data) =>
        @approveRequestButtonDisabled(false)

        try
          errors = JSON.parse(data.responseText)
          errorText = ''
          for field, error of errors
            errorText += "<b>Error: </b>#{field} #{error}<br>"
          Precision.alert.showAboveAll(errorText)
        catch
          Precision.alert.showAboveAll('Something went wrong.')
      beforeSend: () =>
        @approveRequestButtonDisabled(true)
    })

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
