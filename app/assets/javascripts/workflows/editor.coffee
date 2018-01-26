class WorkflowEditorModel
  setSlots: (workflow) ->
    if workflow? && !@slots().length > 0
      for stage in workflow.spec.input_spec["stages"]
        Precision.api('/api/describe', { uid: stage.app_dxid }, null, null, false)
          .done((app) =>
            inputs = app.spec.input_spec.map (input) ->
              $.extend({}, input, {
                values: { id: null, name: null }
              })
            outputs = app.spec.output_spec.map (output) ->
              $.extend({}, output, {
                values: { id: null, name: null }
              })
            spec = {
              name: app.name,
              dxid: app.dxid,
              instanceType: app.spec.instance_type,
              revision: app.revision,
              inputs: inputs,
              outputs: outputs
            }
            new_slot = new slotModel(spec, this, stage, true)
            @slots.push(new_slot)
            if spec.outputs.length > 0
              @eligibleSlots.push(new_slot)
        )
      for stage in workflow.spec.input_spec["stages"]
        prev_slot = ko.utils.arrayFilter @slots(), (slot) ->
          slot.slotId() == stage.prev_slot
        next_slot = ko.utils.arrayFilter @slots(), (slot) ->
          slot.slotId() == stage.next_slot
        current_slot = ko.utils.arrayFilter @slots(), (slot) ->
          slot.slotId() == stage.slotId
        current_slot[0].prevSlot(prev_slot[0])
        current_slot[0].nextSlot(next_slot[0])

  constructor: (apps, workflow, @mode = 'edit') ->
    @workflow = workflow
    @all_apps = ko.observableArray(apps.private_apps.concat(apps.public_apps).sort((a, b) -> a.id - b.id) )
    @private_apps = ko.observableArray(apps.private_apps)
    @public_apps = ko.observableArray(apps.public_apps)
    @slots = ko.observableArray()
    @readme = ko.observable(workflow?.readme)
    @readme.preview = ko.computed(=>
      Precision.md.render(@readme())
    )
    @isNewWorkflow = @mode != 'edit'
    @saving = ko.observable(false)
    @sortedList = ko.observableArray()
    @name = ko.observable(workflow?.name)
    @name.cache = ko.computed({
      read: () =>
        @name()
      write: (name) =>
        name = _.trim(name.toLowerCase())
                   .replace(/\s+/g, "-")
                   .replace(/[^a-zA-Z0-9\-\_]+/g, "")

        @name(name)
    })

    @title = ko.observable(workflow?.title)
    @slotBeingEdited = ko.observable()
    @updatingWorkflow = ko.observableArray(false)
    @inputBeingEdited = ko.observableArray()
    @eligibleSlots = ko.observableArray()
    @availableInstances = Precision.INSTANCES
    @numberStagesUnConfigured = ko.computed(=>
      ko.utils.arrayFilter(@slots(), (slot) ->
        if slot.inputs().length > 0
          !slot.configured())
    )
    @numberStagesConfigured = ko.computed(=>
      @slots().length - @numberStagesUnConfigured().length
    )
    @stagesText = ko.computed(=>
      if @numberStagesUnConfigured().length > 0
        "#{@numberStagesUnConfigured().length} " + @pluralize("#{@numberStagesUnConfigured()}") +  " unconfigured "
      else if @numberStagesUnConfigured().length == 0 && @slots().length > 0
        "#{@numberStagesConfigured()} " +  @pluralize("#{@numberStagesConfigured()}")  + " configured "
    )
    @errorMessage = ko.observable()
    @canCreateWorkflow = ko.computed(=>
      return @numberStagesUnConfigured().length == 0 && !_.isEmpty(@title()) && !_.isEmpty(@name())
    )
    @setSlots(workflow)
    @saveButtonText = ko.computed(=>
      saving = @saving()
      switch @mode
        when 'new'
          if saving then "Creating..." else "Create"
        when 'fork'
          if saving then "Forking..." else "Fork"
        when 'edit'
          if saving then "Saving..." else "Update"
    )
    @filterQuery = ko.observable()
    @privateApps = ko.computed(=>
      availapps = []
      if @filterQuery()
        apps = @filterSetOfObjects(@private_apps(), @filterQuery())
        for app in apps
          availapps.push(new appModel(app))
      else
        for app in @private_apps()
          availapps.push(new appModel(app))
      availapps
    )
    @publicApps = ko.computed(=>
      availapps = []
      if @filterQuery()
        apps = @filterSetOfObjects(@public_apps(), @filterQuery())
        for app in apps
          availapps.push(new appModel(app))
      else
        for app in @public_apps()
          availapps.push(new appModel(app))
      availapps
    )
    @allApps = ko.computed(=>
      availapps = []
      if @filterQuery()
        apps = @filterSetOfObjects(@all_apps(), @filterQuery())
        for app in apps
          availapps.push(new appModel(app))
      else
        for app in @all_apps()
          availapps.push(new appModel(app))
      availapps
    )

  filterSetOfObjects: (objects, query) ->
    return objects if _.isEmpty(query)
    if _.isArray(query)
      return _.filter(objects, (object) ->
        _.some(query, (queryToTest) ->
          regexp = Precision.utils.globToRegex(queryToTest, "i")
          object.name.match(regexp) || _.some(object.all_tags_list, (tag) -> tag.match(regexp))
        )
      )
    else
      regexp = new RegExp(query, "i")
      return _.filter(objects, (object) ->
        object.name.match(regexp) || _.some(object.all_tags_list, (tag) -> tag.match(regexp))
      )

  pluralize: (count) ->
    if count > 1
      'stages'
    else
      'stage'

  mapIO: () =>
    @slotBeingEdited.inputs

  configInput: (data) =>
    @inputBeingEdited(data)
    @eligibleSlotsBasedOnInput()

  checkOutputConfigured: (o, i, arr) =>
    o.configured?

  configuredSlot: (configuredSlot) =>

  removeMultipleItems: (array, indexes) ->
    array.filter (item, idx) ->
      indexes.indexOf(idx) == -1

  sortSlots: () =>
    clonedSlots = @slots()
    newSlots = []
    while clonedSlots.length > 0
      iter = 0
      for slot in clonedSlots
        if !slot.prevSlot()
          currentHead = slot
          break
      indexesToremove = []
      while currentHead
        newSlots.push currentHead
        indexesToremove.push(clonedSlots.indexOf(currentHead))
        currentHead = currentHead.nextSlot()
        if iter==0
          newSlots[newSlots.length - 1].prevSlot(null)
          newSlots[newSlots.length - 1].nextSlot(null)
        else
          newSlots[newSlots.length - 1].prevSlot(newSlots[newSlots.length - 2])
          newSlots[newSlots.length - 2].nextSlot(newSlots[newSlots.length - 1])
        iter=iter+1
      clonedSlots = @removeMultipleItems(clonedSlots, indexesToremove)
    @slots(newSlots)

  setMapping: (data, slot) =>
    if @inputBeingEdited().class == data.class
      @inputBeingEdited().values.id = data.parent_slot
      @inputBeingEdited().values.name = data.name
      data.configured(true)
      data.values.id = @slotBeingEdited().slotId()
      data.values.name = @slotBeingEdited().name
      @inputBeingEdited().outputBinding(data.name)
      @inputBeingEdited().configured(true)
      slot.nextSlot(@slotBeingEdited())
      @slotBeingEdited().prevSlot(slot)
      @sortSlots()
      config = false
      ko.utils.arrayForEach(@slotBeingEdited().inputs(), (input) =>
        if input.optional == false
          config = input.configured()
      )
      @slotBeingEdited().configured(config)
      @configureEligibleSlots()
      $('#mapper-modal').removeClass('in')
        .attr('aria-hidden', true)
    else
      @errorMessage("Input Output Type do not match")
      $('.workflows-alert-danger').fadeIn().delay(1000).fadeOut();


  unsetMapping: (data) =>
    slotWithOutput = ko.utils.arrayFilter(@slots(), (slot) ->
      slot.slotId() == data.values.id
    )
    ko.utils.arrayMap(slotWithOutput[0].outputs(), (output)->
      if output.parent_slot == data.values.id
        output.values.id = null
        output.values.name = null
        output.configured(false)
    )

    data.values.id = null
    data.values.name = null
    data.outputBinding('Select')
    data.setInputText(data)
    data.configured(false)
    config = true
    for input in @slotBeingEdited().inputs()
      if (input.values.id?)
        config = false
        break
    if config
      @slotBeingEdited().prevSlot(null)
      slotWithOutput[0].nextSlot(null)
    @slotBeingEdited().configured(false)
    @configureEligibleSlots()

  saveWorkflow: () =>
    @saving(true)
    @updatingWorkflow(true)
    workflow_inputs = []
    for slot in @slots()
      slot_details = {
        dxid: slot.id,
        name: slot.name,
        instanceType: slot.instanceType(),
        inputs: slot.inputs(),
        outputs: slot.outputs(),
        slotId: slot.slotId(),
        prevSlot: slot.prevSlot()?.slotId(),
        nextSlot: slot.nextSlot()?.slotId()
      }
      workflow_inputs.push(slot_details)
    params = {slots: workflow_inputs, workflow_name: @name(), readme: @readme.peek() ? "", workflow_title: @title(), workflow_id: @workflow?.dxid, is_new: @isNewWorkflow}
    Precision.api('/api/create_workflow', params)
      .done((res)=>
        window.location.replace("/workflows/#{res.id}")
    )
      .fail((error)=>
        @saving(false)
        errorObject = JSON.parse error.responseText
        @errorMessage(errorObject.error.message)
    )
  publicApps:() =>
    availapps = []
    for app in @public_apps()
      availapps.push(new appModel(app))
    availapps

  allApps: () =>
    availapps = []
    for app in @all_apps()
      availapps.push(new appModel(app))
    availapps

  addStages: (data) =>
    uid = data.selectedAppDxid()
    if uid
      Precision.api('/api/describe', {uid: uid})
        .done((app) =>
          inputs = app.spec.input_spec.map((input) => $.extend({}, input, {values: {id: null, name: null}}))
          outputs = app.spec.output_spec.map((output) => $.extend({}, output, {values: {id: null, name: null}}))
          spec =
            name: app.name
            dxid: app.dxid
            instanceType: app.spec.instance_type
            revision: app.revision
            inputs: inputs
            outputs: outputs
          new_slot = new slotModel(spec, this)
          @slots.push(new_slot)
          if spec.outputs.length > 0
            @eligibleSlots.push(new_slot)
        )
        .fail((error) =>
          errorObject = JSON.parse error.responseText
          @errorMessage(errorObject.error.message)
          console.error(error)
      )
    else
      alert("Please wait a few seconds for this app to load.")

  configureSlot: (slot) =>
    @slotBeingEdited(slot)
    @configureEligibleSlots()
  eligibleSlotsBasedOnInput: () =>
    new_slots= []
    for slot in @eligibleSlots()
      for output in slot.outputs()
        if output.class == @inputBeingEdited().class
          new_slots.push(slot)
          break
    @eligibleSlots(new_slots)

  configureEligibleSlots: () =>
    @eligibleSlots(@slots())
    removeIndexes = []
    prev_slot_inputs_configured = false
    if @slotBeingEdited().prevSlot()
      for input in @slotBeingEdited().inputs()
        if input.configured() == false
          prev_slot_inputs_configured = true
      if prev_slot_inputs_configured
        @eligibleSlots([@slotBeingEdited().prevSlot()])
      else
        @eligibleSlots([])
    else
      removeIndexes.push @eligibleSlots().indexOf(@slotBeingEdited())
      currentHead = @slotBeingEdited()
      while currentHead.nextSlot()
        currentHead = currentHead.nextSlot()
      removeIndexes.push(@eligibleSlots().indexOf(currentHead))

      for slot in @eligibleSlots()
        currentHead = slot
        while currentHead
          if currentHead.nextSlot()
            removeIndexes.push(@eligibleSlots().indexOf(currentHead))
          currentHead = currentHead.nextSlot()

      @eligibleSlots(@removeMultipleItems(@eligibleSlots(), removeIndexes))
      @eligibleSlots()

  removeSlot: (slot) =>
    prevSlot = slot.prevSlot()
    nextSlot = slot.nextSlot()
    if prevSlot?
      for output in prevSlot.outputs()
        if output.values.id?
          output.values.id = null
          output.values.name = null
          output.configured(false)
      prevSlot.nextSlot(null)
    if nextSlot?
      for input in nextSlot.inputs()
        if input.values.id?
          input.values.id = null
          input.values.name = null
          input.configured(false)
          input.outputBinding('Select')
      nextSlot.prevSlot(null)
      nextSlot.configured(false)
    @slots.remove slot

