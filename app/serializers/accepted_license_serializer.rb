# AcceptedLicense serializer.
class AcceptedLicenseSerializer < ApplicationSerializer
  attributes(
    :id,
    :license_id,
    :state,
    :added_by,
    :added_by_fullname,
    :created_at_date_time,
    :message,
  )
  attribute :all_tags_list, key: :tags

  delegate :all_tags_list, to: :object
end
