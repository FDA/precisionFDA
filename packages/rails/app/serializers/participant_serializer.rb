# Participant serializer
class ParticipantSerializer < ApplicationSerializer
  attributes(
    :id,
    :title,
    :image_url,
    :public,
    :kind,
    :position,
    :created_at,
    :updated_at,
  )
end
