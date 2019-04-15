require "rails_helper"
include Imports::WorkflowHelper
include Imports::StagesHelper

RSpec.describe Workflow::StagesPresenter, type: :model do
  subject { presenter }

  let(:user) { create(:user) }
  let(:context) { Context.new(user.id, user.dxuser, SecureRandom.uuid, nil, nil) }
  let(:raw) { params["slots"] }
  let(:presenter) { described_class.new(raw, context) }
  let(:subject_response) { presenter.build }

  before do
    create(:app, dxid:  raw.second["uid"].split("-1").first, user_id: user.id)
    create(:app, dxid:  raw.first["uid"].split("-1").first, user_id: user.id)
    allow_any_instance_of(Context).to receive(:logged_in?).and_return(true)
  end

  describe ".build" do
    it "returns stages json" do
      expect(subject_response).to eq(presenter_result)
    end
  end

  context "when the input data is correct" do
    it { is_expected.to be_valid }
  end
end
