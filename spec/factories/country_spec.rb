FactoryBot.define do
  factory :country do
    name FFaker::Address.country
  end
end
