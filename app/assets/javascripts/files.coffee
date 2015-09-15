$(document).on 'page:change', ->
  displayFiles = (files) ->
    return if files.length == 0
    $filesList = $(".list-files")
    $filesList.removeClass("hide")

    for file, i in files
      $filesList.append("""
        <li class='list-group-item' data-name='#{file.name}' data-index='#{i}'>
          <h4 class='list-group-item-heading'>#{file.name} &bull; <small>#{file.type}</small> &bull;  <small>#{humanFormat(file.size, {unit: 'B'})}</small></h4>
          <div class='list-group-item-text'>
            <input type='text' class='file-description form-control' placeholder='Add description...'>
          </div>
          <div class='progress hide'>
            <div class='progress-bar progress-bar-striped active' role='progressbar' aria-valuenow='100' aria-valuemin='0' aria-valuemax='100' style='width: 100%'>
            </div>
          </div>
        </li>
      """)

  uploadFiles = (files, metadata) ->
    uploadCounter = 0
    doneFn = ($file) ->
      uploadCounter++
      $file.find(".progress-bar").removeClass("active progress-bar-striped").addClass("progress-bar-success")

      if uploadCounter == files.length
          $(".section-files .panel-heading .upload-state").html("#{uploadCounter} upload(s) complete")

    for file, i in files
      $file = $("[data-index=#{i}]")
      $file.find(".progress").removeClass("hide")

      _metadata = _.assign({}, metadata)
      $description = $file.find(".file-description")
      description = $description.val()
      if !_.isEmpty(description)
        _metadata.description = description
      else
        $description.hide()

      do ($file) ->
        uploadFile(file, _metadata, () -> doneFn($file))

  # FIXME: Move this to a global util
  apiCall = (route, input, cb) ->
    $.ajax route,
      'contentType': 'application/json'
      'data': JSON.stringify(input)
      'dataType': 'json'
      'error': (xhr, status, err) ->
        alert "ERROR! XHR status = #{status}, error = #{err}"
      'jsonp': false
      'method': 'POST'
      'mimeType': 'application/json'
      'processData': false
      'success': (data, status, xhr) ->
        cb data

  uploadFile = (file, metadata, cb) ->
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
    apiCall '/api/create_file', params, (res) ->
      id = res.id

      uploadChunks = (index, offset) ->
        this_chunk_size = chunk_size
        if offset + this_chunk_size > size
          this_chunk_size = size - offset
        calculateMD5 file, offset, this_chunk_size, (md5) ->
          apiCall '/api/get_upload_url', {
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
        apiCall '/api/close_file', { 'id': id }, (res) ->
          cb()

      uploadChunks 1, 0

  #Spark MD5

  calculateMD5 = (file, offset, len, cb) ->
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

  # FIXME: Replace with page-specific pattern (Paloma gem or DIY)
  return if $('body.pfda-controller-files.pfda-action-new').length == 0

  $btnBrowse = $(".btn-browse-files")
  $inputBrowse = $('.event-browse-files')
  $upload = $('.event-upload-files')
  $clear = $('.event-clear-files')

  files = null
  $inputBrowse.change (e) ->
    files = e.target.files
    displayFiles(files)
    $btnBrowse.addClass("hide")
    $upload.removeClass("hide")
    $clear.removeClass("hide")

  $upload.click ->
    $upload.addClass("hide")
    $clear.addClass("hide")
    $(".section-metadata .form-control").addClass("disabled").attr("disabled", true)
    $(".section-files .panel-heading .upload-state").removeClass("hide").html("Uploading...")

    metadata = {}

    biospecimen_id = parseInt($(".field-biospecimen").val(), 10)
    metadata.biospecimen_id = biospecimen_id if !_.isEmpty(biospecimen_id)

    uploadFiles(files, metadata)

  $clear.click ->
    $inputBrowse.replaceWith($inputBrowse.val('').clone(true))
    $(".list-files").empty().addClass("hide")

    $upload.addClass("hide")
    $clear.addClass("hide")
    $btnBrowse.removeClass("hide")
