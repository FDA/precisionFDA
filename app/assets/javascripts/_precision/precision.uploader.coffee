window.Precision ||= {}

window.Precision.uploader =
  uploadFile: (fileModel, metadata, cb) ->
    chunk_size = @getChunkSize(fileModel, 5497558138880) # 5TB
    params = _.assign(metadata, {'name': fileModel.file.name})
    Precision.api '/api/create_file', params, (res) =>
      id = res.id
      fileModel.id(id)

      @uploadChunks id, fileModel, 1, 0, chunk_size, cb

  uploadImage: (fileModel, metadata, cb) ->
    chunk_size = @getChunkSize(fileModel, 5000000) # 5MB
    params = _.assign(metadata, {'name': fileModel.file.name})
    Precision.api '/api/create_file', params, (uploadData) =>
      id = uploadData.id
      fileModel.id(id)

      @uploadChunks id, fileModel, 1, 0, chunk_size, cb

  uploadChunks: (id, fileModel, index, offset, chunk_size, cb) ->
    this_chunk_size = chunk_size
    if offset + this_chunk_size > fileModel.file.size
      this_chunk_size = fileModel.file.size - offset
    @calculateMD5 fileModel.file, offset, this_chunk_size, (md5) =>
      Precision.api '/api/get_upload_url', {
        'id': id
        'index': index
        'size': this_chunk_size
        'md5': md5
      }, (res) =>
        $.ajax res.url,
          'contentType': 'application/octet-stream'
          'data': fileModel.file.slice(offset, offset + this_chunk_size)
          'error': (xhr, status, err) ->
            alert 'ERROR! XHR status = ' + status + ', error = ' + err
            return
          'headers': res.headers
          'method': 'PUT'
          'processData': false
          'success': (data, status, xhr) =>
            offset += this_chunk_size
            fileModel.dataUploaded(offset)
            if offset == fileModel.file.size
              @closeFile(id, cb)
            else
              @uploadChunks id, fileModel, index + 1, offset, chunk_size, cb

  closeFile: (id, cb) ->
    Precision.api '/api/close_file', { 'id': id }, (res) ->
      cb()

  getChunkSize: (fileModel, max_size) ->
    MAX_FILE_SIZE = max_size
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

    return chunk_size

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
