#TODO: version semvar validation

class AppEditorModel
  constructor: (app, @isNewApp) ->
    @saving = ko.observable(false)
    @error = ko.observable()

    @dxid = app?.dxid
    @name = ko.observable(app?.name)

    @title = ko.observable(app?.title)
    @revision = ko.observable(app?.revision)
    @readme = ko.observable(app?.readme)
    @code = ko.observable(app?.internal.code)
    @assets = ko.observableArray(app?.internal.ordered_assets)
    @packages = ko.observableArray(app?.internal.packages)

    @inputSpec = app?.spec.input_spec
    @outputSpec = app?.spec.output_spec
    @inputs = ko.observableArray(_.map(@inputSpec, (spec) =>
      new IOModel(spec, "input", this)
    ))
    @outputs = ko.observableArray(_.map(@outputSpec, (spec) =>
      new IOModel(spec, "output", this)
    ))

    @internetAccess = ko.observable(app?.spec.internet_access ? false)

    @availableInstances = Precision.INSTANCES
    @defaultInstanceType = app?.spec.instance_type
    @instanceType = ko.observable(app?.spec.instance_type)

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

    # TODO: make dirty update when fields are changed
    @dirty = ko.observable(true)

    @isSaveReady = ko.computed(=>
      return false if @saving() || !@dirty()
      return !_.isEmpty(@title()) && !_.isEmpty(@name())
    )

    # TODO: Forking
    @saveButtonText = ko.computed(=>
      if @saving()
        if @isNewApp then "Creating..." else "Saving Revision #{parseInt(@revision()) + 1}..."
      else
        if @isNewApp then "Create" else "Save Revision #{parseInt(@revision() + 1)}"
    )

  addInputField: (data, event) =>
    @inputs.push(new IOModel({class: data.class}, "input", this))

  addOutputField: (data, event) =>
    @outputs.push(new IOModel({class: data.class}, "output", this))

  save: () ->
    @title(_.trim(@title.peek()))

    @saving(true)

  # name, title, readme, input_spec, output_spec, internet_access, instance_type, ordered_assets, packages, code, is_new

    params =
      is_new: @isNewApp
      name: @name.peek()
      title: @title.peek()
      readme: @readme.peek() ? ""
      input_spec: _.map(@inputs.peek(), (inputModel) -> inputModel.getDataForSave())
      output_spec: _.map(@outputs.peek(), (outputModel) -> outputModel.getDataForSave())
      internet_access: @internetAccess.peek()
      instance_type: @instanceType.peek()
      ordered_assets: @assets.peek()
      packages: @packages.peek()
      code: @code.peek() ? ""

    Precision.api('/api/create_app', params)
      .done((data) =>
        if data.id
          window.location.replace("/apps/#{data.id}")
        else if data.failure
          #TODO: alert message
          console.error(data.failure)
          @error(data.failure)
      )
      .fail((error) =>
        console.error(error)
      )
      .always(() =>
        @saving(false)
      )

class IOModel
  constructor: (spec, @ioType, @viewModel) ->
    @id = _.uniqueId("io-field-")
    @klass = ko.observable(spec.class)
    @help = ko.observable(spec.help)
    @label = ko.observable(spec.label)
    @name = ko.observable(spec.name)
    if spec.class == 'boolean'
      if spec.default == true
        defaultValue = 'true'
      else if spec.default == false
        defaultValue = 'false'
    else
      defaultValue = spec.default
    @defaultValue = ko.observable(defaultValue)
    @isOptional = ko.observable(spec.optional ? false)
    # @patterns = ko.observable(spec.patterns)
    # @choices = ko.observable(spec.choices)

    @error = ko.observable()

    @isClassAnArray = ko.computed =>
      @klass().indexOf('array') == 0

  remove: (item) ->
    io = if @ioType == "input" then @viewModel.inputs else @viewModel.outputs
    io.remove((ioItem) => ioItem.id == item.id)

  getDataForSave: () ->
    data =
      class: @klass.peek()
      help: @help.peek()
      label: @label.peek()
      name: @name.peek()
      optional: @isOptional()

    data.default = @getValueForDefault() if @ioType == "input"

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
            when 'boolean'
              if value == 'true'
                value = true
              else if value == 'false'
                value = false
            else
              value
      catch error
        value = undefined
    else
      value = undefined
    return value

window.Precision ||= {}
window.Precision.models || = {}
window.Precision.models.AppEditorModel = AppEditorModel
