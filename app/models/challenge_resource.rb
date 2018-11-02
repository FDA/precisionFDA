# == Schema Information
#
# Table name: challenge_resources
#
#  id            :integer          not null, primary key
#  challenge_id  :integer
#  user_file_id  :integer
#  user_id       :integer
#  url           :text
#  meta          :text
#  created_at    :datetime         not null
#  updated_at    :datetime         not null

class ChallengeResource < ActiveRecord::Base
  include Auditor

  belongs_to :challenge
  belongs_to :user_file, dependent: :destroy
  belongs_to :user

  store :meta, accessors: [], coder: JSON

  def name
    user_file.name
  end

  def description
    user_file.description
  end

  def uid
    "challenge-resource-#{id}"
  end

  def klass
    "challenge-resource"
  end

  def editable_by?(context)
    challenge.editable_by?(context)
  end

  def rename(new_name, context)
    if editable_by?(context)
      DNAnexusAPI.new(CHALLENGE_BOT_TOKEN).call(dxid, "rename", {project: CHALLENGE_BOT_PRIVATE_FILES_PROJECT, name: new_name})
      user_file.update_attributes(name: new_name)
    else
      false
    end
  end

  def self.from_challenge(challenge_id)
    where(challenge_id: challenge_id)
  end
end
