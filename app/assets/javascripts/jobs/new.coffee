class JobsNewView
  constructor: (app, @asset_licenses_to_accept) ->
    @dxid = app.dxid
    @inputSpec = app.spec.input_spec
    @outputSpec = app.spec.output_spec

    @fileSelector = new Precision.models.FilesSelectorModel()
    @licenseSelector = new Precision.models.LicensesSelectorModel({
      onAcceptCallback: @run
    })

    @busy = ko.observable(false)
    @running = ko.observable(false)
    @name = ko.observable(app.title)
    @inputModels = ko.observableArray(_.map(@inputSpec, (spec) =>
      new Precision.models.AppInputModel(spec, this)
    ))

    @isRunnable = ko.computed(() =>
      isConfigReady = !_.isEmpty(@name())
      areInputsReady = _.every(@inputModels(), (inputModel) ->
        inputModel.isReady()
      )

      return !@busy() && isConfigReady && areInputsReady
    )

    @availableInstances = Precision.INSTANCES
    @defaultInstanceType = app.spec.instance_type
    @instanceType = ko.observable(app.spec.instance_type)

  validateLicenses: () ->
    # Reset licenses and recompute which ones to accept
    licensesToAccept = @asset_licenses_to_accept ? []

    for inputModel in @inputModels.peek()
      license = inputModel.licenseToAccept.peek()
      licensesToAccept.push(license) if license?

    if _.size(licensesToAccept) > 0
      @licenseSelector.setLicensesToAccept(licensesToAccept)
      return @licenseSelector.areLicensesAccepted()
    else
      return true

  run: () =>
    if !@validateLicenses()
      @licenseSelector.previewedLicense(_.first(@licenseSelector.licensesToAccept.peek()))
      @licenseSelector.toggleLicensesModal()
    else
      params =
        id: @dxid
        name: @name.peek()
        inputs: {}

      params.instance_type = @instanceType.peek() if @instanceType.peek()?

      for inputModel in @inputModels()
        data = inputModel.getDataForRun()
        params.inputs[inputModel.name] = data if data?

      @busy(true)
      @running(true)
      Precision.api('/api/run_app', params)
        .done((rs) =>
          if !rs.failure?
            window.location = "/apps/#{@dxid}/jobs"
          else
            @busy(false)
            @running(false)
            alert "App could not be run due to: #{rs.failure}"
            console.error rs.failure
        )
        .fail((error) =>
          @busy(false)
          @running(false)
          alert "App could not be run due to: #{error.statusText}"
          console.error error
        )

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

JobsController = Paloma.controller('Jobs')
JobsController::new = ->
  $container = $("body main")
  viewModel = new JobsNewView(@params.app, @params.licenses_to_accept)
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
