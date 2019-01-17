CWL = 'CWL'
WDL = 'WDL'

class NewAppViewModel extends Precision.models.AppEditorModel
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

  getDockerPullData: (importText) ->
    dockerPull = importText.match(/dockerPull:(.*$)/gm)
    dockerPull = dockerPull[0].replace(/(dockerPull:)(.*$)/gm, '$2').trim() if dockerPull.length
    dockerPull = dockerPull.replace(/"/g, '') if dockerPull.length

    if typeof dockerPull != 'string' or !dockerPull.length
      Precision.alert.showAboveAll('Wrong docker image name format')
      return false

    dockerPull = dockerPull.split(':')
    imageName = dockerPull[0]
    version = dockerPull[1] || 'latest'

    imageName = imageName.split('/')
    if imageName.length < 2
      Precision.alert.showAboveAll('Wrong docker image name format')
      return false

    namespace = imageName.pop()
    repository = imageName.pop()
    registry = imageName.pop()

    return {
      version,
      namespace,
      repository,
      registry
    }

  getDockerImageData: (fileName) ->
    fileName = fileName.replace(/\.tar\.gz/g, '')
    fileName = fileName.split('_')
    if fileName.length < 2
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

  compareImageData: (pullData, imageData) ->
    return false if !pullData or !imageData
    if pullData.registry
      Precision.alert.showAboveAll('dockerPull has a public image!')
      @clearDockerImage()
      return false
    if pullData.namespace != imageData.namespace
      Precision.alert.showAboveAll('Wrong image namespace!')
      @clearDockerImage()
      return false
    if pullData.repository != imageData.repository
      Precision.alert.showAboveAll('Wrong image repository!')
      @clearDockerImage()
      return false
    if pullData.version != imageData.version
      @clearDockerImage()
      Precision.alert.showAboveAll('Wrong image version!')
      return false
    return true

  validateDockerImage: (file) ->
    return false if !file
    dockerPullData = @getDockerPullData(@wdlTextValue())
    dockerImageData = @getDockerImageData(file.name)
    return @compareImageData(dockerPullData, dockerImageData)

  dockerFileOnChangeHandler: (root, e) ->
    importText = @wdlTextValue()
    if typeof importText != 'string' or !importText.length
      Precision.alert.showAboveAll('You need to fill in textbox first!')
      @dockerImage(null)
      e.target.value = null
      return false

    file = e.target.files[0]
    return false if !@validateDockerImage(file)

    @dockerImage(file)

  clearDockerImage: () ->
    @dockerImage(null)
    @dockerImageInput.val(null)

  clearModalData: () ->
    @wdlTextValue('')
    @clearDockerImage(null)
    @wdlFileInput.val(null)

  importImageData: () ->
    @importModalLoading(true)
    formData = new FormData()
    formData.append('cwl', @wdlTextValue())
    formData.append('attached_image', @dockerImage()) if @dockerImage()
    $.ajax({
      url: '/api/apps/import',
      data: formData,
      cache: false,
      contentType: false,
      processData: false,
      type: 'POST',
      success: (data) =>
        @importModal.modal('hide')
        @importModalLoading(false)
        @clearModalData()

        @newAppUid(data.id)
        @newAssetUid(data.asset_uid) if data.asset_uid

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

  constructor: (data) ->
    super(data, 'new')
    @importModal = $('#import_cwl_wdl_modal')
    @importSuccessModal = $('#import_cwl_wdl_success_modal')
    @wdlFileInput = $('#wdl_file_input')
    @dockerImageInput = $('#docker_image_file_input')
    @importModalLoading = ko.observable(false)
    @importType = ko.observable()
    @wdlTextValue = ko.observable()
    @newAppUid = ko.observable()
    @newAssetUid = ko.observable()
    @newAppURL = ko.computed(=> "/apps/#{@newAppUid()}")
    @newAssetURL = ko.computed(=> "/app_assets/#{@newAssetUid()}")
    @dockerImage = ko.observable(null)
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
    @importImageDisabled = ko.computed(() => !@wdlTextValue() or !@wdlTextValue().length)
    @importModal.on 'hidden.bs.modal', () => @clearModalData()


#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

AppsController = Paloma.controller('Apps', {
  new: ->
    $container = $("body main")
    viewModel = new NewAppViewModel(@params.app)
    ko.applyBindings(viewModel, $container[0])
})
