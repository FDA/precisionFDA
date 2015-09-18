class FilesNewView
  constructor: () ->
    @files = []
    @metadata = {}

    $form = $(".form-upload-files")
    $btnBrowse = $(".btn-browse-files")
    $inputBrowse = $('.event-browse-files')
    $upload = $('.event-upload-files')
    $clear = $('.event-clear-files')

    $inputBrowse.change (e) =>
      @files = e.target.files
      @displayFiles()
      $btnBrowse.addClass("hide")
      $upload.removeClass("hide")
      $clear.removeClass("hide")

    $upload.click @handleUpload
    $form.submit @handleUpload

    $clear.click ->
      $inputBrowse.replaceWith($inputBrowse.val('').clone(true))
      $(".list-files").empty().addClass("hide")

      $upload.addClass("hide")
      $clear.addClass("hide")
      $btnBrowse.removeClass("hide")

  handleUpload: (e) =>
    e.preventDefault()
    $upload = $('.event-upload-files')
    $clear = $('.event-clear-files')
    $upload.addClass("hide")
    $clear.addClass("hide")
    $(".section-metadata .form-control").addClass("disabled").attr("disabled", true)
    $(".section-files .panel-heading .upload-state").removeClass("hide").html("Uploading...")

    biospecimen_id = $(".field-biospecimen").val()
    if !_.isEmpty(biospecimen_id)
      biospecimen_id = parseInt(biospecimen_id, 10)
      @metadata.biospecimen_id = biospecimen_id

    @uploadFiles()

  displayFiles: () ->
    return if @files.length == 0
    $filesList = $(".list-files")
    $filesList.removeClass("hide")

    for file, i in @files
      #TODO: Use some templating engine to render this instead
      $filesList.append("""
        <li class='list-group-item' data-name='#{file.name}' data-index='#{i}'>
          <h4 class='list-group-item-heading'>#{file.name} &middot; <small>#{file.type || 'File'}</small> &middot;  <small>#{humanFormat(file.size, {unit: 'B'})}</small></h4>
          <div class='list-group-item-text'>
            <input type='text' class='file-description form-control' placeholder='Add description...'>
          </div>
          <div class='progress hide'>
            <div class='progress-bar progress-bar-striped active' role='progressbar' aria-valuenow='100' aria-valuemin='0' aria-valuemax='100' style='width: 100%'>
            </div>
          </div>
        </li>
      """)

  uploadFiles: () ->
    uploadCounter = 0
    filesLength = @files.length
    doneFn = ($file) ->
      uploadCounter++
      $file.addClass("list-group-item-success").find(".progress").addClass("hide")

      if uploadCounter == filesLength
          $(".section-files .panel-heading .upload-state").html("#{uploadCounter} upload(s) complete")

    for file, i in @files
      $file = $("[data-index=#{i}]")
      $file.find(".progress").removeClass("hide")

      _metadata = _.clone(@metadata)
      $description = $file.find(".file-description")
      description = $description.val()
      if !_.isEmpty(description)
        _metadata.description = description
      else
        $description.hide()

      do ($file) =>
        @uploadFile(file, _metadata, () -> doneFn($file))

  uploadFile: (file, metadata, cb) ->
    MAX_FILE_SIZE = 5497558138880
    DEFAULT_CHUNK_SIZE = 104857600
    NUM_CHUNKS_CUTOFF = 10000

    #TODO: Ensure this works for files of size 0
    size = file.size
    if size > MAX_FILE_SIZE
      alert 'File size is greater than 5TB! Skipping that file...'
      return cb()
    chunk_size = DEFAULT_CHUNK_SIZE
    num_chunks = Math.ceil(size * 1.0 / chunk_size)
    if num_chunks > NUM_CHUNKS_CUTOFF
      chunk_size = Math.ceil(size * 1.0 / NUM_CHUNKS_CUTOFF)
      num_chunks = Math.ceil(size * 1.0 / chunk_size)

    params = _.assign(metadata, {'name': file.name})
    Precision.api '/api/create_file', params, (res) =>
      id = res.id

      uploadChunks = (index, offset) =>
        this_chunk_size = chunk_size
        if offset + this_chunk_size > size
          this_chunk_size = size - offset
        @calculateMD5 file, offset, this_chunk_size, (md5) ->
          Precision.api '/api/get_upload_url', {
            'id': id
            'index': index
            'size': this_chunk_size
            'md5': md5
          }, (res) ->
            $.ajax res.url,
              'contentType': 'application/octet-stream'
              'data': file.slice(offset, offset + this_chunk_size)
              'error': (xhr, status, err) ->
                alert 'ERROR! XHR status = ' + status + ', error = ' + err
                return
              'headers': res.headers
              'method': 'PUT'
              'processData': false
              'success': (data, status, xhr) ->
                offset += this_chunk_size
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
  new FilesNewView()
