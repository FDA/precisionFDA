# == Schema Information
#
# Table name: invitations
#
#  id                 :integer          not null, primary key
#  first_name         :string(255)
#  last_name          :string(255)
#  email              :string(255)
#  org                :string(255)
#  singular           :boolean
#  phone              :string(255)
#  duns               :string(255)
#  ip                 :string(255)
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  extras             :text(65535)
#  user_id            :integer
#  state              :string(255)
#  code               :string(255)
#  city               :string(255)
#  us_state           :string(255)
#  postal_code        :string(255)
#  address1           :string(255)
#  address2           :string(255)
#  organization_admin :boolean          default(FALSE), not null
#  country_id         :integer
#  phone_country_id   :integer
#

require "rails_helper"

describe Invitation, type: :model do
  context "when run validations" do
    subject(:invitation) { build(:invitation) }

    it "has valid factory" do
      expect(invitation).to be_valid
    end
  end
end
