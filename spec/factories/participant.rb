FactoryBot.define do
  factory :participant do
    title { FFaker::Name.first_name }
    image_url { FFaker::Internet.uri("https") }
  end
end
