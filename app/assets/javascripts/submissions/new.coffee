class SubmissionsView
  constructor: (app, @asset_licenses_to_accept) ->
    @contentScopes = ko.observable([])
    @dxid = app.dxid
    @inputSpec = app.spec.input_spec
    @outputSpec = app.spec.output_spec

    @licenseSelector = new Precision.models.LicensesSelectorModel({
      onAcceptCallback: @run
    })

    @name = ko.observable()
    @desc = ko.observable()

    @busy = ko.observable(false)
    @running = ko.observable(false)
    @inputModels = ko.observableArray(_.map(@inputSpec, (spec) =>
      new Precision.models.AppInputModel(spec, this)
    ))

    @isRunnable = ko.computed(() =>
      areInputsReady = _.every(@inputModels(), (inputModel) ->
        inputModel.isReady()
      )

      return !@busy() && areInputsReady && !_.isEmpty(@name()) && !_.isEmpty(@desc())
    )

    @availableInstances = Precision.INSTANCES
    @defaultInstanceType = app.spec.instance_type
    @instanceType = ko.observable(app.spec.instance_type)

  validateLicenses: () ->
    # Reset licenses and recompute which ones to accept
    licensesToAccept = _.clone(@asset_licenses_to_accept ? [])
    for inputModel in @inputModels.peek()
      licenseToAccept = inputModel.licenseToAccept.peek()
      licensesToAccept.push(licenseToAccept) if licenseToAccept?

    if _.size(licensesToAccept) > 0
      @licenseSelector.setLicensesToAccept(licensesToAccept)
      return @licenseSelector.areAllLicensesAccepted()
    else
      return true

  run: () =>
    if !@validateLicenses()
      @licenseSelector.previewedLicense(_.first(@licenseSelector.licensesToAccept.peek()))
      @licenseSelector.toggleLicensesModal()
    else
      @busy(true)
      @running(true)
      inputs = {}
      for inputModel in @inputModels()
        data = inputModel.getDataForRun()
        inputs[inputModel.name] = data if data?
      $("#submission_inputs").val(JSON.stringify(inputs))
      $("#new_submission").submit()

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

ChallengeSubmissionsController = Paloma.controller('Submissions',
  new: ->
    $container = $("body main")
    viewModel = new SubmissionsView(@params.app, @params.licenses_to_accept)
    ko.applyBindings(viewModel, $container[0])

    $affixContainer = $container.find(".affix-container")
    $affixContainer.affix({
      offset:
        top: $affixContainer.offset().top
    })

    $affixContainer.parent(".affix-spacer").css("min-height", $affixContainer.height())

    $(window).resize(() ->
      $affixContainer.affix('checkPosition')
      $affixContainer.parent(".affix-spacer").css("min-height", $affixContainer.height())
    )

    $('.license-modal').on("click", ".list-group-item", (e) =>
      viewModel.licenseSelector.previewLicense(ko.dataFor(e.currentTarget))
    )
)