class StageModel
  constructor: (spec, @viewModel) ->
    @id = spec.dxid
    @name = spec.name
    @stageInputs = ko.observable()
    @stageOutputs = ko.observable()

class IOModel
  constructor: (io, parent_slot, name, configured, viewModel) ->
    @name = io.name
    @class = io.class
    @parent_slot = parent_slot
    @viewModel = ko.observable(viewModel)
    @stageName = name
    @values = io.values
    @value = io.value
    @configured = ko.observable(configured)
    @outputBinding = ko.observable(@values.name)
    @isSelected = ko.observable(io.requiredRunInput)
    @optional = io.optional
    @requiredRunInput = false
    @label = io.label
    @defaultValues = (if io.default != undefined then io.default else io.defaultValues)
  workflowRequired: (data, e) ->
    e.cancelBubble = true
    if (e.stopPropagation)
      e.stopPropagation()
    data.configured(!data.configured())
    data.requiredRunInput = true
    config = true
    ko.utils.arrayForEach(@viewModel().slotBeingEdited().inputs(), (input) ->
      if input.optional == false && config == true
        config = input.configured()
    )
    @viewModel().slotBeingEdited().configured(config)
    return true

  setInputText: (data) ->
    if data.configured() == true
      'Reset'
    else
      'Set'

