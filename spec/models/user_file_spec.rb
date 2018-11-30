include 'rails_helper'

RSpec.describe UserFile, type: :model do
  let(:file){ create(:user_file)}

  it "should not be deletable if it is in verified space" do

  end
end