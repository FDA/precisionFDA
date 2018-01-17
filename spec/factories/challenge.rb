FactoryBot.define do
  factory :challenge do

    name "challenge_name"
    status Challenge::STATUS_SETUP
    start_at 10.days.ago
    end_at 10.days.since
    card_image_url "https://image"

    trait :open do
      status Challenge::STATUS_OPEN.to_s
    end

    trait :archived do
      status Challenge::STATUS_ARCHIVED.to_s
      end_at 1.days.ago
    end

    trait :skip_validate do
      to_create { |instance| instance.save(validate: false) }
    end

  end
end
