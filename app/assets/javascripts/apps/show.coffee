class AppShowModel
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
  show: ->
    $container = $("body main")
    viewModel = new AppShowModel(@params.app, @params.challenges, @params.releaseable)

    ko.applyBindings(viewModel, $container[0])

    $container.find('[data-toggle="tooltip"]').tooltip({
      container: 'body'
    })
)
