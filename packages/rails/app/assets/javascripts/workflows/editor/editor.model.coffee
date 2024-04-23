CREATE_MODE = 'new'
EDIT_MODE = 'edit'
FORK_MODE = 'fork'

class WorkflowEditorModel
  ### RESTORE APPS ON PAGE LOAD WHEN EDIT ###
  remapIOS: () ->
    stages = @stages()
    mappedInputs = []
    outputs = []
    for stage in stages
      for slot in stage.slots()
        for input in slot.inputs()
          if input.value().appID and input.value().name
            mappedInputs.push(input)
        for output in slot.outputs()
          outputs.push(output)

    for input in mappedInputs
      for output in outputs
        if input.value().appID == output.appData.slotId and input.value().name == output.name
          input.mapIO(output)
          break

  recreateApp: (app, loadedApp) ->
    data = Object.assign(loadedApp, app)
    index = data.stageIndex
    stage = @stages()[index]
    if stage
      stage.addSlot(data)
    else
      @stages.push(new Precision.wfEditor.StageModel(data, index))

  recreateWorkflow: () ->
    apps = @workflow.spec.input_spec.stages
    if !apps
      console.log 'recreateWorkflow no apps!'
      return false
    @wfIsLoading(true) if apps and apps.length
    requests = []
    for app in apps
      request = @loadAppData(app.app_uid)
      requests.push(request)
    Promise.all(requests).then(
      (loadedApps) =>
        loadedApps.forEach((loadedApp, i) => @recreateApp(apps[i], loadedApp))
      (error) =>
        console.log 'error recreateApp', error
        Precision.alert.showAboveAll('Something Went Wrong!')
        @wfIsLoading(false)
    ).then(
      () =>
        @remapIOS()
        @wfIsLoading(false)
      (error) =>
        console.log 'error remapIOS', error
        Precision.alert.showAboveAll('Something Went Wrong!')
        @wfIsLoading(false)
    )
  ### RESTORE APPS ON PAGE LOAD WHEN EDIT ###

  wfNameOnInput: (root, e) ->
    name = e.target.value
    name = name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9\-\_]+/g, "")
    @wfName(name)

  configureSlot: (slot, e) =>
    e.preventDefault()
    @slotIOModal.showModal(slot)

  mapIO: (output) =>
    @mapSlotIOModal.mapIO(output)

  mapSlotIOModalResetInput: (input, e) ->
    input.reset()

  showMapSlotIOModal: (input, e) =>
    nextStage = @stages()[input.stageIndex() - 1]
    if nextStage
      @mapSlotIOModal.showModal(input, nextStage)
    else
      Precision.alert.showAboveAll('No configurable Apps Available', 'alert-info')

  showSetIOValueModal: (input, e) =>
    @setIOValueModal.showModal(input)

  saveWorkflow: () ->
    return false if @wfIsSaving()
    @wfIsSaving(true)
    @disableScreenModal.modal('show')

    slots = []
    for stage in @stages()
      for slot in stage.slots()
        _slot = slot.prepareDataForSaving()

        prevStage = @stages()[stage.index() - 1]
        if prevStage
          _slot.prevSlot = prevStage.slots()[0].slotId

        nextStage = @stages()[stage.index() + 1]
        if nextStage
          _slot.nextSlot = nextStage.slots()[0].slotId

        slots.push(_slot)

    params = {
      slots: slots,
      workflow_name: @wfName(),
      readme: @readme() || '',
      workflow_title: @wfTitle(),
      workflow_id: @workflow?.uid,
      is_new: @isNewWorkflow
    }

    Precision.api('/api/workflows', params)
      .done((res) ->
        window.location.replace("/home/workflows/#{res.id}")
      )
      .fail((error) =>
        @wfIsSaving(false)
        @disableScreenModal.modal('hide')
        errorObject = JSON.parse error.responseText
        @errorMessage(errorObject.error.message)
        Precision.alert.showAboveAll(@errorMessage())
      )

  showAddStagesModal: (stage) =>
    @editingStage(stage)
    @addStagesModal.modal('show')

  loadAppData: (uid) ->
    return new Promise((resolve, reject) =>
      Precision.api('/api/describe', { uid: uid })
        .then(
          (app) ->
            resolve(app)
          (error) =>
            console.error(error)
            errorObject = JSON.parse error.responseText
            @errorMessage(errorObject.error.message)
            reject(error)
      )
    )

  addStages: (data) =>
    uid = data.selectedAppDxid()
    if uid
      @loadAppData(uid).then(
        (app) =>
          if @editingStage()
            @editingStage().addSlot(app)
          else
            index = @stages().length
            @stages.push(new Precision.wfEditor.StageModel(app, index))
      )
    else
      Precision.alert.showAboveAll('Please wait a few seconds for this app to load', 'alert-info')

  openSelectorModal: (input) =>
    @selectorModel.openModal(input)

  getAppsOnScroll: (scope) =>
    @loadingAllApps(true)

  getApps: (params) ->
    return new Promise((resolve, reject) ->
      $.get('/api/apps/accessible_apps', params).then(
        (data) ->
          resolve(data)
        (error) ->
          reject(error)
      )
    )

  getPrivateApps: () =>
    return false if @loadingAllApps()
    @loadingAllApps(true)
    query = @appsFilterQuery()
    @getApps({ page: @privateAppsPage, scope: 'private', query: query }).then(
      (apps) =>
        @loadingAllApps(false)
        apps = apps || []
        newPrivateApps = @privateAppsOriginal().concat(apps)
        @privateAppsOriginal(newPrivateApps)
        @privateAppsPage++ if apps.length
      (error) =>
        @loadingAllApps(false)
        Precision.alert.showAboveAll("Error while loading private apps.")
    )

  getPublicApps: () =>
    return false if @loadingAllApps()
    @loadingAllApps(true)
    query = @appsFilterQuery()
    @getApps({ page: @publicAppsPage, scope: 'public', query: query }).then(
      (apps) =>
        @loadingAllApps(false)
        apps = apps || []
        newPublicApps = @publicAppsOriginal().concat(apps)
        @publicAppsOriginal(newPublicApps)
        @publicAppsPage++ if apps.length
      (error) =>
        @loadingAllApps(false)
        Precision.alert.showAboveAll("Error while loading public apps.")
    )

  getAllApps: () =>
    return false if @loadingAllApps()
    @loadingAllApps(true)
    query = @appsFilterQuery()
    getPrivateApps = @getApps({ page: @privateAppsPage, scope: 'private', query: query })
    getPublicApps = @getApps({ page: @publicAppsPage, scope: 'public', query: query })
    requests = [getPrivateApps, getPublicApps]

    Promise.all(requests).then(
      (loadedApps) =>
        privateApps = loadedApps[0] || []
        newPrivateApps = @privateAppsOriginal().concat(privateApps || [])
        @privateAppsOriginal(newPrivateApps)
        @privateAppsPage++ if privateApps.length

        publicApps = loadedApps[1] || []
        newPublicApps = @publicAppsOriginal().concat(publicApps || [])
        @publicAppsOriginal(newPublicApps)
        @publicAppsPage++ if publicApps.length

        @loadingAllApps(false)
      (error) =>
        Precision.alert.showAboveAll('Error while loading all apps.')
        @loadingAllApps(false)
    )

  filterAllApps: () =>
    return false if @loadingAllApps()

    query = @appsFilterQuery()
    @privateAppsPage = 1
    @publicAppsPage = 1

    @loadingAllApps(true)
    getPrivateApps = @getApps({ page: @privateAppsPage, scope: 'private', query: query })
    getPublicApps = @getApps({ page: @publicAppsPage, scope: 'public', query: query })
    requests = [getPrivateApps, getPublicApps]

    Promise.all(requests).then(
      (loadedApps) =>
        privateApps = loadedApps[0] || []
        @privateAppsOriginal(privateApps)
        @privateAppsPage++ if privateApps.length

        publicApps = loadedApps[1] || []
        @publicAppsOriginal(publicApps)
        @publicAppsPage++ if publicApps.length

        @loadingAllApps(false)
      (error) =>
        Precision.alert.showAboveAll('Error while filtering apps.')
        @loadingAllApps(false)
    )

  constructor: (apps, @workflow, scope, instance_types, @mode = EDIT_MODE) ->
    editableModes = [EDIT_MODE, FORK_MODE]
    isNewModes = [CREATE_MODE, FORK_MODE]
    @instanceTypes = instance_types
    @readme = ko.observable(@workflow?.readme)
    @readmePreview = ko.computed(=>
      Precision.md.render(@readme())
    )
    @isNewWorkflow = isNewModes.indexOf(@mode) > -1

    @wfIsSaving = ko.observable(false)
    @wfIsLoading = ko.observable(false)
    @wfName = ko.observable(@workflow?.name)
    @wfTitle = ko.observable(@workflow?.title)

    @saveButtonText = ko.computed( =>
      isSaving = @wfIsSaving()
      switch @mode
        when CREATE_MODE
          if isSaving then "Creating..." else "Create"
        when FORK_MODE
          if isSaving then "Forking..." else "Fork"
        when EDIT_MODE
          if isSaving then "Saving..." else "Update"
    )
    @errorMessage = ko.observable()

    ### STAGES ###
    @stages = ko.observableArray([])
    @editingStage = ko.observable(null)
    @validStages = ko.computed( => @stages().filter((stage) -> stage.valid()))
    @invalidStages = ko.computed( => @stages().filter((stage) -> !stage.valid()))
    @allStagesValid = ko.computed( => !@invalidStages().length)
    @stagesText = ko.computed( =>
      if @allStagesValid() and @stages().length
        return 'All Stages Configured'
      else if !@stages().length
        return 'No Stages Added'
      else if @stages().length == 1
        return "1 Stage Is Not Configured"
      else
        return "#{@invalidStages().length} Stages Are Not Configured"
    )
    @stagesTextStyle = ko.computed( =>
      if @allStagesValid() then 'workflow-info' else 'workflow-warning'
    )
    @clearEmptyStages = ko.computed( =>
      emptyStages = @stages().filter((stage) -> stage.isEmpty())
      emptyStages.forEach((stage) => @stages.remove(stage))
      @stages().forEach((stage, i) -> stage.index(i))
    )
    ### STAGES ###

    ### ADD STAGES MODAL ###
    @loadingAllApps = ko.observable(false)
    @publicAppsPage = 1
    @privateAppsPage = 1
    @privateAppsOriginal = ko.observable([])
    @publicAppsOriginal = ko.observable([])
    @appsFilterQuery = ko.observable('')
    @privateApps = ko.computed( =>
      return @privateAppsOriginal().map((app) -> new Precision.wfEditor.AppModel(app))
    )
    @publicApps = ko.computed( =>
      return @publicAppsOriginal().map((app) -> new Precision.wfEditor.AppModel(app))
    )
    @allApps = ko.computed( =>
      return @privateApps().concat(@publicApps())
    )
    @getAllApps()

    @addStagesModal = $('#build-workflow-modal')
    @filterAppsByQuery = _.debounce(
      (root, e) =>
        @appsFilterQuery(e.target.value)
        @filterAllApps()
      400
    )

    @addStagesModal.on 'hidden.bs.modal', () =>
      @editingStage(null)
      @appsFilterQuery('')
      @filterAllApps()
    ### ADD STAGES MODAL ###

    @selectorModel = new Precision.wfEditor.SelectorModel(scope)

    @canCreateWorkflow = ko.computed( =>
      @stages().length and @allStagesValid() and !_.isEmpty(@wfTitle()) and !_.isEmpty(@wfName())
    )

    @slotIOModal = new Precision.wfEditor.ConfigureSlotIOModal()
    @mapSlotIOModal = new Precision.wfEditor.MapSlotIOModal()
    @setIOValueModal = new Precision.wfEditor.SetIOValueModal()

    @disableScreenModal = $('#disable-screen-modal')

    @recreateWorkflow() if @workflow and editableModes.indexOf(@mode) > -1


window.Precision ||= {}
window.Precision.wfEditor ||= {}
window.Precision.wfEditor.WorkflowEditorModel = WorkflowEditorModel
