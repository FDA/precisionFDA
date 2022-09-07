# NewsItem serializer.
class NewsItemSerializer < ApplicationSerializer
  attributes(
    :id,
    :title,
    :link,
    :when,
    :content,
    :user_id,
    :video,
    :position,
    :published,
    :created_at,
    :updated_at,
  )
end
