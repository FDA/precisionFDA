class JobsNewView
  constructor: (app, @asset_licenses_to_accept, selectable_spaces, available_content_scopes, job_limit, instance_types) ->
    @uid = app.uid
    @available_content_scopes = available_content_scopes
    @inputSpec = app.spec.input_spec
    @outputSpec = app.spec.output_spec
    @maxJobLimit = job_limit
    @jobLimit = ko.observable(job_limit)

    @licenseSelector = new Precision.models.LicensesSelectorModel({
      onAcceptCallback: @run
    })

    @busy = ko.observable(false)
    @running = ko.observable(false)
    @name = ko.observable(app.title)
    @spaceId = ko.observable()
    @isInSpace = selectable_spaces.length > 0
    @defaultSelectedSpace = ko.computed(() ->
      if selectable_spaces.length == 1
        return selectable_spaces[0]
      else
        return null
    )
    @isReviewSpace = ko.computed(=>
      return @isInSpace &&
             _.first(selectable_spaces).space_type == "review"
    )
    if @isInSpace && !@isReviewSpace()
      @spaceId(_.first(selectable_spaces).value)

    @contentScopes = ko.computed( =>
      if @isInSpace
        available_content_scopes[@spaceId()]
      else
        app.space_scopes
    )

    @inputModels = ko.computed(=>
      return if @isInSpace && !@spaceId()
      _.map(@inputSpec, (spec) =>
        new Precision.models.AppInputModel(spec, this)
      )
    )

    @availableInstances = instance_types

    @selectableSpaces = selectable_spaces
    @defaultInstanceType = app.spec.instance_type if app.spec.instance_type in instance_types.map (instance_type) -> instance_type.value
    @instanceType = ko.observable(app.spec.instance_type)

    @isRunnable = ko.computed(() =>
      isConfigReady = !_.isEmpty(@name()) && !_.isEmpty(@instanceType()) && @jobLimit() != ''
      # parsedJobLimit = parseInt(@jobLimit(), 10)
      # isJobLimitInRange = parsedJobLimit >= 0 && parsedJobLimit <= @maxJobLimit
      areInputsReady = _.every(@inputModels(), (inputModel) ->
        inputModel.isReady()
      )

      return !@busy() && isConfigReady && areInputsReady
      #&& isJobLimitInRange
    )

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
      params = {
        id: @uid,
        name: @name.peek(),
        job_limit: @jobLimit(),
        inputs: {}
      }

      params.instance_type = @instanceType.peek() if @instanceType.peek()?
      params.space_id = @spaceId.peek() if @spaceId.peek()?

      for inputModel in @inputModels()
        data = inputModel.getDataForRun()
        params.inputs[inputModel.name] = data if data?

      @busy(true)
      @running(true)
      Precision.api('/apps/run', params)
        .done((rs) =>
          if !rs.error?
            window.location = if @spaceId() then "/spaces/#{@spaceId()}/executions/#{rs.id}" else "/home/jobs/#{rs.id}"
          else
            @busy(false)
            @running(false)
            alert rs.error.message
        )
        .fail((error) =>
          errorObject = JSON.parse error.responseText
          @busy(false)
          @running(false)
          alert errorObject.error.message
        )

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

JobsController = Paloma.controller('Jobs', {
  new: ->
    $container = $("body main")
    viewModel = new JobsNewView(
      @params.app,
      @params.licenses_to_accept,
      @params.selectable_spaces,
      @params.content_scopes,
      @params.job_limit,
      @params.instance_types.map (instance_type) -> window.Precision.utils.sanitizeInstanceTypeNbsp(instance_type),
    )
    ko.applyBindings(viewModel, $container[0])

    $affixContainer = $container.find(".affix-container")
    $affixContainer.affix({
      offset: {
        top: $affixContainer.offset().top
      }
    })

    $affixContainer.parent(".affix-spacer").css("min-height", $affixContainer.height())

    $(window).resize(() ->
      $affixContainer.affix('checkPosition')
      $affixContainer.parent(".affix-spacer").css("min-height", $affixContainer.height())
    )

    $('.license-modal').on("click", ".list-group-item", (e) ->
      viewModel.licenseSelector.previewLicense(ko.dataFor(e.currentTarget))
    )
})
