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
  # Tracks file delete events.
  class FileDeleted < Event
    alias_attribute :file_size, :param1

    store :data, accessors: %i(uid name path folder_id scope), coder: JSON

    class << self
      def create_for(file, user)
        create(
          uid: file.uid,
          name: file.name,
          path: file.full_path,
          folder_id: file.folder_id,
          scope: file.scope,
          file_size: file.file_size,
          dxuser: user.dxuser,
          org_handle: user.org.handle,
        )
      end
    end
  end
end
