TABLE_CONFIG = [
  {
    resource: 'Compute',
    usage: (stats) -> stats.computeCharges,
    bold: false,
  },
  {
    resource: 'Storage',
    usage: (stats) -> stats.storageCharges,
    bold: false,
  },
  {
    resource: 'Data Egress',
    usage: (stats) -> stats.dataEgressCharges,
    bold: false,
  },
  {
    resource: 'Total',
    usage: (stats) -> stats.totalCharges,
    bold: true,
  },
  {
    resource: 'Usage Limit',
    usage: (stats) -> stats.usageLimit,
    bold: false,
  },
  {
    resource: 'Usage Available',
    usage: (stats) -> stats.usageAvailable,
    bold: true,
  },
  {
    resource: 'Job Limit',
    usage: (stats) -> stats.jobLimit,
    bold: true,
  },
]

createCloudResourceSpendingsTable = (data) ->
  TABLE_CONFIG.map((row) -> {
    resource: row.resource,
    usage: "$#{row.usage(data).toFixed(2)}",
    bold: row.bold
  })
class NavBarDropdownModel
  getCloudResourcesModalElement: () ->
    $('#cloud_resources_modal')
  # First and foremost apologies my sincerest apologies to knockoutJS gods, this is not creation as it was originally intended
  # these params are passed, because this fn is invoked with "afterRender" template workaround
  # No idea what is happening
  loadStats: (isLoadingObservable, resourceTableObservable) ->
    error = false
    isLoadingObservable(true)
    $.ajax('/api/user/cloud_resources', {
      method: 'GET',
      contentType: 'application/json',
      dataType: 'json',
      jsonp: false,
      success: (data) ->
        data
      error: (xhr, status, err) ->
        Precision.alert.showAboveAll('Something went wrong while loading cloud user spendings')
        error = true
    }).done((data) =>
      table = createCloudResourceSpendingsTable(data)
      resourceTableObservable(table)
    ).always(=>
      isLoadingObservable(false)
    )
  showCloudResourcesModal: () ->
    # Need to reinitialize element, because template rendering most likely occurs between constructor and "loadStats" call, that invalidates the ref
    @cloudResourcesModal = @getCloudResourcesModalElement() if @cloudResourcesModal.length == 0
    @cloudResourcesModal.modal('show')
  constructor: (tableConfig) ->
    @cloudResourcesModal = @getCloudResourcesModalElement()
    @resourceTable = ko.observable()
    @isLoading = ko.observable(false)


$(document).ready(() =>
  $headerContainer = $("body header")
  viewModel = new NavBarDropdownModel()
  ko.applyBindings(viewModel, $headerContainer[0])
)
