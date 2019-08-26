class AssetService
  MAX_ASSET_SIZE = 5.terabytes
  CHUNK_SIZE = 50.megabytes
  MAX_CHUNK_SIZE = 2.gigabytes
  MIN_CHUNK_SIZE = 5.megabytes
  THREADS_COUNT = 5

  include ActionView::Helpers::NumberHelper

  class AssetServiceError < StandardError; end

  class << self
    def create(context, options)
      new(context).create(options)
    end

    def close(context, options)
      new(context).close(options[:uid])
    end

    def create_and_upload(context, options)
      new(context).create_and_upload(options)
    end

    # Example of files mapping:
    #   {
    #     "work/GenomeAnalysisTK.jar" => io_object
    #     "usr/bin/bgzip" => io_object
    #   }
    def build(files)
      tarball =
        TarballBuilder.build do |tar|
          files.each do |filepath, file|
            tar.add_file_simple(filepath, file.read, file.size)
          end
        end

      StringIO.new(tarball)
    end
  end

  def initialize(context)
    @context = context
  end

  def create_and_upload(options)
    asset_name, asset_readme, files =
      options.values_at(:name, :readme, :files)

    asset_io = self.class.build(files)

    asset_size = asset_io.length

    if asset_size > MAX_ASSET_SIZE
      raise AssetServiceError,
        "Size of asset #{asset_name} " \
        "(#{number_to_human_size(asset_size)}) " \
        "exceeds maximum allowed file size " \
        "(#{number_to_human_size(MAX_ASSET_SIZE)})"
    end

    Asset.transaction do
      asset = create(
        name: asset_name,
        description: asset_readme,
        paths: files.keys
      )

      upload(asset.uid, asset_io)

      close(asset.uid)
    end
  end

  def describe(asset_dxid)
    api.call(
      "system",
      "describeDataObjects",
      objects: [asset_dxid]
    )["results"][0]["describe"]
  end

  def upload(uid, asset_io, chunk_size = CHUNK_SIZE)
    chunks = -> do
      if !asset_io.eof?
        chunk = asset_io.read(chunk_size)

        [chunk, md5sum(chunk), chunk.length]
      else
        Parallel::Stop
      end
    end

    url_service = UploadUrlFetcher.new(context, uid)
    url_service.instance_eval { file }

    Parallel.each_with_index(
      chunks, in_threads: THREADS_COUNT
    ) do |(chunk, md5, size), index|
      idx = index + 1

      result = url_service.fetch_url(
        md5: md5,
        size: size,
        index: idx
      )

      send_to_store(result["url"], result["headers"], chunk, idx)
    end
  ensure
    asset_io.close
  end

  def create(options)
    asset_name, description, paths =
      options.values_at(:name, :description, :paths)

    project = User.find(context.user_id).private_files_project

    dxid =
      api.call(
        "file",
        "new",
        "name": asset_name,
        "project": project
      )["id"]

    asset = nil

    Asset.transaction do
      asset = Asset.create!(
        dxid: dxid,
        project: project,
        name: asset_name,
        state: "open",
        description: description,
        user_id: context.user_id,
        scope: "private"
      )
      asset.parent = asset
      asset.save!
      asset.update!(parent_type: "Asset")

      entries = paths.map do |path|
        name = path.split("/").last

        if name == "" || name == "." || name == ".."
          name = nil
        end

        asset.archive_entries.build(path: path, name: name)
      end

      ArchiveEntry.import(entries)
    end

    asset
  end

  def close(uid)
    asset = Asset.open.find_by!(user_id: context.user_id, uid: uid)

    api.call(asset.dxid, "close")

    asset.reload

    asset.update_attributes!(state: "closing") if asset.open?

    asset
  end

  # we need to wait until the asset becomes closed
  # otherwise we won't create an app with the assed linked to it
  def wait_for_asset_to_close(asset_dxid, max_retries = 5)
    return unless block_given?

    retries = 0

    loop do
      data = describe(asset_dxid)

      if data["state"] == "closed"
        yield data

        break
      end

      retries += 1

      if retries > max_retries - 1
        raise AssetServiceError,
          "The asset #{asset.uid} can't be closed. Please try again later."
      end

      sleep 3
    end
  end

  protected

  def send_to_store(url, headers, chunk, index)
    uri = URI(url)
    req = Net::HTTP::Put.new(uri)
    req.body = chunk
    headers.each { |name, value| req[name] = value }

    res =
      Net::HTTP.start(
        uri.hostname,
        uri.port,
        read_timeout: 180,
        use_ssl: uri.scheme == "https"
      ) do |http|
        http.request(req)
      end

    unless res.is_a?(Net::HTTPSuccess)
      raise AssetServiceError,
        "Failed to upload chunk ##{index}. Please try again later. " \
        "If the problem persists, contact precisionFDA support."
    end
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

  def api
    @api ||= DNAnexusAPI.new(context.token)
  end

  attr_reader :context
end
