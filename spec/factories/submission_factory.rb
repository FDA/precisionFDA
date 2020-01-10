# == Schema Information
#
# Table name: submissions
#
#  id             :integer          not null, primary key
#  challenge_id :integer
#  user_id      :integer
#  job_id       :integer
#  desc         :text(65535)
#  meta         :text(65535)
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#

FactoryBot.define do
  factory :submission do
    desc { "submission_description" }
    meta { {} }
  end
end
