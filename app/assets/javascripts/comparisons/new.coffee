class ComparisonsNewView
  constructor: () ->
    @fileSelector = new Precision.models.FilesSelectorModel()

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
          patterns: ["*.vcf.bed"]
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
          patterns: ["*.vcf.bed"]
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
        actionLabel: "Compare to NIST"
      }, this)
    ]

  submitForm: (e) =>
    $("#comparison-modal form").submit()

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
      # new VariantInputModel(@category, input)
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

  # $container
  #   .on("click.comparisons_new", ".event-select-input", (e) -> viewModel.selectInput(e))
  #   .on("click.comparisons.new", ".event-select-file", (e) -> viewModel.selectFile(e))
  #   .on("click.comparisons.new", ".event-unselect-file", (e) -> viewModel.unselectFile(e))

  # # Affix the variants comparator and filter
  # $affixContainer = $container.find(".affix-container")
  # $affixContainer.affix({
  #   offset:
  #     top: $affixContainer.offset().top
  # })
  #
  # $affixContainer.parent(".affix-spacer").css("min-height", $affixContainer.height())
  #
  # $(window).resize(() ->
  #   $affixContainer.affix('checkPosition')
  #   $affixContainer.parent(".affix-spacer").css("min-height", $affixContainer.height())
  # )
