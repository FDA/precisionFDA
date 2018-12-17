class AppEditorModel
  constructor: (app, @mode = 'edit') ->
    @isNewApp = @mode != 'edit'
    @saving = ko.observable(false)
    @loading = ko.observable(false)
    @errorMessage = ko.observable()

    @dxid = app?.dxid
    @name = ko.observable(app?.name)
    @name.cache = ko.computed(
      read: () =>
        @name()
      write: (name) =>
        name = _.trim(name.toLowerCase())
                   .replace(/\s+/g, "-")
                   .replace(/[^a-zA-Z0-9\-\_]+/g,"")

        @name(name)
    )

    @title = ko.observable(app?.title)
    @revision = ko.observable(app?.revision)
    @readme = ko.observable(app?.readme)
    @readme.preview = ko.computed(=>
      Precision.md.render(@readme())
    )
    @code = ko.observable(app?.internal.code)

    # Assets
    @assetsSelector = new Precision.models.AssetsModel
    @assets = ko.observableArray()
    if app?.internal.ordered_assets.length > 0
      @loading(true)
      Precision.api '/api/list_assets', {ids: app.internal.ordered_assets}, (assets) =>
        @assets(_.map(@assetsSelector.createAssetModels(assets)))
        @loading(false)

    @assetsSelector.assets.saved.subscribe((assetsSaved) =>
      @assets(assetsSaved)
    )

    # Packages
    @packages = ko.observableArray(app?.internal.packages)
    @packageToAdd = ko.observable("")

    @inputSpec = app?.spec.input_spec
    @outputSpec = app?.spec.output_spec

    @inputs = ko.observableArray()
    @createInputs(@inputSpec)
    @outputs = ko.observableArray()
    @createOutputs(@outputSpec)

    @internetAccess = ko.observable(app?.spec.internet_access ? false)

    @availableInstances = Precision.INSTANCES
    @defaultInstanceType = app?.spec.instance_type ? "baseline-8"
    @instanceType = ko.observable(@defaultInstanceType)

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

    @isSaveReady = ko.computed(=>
      return false if @saving() || @loading()
      return !_.isEmpty(@title()) && !_.isEmpty(@name())
    )

    @saveButtonText = ko.computed(=>
      saving = @saving()
      switch @mode
        when 'new'
          if saving then "Creating..." else "Create"
        when 'fork'
          if saving then "Forking..." else "Fork"
        else
          if saving
            "Saving Revision #{parseInt(@revision()) + 1}..."
          else
            "Save Revision #{parseInt(@revision() + 1)}"
    )

    @saveIcon = ko.computed(=>
      switch @mode
        when 'new'
          "fa fa-plus"
        when 'fork'
          "fa fa-code-fork"
        else
          "fa fa-save"
    )

    @isContentVisible = ko.computed(=>
      if @isNewApp
        return !_.isEmpty(@name()) && !_.isEmpty(@title())
      else
        true
    )

    Precision.bind.save(this, @save)
    Precision.bind.traps()

  createInputs: (inputSpec) =>
    @inputs.removeAll()
    _.each(inputSpec, (spec) =>
      @inputs.push(new IOModel(spec, "input", this)))

  createOutputs: (inputSpec) =>
    @outputs.removeAll()
    _.each(inputSpec, (spec) =>
      @outputs.push(new IOModel(spec, "output", this)))

  onOpenAssetsModal: ->
    # Set up a subscription for when the assets will be loaded,
    # then set the selected assets

    sub = @assetsSelector.assets.subscribe((assets) =>
      selectedAssets = _.union(@assets.peek(), @assetsSelector.assets.selected.peek())
      @assetsSelector.setSelected(selectedAssets)
      @assetsSelector.previewAsset(_.first(@assetsSelector.assets()))
      sub.dispose()
    )
    @assetsSelector.getAssets()

  addPackage: ->
    if @packageToAdd() != '' and @packages.indexOf(@packageToAdd()) < 0
      @packages.push _.trim(@packageToAdd())
    @packageToAdd ''

  removePackage: (packageText) =>
    @packages.remove(packageText)

  removeAsset: (asset) =>
    @assets.remove(asset)

  addInputField: (data, event) =>
    @inputs.push(new IOModel({class: data.class}, "input", this))

  addOutputField: (data, event) =>
    @outputs.push(new IOModel({class: data.class}, "output", this))

  getAssetsForSave: () ->
    assets = @assets.peek()
    return _.map(assets, 'uid') if assets.length > 0

  save: () ->
    @title(_.trim(@title.peek()))
    @name(_.trim(@name.peek())) if @isNewApp
    @saving(true)
    @errorMessage(null)
    params =
      is_new: @isNewApp
      name: @name.peek()
      title: @title.peek()
      readme: @readme.peek() ? ""
      input_spec: _.map(@inputs.peek(), (inputModel) -> inputModel.getDataForSave())
      output_spec: _.map(@outputs.peek(), (outputModel) -> outputModel.getDataForSave())
      internet_access: @internetAccess.peek()
      instance_type: @instanceType.peek()
      ordered_assets: @getAssetsForSave()
      packages: @packages.peek()
      code: @code.peek() ? ""

    Precision.api('/api/create_app', params)
      .done((data) =>
        Precision.unbind.traps()
        window.location.replace("/apps/#{data.id}/jobs")
      )
      .fail((error) =>
        errorObject = JSON.parse error.responseText
        @errorMessage(errorObject.error.message)
        console.error(error)
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
    @defaultFileValue = ko.observable()
    @isOptional = ko.observable(spec.optional ? false)
    # @patterns = ko.observable(spec.patterns)
    @choices = ko.observableArray(spec.choices)
    @choicesValue = ko.computed({
      read: () =>
        @choices().join(', ')
      write: (choicesEntered) =>
        choices = []
        rawChoices = _.trim(choicesEntered).split(',')
        for rawChoice in rawChoices
          choice = switch @klass()
            when 'int'
              parseInt(rawChoice, 10)
            when 'float'
              parseFloat(rawChoice)
            else
              _.trim(rawChoice)
          choices.push(choice) if !_.isNaN(choice) && choice != ""
        @choices(choices)
    })
    @choicesPlaceholder = ko.computed(=>
      "Optional comma separated #{@klass()}s"
    )

    @isChoicesVisible = ko.observable(spec.choices?)

    @error = ko.observable()

    @isClassAnArray = ko.computed =>
      @klass().indexOf('array') == 0

    # Default Value Selector

    @defaultValueDisplay = ko.computed(=>
      switch @klass()
        when 'file'
          defaultValue = @defaultValue()
          defaultFileValue = @defaultFileValue()
          if defaultValue?
            if defaultFileValue?
              title = defaultFileValue.title
              if _.isFunction(title) then title() else title
            else if defaultValue.match(new RegExp(/^file-(.{24,})$/, "i"))
                params =
                  uid: defaultValue
                Precision.api('/api/describe', params).done((value) =>
                  @defaultFileValue(value)
                )
                defaultValue
            else
              @error("Invalid default value: #{defaultValue}")
              defaultValue
          else
            "Select file..."
        else
          defaultValue
    )

    @objectSelector = new Precision.models.SelectorModel({
      title: "Select default file for field"
      selectionType: "radio"
      selectableClasses: ["file"]
      onSave: (selected) =>
        @defaultValue(selected.uid)
        @defaultFileValue(selected)

        deferred = $.Deferred()
        deferred.resolve(selected)
      listRelatedParams:
        # editable: true
        # scopes: ["private", "public"]
        classes: ["file", "note", "discussion", "answer", "comparison", "app", "asset", "job"]
      listModelConfigs: [
        {
          className: "file"
          name: "Files"
          apiEndpoint: "list_files"
          apiParams:
            states: ["closed"]
            describe:
              include:
                user: true
                org: true
                all_tags_list: true
        }
        {
          className: "note"
          name: "Notes"
          apiEndpoint: "list_notes"
          apiParams:
            note_types: ["Note"]
            describe:
              include:
                user: true
                org: true
                all_tags_list: true
        }
        {
          className: "discussion"
          name: "Discussions"
          apiEndpoint: "list_notes"
          apiParams:
            note_types: ["Discussion"]
            describe:
              include:
                user: true
                org: true
                all_tags_list: true
        }
      ]
    })

  toggleChoices: () ->
    @isChoicesVisible(!@isChoicesVisible())

  remove: (item) ->
    io = if @ioType == "input" then @viewModel.inputs else @viewModel.outputs
    io.remove((ioItem) => ioItem.id == item.id)

  openFileSelector: () ->
    @objectSelector.open()

  clear: () ->
    @defaultValue(null)
    @defaultFileValue(null)

  getDataForSave: () ->
    data =
      class: @klass.peek()
      help: @help.peek() ? ""
      label: @label.peek() ? ""
      name: @name.peek()
      optional: @isOptional() ? false
      choices: @choices() ? []

    if @ioType == "input"
      defaultValue = @getValueForDefault()
      data.default = defaultValue if defaultValue?

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
              value = value.dxid ? value
              if !value.match(new RegExp(/^file-(.{24,})$/, "i"))
                @error("Invalid default value: #{value}")
                value = undefined
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
window.Precision.models ||= {}
window.Precision.models.AppEditorModel = AppEditorModel
