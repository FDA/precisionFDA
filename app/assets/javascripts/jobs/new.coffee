class JobsNewView
  constructor: (app, licenses_to_accept) ->
    @dxid = app.dxid
    @inputSpec = app.spec.input_spec
    @outputSpec = app.spec.output_spec

    @fileSelector = new Precision.models.FilesSelectorModel()

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

    if licenses_to_accept.length > 0
      for license in licenses_to_accept
        license.licenseHTML = Precision.md.render(license.content)

    @licensesToAccept = ko.observableArray(licenses_to_accept)
    @licensesAccepted = ko.observableArray()
    @previewedLicense = ko.observable(_.first(licenses_to_accept))

    @areLicensesAccepted = ko.computed(=>
      @licensesToAccept().length == @licensesAccepted().length
    )

  previewLicense: (license) =>
    @previewedLicense(license)

  toggleLicensesModal: () ->
    $('.license-modal').modal('toggle')

  acceptLicenses: () ->
    params =
      license_ids: _.map(@licensesAccepted(), (license) -> license.id)
    @busy(true)
    Precision.api('/api/accept_licenses', params)
      .done((rs) =>
        @busy(false)
        @toggleLicensesModal()
        @run()
      )
      .fail((error) =>
        @busy(false)
        #TODO: bootstrap alerts
        alert "Licenses could not be accepted: #{error.statusText}"
        console.error error
      )

  run: () ->
    if !@areLicensesAccepted()
      @toggleLicensesModal()
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
          window.location = "/apps/#{@dxid}/jobs"
        )
        .fail((error) =>
          @busy(false)
          @running(false)
          #TODO: bootstrap alerts
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
    viewModel.previewLicense(ko.dataFor(e.currentTarget))
  )
