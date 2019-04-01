class DockerImporter
  def initialize(context:, attached_image:, formatted_image:)
    @context = context
    @attached_image = attached_image
    @formatted_image = formatted_image
    @asset_service = AssetService.new(context)
  end

  def import
    return unless attached_image_valid_and_matched?

    image_filename = attached_image.original_filename

    asset_name =
      "#{formatted_image[:repository]}-#{formatted_image[:tag]}.tar.gz".freeze
    asset_readme = %(
      This asset contains the locally uploaded Docker
      image #{image_filename}.
    ).squish.freeze

    image_filepath =
      File.join(
        "work",
        image_filename
      )

    asset = asset_service.create_and_upload(
      name: asset_name,
      readme: asset_readme,
      files: { image_filepath => attached_image }
    )

    asset_service.wait_for_asset_to_close(asset.dxid) do |data|
      asset.update!(
        state: "closed",
        file_size: data["size"]
      )
      Event::FileCreated.create_for(asset, context.user)
    end

    asset
  end

  private

  def attached_image_valid_and_matched?
    formatted_image[:registry].nil? &&
    attached_image.present? &&
    attached_image_valid? &&
    attached_image_matched?
  end

  def attached_image_valid?
    filename = attached_image.original_filename

    return false unless filename =~ /\.tar\.gz$/

    splitted_filename = filename.sub(".tar.gz", "").split("_")

    splitted_filename.size.between?(2, 3)
  end

  def attached_image_matched?
    filename = attached_image.original_filename

    namespace, repository, tag = filename.sub(".tar.gz", "").split("_")
    tag ||= "latest"

    namespace == formatted_image[:namespace] &&
    repository == formatted_image[:repository] &&
    tag == formatted_image[:tag]
  end

  attr_reader :attached_image, :formatted_image, :context, :asset_service
end
