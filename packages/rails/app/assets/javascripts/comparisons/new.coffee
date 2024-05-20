class SelectorModel extends Precision.models.SelectorModel
  openModal: (input) =>
    @editingInput(input)
    @open()

  getListedFiles: () =>
    params = {
      states: ["closed"],
      scopes: @accessibleScope,
      describe: {
        include: {
          user: true
          all_tags_list: false
        }
      }
    }
    $.post('/api/list_files', params).then (objects) => @listedFiles(objects)

  constructor: (@accessibleScope = []) ->
    @listedFiles = ko.observableArray([])
    super({
      title: 'Select default file for field',
      selectionType: 'radio',
      selectableClasses: ['file'],
      studies: [],
      listRelatedParams: {
        classes: ['file'],
        scopes: @accessibleScope
      },
      listModelConfigs: [
        {
          className: 'file',
          name: 'Files',
          apiEndpoint: 'list_files',
          listedFiles: @listedFiles()
        }
      ],
      onSave: (selected) =>
        if @editingInput()
          @editingInput().value(selected.uid)
          @editingInput(null)
        deferred = $.Deferred()
        deferred.resolve(selected)
    })

    @editingInput = ko.observable(null)

class ComparisonsNewView
  constructor: (selectable_comparators, default_comparator) ->
    @contentScopes = ko.observable([])
    @busy = ko.observable(false)

    @objectSelector = new SelectorModel()

    @selectableComparators = ko.observableArray(selectable_comparators)

    @defaultComparator = ko.observable(default_comparator)
    @defaultComparatorIsLoading = ko.observable(false)

    @licenseSelector = new Precision.models.LicensesSelectorModel({
      onAcceptCallback: @submitForm
    })

    @testVariant = new VariantViewModel(this, "Test", [])
    @refVariant = new VariantViewModel(this, "Benchmark", [])
    @allInputModels = ko.computed(() =>
      @refVariant.inputs().concat(@testVariant.inputs())
    )

    @areAllInputsSet = ko.computed(() =>
      inputs = @allInputModels()
      invalidInputs = inputs.filter((input) -> !input.valid())
      return !invalidInputs.length
    )

    @name = ko.observable()
    @description = ko.observable()
    @isFormReady = ko.computed(() =>
      !_.isEmpty(@name())
    )

    @loadComparatorApp()

    $('#comparison-modal').on 'show.bs.modal', () =>
      @name(@generateAutoName())

    $('#comparison-modal').on 'hidden.bs.modal', () =>
      @name('')
      @description('')

  generateAutoName: () ->
      left = ''
      right = ''
      testInputs = @testVariant.inputs()
      benchmarkInputs = @refVariant.inputs()

      return false if !testInputs.length

      if testInputs.length
        fileInputLeft = testInputs.filter((input) -> input.type == 'file')[0]
        left = if fileInputLeft then fileInputLeft.fileTitle() else testInputs[0].name
      if benchmarkInputs.length
        fileInputRight = benchmarkInputs.filter((input) -> input.type == 'file')[0]
        right = if fileInputRight then fileInputRight.fileTitle() else benchmarkInputs[0].name

      return "#{left} vs #{right}" if right
      return left

  openSelectorModal: (input) => @objectSelector.openModal(input)

  validateLicenses: () ->
    licensesToAccept = []
    # Reset licenses and recompute which ones to accept
    inputModels = @allInputModels()
    for inputModel in inputModels
      if inputModel.type == 'file'
        license = inputModel.licenseToAccept.peek()
        licensesToAccept.push(license) if license

    if _.size(licensesToAccept) > 0
      @licenseSelector.setLicensesToAccept(licensesToAccept)
      return @licenseSelector.areAllLicensesAccepted()
    else
      return true

  loadComparatorApp: () ->
    @defaultComparatorIsLoading(true)
    uid = encodeURIComponent(@defaultComparator())
    $.get("/comparators?id=#{uid}").then(
      (data = []) =>
        @defaultComparatorIsLoading(false)
        @testVariant.setInputSpec(data.filter((input) -> !input.name.startsWith('benchmark')))
        @refVariant.setInputSpec(data.filter((input) -> input.name.startsWith('benchmark')))
      () =>
        @defaultComparatorIsLoading(false)
        Precision.alert.showAboveAll('Something went wrong while loading comparator!')
    )

  submitForm: (e) =>
    if !@validateLicenses()
      @licenseSelector.previewedLicense(_.first(@licenseSelector.licensesToAccept.peek()))
      @licenseSelector.toggleLicensesModal()
    else

      inputs = {}
      @allInputModels().forEach((input) ->
        value = input.getConvertedValue()
        inputs[input.name] = value if value != null or value != undefined
      )

      data = {
        comparison: {
          comparison_app: @defaultComparator(),
          name: @name(),
          description: @description(),
          inputs: inputs
        }
      }

      @busy(true)
      $.ajax({
        url: '/comparisons',
        data: JSON.stringify(data),
        cache: false,
        contentType: 'application/json',
        processData: false,
        type: 'POST',
        success: (data) ->
          Precision.alert.showAfterReload('Comparison successfully run.', 'alert-success')
          window.location = data.url
        error: (response) =>
          @busy(false)
          try
            errors = JSON.parse(response.responseText)
            errors.forEach((error) =>
              inputName = error.split(':')[0]
              @allInputModels().forEach((input) ->
                input.valid(false) if input.name == inputName
              )
              Precision.alert.show(error, 'alert-danger', 30000)
            )
            $('#comparison-modal').modal('hide')
          catch
            Precision.alert.showAboveAll('Something went wrong while running comparison!')
      })

class InputModel extends Precision.appTemplate.InputTemplateModel
  onChange: () ->
    @_onChange()
    @validate()

  onKeyUp: () ->
    @onChange()

  constructor: (input) ->
    super(input, 'comparison_app_input', true)
    @validate()

class VariantViewModel
  setInputSpec: (spec = []) ->
    @inputSpec(spec)
    @inputs(spec.map((input) -> new InputModel(input)))

  constructor: (viewModel, @category, inputSpec = []) ->
    @inputSpec = ko.observableArray(inputSpec)
    @inputs = ko.observableArray()


#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

ComparisonsController = Paloma.controller('Comparisons', {
  new: ->
    $container = $('body main')
    viewModel = new ComparisonsNewView(@params.selectable_comparators, @params.default_comparator)
    ko.applyBindings(viewModel, $container[0])

    $container.on('click', '.variants-circle-compare', () ->
      testVCFModel = _.find(viewModel.testVariant.inputs(), (input) -> input.name == 'test_vcf')
      refVCFModel = _.find(viewModel.refVariant.inputs(), (input) -> input.name == 'ref_vcf')

      if testVCFModel? && refVCFModel?
        testName = testVCFModel.value().name.replace /\.vcf\.gz/i, ""
        refName = refVCFModel.value().name.replace /\.vcf\.gz/i, ""

        viewModel.name("#{testName} vs #{refName}")
    )

    $('.license-modal').on('click', '.list-group-item', (e) ->
      viewModel.licenseSelector.previewLicense(ko.dataFor(e.currentTarget))
    )
})
