# methods for UserFile business-logic
#
module FilesConcern
  include ActiveSupport::Concern

  def user_real_files(params, context)
    # rubocop:disable Style/SignalException
    scopes = params[:scopes]
    states = params[:states]

    files = if params[:editable]
      UserFile.real_files.editable_by(context).accessible_by_private
    else
      UserFile.real_files.accessible_by(context)
    end

    if scopes.present?
      check_scope!
      files = files.where(scope: scopes)
    end

    if states.present?
      fail "Invalid states" unless states.is_a?(Array) && states.all? { |state| allowed?(state) }

      files = files.where(state: params["states"])
    end
    # rubocop:enable Style/SignalException

    files
  end

  def allowed?(state)
    %w(closed closing open).include?(state)
  end

  def determine_scope_name(scope)
    case scope
    when "private" then "My files"
    when "public" then "Explore"
    when "featured" then "Featured"
    end
  end

  def refresh_file(file, context)
    return unless file.state != "closed"

    if file.challenge_file?
      User.sync_challenge_file!(file.id)
    else
      User.sync_file!(context, file.id)
    end
    file.reload
  end

  # Get a node, mapped to attributes, used in /client on Space Files page,
  # links crated for every node: UserFile or Folder.
  # @param node [Node] Node to get origin for.
  # @param space [Space] A space.
  # @param current_user [User] A current_user.
  # @return [Hash] An object of mapped node, to be used in /client
  def client_file(node, space, current_user)
    rename_path = if node.is_a?(UserFile)
      api_file_path(node)
    else
      rename_folder_api_space_file_path(space, node)
    end

    {
      id: node.id,
      name: ERB::Util.h(node.name),
      type: node.is_a?(UserFile) ? "File" : node.sti_type,
      org: node.user ? node.user.org.handle : "-",
      added_by: node.user.dxuser,
      size: node.is_a?(UserFile) ? number_to_human_size(node.file_size) : "",
      created: node.created_at.strftime("%m/%d/%Y"),
      state: node.state,
      tags: node.all_tags_list,
      links: {}.tap do |links|
        links[:filePath] = node.is_a?(UserFile) ? "/files/#{node.uid}" : ""
        links[:user] = user_path(node.user.dxuser)
        links[:originPath] = node.is_a?(UserFile) ? node_origin(node, current_user) : ""
        links[:renamePath] = rename_path if space.editable_by?(current_user)
      end,
    }
  end
end
