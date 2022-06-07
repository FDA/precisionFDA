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
  # Tracks file copy events.
  class FileCopied < Event
    store :data,
          accessors: %i(
            source_uid
            source_name
            source_path
            source_folder_id
            source_scope
            target_uid
            target_name
            target_path
            target_folder_id
            target_scope
          ), coder: JSON

    class << self
      def create_for(source, target, user)
        create(
          source_uid: source.uid,
          source_name: source.name,
          source_path: source.full_path,
          source_folder_id: source.folder_id,
          source_scope: source.scope,
          target_uid: target.uid,
          target_name: target.name,
          target_path: target.full_path,
          target_folder_id: target.folder_id,
          target_scope: target.scope,
          dxuser: user.dxuser,
          org_handle: user.org.handle,
        )
      end
    end
  end
end
