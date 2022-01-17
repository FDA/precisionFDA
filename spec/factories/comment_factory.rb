# == Schema Information
#
# Table name: comments
#
#  id                  :integer          not null, primary key
#  commentable_id      :integer
#  commentable_type    :string(255)
#  title               :string(255)
#  body                :text(65535)
#  subject             :string(255)
#  user_id             :integer          not null
#  parent_id           :integer
#  lft                 :integer
#  rgt                 :integer
#  created_at          :datetime
#  updated_at          :datetime
#  content_object_id   :integer
#  content_object_type :string(255)
#  state               :integer          default("active")
#

FactoryBot.define do
  factory :comment do
    body { "comment_body" }
    user
  end
end
