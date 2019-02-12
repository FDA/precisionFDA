ERROR_MSG = 'Please fill in all required fields properly.'
showAlert = (msg, color = 'alert-danger') -> Precision.alert.showAboveAll(msg, color, 3000)
showStandartAlert = () -> showAlert(ERROR_MSG)

class SelectorModel
  openModal: (input) =>
    @editingInput(input)
    @objectSelector.open()
  getListedFiles: () ->
    params = {
      states: ["closed"],
      scopes: @accessibleScope,
      describe: {
        include: {
          user: true
          all_tags_list: false
        }
      }
    }
    $.post('/api/list_files', params).then (objects) => @listedFiles(objects)

  constructor: (scope) ->
    @editingInput = ko.observable(null)
    @listedFiles = ko.observableArray([])
    @accessibleScope = scope
    @objectSelector = new Precision.models.SelectorModel({
      title: 'Select default file for field',
      selectionType: 'radio',
      selectableClasses: ['file'],
      studies: [],
      listRelatedParams: {
        classes: ['file']
      },
      listModelConfigs: [
        {
          className: 'file'
          name: 'Files'
          apiEndpoint: 'list_files'
          listedFiles: @listedFiles()

        }
      ],
      onSave: (selected) =>
        if @editingInput()
          @editingInput().value(selected.uid)
          @editingInput(null)
        deferred = $.Deferred()
        deferred.resolve(selected)
    })
    @getListedFiles()


### Input Model ###

extendFileInput = () ->
  @clearFileValue = () => @value(null)
  @fileTitle = ko.observable('')
  @getFileTitle = ko.computed( =>
    @valid(true)
    if typeof @value() == 'string'
      $.post('/api/describe', { uid: @value() }).then (fileInfo) =>
        @fileTitle(fileInfo.title)
    else
      @fileTitle('')
  )

extendBooleanInput = () ->
  @setBoolValueTrue = (value) => @value(true)
  @setBoolValueFalse = (value) => @value(false)

class InputModel
  isEmpty: () ->
    nullVals = [undefined, null]
    return true if nullVals.indexOf(@value()) > -1
    return true if typeof @value() == 'string' and !@value().trim().length
    return false

  validate: () ->
    if @batchOne() or @batchTwo()
      @valid(true)
      return true
    if @required and @isEmpty()
      @valid(false)
      return false
    if !@isEmpty() and @type == 'int' and isNaN(parseInt(@value()))
      @valid(false)
      return false
    if !@isEmpty() and @type == 'float' and isNaN(parseFloat(@value()))
      @valid(false)
      return false
    @valid(true)
    return true

  onChange: () ->
    @valid(true)

  constructor: (input) ->
    @id = "#{input.stageName}_#{input.name}"
    @type = input.class
    @name = input.name
    @label = input.label || input.name
    @help = input.help
    @required = !input.optional
    @stageName = input.stageName
    @value = ko.observable(input.defaultValues)
    @defaultValue = input.defaultValues
    @batchOne = ko.observable(false)
    @batchTwo = ko.observable(false)
    @disabled = ko.observable(false)
    @disabledBatchTwo = ko.observable(false)
    @_disabledBatchTwo = ko.computed( => @disabled() || @disabledBatchTwo())
    @valid = ko.observable(true)
    @showBatchInput = input.allow_batch
    @template = do () =>
      switch @type
        when 'file' then return 'file'
        when 'boolean' then return 'boolean'
        else return 'default'
    extendBooleanInput.call(@) if @type == 'boolean'
    extendFileInput.call(@) if @type == 'file'

### Input Model ###

### Batch Input Model ###
extendBatchInput = (files) ->
  @files = ko.observableArray(files)
  @selectedFiles = ko.observableArray([])
  @setValue = ko.computed( =>
    @value(@selectedFiles())
  )
  @searchValue = ko.observable(null)
  @filteredFiles = ko.computed( =>
    if @searchValue()
      return @files().filter (file) =>
        file.title.toLowerCase().indexOf(@searchValue().toLowerCase()) > -1
    else
      return @files()
  )
  @searchOnChange = (root, e) => @searchValue(e.target.value)
  @clearSearch = (root, e) => @searchValue(null)

class BatchInputModel
  onChange: () ->
    @valid(true)

  rowsCount: () =>
    value = @value()
    if value and typeof value == 'string'
      return @value().split(/\r*\n/).length
    else
      return 0
  constructor: (type, title, files) ->
    @type = ko.observable(type)
    @value = ko.observable(null)
    @valid = ko.observable(true)
    @title = ko.observable(title)
    @name = "step2_select_batch_file_#{title.replace(/\s/g, '_')}"
    extendBatchInput.call(@, files) if type == 'file'
### Batch Input Model ###

### FolderModel ###
class FolderModel
  constructor: (folder) ->
    @id = folder.id
    @name = folder.name
    @selected = ko.observable(false)
### FolderModel ###


