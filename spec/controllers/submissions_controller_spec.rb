require 'rails_helper'

RSpec.describe SubmissionsController, type: :controller do

  let(:user1) { create(:user, dxuser: "user_1") }
  let(:app) do
    create(:app,
      input_spec:
        [
          { name: "file1", class: "file", optional: false, label: "file1", help: "" },
          { name: "file2", class: "file", optional: true, label: "file2", help: "" },
          { name: "string1", class: "string", optional: false, label: "string1", help: "" },
          { name: "boolean1", class: "boolean", optional: false, label: "boolean1", help: "" },
          { name: "int1", class: "int", optional: false, label: "int1", help: "" }
        ]
    )
  end
  let(:challenge) { create(:challenge, :open, :skip_validate, app_id: app.id) }
  let(:file1) { create(:user_file, :public, parent_id: user1.id, user_id: user1.id) }
  let(:file2) { create(:user_file, :public, parent_id: user1.id, user_id: user1.id) }
  let(:valid_inputs) do
    {
      file1: file1.uid,
      file2: file2.uid,
      string1: "123",
      boolean1: true,
      int1: 123
    }
  end

  describe "POST create" do
    context "with invalid data" do
      before { authenticate!(user1) }
      it "flashes a error" do
        post :create, challenge_id: challenge.id, submission: { inputs: {}.to_json }
        expect(flash[:error]).to be_present
      end
    end

    context "with valid data" do
      before { authenticate!(user1) }
      it "creates a job" do
        post :create,
             challenge_id: challenge.id,
             submission: { name: "1", desc: "1", inputs: valid_inputs.to_json }
        expect(Job.any?).to be_truthy
      end
    end
  end

end
