require "rails_helper"

RSpec.describe WorkflowsController, type: :controller do
  let(:user) { create(:user, dxuser: "user") }
  let(:folder) { create(:folder, :private, user_id: user.id) }
  let(:app_input) do
    [
      { class: "string", help: "anything", label: "s1", name: "s1", optional: false, \
        choices: nil, requiredRunInput: false },
    ]
  end

  let(:app_output) do
    [
      { class: "string", help: "anything", label: "os1", name: "os1", optional: false, \
        choices: nil, requiredRunInput: false },
    ]
  end

  let(:app) do
    create(
      :app,
       user_id: user.id,
       input_spec: app_input,
       output_spec: app_output,
       internet_access: false,
       instance_type: "baseline-8",
       packages: nil,
       code: "emit os1 'Test App Outpit:-->'$s1",
    )
  end

  let(:workflow_inputs) do
    [
      {
        class: "string", label: "s1", name: "s1", optional: false, requiredRunInput: false, \
        parent_slot: slot_id, default_workflow_value: nil, values: values
      },
    ]
  end

  let(:workflow_outputs) do
    [
      {
        class: "string", label: "os1", name: "os1", optional: false, parent_slot: slot_id, \
        requiredRunInput: false, default_workflow_value: nil, values: values
      },
    ]
  end
  let(:values) { { "id" => nil, "name" => nil } }
  let(:slot_id) { "stage-#{SecureRandom.hex(7)}" }

  let(:workflow_spec) do
    {
      input_spec:
        {
          stages:
            [
              {
                name: app.title,
                prev_slot: nil,
                next_slot: nil,
                slotId: slot_id,
                app_dxid: app.dxid,
                app_uid: app.uid,
                inputs: workflow_inputs,
                outputs: workflow_outputs,
                instanceType: "baseline-8",
                stageIndex: 0,
              },
            ],
        },
      output_spec: { stages: [] },
    }
  end

  let(:workflow) { create(:workflow, user_id: user.id, spec: workflow_spec) }

  describe "GET output_folder_create" do
    let(:new_folder_name) { FFaker::Lorem.word }

    before { authenticate!(user) }

    context "with valid data" do
      let(:params) do
        {
          "id" => workflow.uid,
          "parent_folder_id" => "",
          "name" => new_folder_name,
          "public" => false,
        }
      end

      it "returns a http_status 200" do
        post :output_folder_create, params: params
        expect(response).to have_http_status(200)
      end

      it "returns a content_type 'json'" do
        post :output_folder_create, params: params
        expect(response.media_type).to eq "application/json"
      end

      it "creates a new output folder" do
        post :output_folder_create, params: params
        expect(parsed_response["folders"]["name"]).to eq new_folder_name
      end
    end

    context "with invalid data - without new folder name" do
      let(:params) do
        {
          "id" => workflow.uid,
          "parent_folder_id" => "",
          "name" => "",
          "public" => false,
        }
      end

      it "returns a http_status 500" do
        post :output_folder_create, params: params
        expect(response).to have_http_status(500)
      end

      it "returns a content_type 'json'" do
        post :output_folder_create, params: params
        expect(response.media_type).to eq "application/json"
      end

      it "returns an error message" do
        post :output_folder_create, params: params
        expect(parsed_response["error_message"]).to eq "Name could not be blank"
      end
    end

    context "with invalid data - folder name exists" do
      let(:folder_name) { folder.name }
      let(:params) do
        {
          "id" => workflow.uid,
          "parent_folder_id" => "",
          "name" => folder_name,
          "public" => false,
        }
      end

      before do
        authenticate!(user)
      end

      it "returns a http_status 500" do
        post :output_folder_create, params: params
        expect(response).to have_http_status(500)
      end

      it "returns a content_type 'json'" do
        post :output_folder_create, params: params
        expect(response.media_type).to eq "application/json"
      end

      it "returns a folder name uniqueness validation error message" do
        post :output_folder_create, params: params
        expect(parsed_response["error_message"]).
          to eq("A folder with the name '#{folder_name}' already exists.")
      end
    end
  end
end
