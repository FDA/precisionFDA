# == Schema Information
#
# == Schema Information
#
# Table name: analyses
#
#  id          :integer          not null, primary key
#  name        :string(255)
#  dxid        :string(255)
#  user_id     :integer
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  workflow_id :integer
#  batch_id    :string(255)
#

FactoryBot.define do
  factory :analysis do
    user
    workflow
    name { FFaker::Lorem.word }
    sequence(:dxid) { "job-#{SecureRandom.hex(12)}" }

    trait :batch do
      transient do
        size { batch_size }
        user { user }
      end

      after(:create) do |record, options|
        dxid = options.workflow.dxid
        record.update(user: options.user, batch_id: dxid)
        record.workflow.update(user: options.user)

        if options.size > 1
          create_list(:analysis, (options.size - 1),
                      user: options.user,
                      workflow: options.workflow,
                      batch_id: dxid)
        end
      end
    end
  end
end
