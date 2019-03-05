require 'rails_helper'

RSpec.describe Org, type: :model do
  subject { org }

  let(:org) { build(:org) }

  it { is_expected.to be_valid }
  it { is_expected.to validate_presence_of(:name) }
  it { is_expected.to validate_uniqueness_of(:name).case_insensitive }
end

