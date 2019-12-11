class BatchAppNewView
  constructor: (app, @asset_licenses_to_accept, selectable_spaces, available_content_scopes) ->
    @uid = app.uid
    @inputSpec = app.spec.input_spec
    @outputSpec = app.spec.output_spec

    @availableInstances = Precision.INSTANCES
    @defaultInstanceType = app.spec.instance_type
    @instanceType = ko.observable(app.spec.instance_type)
    @selectableSpaces = selectable_spaces

    @spaceId = ko.observable()

    @available_content_scopes = available_content_scopes

    @isInSpace = selectable_spaces.length > 0
    @isReviewSpace = ko.computed( =>
      return @isInSpace && _.first(selectable_spaces).space_type == "review"
    )

    @needSelectSpace = @isInSpace &&
                       @isReviewSpace()

    if @isInSpace && !@isReviewSpace()
      @spaceId(_.first(selectable_spaces).value)

    @contentScopes = ko.computed( =>
      if @isInSpace
        available_content_scopes[@spaceId()]
      else
        app.space_scopes
    )

    @licenseSelector = new Precision.models.LicensesSelectorModel({
      onAcceptCallback: @run
    })

    @busy = ko.observable(false)
    @running = ko.observable(false)
    @runBtnText = ko.observable("Run Batch App")
    @name = ko.observable(app.title)
    @inputModels = ko.observableArray(_.map(@inputSpec, (spec) =>
      new Precision.models.AppInputModel(spec, this)
    ))

    @batchInputName = ko.observableArray()

    @batchInputSpec = ko.computed(() =>
      availableBatchInputs = @inputSpec.filter((spec) => @batchInputName() == spec.name)
      return availableBatchInputs.map((spec) =>
        new Precision.models.AppInputModel(spec, this, true)
      )
    )

    @otherInputSpec = ko.computed(() =>
      availableOtherInputs = @inputSpec.filter((spec) => !(@batchInputName() == spec.name))
      return availableOtherInputs.map((spec) =>
        new Precision.models.AppInputModel(spec, this)
      )
    )

    @isRunnable = ko.computed(() =>
      isConfigReady = !_.isEmpty(@name())
      areBatchInputsReady = _.every(@batchInputSpec(), (input) -> input.isReady())
      areOtherInputsReady = _.every(@otherInputSpec(), (input) -> input.isReady())
      areInputsReady = areBatchInputsReady && areOtherInputsReady
      if @batchInputSpec()[0]
        getDataForBatchRun = @batchInputSpec()[0].getDataForBatchRun()
        isBatchInputReady = @batchInputSpec().length && getDataForBatchRun &&
          (
            _.isArray(getDataForBatchRun) &&
            getDataForBatchRun.length ||
            _.isString(getDataForBatchRun) ||
            _.isObject(getDataForBatchRun) &&
            !_.isArray(getDataForBatchRun)
          )

      return !@busy() && isConfigReady && areInputsReady && isBatchInputReady
    )

    @disableRunBtn = ko.computed(() =>
      if @isInSpace
        return !@isRunnable() || !@spaceId()
      else
        return !@isRunnable()
    )

  validateLicenses: () ->
    # Reset licenses and recompute which ones to accept
    licensesToAccept = _.clone(@asset_licenses_to_accept ? [])
    for inputModel in @inputModels.peek()
      licenseToAccept = inputModel.licenseToAccept.peek()
      if licenseToAccept?
        if _.isArray(licenseToAccept)
          for license in licenseToAccept
            licensesToAccept.push(license)
        else
          licensesToAccept.push(licenseToAccept)


    if _.size(licensesToAccept) > 0
      @licenseSelector.setLicensesToAccept(licensesToAccept)
      return @licenseSelector.areAllLicensesAccepted()
    else
      return true

  availableInputs: () =>
    ko.utils.arrayFilter(@inputSpec, (input) ->
      input.class != 'boolean' && !input.choices)

  selectBatchInput: () ->
    @resetDefaultFileStates()
    @batchInputName($('#batch-input-name option:selected').val())

  resetDefaultFileStates: () =>
    newInputModels = _.map(@inputModels(), (inputModel) ->
      _val = inputModel.value()
      if inputModel.className == "file" && _.isArray(_val) && _val.length == 0
        inputModel.value(undefined)
      return inputModel
    )
    @inputModels(newInputModels)

  removeItem: (item) =>
    if @batchInputSpec()[0].defaultValue
      selectedFiles = []
    else if @batchInputSpec()[0].value().length > 0
      selectedFiles = @batchInputSpec()[0].value().filter (el) -> el.uid != item.uid
    @batchInputSpec()[0].value(selectedFiles)

  run: () =>
    if !@validateLicenses()
      @licenseSelector.previewedLicense(_.first(@licenseSelector.licensesToAccept.peek()))
      @licenseSelector.toggleLicensesModal()
    else
      batchData = @batchInputSpec()[0]
      batchFileIds = batchData.getDataForBatchRun()
      counter = 0
      if _.isString(batchFileIds) || _.isNumber(batchFileIds)
        counter += 1
        params = {
          id: @uid,
          name: @name.peek(),
          jobName: "#{@name.peek()}_#{counter}",
          inputs: {}
        }
        params.instance_type = @instanceType.peek() if @instanceType.peek()?
        params.space_id = @spaceId.peek() if @spaceId.peek()?

        params.inputs[batchData.name] = batchFileIds if batchFileIds?
        for inputModel in @otherInputSpec()
          data = inputModel.getDataForRun()
          params.inputs[inputModel.name] = data if data?
        @busy(true)
        @running(true)
        Precision.api('/api/run_app', params)
          .done((rs) =>
            if !rs.error?
              window.location = "/apps/#{@uid}"
            else
              @busy(false)
              @running(false)
              alert "App could not be run due to: #{rs.error.message}"
              console.error rs.error
        )
          .fail((error) =>
            errorObject = JSON.parse error.responseText
            @busy(false)
            @running(false)
            alert "App could not be run due to: #{errorObject.error.message}"
            console.error error
        )

      else if _.isArray(batchFileIds)
        @batchRun(batchFileIds)

  batchRun: (batchFileIds) =>
    batchData = @batchInputSpec()[0]
    batchFileIds = batchData.getDataForBatchRun()
    @busy(true)
    @running(true)
    @_batchRun(batchData, batchFileIds.length, batchFileIds, 0)

  _batchRun: (batchData, totalBatchFileIds, currentBatchFileIds, counter) =>
    if counter < totalBatchFileIds
      currentFileId = currentBatchFileIds[0]
      nextBatchFileIds = currentBatchFileIds.slice(1, currentBatchFileIds.length)
      @runBtnText("Running #{counter + 1} of #{totalBatchFileIds}...")
      params = {
        id: @uid,
        name: "#{@name.peek()} (#{counter + 1} of #{totalBatchFileIds})",
        inputs: {}
      }
      params.instance_type = @instanceType.peek() if @instanceType.peek()?
      params.space_id = @spaceId.peek() if @spaceId.peek()?

      params.inputs[batchData.name] = currentFileId if currentFileId?

      for inputModel in @otherInputSpec()
        data = inputModel.getDataForRun()
        params.inputs[inputModel.name] = data if data?

      Precision.api('/api/run_app', params)
        .done((rs) ->
          if rs.error?
            alert "App could not be run on due to: #{rs.error.message}"
            console.error rs.error
          )
        .fail((error) ->
          errorObject = JSON.parse error.responseText
          alert "App could not be run due to: #{errorObject.error.message}"
          console.error error
          )
        .always(() =>
          @_batchRun(batchData, totalBatchFileIds, nextBatchFileIds, counter + 1)
        )
    else
      window.location = "/apps/#{@uid}"
#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

AppsController = Paloma.controller('Apps', {
  batch_app: ->
    $container = $("body main")
    viewModel = new BatchAppNewView(
      @params.app,
      @params.licenses_to_accept,
      @params.selectable_spaces,
      @params.content_scopes
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
