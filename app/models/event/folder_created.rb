# == Schema Information
#
# Table name: events
#
#  id         :integer          not null, primary key
#  type       :string(255)
#  org_handle :string(255)
#  dxuser     :string(255)
#  param1     :string(255)
#  param2     :string(255)
#  param3     :string(255)
#  created_at :datetime         not null
#  param4     :string(255)
#  data       :text(65535)
#

class Event
  # Tracks folder creation events.
  class FolderCreated < Event
    store :data, accessors: %i(id scope name path), coder: JSON

    class << self
      def create_for(folder, user)
        path_with_folder = folder.full_path == "/" ? "/#{folder.name}" : folder.full_path + folder.name
        create(
          id: folder.id,
          scope: folder.scope,
          name: folder.name,
          path: path_with_folder,
          param1: path_with_folder,
          dxuser: user.dxuser,
          org_handle: user.org.handle,
        )
      end
    end
  end
end
