class PageComparatorSettingsView
  showSetAsDefaultModal: (data, e) =>
    dxid = e.target.getAttribute('data-dxid')
    @currentAppDxid = dxid
    @setAsDefaultModal.modal('show')

  showRemoveFromComparatorsModal: (data, e) =>
    dxid = e.target.getAttribute('data-dxid')
    @currentAppDxid = dxid
    @removeFromComparatorsModal.modal('show')

  setAppAsDefault: () ->
    @setAsDefaultLoading(true)
    $.ajax("/admin/apps/set_comparison_app", {
      method: 'POST',
      data: {
        dxid: @currentAppDxid
      },
      success: (data) ->
        Precision.alert.showAfterReload(
          'App successfully set as comparison default app',
          'alert-success'
        )
        window.location.reload()
      error: (data) =>
        @setAsDefaultLoading(false)
        Precision.alert.showAboveAll('Something went wrong while setting default comparator!')
    })

  removeFromComparators: () =>
    @removeFromComparatorsLoading(true)
    $.ajax("/admin/apps/remove_from_comparators", {
      method: 'POST',
      data: {
        dxid: @currentAppDxid
      },
      success: (data) ->
        Precision.alert.showAfterReload(
          'The app has been successfully removed from the comparators list',
          'alert-success'
        )
        window.location.reload()
      error: (data) =>
        @removeFromComparatorsLoading(false)
        Precision.alert.showAboveAll('Something went wrong while removing from comparators!')
    })

  constructor: () ->
    @setAsDefaultModal = $('#set_comparison_app_modal')
    @removeFromComparatorsModal = $('#remove_from_comparators_modal')
    @currentAppDxid = null
    @setAsDefaultLoading = ko.observable(false)
    @removeFromComparatorsLoading = ko.observable(false)

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

ComparatorSettingsController = Paloma.controller('Admin/ComparatorSettings', {
  index: ->
    $container = $("body main")
    vm = new PageComparatorSettingsView(@params)
    ko.applyBindings(vm, $container[0])
})
