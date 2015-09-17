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

    @activeInput = ko.observable("test_vcf")

    @testVariant = new VariantModel({
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

    @refVariant = new VariantModel({
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
      fileModels = []
      for file in files
        fileModels.push(new FileModel(file))
      @files(fileModels)

  selectInput: (e) =>
    e.preventDefault()
    inputModel = ko.dataFor(e.currentTarget)
    @activeInput(inputModel.name)
    return false

  selectFile: (e) =>
    e.preventDefault()
    inputModel = ko.dataFor(e.currentTarget)
    fileModel = ko.contextFor(e.currentTarget).$parent
    inputModel.input(fileModel)

  unselectFile: (e) =>
    e.preventDefault()
    inputModel = ko.dataFor(e.currentTarget)
    inputModel.input(null)
    return false

  submitForm: (e) =>
    $("#comparison-modal form").submit()

class FileModel
  constructor: (file) ->
    @id = file.id
    @dxid = file.dxid
    @name = file.name
    @selected = ko.observable(false)
    @inputName = ko.observable()

class VariantModel
  constructor: (app) ->
    inputs = _.map(app.inputSpec, (input) ->
      new VariantInputModel(input)
    )
    @inputs = ko.observableArray(inputs)

class VariantInputModel
  constructor: (input) ->
    @name = input.name
    @title = input.title
    @required = input.required ? true
    @input = ko.observable()
    @dxid = ko.computed(=>
      input = @input()
      input.dxid if input?
    )
    @active = ko.computed(=>
      !_.isEmpty(@input())
    )
    @label = ko.computed(=>
      if @input()?
        @input().name
      else
        "Select a file from below"
    )



#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

ComparisonsController = Paloma.controller('Comparisons')
ComparisonsController::new = ->
  $container = $("[data-controller=comparisons][data-action=new]")
  viewModel = new ComparisonsNewView()
  ko.applyBindings(viewModel, $container[0])

  $container.on("click.comparisons.new", ".event-select-input", viewModel.selectInput)
  $container.on("click.comparisons.new", ".event-select-file", viewModel.selectFile)
  $container.on("click.comparisons.new", ".event-unselect-file", viewModel.unselectFile)
  $container.on("click.comparisons.new", ".event-comparison-tabs [data-toggle='tab']", (e) ->
    e.preventDefault()
    $(this).tab('show')
  )
