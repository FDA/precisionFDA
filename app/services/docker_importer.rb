class DockerImporter
  class ImportError < StandardError; end

  class << self
    def import(context:, attached_image:, docker_image:)
      return if docker_image.public? || attached_image.blank?

      image_filename = attached_image.original_filename
      docker_image_attached = DockerImage.from_filename(image_filename)

      return if docker_image_attached.invalid? ||
                docker_image != docker_image_attached

      asset_name = "#{docker_image.repository}-#{docker_image.tag}.tar.gz"

      asset_readme = %(
        This asset contains the locally uploaded Docker
        image #{image_filename}.
      ).squish.freeze

      image_filepath =
        File.join(
          "work",
          image_filename
        )

      new(
        context: context,
        asset_name: asset_name,
        asset_readme: asset_readme,
        asset_files: { image_filepath => attached_image }
      ).import
    end
  end

  def initialize(context:, asset_name:, asset_files:, asset_readme:)
    @context = context
    @asset_name = asset_name
    @asset_files = asset_files
    @asset_readme = asset_readme
  end

  def import
    asset = asset_service.create_and_upload(
      name: asset_name,
      files: asset_files,
      readme: asset_readme,
    )

    asset_service.wait_for_asset_to_close(asset.dxid) do |data|
      asset.update!(
        state: "closed",
        file_size: data["size"]
      )
      Event::FileCreated.create_for(asset, context.user)
    end

    asset
  rescue => e
    raise ImportError.new("Can't create asset #{asset_name}")
  end

  private

  def asset_service
    @asset_service ||= AssetService.new(context)
  end

  attr_reader :context, :asset_name, :asset_files, :asset_readme
end
