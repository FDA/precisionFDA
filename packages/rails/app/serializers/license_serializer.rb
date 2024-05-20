# License serializer.
class LicenseSerializer < ApplicationSerializer
  attributes(
    :id,
    :uid,
    :content,
    :title,
    :added_by,
    :added_by_fullname,
    :created_at,
    :created_at_date_time,
    :location,
    :approval_required,
  )
  attribute :all_tags_list, key: :tags

  delegate :all_tags_list, to: :object
end
