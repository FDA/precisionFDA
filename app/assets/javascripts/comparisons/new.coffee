class ComparisonsNewView
  constructor: () ->
    @filterQuery = ko.observable()
    @files = ko.observableArray()
    @files.filtered = ko.computed(=>
      files = _.sortBy(@files(), 'name')
      query = @filterQuery()
      if query?
        regexp = new RegExp(query, "i")
        return _.filter(files, (file) -> file.name.match regexp)
      else
        files
    )

    @testVariant = new VariantModel("Test", {
      inputSpec: [
        {
          name: "test_vcf"
          title: "VCF"
          required: true
        }
        {
          name: "test_tbi"
          title: "TBI"
          required: true
        }
        {
          name: "test_bed"
          title: "BED"
          required: false
        }
      ]
    })

    @refVariant = new VariantModel("Benchmark", {
      inputSpec: [
        {
          name: "ref_vcf"
          title: "VCF"
          required: true
        }
        {
          name: "ref_tbi"
          title: "TBI"
          required: true
        }
        {
          name: "ref_bed"
          title: "BED"
          required: false
        }
      ]
    })

    @areAllInputsSet = ko.computed(() =>
      inputs = @refVariant.inputs().concat(@testVariant.inputs())
      _.all(inputs, (inputModel) ->
        return (inputModel.required && inputModel.active()) || !inputModel.required
      )
    )

    @name = ko.observable()
    @description = ko.observable()
    @isFormReady = ko.computed(() =>
      !_.isEmpty(@name())
    )

    @getFiles()

  getFiles: (params = {}) ->
    Precision.api '/api/list_files', params, (files) =>
      @files(_.map(files, (file) -> new FileModel(file)))

  selectFile: (e) =>
    e.preventDefault()
    inputModel = ko.dataFor(e.currentTarget)
    fileModel = ko.contextFor(e.currentTarget).$parent
    inputModel.file(fileModel)

  unselectFile: (e) =>
    e.preventDefault()
    inputModel = ko.dataFor(e.currentTarget)
    inputModel.file(null)
    return false

  submitForm: (e) =>
    $("#comparison-modal form").submit()

class VariantModel
  constructor: (@category, app) ->
    inputs = _.map(app.inputSpec, (input) =>
      new VariantInputModel(@category, input)
    )
    @inputs = ko.observableArray(inputs)

class VariantInputModel
  constructor: (@category, input) ->
    @name = input.name
    @title = input.title
    @required = input.required ? true
    @file = ko.observable()
    @uid = ko.computed(=>
      file = @file()
      file.uid if file?
    )
    @active = ko.computed(=>
      !_.isEmpty(@file())
    )

class FileModel
  constructor: (file) ->
    @uid = file.uid
    @name = file.name

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
        testName = testVCFModel.file().name.replace /\.vcf\.gz/i, ""
        refName = refVCFModel.file().name.replace /\.vcf\.gz/i, ""

        viewModel.name("#{testName} vs #{refName}")
  )

  $container
    .on("click.comparisons_new", ".event-select-input", (e) -> viewModel.selectInput(e))
    .on("click.comparisons.new", ".event-select-file", (e) -> viewModel.selectFile(e))
    .on("click.comparisons.new", ".event-unselect-file", (e) -> viewModel.unselectFile(e))

  # Affix the variants comparator and filter
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
