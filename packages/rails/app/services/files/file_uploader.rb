module Files
  # File uploader service
  class FileUploader
    MAX_FILE_SIZE = 5.terabytes
    CHUNK_SIZE = 50.megabytes
    MAX_CHUNK_SIZE = 2.gigabytes
    MIN_CHUNK_SIZE = 5.megabytes
    THREADS_COUNT = 5

    class FileUploaderError < StandardError; end

    class << self
      # Used to create any small text file.
      def upload_from_string(context, options)
        file_content = options.delete(:content)
        raise FileUploaderError, "The file content is missed" if file_content.blank?

        new(context).create_and_upload(options.merge(file_io: StringIO.new(file_content)))
      end
    end

    def initialize(context)
      @context = context
    end

    def create_and_upload(options)
      file_io = options[:file_io]
      file_size = file_io.length

      if file_size > MAX_FILE_SIZE
        raise FileUploaderError, "Size of file exceeds maximum allowed file size"
      end

      file = nil
      Node.transaction do
        file = create(options)
        upload(file.uid, file_io)
      end

      if file.nil?
        Rails.logger.error("FileUploader::create_and_upload: Error while uploading file")
      else
        unsafe_params = { "id" => file.uid }
        https_apps_client.file_close(file.uid, unsafe_params)
      end

      file
    end

    private

    def upload(uid, file_io, chunk_size = CHUNK_SIZE)
      chunks = lambda do
        if !file_io.eof?
          chunk = file_io.read(chunk_size)
          [chunk, md5sum(chunk), chunk.length]
        else
          Parallel::Stop
        end
      end

      url_service = UploadUrlFetcher.new(context, uid)

      Parallel.each_with_index(chunks, in_threads: THREADS_COUNT) do |(chunk, md5, size), index|
        idx = index + 1
        result = url_service.fetch_url(md5: md5, size: size, index: idx)
        send_to_store(result["url"], result["headers"], chunk, idx)
      end
    ensure
      file_io.close
    end

    def create(options)
      project = context.user.private_files_project
      dxid = context.api.file_new(options[:name], project)["id"]

      UserFile.create!(
        dxid: dxid,
        project: project,
        name: options[:name],
        state: "open",
        description: options[:description],
        user_id: context.user_id,
        scope: Scopes::SCOPE_PRIVATE,
        parent: context.user,
        parent_type: "User",
      )
    end

    def close(uid)
      file = UserFile.open.find_by!(user_id: context.user_id, uid: uid)
      context.api.call(file.dxid, "close")

      file.reload
      file.update!(state: "closing") if file.open?
      file
    end

    def send_to_store(url, headers, chunk, index)
      uri = URI(url)
      req = Net::HTTP::Put.new(uri)
      req.body = chunk
      headers.each { |name, value| req[name] = value }

      res = Net::HTTP.start(
        uri.hostname,
        uri.port,
        read_timeout: 180,
        use_ssl: uri.scheme == "https",
      ) do |http|
        http.request(req)
      end

      return if res.is_a?(Net::HTTPSuccess)

      raise FileUploaderError,
            "Failed to upload chunk ##{index}. Please try again later. " \
            "If the problem persists, contact precisionFDA support."
    end

    def https_apps_client
      @https_apps_client ||= HttpsAppsClient.new
    end

    def md5sum(chunk)
      file = Tempfile.new("")
      file.binmode
      file.write(chunk)
      file.rewind

      `md5sum #{file.path} | cut -d ' ' -f 1`.strip
    ensure
      file.close
      file.unlink
    end

    attr_reader :context
  end
end
