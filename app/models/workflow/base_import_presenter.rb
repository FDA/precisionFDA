class Workflow
  class BaseImportPresenter < Presenter
    def initialize(params, context)
      super(params[:file], context)
      @attached_images = params[:attached_images]
    end


    def assets
      @assets ||= begin
        matched_images = (attached_images || []).each_with_object({}) do |attached, images|
          image_from_file = DockerImage.from_filename(attached.original_filename)
          matched_image = docker_images.find { |image| image == image_from_file }

          images[matched_image] = attached if image_from_file.valid? && matched_image
        end

        matched_images.map do |docker_image, attached|
          DockerImporter.import(
              context: context,
              attached_image: attached,
              docker_image: docker_image,
              )
        end
      end
    end

    private

    attr_reader :attached_images
  end
end