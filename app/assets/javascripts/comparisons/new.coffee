class ComparisonsNewView
  constructor: () ->
    @contentScopes = ko.observable([])
    @busy = ko.observable(false)

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

    @challenges = []
    for challenge in Precision.challenges.suggestions
      @challenges.push(new ChallengeViewModel(challenge, this))

  validateLicenses: () ->
    licensesToAccept = []
    # Reset licenses and recompute which ones to accept
    inputModels = @refVariant.inputs().concat(@testVariant.inputs())
    for inputModel in inputModels
      license = inputModel.licenseToAccept.peek()
      licensesToAccept.push(license) if license?

    if _.size(licensesToAccept) > 0
      @licenseSelector.setLicensesToAccept(licensesToAccept)
      return @licenseSelector.areAllLicensesAccepted()
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
    @name = challenge.name
    @title = challenge.title
    @actionLabel = "Compare to #{@name}"
    @vcf = challenge.benchmark.VCF
    @bed = challenge.benchmark.BED

  assignChallengeFiles: () ->
    refVCFModel = _.find(@viewModel.refVariant.inputs(), (input) -> input.name == "ref_vcf")
    refBEDModel = _.find(@viewModel.refVariant.inputs(), (input) -> input.name == "ref_bed")

    refVCFModel.value(@vcf)
    refBEDModel.value(@bed)


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

ComparisonsController = Paloma.controller('Comparisons',
  new: ->
    $container = $("body main")
    viewModel = new ComparisonsNewView()
    ko.applyBindings(viewModel, $container[0])

    $container.on("click", ".variants-circle-compare", () ->
      testVCFModel = _.find(viewModel.testVariant.inputs(), (input) -> input.name == "test_vcf")
      refVCFModel = _.find(viewModel.refVariant.inputs(), (input) -> input.name == "ref_vcf")

      if testVCFModel? && refVCFModel?
        testName = testVCFModel.value().name.replace /\.vcf\.gz/i, ""
        refName = refVCFModel.value().name.replace /\.vcf\.gz/i, ""

        viewModel.name("#{testName} vs #{refName}")
    )

    $('.license-modal').on("click", ".list-group-item", (e) =>
      viewModel.licenseSelector.previewLicense(ko.dataFor(e.currentTarget))
    )
)
