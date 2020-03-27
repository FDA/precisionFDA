FactoryBot.define do
  factory :admin_group do
    role { AdminGroup::ROLE_SITE_ADMIN }
  end
end
