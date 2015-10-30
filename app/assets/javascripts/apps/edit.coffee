class AppEditModel
  constructor: (app) ->
    @saving = ko.observable(false)

    @scriptEditor = null
    @readmeEditor = null

    @dxid = app.dxid
    @name = app.name

    @title = ko.observable(app.title)
    @revision = ko.observable(app.revision)
    @version = ko.observable(app.version)
    @readme = ko.observable(app.readme)
    @code = ko.observable(app.internal.code)
    @assets = ko.observableArray(app.internal.ordered_assets)

    @inputSpec = app.spec.input_spec
    @outputSpec = app.spec.output_spec
    @inputs = ko.observableArray(_.map(@inputSpec, (spec) =>
      new IOModel(spec, "input", this)
    ))
    @outputs = ko.observableArray(_.map(@outputSpec, (spec) =>
      new IOModel(spec, "output", this)
    ))

    @internetAccess = ko.observable(app.spec.internet_access)

    @availableInstances = Precision.INSTANCES
    @defaultInstanceType = app.spec.instance_type
    @instanceType = ko.observable(app.spec.instance_type)

    @availableInputClasses = [
      {class: "file", label: "File"}
      {class: "string", label: "String"}
      {class: "int", label: "Integer"}
      {class: "float", label: "Float"}
      {class: "boolean", label: "Boolean"}
      # {class: "choices", label: "Choices"}
    ]

    @availableOutputClasses = [
      {class: "file", label: "File"}
      {class: "string", label: "String"}
      {class: "int", label: "Integer"}
      {class: "float", label: "Float"}
      {class: "boolean", label: "Boolean"}
    ]

    @dirty = ko.observable(true)

    @isSaveReady = ko.computed(=>
      return false if @saving() || !@dirty()
      return !_.isEmpty(@title()) && !_.isEmpty(@version())
    )

  addInputField: (data, event) =>
    @inputs.push(new IOModel({class: data.class}, "input", this))

  addOutputField: (data, event) =>
    @outputs.push(new IOModel({class: data.class}, "output", this))

  save: () ->
    @title(_.trim(@title()))
    @version(_.trim(@version()))
    console.log @readme()
    console.log @code()

    @saving(true)

    params =
      app:
        title: @title()
        version: @version()
        readme: @readme()
        spec:
          input_spec: _.map(@inputs(), (inputModel) -> inputModel.getDataForSave())
          output_spec: _.map(@outputs(), (outputModel) -> outputModel.getDataForSave())
        internal:
          code: @code()
          ordered_assets: @assets()

    # $.ajax("/apps/#{@name}", {
    #   method: "PUT"
    #   data: params
    # }).done((res) =>
    #   window.location.replace(res.path) if window.location.pathname != res.path
    # ).fail((error) ->
    #   console.error(error)
    # ).always(() =>
    #   @saving(false)
    # )

class IOModel
  constructor: (spec, @ioType, @viewModel) ->
    @id = _.uniqueId("io-field-")
    @klass = ko.observable(spec.class)
    @help = ko.observable(spec.help)
    @label = ko.observable(spec.label)
    @name = ko.observable(spec.name)
    @defaultValue = ko.observable(spec.default)
    @isOptional = ko.observable(spec.optional)
    # @patterns = ko.observable(spec.patterns)
    # @choices = ko.observable(spec.choices)

    @error = ko.observable()

    @isClassAnArray = ko.computed =>
      @klass().indexOf('array') == 0

  remove: (item) ->
    io = if @ioType == "input" then @viewModel.inputs else @viewModel.outputs
    io.remove((ioItem) => ioItem.id == item.id)

  # Boolean Functions
  toggleTrue: (e) ->
    if @defaultValue() == true
      @defaultValue(null)
    else
      @defaultValue(true)
    $(".field-boolean .btn").blur()

  toggleFalse: (e) ->
    if @defaultValue() == false
      @defaultValue(null)
    else
      @defaultValue(false)
    $(".field-boolean .btn").blur()

  getDataForSave: () ->
    data =
      class: @klass()
      help: @help()
      label: @label()
      name: @name()

    if @ioType == "input"
      data = _.extend(data, {
        default: @getValueForDefault()
        optional: @isOptional()
      })

    return data

  getValueForDefault: () ->
    value = @defaultValue.peek()
    klass = @klass.peek()
    if value? && value != ''
      try
        if @isClassAnArray() && _.isString(value)
          value = value.replace(/(^\s*,)|(,\s*$)/g, '') # Remove any trailing/leading commas
          value = _.map(value.split(','), (data) =>
            data = $.trim(data) # Remove trailing/leading whitespace
            data = switch klass
                    when 'int'
                      parseInt(data, 10)
                    when 'float'
                      parseFloat(data)
                    else
                      data
          )
        else if klass == "hash" && _.isString(value)
          if value.length > 0
            try
              value = JSON.parse(value)
            catch error
              @error(error.message)
          else
            value = undefined
        else
          switch klass
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

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

AppsController = Paloma.controller('Apps')
AppsController::edit = ->
  $container = $("body main")
  viewModel = new AppEditModel(@params.app)

  # scriptEditor = ace.edit("script-editor")
  # scriptEditor.setTheme("ace/theme/monokai")
  # scriptEditor.getSession().setMode("ace/mode/sh")
  # scriptEditor.setOptions({
  #   maxLines: Infinity
  #   minLines: 25
  # })

  # readmeEditor = ace.edit("readme-editor")
  # readmeEditor.setTheme("ace/theme/textmate")
  # readmeEditor.getSession().setMode("ace/mode/markdown")
  # readmeEditor.setOptions({
  #   maxLines: Infinity
  #   minLines: 25
  # })

  # viewModel.scriptEditor = scriptEditor
  # viewModel.readmeEditor = readmeEditor

  ko.applyBindings(viewModel, $container[0])
