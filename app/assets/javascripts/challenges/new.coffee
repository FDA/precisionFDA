#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

class FileModel
  constructor: (file) ->
    @id = ko.observable()
    @file = file
    @state = ko.observable()
    @sizeFormatted = humanFormat(file.size, { unit: 'B' })

    @path = ko.computed( => "/files/#{@id()}" if @id()? )

    @isUploading = ko.computed( => @state() == "UPLOADING" )
    @isDone = ko.computed( => @state() == "DONE" )
    @isProgressVisible = ko.computed( => @isUploading() )

    @classes = ko.computed( => "list-group-item-success" if @isDone() )

    @dataUploaded = ko.observable(0)
    @progressPercentFormatted = ko.computed( =>
      if file.size == 0
        if @dataUploaded() == file.size then "100%" else 0
      else
        "#{@dataUploaded() / file.size * 100}%"
    )

class ChallengesFormView
  constructor: (data) ->
    @files = ko.observableArray()

    @imageUrl = ko.observable(data.card_image_url)
    @fileId = ko.observable(data.card_image_id)

    @uploadState = ko.observable()
    @isUploadStateVisible = ko.computed( => !_.isEmpty(@uploadState()) )
    @uploadStateDisplay = ko.computed( =>
      switch @uploadState()
        when "UPLOADING"
          "Uploading..."
        when "DONE"
          "Upload(s) complete"
        else
          "#{@files().length} file(s) selected"
    )

    @isBrowseVisible = ko.computed( =>
      @files().length == 0
    )

    @isUploadVisible = ko.computed( =>
      @files().length > 0 && @uploadState() != "DONE"
    )

    @isClearVisible = ko.computed( =>
      @files().length > 0
    )

    @disableActions = ko.computed( =>
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
    doneFn = (fileModel, url) =>
      uploadCounter++
      @fileId(fileModel.id())
      @imageUrl(url)
      fileModel.state("DONE")
      @uploadState("DONE") if uploadCounter == filesLength

    for fileModel, i in files
      metadata = {}

      do (fileModel) =>
        fileModel.state("UPLOADING")
        Precision.uploader.uploadImage({
          fileModel: fileModel,
          metadata: metadata,
          url: '/api/create_challenge_card_image'
        }, () =>
          @getFileLink(fileModel, doneFn)
        )

  getFileLink: (fileModel, doneFn) ->
    Precision.api '/api/get_file_link', { 'id': fileModel.id() }, (fileLinkData) =>
      if fileLinkData.error
        if fileLinkData.errorType == "FileNotClosed"
          setTimeout(=>
            @getFileLink(fileModel, doneFn)
          , 500)
        else
          alert(fileLinkData.error)
      else
        doneFn(fileModel, fileLinkData.url)

init_file_form_view = (data) ->
  $container = $("body main")
  viewModel = new ChallengesFormView(data)
  ko.applyBindings(viewModel, $container[0])

  $container
    .on("change.files.new", ".event-browse-files", (e) -> viewModel.handleInputChange(e))
    .on("submit.files.new", ".form-upload-files", (e) -> viewModel.handleUpload(e))
    .on("click.files.new", ".event-upload-image", (e) -> viewModel.handleUpload(e))
    .on("click.files.new", ".event-clear-files", (e) -> viewModel.handleClear(e))

init_datetimepickers = () ->
  inputs = $('.add-datetimepicker')
  for input in inputs
    new Precision.Datepicker(input, {
      noDefaultValue: true,
      icon: true
    })

MainController = Paloma.controller('Challenges', {
  create: ->
    init_datetimepickers()
    init_file_form_view(@params)
  update: ->
    init_datetimepickers()
    init_file_form_view(@params)
  new: ->
    init_datetimepickers()
    init_file_form_view(@params)
  edit: ->
    init_datetimepickers()
    init_file_form_view(@params)
})
