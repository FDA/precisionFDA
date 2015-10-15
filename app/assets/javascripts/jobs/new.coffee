class JobsNewView
  constructor: (app) ->
    @id = app.id
    @dxid = app.dxid
    @series = app.series
    @inputSpec = app.spec.input_spec
    @outputSpec = app.spec.output_spec

    @fileSelector = new FileSelector()

    @busy = ko.observable(false)
    @instanceType = ko.observable(app.spec.instance_type)
    @name = ko.observable(app.title)
    @inputFields = ko.observableArray(_.map(@inputSpec, (spec) =>
      new InputModel(spec, this)
    ))

    @isRunnable = ko.computed(() =>
      isConfigReady = !_.isEmpty(@name())
      areInputsReady = _.every(@inputFields(), (inputModel) ->
        hasError = inputModel.error()?
        hasData = inputModel.getDataForRun()? && inputModel.getDataForRun() != ''
        hasDefault = inputModel.defaultValue?
        isRequired = inputModel.isRequired
        return !hasError && (!isRequired || (isRequired && (hasData || hasDefault)))
      )

      return isConfigReady && areInputsReady
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
              "Select..."
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
    @viewModel.fileSelector.inputModel = this
    @viewModel.fileSelector.open()

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
        else if _.isObject(value)
          value
        else
          value = switch @klass
                    when 'int'
                      parseInt(value, 10)
                    when 'float'
                      parseFloat(value)
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
    @inputModel = null
    @busy = ko.observable(false)

  getFiles: (params = {}) ->
    @busy(true)
    Precision.api('/api/list_files', params, (files) =>
      @files(_.map(files, (file) ->
        new FileModel(file)
      ))
    ).always(=>
      @busy(false)
    )

  open: () =>
    @getFiles().done(() =>
      @modal.modal('handleUpdate')
    )
    @modal.modal('show')

  save: () =>
    value = @selected()
    @inputModel.value(value)
    @modal.modal('hide')
    @modal.on('hidden.bs.modal', =>
      @files([])
    )

class FileModel
  constructor: (file) ->
    @id = file.id
    @dxid = file.dxid
    @name = file.name
    @project = file.project

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

  # $container
    # .on("click.jobs.new", ".event-select-file", (e) -> viewModel.selectFile(e))
  #   .on("submit.jobs.new", ".form-upload-jobs", (e) -> viewModel.handleUpload(e))
  #   .on("click.jobs.new", ".event-upload-jobs", (e) -> viewModel.handleUpload(e))
  #   .on("click.jobs.new", ".event-clear-jobs", (e) -> viewModel.handleClear(e))
