class ComparisonsNewView
  constructor: () ->
    @busy = ko.observable(false)

    @fileSelector = new Precision.models.FilesSelectorModel()
    @licenseSelector = new Precision.models.LicensesSelectorModel({
      onAcceptCallback: @submitForm
    })

    @testVariant = new VariantViewModel(this, "Test", {
      inputSpec: [
        {
          name: "test_vcf"
          label: "VCF"
          class: "file"
          optional: false
          patterns: ["*.vcf.gz", "*.vcf"]
        }
        {
          name: "test_bed"
          label: "BED"
          class: "file"
          optional: true
          patterns: ["*.bed"]
        }
      ]
    })

    @refVariant = new VariantViewModel(this, "Benchmark", {
      inputSpec: [
        {
          name: "ref_vcf"
          label: "VCF"
          class: "file"
          optional: false
          patterns: ["*.vcf.gz", "*.vcf"]
        }
        {
          name: "ref_bed"
          label: "BED"
          class: "file"
          optional: true
          patterns: ["*.bed"]
        }
      ]
    })

    @areAllInputsSet = ko.computed(() =>
      inputModels = @refVariant.inputs().concat(@testVariant.inputs())
      _.every(inputModels, (inputModel) -> inputModel.isReady())
    )

    @name = ko.observable()
    @description = ko.observable()
    @isFormReady = ko.computed(() =>
      !_.isEmpty(@name())
    )

    @challenges = [
      new ChallengeViewModel({
        id: 1
        name: "consistency"
        title: "Consistency Challenge"
        actionLabel: "Compare to NA12878-NISTv2.19"
      }, this)
    ]

  validateLicenses: () ->
    licensesToAccept = []
    # Reset licenses and recompute which ones to accept
    inputModels = @refVariant.inputs().concat(@testVariant.inputs())
    for inputModel in inputModels
      license = inputModel.licenseToAccept.peek()
      licensesToAccept.push(license) if license?

    if _.size(licensesToAccept) > 0
      @licenseSelector.setLicensesToAccept(licensesToAccept)
      return @licenseSelector.areLicensesAccepted()
    else
      return true

  submitForm: (e) =>
    if !@validateLicenses()
      @licenseSelector.previewedLicense(_.first(@licenseSelector.licensesToAccept.peek()))
      @licenseSelector.toggleLicensesModal()
    else
      $("#comparison-modal form").submit()
      @busy(true)

class ChallengeViewModel
  constructor: (challenge, @viewModel) ->
    @id = challenge.id
    @name = challenge.name
    @title = challenge.title
    @actionLabel = challenge.actionLabel

  assignChallengeFiles: () ->
    refVCFModel = _.find(@viewModel.refVariant.inputs(), (input) -> input.name == "ref_vcf")
    refBEDModel = _.find(@viewModel.refVariant.inputs(), (input) -> input.name == "ref_bed")

    if @name == "consistency"
      refVCFModel.value(Precision.challenges.consistency.benchmark.VCF)
      refBEDModel.value(Precision.challenges.consistency.benchmark.BED)


class VariantViewModel
  constructor: (viewModel, @category, app) ->
    inputs = _.map(app.inputSpec, (input) =>
      new Precision.models.AppInputModel(input, viewModel)
    )
    @inputs = ko.observableArray(inputs)

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

ComparisonsController = Paloma.controller('Comparisons')
ComparisonsController::new = ->
  $container = $("body main")
  viewModel = new ComparisonsNewView()
  ko.applyBindings(viewModel, $container[0])

  viewModel.areAllInputsSet.subscribe((areAllInputsSet) ->
    if areAllInputsSet
      testVCFModel = _.find(viewModel.testVariant.inputs(), (input) -> input.name == "test_vcf")
      refVCFModel = _.find(viewModel.refVariant.inputs(), (input) -> input.name == "ref_vcf")

      if testVCFModel? && refVCFModel? && !viewModel.name()?
        testName = testVCFModel.value().name.replace /\.vcf\.gz/i, ""
        refName = refVCFModel.value().name.replace /\.vcf\.gz/i, ""

        viewModel.name("#{testName} vs #{refName}")
  )

  $('.license-modal').on("click", ".list-group-item", (e) =>
    viewModel.licenseSelector.previewLicense(ko.dataFor(e.currentTarget))
  )
