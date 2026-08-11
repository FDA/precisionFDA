require "rails_helper"

RSpec.describe SubmissionsController, type: :controller do
  let(:user1) { create(:user, dxuser: "user_1") }
  let(:user2) { create(:user, dxuser: "user_2") }

  let(:app) do
    create \
      :app,
      input_spec: [
        { name: "file1", class: "file", optional: false, label: "file1", help: "" },
        { name: "file2", class: "file", optional: true, label: "file2", help: "" },
        { name: "string1", class: "string", optional: false, label: "string1", help: "" },
        { name: "boolean1", class: "boolean", optional: false, label: "boolean1", help: "" },
        { name: "int1", class: "int", optional: false, label: "int1", help: "" },
      ]
  end

  let(:space) do
    create(:space, :group, host_lead_id: user1.id, guest_lead_id: user2.id,
      host_project: "project-1", guest_project: "project-2")
  end

  let(:challenge) { create(:challenge, :open, :skip_validate, app_id: app.id, space: space) }
  let(:file1) { create(:user_file, :private, parent_id: user1.id, user_id: user1.id) }
  let(:file2) { create(:user_file, :private, parent_id: user1.id, user_id: user1.id) }

  let(:valid_inputs) do
    {
      file1: file1.uid,
      file2: file2.uid,
      string1: "123",
      boolean1: true,
      int1: 123,
    }
  end

  describe "POST create" do
    before do
      authenticate!(user1)
      allow(ActiveRecord::Base.connection).to receive(:commit_db_transaction)
      stub_request(:post, "https://localhost:3001/emails/typed")
    end

    # Stubs the Node API copy endpoint with a real source -> target mapping,
    # the way the NestJS facade responds on a successful copy. An empty
    # mapping ("[]") would mask copy failures and let the job run with the
    # submitter's private file UIDs.
    def stub_nodes_copy(mapping)
      stub_request(:post, "https://localhost:3001/nodes/copy").to_return(
        status: 200,
        headers: { "Content-Type" => "application/json" },
        body: mapping.map { |source, target|
          { sourceNodeId: source.id, targetNodeId: target.id, copied: true }
        }.to_json,
      )
    end

    def create_cloned_file(source)
      create(
        :user_file,
        dxid: source.dxid,
        project: space.host_project,
        scope: space.scope,
        parent_id: User.challenge_bot.id,
        user_id: User.challenge_bot.id,
      )
    end

    context "with invalid data" do
      it "flashes a error" do
        post :create, params: { challenge_id: challenge.id, submission: { inputs: {}.to_json } }
        expect(flash[:error]).to be_present
      end
    end

    context "with valid data" do
      it "creates a job" do
        stub_nodes_copy(file1 => create_cloned_file(file1), file2 => create_cloned_file(file2))

        post :create, params: {
          challenge_id: challenge.id,
          submission: { name: "1", desc: "1", inputs: valid_inputs.to_json },
        }
        expect(flash[:error]).to be_nil
        expect(Job).to be_any
      end

      it "fails the submission when the copy mapping does not cover all files" do
        # Only file1 gets a clone mapping - file2 is missing from the response.
        stub_nodes_copy(file1 => create_cloned_file(file1))

        post :create, params: {
          challenge_id: challenge.id,
          submission: { name: "1", desc: "1", inputs: valid_inputs.to_json },
        }

        expect(flash[:error]).to include(file2.uid)
        expect(Submission.count).to eq(0)
      end

      it "persists all input values and remaps file UIDs to cloned copies" do
        cloned_file1 = create(
          :user_file, :private,
          dxid: file1.dxid, project: space.host_project,
          parent_id: User.challenge_bot.id, user_id: User.challenge_bot.id
        )
        cloned_file2 = create(
          :user_file, :private,
          dxid: file2.dxid, project: space.host_project,
          parent_id: User.challenge_bot.id, user_id: User.challenge_bot.id
        )

        copies = CopyService::Copies.new
        copies.push(object: cloned_file1, source: file1)
        copies.push(object: cloned_file2, source: file2)

        allow_any_instance_of(described_class).to receive(:clone_inputs_to_space).and_return(copies)

        captured_input_info = nil
        allow_any_instance_of(JobCreator).to receive(:create) do |_creator, app:, name:, input_info:, **_kwargs|
          captured_input_info = input_info
          create(
            :job,
            app_series_id: app.app_series_id,
            app_id: app.id,
            name: name,
            user_id: User.challenge_bot.id,
            run_inputs: input_info.run_inputs,
          )
        end

        post :create, params: {
          challenge_id: challenge.id,
          submission: { name: "1", desc: "1", inputs: valid_inputs.to_json },
        }

        expect(captured_input_info).not_to be_nil

        # run_inputs should preserve every submitted value, with file UIDs
        # remapped to the cloned UserFile UIDs (non-file values must NOT be
        # nullified).
        expect(captured_input_info.run_inputs).to eq(
          "file1" => cloned_file1.uid,
          "file2" => cloned_file2.uid,
          "string1" => "123",
          "boolean1" => true,
          "int1" => 123,
        )
      end
    end
  end
end
