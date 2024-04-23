module FilesHelper
  include PathHelper
  include ActionView::Helpers::UrlHelper
  include ApplicationHelper

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
      uid: node.uid,
      name: ERB::Util.h(node.name),
      type: node.is_a?(UserFile) ? "File" : node.sti_type,
      org: node.user ? node.user.org.handle : "-",
      added_by: node.user.dxuser,
      file_size: node.is_a?(UserFile) ? number_to_human_size(node.file_size) : "",
      created_at: node.created_at.strftime("%m/%d/%Y"),
      created_at_date_time: node.created_at.strftime("%Y-%m-%d %H:%M:%S %Z"),
      state: node.state,
      tags: node.all_tags_list,
      origin: node.is_a?(UserFile) ? node_origin(node, current_user) : "",
      links: {}.tap do |links|
        links[:filePath] = node.is_a?(UserFile) ? "/files/#{node.uid}" : ""
        links[:user] = user_path(node.user.dxuser)
        links[:renamePath] = rename_path if space.editable_by?(current_user)
      end,
    }
  end

  def file_description(file)
    file.description.present? ? file.description : "This file has no description."
  end

  # Provide a node origin links to use on Home (Space) Files page
  # @param node [Node] Node to get origin for.
  # @return [String] - file link object node of type "UserFile"
  def node_origin(node, current_user)
    if node.klass == "folder" && !node.https?
      nil
    elsif node.parent_type == "Node" && node.parent.blank?
      "Copied"
    elsif node.parent_type != "User"

      node_origin_link(
        unilinkfw(node.parent, { no_home: true, current_user: current_user }),
      )
    else
      "Uploaded"
    end
  end

  def node_origin_link(html_link)
    parsed_html_link = Nokogiri::HTML(html_link)
    parsed_a_element = parsed_html_link.at("a")
    parsed_span_element = parsed_html_link.at("span")

    origin_link = {}
    origin_link[:href] = parsed_a_element["href"] if parsed_a_element
    origin_link[:fa] = parsed_span_element.to_h["class"] if parsed_span_element
    origin_link[:text] = parsed_html_link.text

    origin_link
  end
end