class BatchWorkflowPageModel
  runBatchWorkflow: () ->
    inputs = @inputs().filter((input) ->
      return !input.batchOne() and !input.batchTwo() and input.valid()
    ).map((input) ->
      return {
        class: input.type,
        input_name: input.name,
        input_value: input.value()
      }
    )

    batch_input_one = {
      class: @batchInputOne().type()
      value: @batchInputOne().value()
    }

    batch_input_two = null
    if @batchInputTwo()
      batch_input_two = {
        class: @batchInputTwo()?.type()
        value: @batchInputTwo()?.value()
      }

    data = {
      folder_id: @selectedFolderId()
      workflow_id: @workflow.id
      inputs: inputs,
      batch_input_one: batch_input_one,
      batch_input_two: batch_input_two
    }
    @wizardLoading(true)
    $.ajax({
      url: "/workflows/#{@workflow.uid}/run_batch",
      method: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      success: (data) ->
        showAlert('Workflow run success! Redirecting to results page...', 'alert-success')
        window.location = data.url
      error: (data) =>
        @wizardLoading(false)
        showAlert(data.responseJSON.error.message)
    })

  nextToStep2: () ->
    return false if !@validateStep1()
    files = @selectorModel.listedFiles()
    @batchInputOne(null)
    if @batchInputOneType()
      @batchInputOne new BatchInputModel(@batchInputOneType(), 'INPUT 1', files)
    @batchInputTwo(null)
    if @batchInputTwoType()
      @batchInputTwo new BatchInputModel(@batchInputTwoType(), 'INPUT 2', files)
    @step(2)

  nextToStep3: () ->
    one = @batchInputOne()
    two = @batchInputTwo()
    one.valid(true) if one
    two.valid(true) if two
    if !one.value() or !one.value().length
      showAlert('Select at least one file') if one.type() == 'file'
      showStandartAlert() if one.type() == 'string'
      one.valid(false)
      return false
    if two and (!two.value() or !two.value().length)
      showStandartAlert()
      two.valid(false)
      return false
    if one.type() == 'string' and one.value() and two and two.value()
      if one.rowsCount() != two.rowsCount()
        showAlert('Different rows number for the first and second input')
        one.valid(false)
        two.valid(false)
        return false
    if one.type() == 'file'
      if two and !two.value().length
        showAlert('Select at least one file')
        two.valid(false)
        return false
      if two and one.value().length != two.value().length
        showAlert('Different number of files for the first and second input')
        one.valid(false)
        two.valid(false)
        return false
    @step(3)

  backToStep1: () -> @step(1)
  backToStep2: () -> @step(2)

  validateFile: (file) ->
    toBig = file.size > 1024 * 1024 * 2
    if toBig
      showAlert('Max file size is 2MB')
      return false
    ext = file.name.split('.').reverse()[0]
    allowedExt = ['txt', 'tsv']
    if allowedExt.indexOf(ext) < 0
      showAlert('Wrong file type')
      return false
    return true

  step2LoadFileInputOnChange: (root, e) =>
    if e.target.files.length
      @wizardLoading(true)
      file = e.target.files[0]
      if !@validateFile(file)
        @wizardLoading(false)
        e.target.value = null
        return false
      formData = new FormData()
      formData.append('file_field', file)
      $.ajax({
        url: '/workflows/convert_file_with_strings',
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        type: 'POST',
        success: (data) =>
          @wizardLoading(false)
          if data.content and data.content.length
            @batchInputOne().value(data.content[0])
          if @batchInputTwo() and data.content and data.content.length > 1
            @batchInputTwo().value(data.content[1])
          e.target.value = null
        error: (data) =>
          @wizardLoading(false)
          e.target.value = null
          showAlert('Error while uploading file.')
    })

  selectBatchOne: (input) =>
    @inputs().forEach( (_input) ->
      if _input.type != input.type
        _input.disabledBatchTwo(true)
      else
        _input.disabledBatchTwo(false)
      _input.disabled(false)
      _input.batchOne(false)
      _input.batchTwo(false)
    )
    input.disabled(true)
    input.batchOne(true)
    @batchInputOneType(input.type)
    @batchInputTwoType(null)
    @batchInputTwoSelected('none')

  selectBatchTwo: (input) =>
    @inputs().forEach( (_input) =>
      if _input.batchOne()
        _input.disabled(true)
      else
        _input.disabled(false)
      _input.batchTwo(false)
      @batchInputTwoType(null)
    )
    if input
      input.disabled(true)
      input.batchTwo(true)
      @batchInputTwoType(input.type)

  openSelectorModal: (input) => @selectorModel.openModal(input)

  validateStep1: () ->
    valid = true
    @inputs().forEach((input) ->
      input.validate()
      valid = false if !input.valid()
    )
    if !valid
      showStandartAlert()
    return valid

  showSelectFolderModal: () -> @selectFolderModal.modal('show')
  hideSelectFolderModal: () -> @selectFolderModal.modal('hide')

  onClickFolder: (folder, e) =>
    @folders().forEach((folder) -> folder.selected(false))
    folder.selected(true)
    @selectedFolder(folder.name)
    @selectedFolderId(folder.id)

  updateFolder: () ->
    return false if !@selectedFolder()
    @selectedPath(@selectedFolder())
    @hideSelectFolderModal()

  createFolder: () ->
    return false if !@createFolderName()
    @wizardLoading(true)
    @folderModalLoading(true)
    $.get("/workflows/#{@workflow.uid}/output_folder_create", {
      name: @createFolderName(),
      public: false,
      parent_folder_id: null
    }).then(
      (data) =>
        @wizardLoading(false)
        @folderModalLoading(false)
        @hideSelectFolderModal()
        @selectedPath(@createFolderName())
        @selectedFolderId(data.folders.id)
        @folders.push(data.folders)
        @selectedFolder(null)
        @createFolderName(null)
        showAlert('Output Folder Successfully Created', 'alert-success')
      (data) =>
        @wizardLoading(false)
        @folderModalLoading(false)
        showAlert('Error while creating folder')
    )

  searchFolderOnChange: (root, e) => @folderSearchValue(e.target.value)
  clearSearchFolder: () => @folderSearchValue(null)

  constructor: (workflow, inputs, outputs, folders, scope) ->
    @workflow = workflow
    @step = ko.observable(1)
    @wizardLoading = ko.observable(false)
    @accessibleScope = scope

    ### some defaults for other tabs. Copied from show.coffee ###
    @readmeDisplay = Precision.md.render(workflow.readme)
    @stages = workflow.spec.input_spec.stages
    @length = ko.computed( => @stages.length - 1)
    @firstStage = ko.computed( -> workflow.spec.input_spec.stages[0])
    @lastStage = ko.computed( => workflow.spec.input_spec.stages[@length()])
    @slots = workflow.spec
    @slotsWithoutFirstAndLast = ko.computed( =>
      ko.utils.arrayFilter(@stages, (stage) =>
        !(stage == @stages[0] || stage == @stages[@stages.length - 1])
      )
    )
    ### some defaults for other tabs. Copied from show.coffee ###
    @selectorModel = new SelectorModel(@accessibleScope)

    ### step 1 ###
    @inputs = ko.observableArray(inputs.map (input) -> new InputModel(input))
    ### because value can be the same for several radio ###
    @batchInputOneSelected = ko.observable(null)
    @batchInputTwoSelected = ko.observable('none')
    ### ###
    @batchInputOneType = ko.observable(null)
    @batchInputTwoType = ko.observable(null)
    @Step1toStep2Disabled = ko.computed( => !@batchInputOneType())
    ### step 1 ###


    ### step 2 ###
    @titleAmount = ko.computed( =>
      return 'Two' if @batchInputTwoType()
      return 'Single' if !@batchInputTwoType()
    )
    @titleType = ko.computed( =>
      switch @batchInputOneType()
        when 'file' then return 'File'
        when 'string' then return 'String'
        else return 'No Type'
    )
    @titleStep2 = ko.computed( =>
      input = 'Input'
      input = 'Inputs' if @batchInputTwoType()
      return "#{@titleAmount()} #{@titleType()} #{input}"
    )
    @batchInputOne = ko.observable(null)
    @batchInputTwo = ko.observable(null)
    @step2LoadFileInput = $('#step2_load_file_input')
    ### step 2 ###

    ### step 3 ###
    @selectFolderModal = $('#select_folder_modal')
    @enableFolderSelector = ko.observable do () ->
      fileOutputs = outputs.filter (output) -> output.class == 'file'
      return !!fileOutputs.length
    @defaultPathLabel = 'Select Folder or Create Folder'
    @selectedPath = ko.observable(null)
    @folderPathLabel = ko.computed( => @selectedPath() || @defaultPathLabel)
    @folderModalLoading = ko.observable(false)
    @folders = ko.observableArray(folders.map (folder) -> new FolderModel(folder))
    @selectedFolder = ko.observable(null)
    @selectedFolderId = ko.observable(null)
    @createFolderName = ko.observable(null)
    @folderSearchValue = ko.observable(null)
    @filteredFolders = ko.computed( =>
      if @folderSearchValue()
        return @folders().filter (folder) =>
          folder.name.toLowerCase().indexOf(@folderSearchValue().toLowerCase()) > -1
      else
        return @folders()
    )
    ### step 3 ###



#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

WorkflowsController = Paloma.controller('Workflows', {
  batch_workflow: ->
    $container = $('body main')
    viewModel = new BatchWorkflowPageModel(
      @params.workflow,
      @params.inputs,
      @params.outputs,
      @params.folders.folders,
      @params.scope
    )
    ko.applyBindings(viewModel, $container[0])

    window.viewModel = viewModel
})
