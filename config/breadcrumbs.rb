crumb :folder do |folder|
  if folder
    link folder.name, pathify_folder(folder)
    parent :folder, folder.parent_folder
  else
    if controller_name == 'files' && action_name == 'index'
      link "My files", files_path
    elsif controller_name == 'files' && action_name == 'explore'
      link "Explore", explore_files_path
    elsif controller_name == 'spaces' && action_name == 'content'
      # TODO(Viktor Polotebnov): Temporary solution for getting space. Should be changed.
      space = Space.find(params[:id])
      link "Space files", content_space_path(space)
    end
  end
end
