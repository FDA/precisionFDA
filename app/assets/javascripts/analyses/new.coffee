class WorkflowViewModel
  constructor: (workflow) ->
    @name = ko.observable()
    @title = ko.observable(workflow.title)
    @errorMessage = ko.observable()
    @isRunning = ko.observable(false)
    @accessibleScope = workflow.scopes
    @scope = workflow.scope
    @stages = ko.computed( =>
      for io in workflow.spec.input_spec.stages
        new stageModel(io, @accessibleScope)
    )
    @inputs = ko.computed( =>
      stages = []
      for  input_spec in @stages()
        for i in input_spec.inputs()
          if !i.values.id?
            stages.push input_spec
            break
      stages)
    @workflowUid = workflow.uid
    @defaultValues = ko.observable()
    @canRunWorkflow = ko.computed(=>
      config = true
      ko.utils.arrayMap(@inputs(), (slot) ->
        ko.utils.arrayMap(slot.inputs(), (input) ->
          if input.optional == false && config && input.values.id == null
            if input['class'] == 'file' || input['class'] == 'array:file'
              config = (input.selectorModel.defaultValues()? && input.selectorModel.defaultValues().length > 0 && input.selectorModel.defaultValues()[0]!=undefined)|| (input.selectorModel.fileValues()? && input.selectorModel.fileValues().length > 0 && input.selectorModel.fileValues()[0]!=undefined)
            else if input['class'] == 'boolean'
              config = (input.defaultValues()? && !_.isArray(input.defaultValues()) && _.isBoolean(input.defaultValues())) ||
                       (input.defaultValues()? && _.isArray(input.defaultValues()) && (_.isString(input.defaultValues()[0]) || _.isBoolean(input.defaultValues()[0])))
            else
              config = (input.defaultValues()? && input.defaultValues().length > 0 && input.defaultValues()[0]!=undefined)
        )
      )
      return config && !_.isEmpty(@title())
    )

  data_inputs: (data) ->
    ko.utils.arrayFilter(data.inputs(), (input) -> !input.values.id?)

  isInSpace: (scope) ->
    return scope.startsWith('space-') if scope?
  
  getSpaceId: (scope) ->
    return scope.substring(scope.indexOf('-') + 1);

  run_workflow: () =>
    @isRunning(true)
    inputs = []
    for workflow_inputs in @inputs()
      for workflow_input in workflow_inputs.inputs()
        if !workflow_input.values.id?
          input_name = workflow_input.parent_slot+"."+workflow_input.stageName
          if workflow_input.class == 'file'
            if workflow_input.optional && workflow_input.selectorModel.defaultValues()?
              continue
            else if !workflow_input.optional || !workflow_input.selectorModel.defaultValues()?
              uid = if workflow_input.selectorModel.defaultValues()[0].uid !=undefined then  workflow_input.selectorModel.defaultValues()[0].uid else workflow_input.selectorModel.defaultValues()[0]
              input = {"class": workflow_input.class, "input_name": input_name, "input_value": uid}
          else if workflow_input.class == 'array:file'
            if workflow_input.optional && workflow_input.selectorModel.defaultValues()?
              continue
            else if !workflow_input.optional || !workflow_input.selectorModel.defaultValues()?
              values = if _.isArray(workflow_input.selectorModel.defaultValues()[0]) then workflow_input.selectorModel.defaultValues()[0] else workflow_input.selectorModel.defaultValues()
              files = []
              for file in values
                uid = if file.uid? then file.uid else file
                files.push uid
              input = {"class": workflow_input.class, "input_name": input_name, "input_value": files}
          else if _.isArray(workflow_input.defaultValues())
            if workflow_input.optional && workflow_input.defaultValues()[0]?
              input = {"class": workflow_input.class, "input_name": input_name, "input_value": workflow_input.defaultValues()[0]}
            else if !workflow_input.optional || !workflow_input.defaultValues()[0]?
              input = {"class": workflow_input.class, "input_name": input_name, "input_value": workflow_input.defaultValues()[0]}
          else
            if workflow_input.optional && workflow_input.selectorModel.defaultValues()?
              input = {"class": workflow_input.class, "input_name": input_name, "input_value": workflow_input.defaultValues()}
            else if !workflow_input.optional || !workflow_input.defaultValues()?
              input = {"class": workflow_input.class, "input_name": input_name, "input_value": workflow_input.defaultValues()}
          inputs.push input
    params = {
      name: @title(),
      inputs: inputs,
      workflow_id: @workflowUid
    }
    Precision.api('/api/run_workflow', params)
      .done( =>
        window.location.replace(if (@isInSpace(@scope)) then "/spaces/#{@getSpaceId(@scope)}/workflows/#{@workflowUid}" else "/home/workflows/#{@workflowUid}")
    )
      .fail((error) =>
        @isRunning(false)
        Precision.alert.show(error.responseJSON.error.message)
        console.log(error)
    )

