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
#
class Event
  # Tracks file copy events.
  class FileCopied < Event
    alias_attribute :source_id, :param1
    alias_attribute :target_id, :param2
    alias_attribute :source_folder_id, :param3
    alias_attribute :target_folder_id, :param4

    class << self
      def create_for(source, target, user)
        create(
          source_id: source.id,
          target_id: target.id,
          source_folder_id: source.folder_id,
          target_folder_id: target.folder_id,
          dxuser: user.dxuser,
          org_handle: user.org.handle,
        )
      end
    end
  end
end
