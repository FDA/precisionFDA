# == Schema Information
#
# Table name: challenges
#
#  id              :integer          not null, primary key
#  name            :string(255)
#  admin_id        :integer
#  app_owner_id    :integer
#  app_id          :integer
#  description     :text(65535)
#  meta            :text(65535)
#  start_at        :datetime
#  end_at          :datetime
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  status          :string(255)
#  automated       :boolean          default(TRUE)
#  card_image_url  :string(255)
#  card_image_id   :string(255)
#  specified_order :integer
#  space_id        :integer
#

FactoryBot.define do
  factory :challenge do
    name { "challenge_name" }
    status { Challenge::STATUS_SETUP }
    start_at { 10.days.ago }
    end_at { 10.days.since }
    card_image_url { "https://image" }

    trait :open do
      status { Challenge::STATUS_OPEN.to_s }
    end

    trait :archived do
      status { Challenge::STATUS_ARCHIVED.to_s }
      end_at { 1.days.ago }
    end

    trait :skip_validate do
      to_create { |instance| instance.save(validate: false) }
    end
  end
end