class stageModel
  constructor: (spec, @accessibleScope) ->
    @name = spec.name
    @inputs = ko.computed( =>
      for io in spec.inputs
        new IOModel(io, @accessibleScope)
    )

class IOModel
  getDefaultValues: (data) ->
    if typeof data.default_workflow_value == 'boolean'
      return [data.default_workflow_value]
    return [data.default_workflow_value || data.defaultValues]

  constructor: (data, @accessibleScope) ->
    @class = data.class
    @parent_slot = data.parent_slot
    @stageName = data.name
    @label = data.label
    @inputLabel = data.label || data.name
    @values = data.values
    @value = ko.observable(data.value)
    @optional = data.optional
    @selectorModel = new selectorModel(@class, data, @accessibleScope)
    @defaultValues = ko.observableArray(@getDefaultValues(data))
    @isTrueActive = ko.computed( =>
      if @defaultValues()? && _.isArray(@defaultValues())
        value = @defaultValues()[0]
        value = value.toString() if value
        return (typeof value == 'boolean' and value) or value == 'true'
      else if @defaultValues()? && _.isBoolean(@defaultValues())
        return @defaultValues() == true
    )
    @isFalseActive = ko.computed( =>
      if @defaultValues()? && _.isArray(@defaultValues())
        value = @defaultValues()[0]
        value = value.toString() if value
        return (typeof value == 'boolean' and !value) or value == 'false'
      else if @defaultValues()? && _.isBoolean(@defaultValues())
        return @defaultValues() == false
    )

  toggleTrue: (e) ->
    if @defaultValues() == true
      @defaultValues([])
    else
      @defaultValues(true)

  toggleFalse: (e) ->
    if @defaultValues() == false
      @defaultValues([])
    else
      @defaultValues(false)

class selectorModel
  constructor: (klass, data, @accessibleScope) ->
    @id = _.uniqueId("io-field-")
    @klass = klass
    @fileValues = ko.observableArray()
    @defaultValues = ko.observableArray([data.default_workflow_value || data.defaultValues])
    @buttonType = ko.computed(=>
      switch @klass
        when "file"
          'radio'
        when "array:file"
          'checkbox'
    )
    @listedFiles = ko.computed(=>
      params = {
        states: ["closed"]
        describe:
          include:
            user: true
            all_tags_list: false
        patterns: @patterns
      }
      Precision.api("/api/list_files", params, (objects) =>
        objects
      )
    )
    @fileValueDisplay = ko.computed(=>

      if @klass=='file' || @klass=='array:file'
        if @defaultValues()? && @defaultValues().length > 0  && @defaultValues()[0] != undefined
          if _.isArray(@defaultValues()[0])
            values = @defaultValues()[0]
          else
            values = @defaultValues()
        else
          values = @fileValues()
        if values.length > 0
          for file_value in values
            arr = []
            params =
              uid: if file_value.uid!= undefined then file_value.uid else file_value
            Precision.api('/api/describe', params, null, null, false).done((value) =>
              arr.push(value)
            )
            o.title for o in arr
        else
          "Select file..."
    )

    @objectSelector = new Precision.models.SelectorModel({
      title: 'Select default file for field'
      selectionType: @buttonType()
      selectableClasses: ['file']
      studies: []
      onSave: (selected) =>

        if !_.isArray(selected)
          @fileValues([selected])
          @defaultValues([selected])
        else
          arr = []
          file_name = []
          for file in selected
            arr.push(file.uid)
          @fileValues(selected)
          @defaultValues(arr)
        deferred = $.Deferred()
        deferred.resolve(selected)
      listRelatedParams: {
        scopes: @accessibleScope,
        classes: ['file']
      }
      listModelConfigs: [{
        className: 'file',
        name: 'Files',
        apiEndpoint: 'list_files',
        listedFiles: @listedFiles,
        apiParams: {
          scopes: @accessibleScope
        }
      }]
    })

  clear: () ->
    @defaultValues([])
    @fileValues([])
  openSelector: () =>
    @objectSelector.open()


#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

AnalysesController = Paloma.controller('Analyses', {
  new: ->
    $container = $("body main")
    viewModel = new WorkflowViewModel(@params.workflow)
    ko.applyBindings(viewModel, $container[0])
})
