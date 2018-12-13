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
    @fdaSpinner = ko.observable(false)
    @shareSuccess = ko.observable(false)

  shareWithFDA: () =>
    return false if @fdaSpinner()
    if $('#fda_button').hasClass('btn-primary')
      @fdaSpinner(true)
      $.ajax('/api/share_with_fda', {
        method: "POST",
        data: { id: @app.id },
        success: () => @shareSuccess(true)
      }).always () => @fdaSpinner(false)
    return false

  showConfirmationModal: (challenge_id) =>
    @confirmationModal.modal('show')
    ko.utils.arrayForEach(@challenges, (item) =>
      if item.id == challenge_id
        @selectedChallenge(item)
    )


#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

AppsController = Paloma.controller('Apps',
  index: ->
    $container = $("body main")
    viewModel = new AppIndexModel(@params.app, @params.challenges, @params.releaseable)
    ko.applyBindings(viewModel, $container[0])

    $container.find('[data-toggle="tooltip"]').tooltip({
      container: 'body'
    })

)