class slotModel
  constructor: (spec, viewModel, stage = null, configured = false) ->
    @id = spec.dxid
    @slotId = ko.computed( () ->
      if stage?
        stage["slotId"]
      else
        _slotId = Math.round((Math.pow(36, 14 + 1) - Math.random() * Math.pow(36, 14)))
        'stage-' + _slotId.toString(36).slice(1)
    )
    @name = spec.name
    @revision = spec.revision
    @instanceTypes = Precision.INSTANCES
    @instanceType = ko.observable(stage?.instanceType || spec?.instanceType)
    @inputs = ko.observableArray()
    @addInputs = ko.computed(=>
      configured = true
      if stage?
        ko.utils.arrayForEach(stage["inputs"], (input) =>
          if !input.optional
            configured = false
          @inputs.push(new IOModel(input, @slotId(), @name, true, viewModel))
        )
      else
        ko.utils.arrayForEach(spec.inputs, (input) =>
          if !input.optional
            configured = false
          @inputs.push(new IOModel(input, @slotId(), @name, false, viewModel))
        )
    )
    @outputs = ko.observableArray()
    @addOutputs = ko.computed(=>
      if stage?
        ko.utils.arrayForEach(stage["outputs"], (output) =>
          @outputs.push(new IOModel(output, @slotId(), @name, output.values.id?, viewModel))
        )
      else
        ko.utils.arrayForEach(spec.outputs, (output) =>
          @outputs.push(new IOModel(output, @slotId(), @name, false, viewModel))
        )
    )
    @configured = ko.observable(configured)
    @nextSlot = ko.observable()
    @prevSlot = ko.observable()

class appModel
  constructor: (app) ->
    @app = app
    @inputsForApp = ko.observableArray()
    @outputsForApp = ko.observableArray()
    @revisions = ko.observableArray()
    @appIdToDxid = {}
    @setRevisions = ko.computed(=>
      Precision.api('/api/list_app_revisions', {id: @app.id})
        .done((revisions) =>
          for revision in revisions
            @appIdToDxid[revision.id] = revision.dxid
            @revisions.push(revision)
      )
    )
    @selectedApp = ko.observable()
    @setInputOutput = ko.computed(=>
      if @selectedApp()
        Precision.api('/api/get_app_spec', {id: @selectedAppDxid()})
          .done((app) =>
            @inputsForApp(app.spec.input_spec)
            @outputsForApp(app.spec.output_spec)
        )
      )

  selectedAppDxid: () => @appIdToDxid[@selectedApp()]

window.Precision ||= {}
window.Precision.models ||= {}
window.Precision.models.WorkflowEditorModel = WorkflowEditorModel
