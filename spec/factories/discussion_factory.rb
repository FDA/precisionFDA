# == Schema Information
#
# Table name: discussions
#
#  id         :integer          not null, primary key
#  user_id    :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  note_id    :integer
#

FactoryBot.define do
  factory :discussion do

    association :note

    trait :with_attachments do
      transient do
        attachments { [] }
      end

      after(:create) do |discussion, evaluator|
        evaluator.attachments.each do |attachment|
          discussion.note.attachments.find_or_create_by(item: attachment)
        end
      end
    end

  end
end
