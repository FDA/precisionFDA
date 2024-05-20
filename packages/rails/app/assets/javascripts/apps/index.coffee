class AppIndexModel
  constructor: (app, challenges, releaseable) ->
    if app?
      @noteAttachModel = new Precision.models.NoteAttachModel(app.id, 'App')
      @readmeDisplay = Precision.md.render(app.readme)

    if releaseable
      @appReleaseModel = new Precision.models.AppReleaseModel(app.dxid)

    @challenges = challenges
    @app = app
    @confirmationModal = $('#replace-challenge-app-modal')
    @selectedChallenge = ko.observable({ app: {} })

    @shareSuccess = ko.observable(false)
    @sharingWithFDA = ko.observable(false)

    @assignToChallengeModal = $('#assign_app_to_challenge_modal')
    @assignToChallengeModalLoading = ko.observable(false)
    @assignToChallengeId = ''

    @addToComparatorsModal = $('#add_to_comparators_modal')
    @addToComparatorsLoading = ko.observable(false)

    @removeFromComparatorsModal = $('#remove_from_comparators_modal')
    @removeFromComparatorsLoading = ko.observable(false)

    @setAsDefaultLoading = ko.observable(false)

  shareWithFDA: () =>
    @sharingWithFDA(true)
    $.ajax('/api/share_with_fda', {
      method: 'POST',
      data: {
        id: @app.id
      },
      success: (data) =>
        $('#share_with_fda_modal').modal('hide')
        @sharingWithFDA(false)
        @shareSuccess(true)
      error: (data) =>
        @sharingWithFDA(false)
        Precision.alert.showAboveAll('Something went wrong while sharing with FDA!')
    })

  showConfirmationModal: (challenge_id) =>
    @confirmationModal.modal('show')
    ko.utils.arrayForEach(@challenges, (item) =>
      if item.id == challenge_id
        @selectedChallenge(item)
    )

  showAssignToChallengeModal: (data, e) =>
    e.preventDefault()
    @assignToChallengeId = e.target.getAttribute('data-challenge-id')
    @assignToChallengeModal.modal('show')

  assignToChallenge: () =>
    @assignToChallengeModalLoading(true)
    $.ajax("/challenges/#{@assignToChallengeId}/assign_app", {
      method: 'POST',
      data: {
        app_id: @app.id
      },
      error: (data) =>
        @assignToChallengeModalLoading(false)
        Precision.alert.showAboveAll('Something went wrong while assigning to Challenge!')
    })

  addToComparators: () =>
    @addToComparatorsLoading(true)
    $.ajax("/admin/apps/add_to_comparators", {
      method: 'POST',
      data: {
        dxid: @app.dxid
      },
      success: (data) ->
        Precision.alert.showAfterReload(
          'The app has been successfully added to the comparators list',
          'alert-success'
        )
        window.location.reload()
      error: (data) =>
        @addToComparatorsLoading(false)
        msg = data.responseJSON?.error || 'Something went wrong while adding to comparators!'
        Precision.alert.showAboveAll(msg)
    })

  removeFromComparators: () =>
    @removeFromComparatorsLoading(true)
    $.ajax("/admin/apps/remove_from_comparators", {
      method: 'POST',
      data: {
        dxid: @app.dxid
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

  setAppAsDefault: () =>
    @setAsDefaultLoading(true)
    $.ajax("/admin/apps/set_comparison_app", {
      method: 'POST',
      data: {
        dxid: @app.dxid
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

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

AppsController = Paloma.controller('Apps', {
  index: ->
    $container = $("body main")
    viewModel = new AppIndexModel(@params.app, @params.challenges, @params.releaseable)
    ko.applyBindings(viewModel, $container[0])

    $container.find('[data-toggle="tooltip"]').tooltip({
      container: 'body'
    })
})
