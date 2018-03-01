class FileModel
  constructor: (file) ->
    @id = ko.observable()
    @file = file
    @state = ko.observable()
    @sizeFormatted = humanFormat(file.size, { unit: 'B' })

    @path = ko.computed(=>
      "/files/#{@id()}" if @id()?
    )

    @isUploading = ko.computed(=>
      @state() == "UPLOADING"
    )
    @isDone = ko.computed(=>
      @state() == "DONE"
    )
    @isProgressVisible = ko.computed(=>
      @isUploading()
    )

    @classes = ko.computed(=>
      "list-group-item-success" if @isDone()
    )

    @dataUploaded = ko.observable(0)
    @progressPercentFormatted = ko.computed(=>
      if file.size == 0
        if @dataUploaded() == file.size then "100%" else 0
      else
        "#{@dataUploaded() / file.size * 100}%"
    )

class FilesNewView
  constructor: (data) ->
    
    @folder_id = data.folder_id
    @files = ko.observableArray()

    @uploadState = ko.observable()
    @isUploadStateVisible = ko.computed(=>
      !_.isEmpty(@uploadState())
    )
    @uploadStateDisplay = ko.computed(=>
      switch @uploadState()
        when "UPLOADING"
          "Uploading..."
        when "DONE"
          "Upload(s) complete"
        else
          "#{@files().length} file(s) selected"
    )

    @isBrowseVisible = ko.computed(=>
      @files().length == 0
    )

    @isUploadVisible = ko.computed(=>
      @files().length > 0 && @uploadState() != "DONE"
    )

    @isClearVisible = ko.computed(=>
      @files().length > 0
    )

    @disableActions = ko.computed(=>
      @uploadState() == "UPLOADING"
    )

  handleInputChange: (e) =>
    @files(new FileModel(file) for file in e.target.files)

  handleClear: (e) =>
    e.preventDefault()
    @files([])
    @uploadState(false)

  handleUpload: (e) =>
    e.preventDefault()
    @uploadFiles()

  uploadFiles: () ->
    @uploadState("UPLOADING")
    uploadCounter = 0
    files = @files.peek()
    filesLength = files.length
    doneFn = (fileModel) =>
      uploadCounter++
      fileModel.state("DONE")
      @uploadState("DONE") if uploadCounter == filesLength

    for fileModel, i in files
      metadata = {
        folder_id: @folder_id
      }

      do (fileModel) ->
        fileModel.state("UPLOADING")
        Precision.uploader.uploadFile(fileModel, metadata, () -> doneFn(fileModel))

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

FilesController = Paloma.controller('Files',
  new: ->
    $container = $("body main")
    viewModel = new FilesNewView(@params)
    ko.applyBindings(viewModel, $container[0])

    $container
      .on("change.files.new", ".event-browse-files", (e) -> viewModel.handleInputChange(e))
      .on("submit.files.new", ".form-upload-files", (e) -> viewModel.handleUpload(e))
      .on("click.files.new", ".event-upload-files", (e) -> viewModel.handleUpload(e))
      .on("click.files.new", ".event-clear-files", (e) -> viewModel.handleClear(e))
)
