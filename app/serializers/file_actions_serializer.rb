# File & folder actions serializer. Used in files#download_list.
class FileActionsSerializer < ApplicationSerializer
  include FilesConcern
  include PathHelper

  attributes(
    :id,
    :name,
  )

  attribute :klass, key: :type
  attribute :fs_path, key: :fsPath
  attribute :view_url, key: :viewURL
  attribute :download_url, key: :downloadURL, if: -> { object.is_a?(UserFile) && download_action? }

  # Returns a path to a file starting from root folder.
  # @return [String] A path to a file.
  def fs_path
    scope_name = @instance_options[:scope_name]

    ([root_name] + object.ancestors(scope_name).map(&:name).reverse).compact.join(" / ")
  end

  # Returns a view url to file or folder.
  # @return [String] A view URL.
  def view_url
    object.is_a?(Folder) ? pathify_folder(object) : file_path(object)
  end

  # Returns a download url to a file.
  # @return [String] A download URL.
  def download_url
    download_api_file_path(object)
  end

  private

  # Checks if action is download.
  # @return [Boolean] Returns true if action is download, false otherwise.
  def download_action?
    @instance_options[:action_name] == Api::FilesController::DOWNLOAD_ACTION
  end

  # Returns files scope label.
  # @return [String] A file scope label.
  def root_name
    determine_scope_name(@instance_options[:scope_name])
  end
end
