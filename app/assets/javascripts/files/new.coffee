class FileModel
  constructor: (file) ->
    @id = ko.observable()
    @file = file
    @state = ko.observable()
    @sizeFormatted = humanFormat(file.size, {unit: 'B'})

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
        "#{@dataUploaded()/file.size * 100}%"
    )

class FilesNewView
  constructor: () ->
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
      metadata = {}

      do (fileModel) =>
        fileModel.state("UPLOADING")
        @uploadFile(fileModel, metadata, () -> doneFn(fileModel))

  uploadFile: (fileModel, metadata, cb) ->
    MAX_FILE_SIZE = 5497558138880
    DEFAULT_CHUNK_SIZE = 104857600
    NUM_CHUNKS_CUTOFF = 10000

    #TODO: Ensure this works for files of size 0
    size = fileModel.file.size
    if size > MAX_FILE_SIZE
      alert 'File size is greater than 5TB! Skipping that file...'
      return cb()
    chunk_size = DEFAULT_CHUNK_SIZE
    num_chunks = Math.ceil(size * 1.0 / chunk_size)
    if num_chunks > NUM_CHUNKS_CUTOFF
      chunk_size = Math.ceil(size * 1.0 / NUM_CHUNKS_CUTOFF)
      num_chunks = Math.ceil(size * 1.0 / chunk_size)

    params = _.assign(metadata, {'name': fileModel.file.name})
    Precision.api '/api/create_file', params, (res) =>
      id = res.id
      fileModel.id(id)

      uploadChunks = (index, offset) =>
        this_chunk_size = chunk_size
        if offset + this_chunk_size > size
          this_chunk_size = size - offset
        @calculateMD5 fileModel.file, offset, this_chunk_size, (md5) ->
          Precision.api '/api/get_upload_url', {
            'id': id
            'index': index
            'size': this_chunk_size
            'md5': md5
          }, (res) ->
            $.ajax res.url,
              'contentType': 'application/octet-stream'
              'data': fileModel.file.slice(offset, offset + this_chunk_size)
              'error': (xhr, status, err) ->
                alert 'ERROR! XHR status = ' + status + ', error = ' + err
                return
              'headers': res.headers
              'method': 'PUT'
              'processData': false
              'success': (data, status, xhr) ->
                offset += this_chunk_size
                fileModel.dataUploaded(offset)
                if offset == size
                  closeFile()
                else
                  uploadChunks index + 1, offset


      closeFile = ->
        Precision.api '/api/close_file', { 'id': id }, (res) ->
          cb()

      uploadChunks 1, 0

  #Spark MD5
  calculateMD5: (file, offset, len, cb) ->
    blobSlice = File::slice or File::mozSlice or File::webkitSlice
    chunkSize = 2097152
    chunks = Math.ceil(len / chunkSize)
    currentChunk = 0
    spark = new (SparkMD5.ArrayBuffer)
    fileReader = new FileReader

    loadNext = ->
      start = offset + currentChunk * chunkSize
      end = if (currentChunk + 1) * chunkSize >= len then offset + len else start + chunkSize
      fileReader.readAsArrayBuffer blobSlice.call(file, start, end)

    fileReader.onload = (e) ->
      spark.append e.target.result
      currentChunk++
      if currentChunk < chunks
        loadNext()
      else
        cb spark.end()

    fileReader.onerror = ->
      alert 'Error reading file'

    loadNext()

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

FilesController = Paloma.controller('Files')
FilesController::new = ->
  $container = $("body main")
  viewModel = new FilesNewView()
  ko.applyBindings(viewModel, $container[0])

  $container
    .on("change.files.new", ".event-browse-files", (e) -> viewModel.handleInputChange(e))
    .on("submit.files.new", ".form-upload-files", (e) -> viewModel.handleUpload(e))
    .on("click.files.new", ".event-upload-files", (e) -> viewModel.handleUpload(e))
    .on("click.files.new", ".event-clear-files", (e) -> viewModel.handleClear(e))
