class JobsNewView
  constructor: (app) ->
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
        inputModel.isReady()
      )

      return !@busy() && isConfigReady && areInputsReady
    )

    @availableInstances = Precision.INSTANCES
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
        window.location = "/apps/#{@dxid}/jobs"
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

    @error = ko.observable(null)

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

    @isReady = ko.computed(=>
      @value()
      hasDefault = @defaultValue?
      isRequired = @isRequired
      hasData = @getDataForRun()? && @getDataForRun() != ''
      hasError = @error() != null
      return !hasError && (!isRequired || (isRequired && (hasData || hasDefault)))
    )

    @needsToBeSet = ko.computed(=>
      return @isRequired && !@isReady()
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
            _data = data
            switch @klass
              when 'int'
                data = parseInt(data, 10)
                if _.isString(_data) && _data != data.toString()
                  @error("#{_data} is not a valid integer")
                else
                  @error(null)
              when 'float'
                data = parseFloat(data)
                if _.isString(_data) && _data != data.toString()
                  @error("#{_data} is not a valid integer")
                else
                  @error(null)
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
          _value = value
          switch @klass
            when 'int'
              value = parseInt(value, 10)
              if _.isString(_value) && _value != value.toString()
                @error("#{_value} is not a valid integer")
              else
                @error(null)
            when 'float'
              value = parseFloat(value)
              if _.isString(_value) && _value != value.toString()
                @error("#{_value} is not a valid float")
              else
                @error(null)
            when 'file'
              value = value.uid
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
          foundValue = _.find(files, (file) -> file.uid == value.uid)
        else
          foundValue = _.map(value, (v) -> _.find(files, (file) -> file.uid == v.uid))
        @selected(foundValue)
    )
    @modal.modal('show')

  save: () =>
    value = @selected()
    @inputModel.peek().value(value)
    @modal.modal('hide')

class FileModel
  constructor: (file, @selectorModel) ->
    @uid = file.uid
    @name = file.name
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
