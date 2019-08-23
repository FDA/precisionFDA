CWL = 'CWL'
WDL = 'WDL'

class NewWorkflowView extends Precision.wfEditor.WorkflowEditorModel
  openCwlImport: () -> @openImportModal(CWL)
  openWdlImport: () -> @openImportModal(WDL)

  openImportModal: (type) ->
    @importType(type)
    @importModal.modal('show')

  fileOnChangeHandler: (root, e) ->
    file = e.target.files[0]
    return if not file

    reader = new FileReader()
    reader.onload = (e) => @wdlTextValue(e.target.result)
    reader.readAsText(file)
    e.target.value = ''

  buildFormattedImages: (images) ->
    images.map (image) =>
      docker = image.replace(///(#{@dockerAttr()}:)(.*$)///gm, '$2').trim()
      docker = docker.replace(/"/g, '') if docker.length

      if typeof docker != 'string' or !docker.length
        Precision.alert.showAboveAll('Wrong docker image name format')
        return false

      docker = docker.split(':')
      imageName = docker[0]
      version = docker[1] || 'latest'

      imageName = imageName.split('/')
      if imageName.length < 2 || imageName.length > 3
        Precision.alert.showAboveAll('Wrong docker image name format')
        return false

      namespace = imageName.pop()
      repository = imageName.pop()
      registry = imageName.pop()

      {
        version,
        namespace,
        repository,
        registry
      }

  getDockerData: (importText) ->
    images = importText.match(///#{@dockerAttr()}:(.*$)///gm)

    if !images or !images.length
      Precision.alert.showAboveAll('Wrong docker image name format')
      return false

    images = @buildFormattedImages(images)

    if (not images.every (image) -> !!image)
      return false

    images

  getDockerImageData: (fileName) ->
    fileName = fileName.replace(/\.tar\.gz/g, '')
    fileName = fileName.split('_')
    if fileName.length < 2 || fileName.length > 3
      Precision.alert.showAboveAll('Wrong docker image name format')
      return false

    repository = fileName[0]
    namespace = fileName[1]
    version = fileName[2] || 'latest'

    return {
      repository,
      namespace,
      version
    }

  compareImageData: (dockerData, imageData) ->
    return false if !dockerData or !imageData

    filtered = dockerData.filter (image) ->
      !image.registry &&
      image.namespace == imageData.namespace &&
      image.repository == imageData.repository &&
      image.version == imageData.version

    if filtered.length == 0
      Precision.alert.showAboveAll(
        "The selected image file do not match image in #{@importType()}!"
      )
      return false

    return true

  validateDockerImage: (file) ->
    return false if !file
    dockerData = @getDockerData(@wdlTextValue())
    dockerImageData = @getDockerImageData(file.name)
    return @compareImageData(dockerData, dockerImageData)

  dockerFileOnChangeHandler: (root, e) ->
    importText = @wdlTextValue()
    if typeof importText != 'string' or !importText.length
      Precision.alert.showAboveAll('You need to fill in textbox first!')
      @dockerImage(null)
      return false

    file = e.target.files[0]
    if !@validateDockerImage(file)
      @clearDockerImage()
      return false

    @dockerImagesArray.push(file)
    e.target.value = null

  clearDockerImage: () ->
    @dockerImage(null)
    @dockerImageInput.val(null)

  removeDockerImage: (image) =>
    @dockerImagesArray.remove(image)

  clearModalData: () ->
    @wdlTextValue('')
    @clearDockerImage()
    @dockerImagesArray([])
    @wdlFileInput.val(null)

  importImageData: () ->
    return false if @dockerImage() || !@getDockerData(@wdlTextValue())
    for dockerImage in @dockerImagesArray()
      return false if !@validateDockerImage(dockerImage)

    @importModalLoading(true)

    formData = new FormData()
    formData.append('format', @importType().toLowerCase())
    formData.append('file', @wdlTextValue())
    for dockerImage in @dockerImagesArray()
      formData.append('attached_images[]', dockerImage)
    $.ajax({
      url: "/api/workflows",
      data: formData,
      cache: false,
      contentType: false,
      processData: false,
      type: 'POST',
      success: (data) =>
        @importModal.modal('hide')
        @importModalLoading(false)
        @clearModalData()

        @newWorkflowUid(data.id)
        @newAssetUids(data.asset_uids) if data.asset_uids

        @importSuccessModal.modal('show')
      error: (response) =>
        try
          data = JSON.parse(response.responseText)
          if data.errors and Array.isArray(data.errors) and data.errors.length > 0
            text = data.errors[0]
        catch
          text = 'Error while uploading file.'
        finally
          @importModalLoading(false)
          Precision.alert.showAboveAll(text)
    })

  wdlTextValueOnInput: (root, e) =>
    @wdlTextValue(e.target.value)

  constructor: (apps, scope) ->
    super(apps, null, scope, 'new')
    @importModal = $('#import_cwl_wdl_modal')
    @importSuccessModal = $('#import_cwl_wdl_success_modal')
    @wdlFileInput = $('#wdl_file_input')
    @dockerImageInput = $('#docker_image_file_input')
    @importModalLoading = ko.observable(false)
    @importType = ko.observable()
    @wdlTextValue = ko.observable()
    @newWorkflowUid = ko.observable()
    @newAssetUids = ko.observableArray()
    @newWorkflowURL = ko.computed(=> "/workflows/#{@newWorkflowUid()}")
    @dockerImage = ko.observable(null)
    @dockerImagesArray = ko.observableArray([])
    @modalTitle = ko.computed(() =>
      switch @importType()
        when CWL then return 'Import from *.cwl file'
        when WDL then return 'Import from *.wdl file'
        else return ''
    )
    @acceptFileType = ko.computed(() =>
      switch @importType()
        when CWL then return '.cwl'
        when WDL then return '.wdl'
        else return ''
    )
    @dockerAttr = ko.computed(() =>
      switch @importType()
        when CWL then return 'dockerPull'
        when WDL then return 'docker'
        else return ''
    )
    @importImageDisabled = ko.computed(() => !@wdlTextValue() or !@wdlTextValue().length)
    @importModal.on 'hidden.bs.modal', () => @clearModalData()


########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

WorkflowsController = Paloma.controller('Workflows', {
  new: ->
    $container = $("body main")
    viewModel = new NewWorkflowView(@params.apps, @params.scope)
    ko.applyBindings(viewModel, $container[0])
    Precision.wfEditor.addLoadAppsOnScroll(viewModel)
})
