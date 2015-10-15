class JobsNewView
  constructor: (app) ->
    @id = app.id
    @dxid = app.dxid
    @inputSpec = app.spec.input_spec
    @outputSpec = app.spec.output_spec

    @fileSelector = new FileSelector()

    @busy = ko.observable(false)
    @running = ko.observable(false)
    @name = ko.observable(app.title)
    @inputModels = ko.observableArray(_.map(@inputSpec, (spec) =>
      new InputModel(spec, this)
    ))

    @isRunnable = ko.computed(() =>
      isConfigReady = !_.isEmpty(@name())
      areInputsReady = _.every(@inputModels(), (inputModel) ->
        hasError = inputModel.error()?
        hasData = inputModel.getDataForRun()? && inputModel.getDataForRun() != ''
        hasDefault = inputModel.defaultValue?
        isRequired = inputModel.isRequired
        return !hasError && (!isRequired || (isRequired && (hasData || hasDefault)))
      )

      return !@busy() && isConfigReady && areInputsReady
    )

    @availableInstances = [
      {value: "baseline-2", label: "Baseline 2"}
      {value: "baseline-4", label: "Baseline 4"}
      {value: "baseline-8", label: "Baseline 8"}
      {value: "baseline-16", label: "Baseline 16"}
      {value: "baseline-32", label: "Baseline 32"}
      {value: "himem-2", label: "High Mem 2"}
      {value: "himem-4", label: "High Mem 4"}
      {value: "himem-8", label: "High Mem 8"}
      {value: "himem-16", label: "High Mem 16"}
      {value: "himem-32", label: "High Mem 32"}
      {value: "hidisk-2", label: "High Disk 2"}
      {value: "hidisk-4", label: "High Disk 4"}
      {value: "hidisk-8", label: "High Disk 8"}
      {value: "hidisk-16", label: "High Disk 16"}
      {value: "hidisk-32", label: "High Disk 32"}
    ]
    @defaultInstanceType = app.spec.instance_type
    @instanceType = ko.observable(app.spec.instance_type)

  run: () ->
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
        window.location = "/jobs/#{rs.id}"
      )
      .fail((error) =>
        @busy(false)
        @running(false)
        #TODO: bootstrap alerts
        alert "App could not be run due to: #{error.statusText}"
        console.error error
      )

class InputModel
  constructor: (spec, @viewModel) ->
    @klass = spec.class
    @help = spec.help
    @label = spec.label
    @name = spec.name
    @defaultValue = spec.default
    @isOptional = spec.optional
    @isRequired = !@isOptional
    @patterns = spec.patterns
    @choices = spec.choices

    @placeholder = @defaultValue

    @isClassAnArray = @klass.indexOf('array') == 0

    @error = ko.observable()

    @value = ko.observable()
    @valueDisplay = ko.computed(
      read: () =>
        switch @klass
          when 'file'
            if !@value()?
              "Select file..."
            else
              @value().name
          else
            if !@value()?
              @defaultValue
            else
              @value()
      write: (value) =>
        if !value?
          @value(@defaultValue)
        else
          switch @klass
            when 'boolean'
              if value == 'true'
                @value(true)
              else if value == 'false'
                @value(false)
              else
                @value(null)
            else
              @value(value)
    )

  # Boolean Functions
  toggleTrue: (e) ->
    if @value() == true
      @value(null)
    else
      @value(true)
    $(".field-boolean .btn").blur()

  toggleFalse: (e) ->
    if @value() == false
      @value(null)
    else
      @value(false)
    $(".field-boolean .btn").blur()

  # File Functions
  openFileSelector: () ->
    @viewModel.fileSelector.open(this, @value.peek())

  clear: () ->
    @valueDisplay(null)

  getDataForRun: () ->
    value = @value()
    if value? && value != ''
      try
        if @isClassAnArray && _.isString(value)
          value = value.replace(/(^\s*,)|(,\s*$)/g, '') # Remove any trailing/leading commas
          value = _.map(value.split(','), (data) =>
            data = $.trim(data) # Remove trailing/leading whitespace
            data = switch @klass
                    when 'int'
                      parseInt(data, 10)
                    when 'float'
                      parseFloat(data)
                    else
                      data
          )
        else if @klass == "hash" && _.isString(value)
          if value.length > 0
            try
              value = JSON.parse(value)
            catch error
              @error(error.message)
          else
            value = undefined
        else
          switch @klass
            when 'int'
              value = parseInt(value, 10)
            when 'float'
              value = parseFloat(value)
            when 'file'
              value = value.dxid
            else
              value
      catch error
        value = undefined
    else
      value = undefined
    return value

class FileSelector
  constructor: () ->
    @modal = $(".file-selector-modal")
    @files = ko.observableArray()
    @selected = ko.observableArray()
    @inputModel = ko.observable()
    @busy = ko.observable(false)

    @type = ko.computed(=>
      if @inputModel()?.isClassAnArray then 'checkbox' else 'radio'
    )

    @canSave = ko.computed(=>
      !@busy() && !_.isEmpty(@selected())
    )

    @modal.on('hidden.bs.modal', =>
      @files([])
      @inputModel(null)
      @selected([])
    )

  getFiles: (params = {}) ->
    @busy(true)
    Precision.api('/api/list_files', params, (files) =>
      @files(_.map(files, (file) =>
        new FileModel(file, this)
      ))
    ).always(=>
      @busy(false)
    )

  open: (inputModel, value) =>
    @inputModel(inputModel)

    @getFiles().done(() =>
      @modal.modal('handleUpdate')

      # Since getFiles creates new FileModels, our existing selection is considered a different object
      # So we need to go through all the files to find our selection
      if value?
        files = @files.peek()
        if !_.isArray(value)
          foundValue = _.find(files, (file) -> file.dxid == value.dxid)
        else
          foundValue = _.map(value, (v) -> _.find(files, (file) -> file.dxid == v.dxid))
        @selected(foundValue)
    )
    @modal.modal('show')

  save: () =>
    value = @selected()
    @inputModel.peek().value(value)
    @modal.modal('hide')

class FileModel
  constructor: (file, @selectorModel) ->
    @id = file.id
    @dxid = file.dxid
    @name = file.name
    @project = file.project
    @type = @selectorModel.type()

  onSelect: () =>
    @selectorModel.save() if @type == 'radio'

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
  viewModel = new JobsNewView(@params.app)
  ko.applyBindings(viewModel, $container[0])
