module DXClient
  # Provides files-related API calls.
  module Endpoints
    # Contains files related methods.
    module Files
      # Creates a new file object.
      # @see https://documentation.dnanexus.com/developer/api/introduction-to-data-object-classes/files#api-method-file-new
      # @param name [String] The name of the file.
      # @param project [String] ID of the project or container to which the file should belong.
      # @param opts [Hash] Additional opts.
      # @return id [Hash] ID of the created file object in the form { "id":"file-xxxx" }
      def file_new(name, project, opts = {})
        call("file", "new", opts.merge(name: name, project: project))
      end

      # Generates a "download URL" for downloading the contents of this file object.
      # @see https://documentation.dnanexus.com/developer/api/introduction-to-data-object-classes/files#api-method-file-xxxx-download
      # @param file_dxid [String] ID of the created file object
      #   (i.e. a string in the form "file-xxxx").
      # @param opts [Hash] Additional options.
      # @return url [Hash] An absolute URL to which HTTP GET requests can be made
      #   to download the file in the form
      #   { "url":"https://xxxx/file_name", "headers":{}, "expires":yyyy }.
      def file_download(file_dxid, opts = {})
        call(file_dxid, "download", opts)
      end

      # Renames file in specified project.
      # @see https://documentation.dnanexus.com/developer/api/introduction-to-data-object-metadata/name#api-method-class-xxxx-rename
      # @param file_dxid [String] File ID.
      # @param project_dxid [String] Project containing the file.
      # @param name [String] New file name.
      # @return [Hash]
      def file_rename(file_dxid, project_dxid, name)
        call(file_dxid, "rename", { project: project_dxid, name: name })
      end

      # Describes a file object.
      # @see https://documentation.dnanexus.com/developer/api/introduction-to-data-object-classes/files#api-method-file-xxxx-describe
      # @param file_dxid [String] ID of file object.
      # @param opts [Hash] Additional options.
      # @return [Hash]
      def file_describe(file_dxid, opts = {})
        call(file_dxid, "describe", opts)
      end
    end
  end
end
