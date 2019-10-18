class AdminOrgRequestsView
  constructor: (params) ->
    @approveRequestModal = $("#approve_leave_org_modal")
    @approveRequestButtonDisabled = ko.observable(false)
    @requestId = null

  showApproveModal: (root, e) =>
    @requestId = e.currentTarget.dataset.request_id
    @approveRequestModal.modal("show")

  closeApproveModal: () =>
    @approveRequestModal.modal("hide")

  approveRequest: () =>
    $.ajax({
      method: "PUT",
      url: "/admin/org_requests/" + @requestId + "/approve"
      success: () ->
        window.location = '/admin/org_action_requests'
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

AdminOrgRequestsController = Paloma.controller("Admin/OrgRequests", {
  index: ->
    $container = $("body main")
    viewModel = new AdminOrgRequestsView(@params)
    ko.applyBindings(viewModel, $container[0])
})
