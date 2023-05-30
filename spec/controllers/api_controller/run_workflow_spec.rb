require "rails_helper"

# rubocop:todo RSpec/MultipleMemoizedHelpers
RSpec.describe ApiController, type: :controller do
  let(:user) { create(:user, dxuser: "user", job_limit: 100, resources: CloudResourceDefaults::RESOURCES) }

  let(:app_input) do
    [
      { class: "string", help: "anything", label: "s1", name: "s1", optional: false, \
        choices: nil, requiredRunInput: false, default: "AAA" },
      { class: "string", help: "anything", label: "s2", name: "s2", optional: false, \
        choices: nil, requiredRunInput: false },
      { class: "int", help: "anything", label: "i1", name: "i1", optional: false, \
        choices: nil, requiredRunInput: false, default: 111 },
      { class: "int", help: "anything", label: "i2", name: "i2", optional: false, \
        choices: nil, requiredRunInput: false },
    ]
  end

  let(:app_output) do
    [
      { class: "string", help: "anything", label: "os1", name: "os1", optional: false, \
        choices: nil, requiredRunInput: false },
      { class: "int", help: "anything", label: "oi1", name: "oi1", optional: false, \
        choices: nil, requiredRunInput: false },
    ]
  end

  let(:app) do
    create(:app,
           user_id: user.id,
           input_spec: app_input,
           output_spec: app_output,
           internet_access: false,
           instance_type: "baseline-4",
           packages: nil,
           code: "emit os1 'Test App Outpit:-->'$s1' and '$s2\nemit oi1 $i2",)
  end

  let(:values) { { "id" => nil, "name" => nil } }
  let(:slot_id) { "stage-#{SecureRandom.hex(7)}" }

  let(:run_inputs) { { "s1" => "AAA", "s2" => "ddd", "i1" => 111, "i2" => 555 } }
  let(:run_inputs_failed_int) { { "i2" => "ccc" } }

  let(:workflow_inputs) do
    [
      { class: "string", label: "s1", name: "s1", optional: false, requiredRunInput: false, \
        parent_slot: slot_id, defaultValues: run_inputs["s1"], \
        default_workflow_value: run_inputs["s1"], values: values }, # "AAA"
      { class: "string", label: "s2", name: "s2", optional: false, requiredRunInput: true, \
        parent_slot: slot_id, default_workflow_value: nil, values: values },
      { class: "int", label: "i1", name: "i1", optional: false, requiredRunInput: false, \
        parent_slot: slot_id, defaultValues: run_inputs["i1"], \
        default_workflow_value: run_inputs["i1"], values: values }, # 111
      { class: "int", label: "i2", name: "i2", optional: false, requiredRunInput: true, \
        parent_slot: slot_id, default_workflow_value: nil, values: values },
    ]
  end

  let(:workflow_outputs) do
    [
      { class: "string", label: "os1", name: "os1", optional: false, parent_slot: slot_id, \
        requiredRunInput: false, default_workflow_value: nil, values: values },
      { class: "int", label: "oi1", name: "oi1", optional: false, parent_slot: slot_id, \
        requiredRunInput: false, default_workflow_value: nil, values: values },
    ]
  end

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
                instanceType: "baseline-4",
                stageIndex: 0,
              },
            ],
        },
      output_spec: { stages: [] },
    }
  end

  let(:workflow) { create(:workflow, user_id: user.id, spec: workflow_spec) }

  let(:params_inputs) do
    [
      # default value
      { class: "string", input_name: slot_id + "." + "s1", input_value: run_inputs["s1"] },
      { class: "string", input_name: slot_id + "." + "s2", input_value: run_inputs["s2"] },
      # default value
      { class: "int", input_name: slot_id + "." + "i1", input_value: run_inputs["i1"] },
      { class: "int", input_name: slot_id + "." + "i2", input_value: run_inputs["i2"].to_s },
    ]
  end

  let(:params_inputs_failed_int) do
    [
      # default value
      { class: "string", input_name: slot_id + "." + "s1", input_value: run_inputs["s1"] },
      { class: "string", input_name: slot_id + "." + "s2", input_value: run_inputs["s2"] },
      # default value
      { class: "int", input_name: slot_id + "." + "i1", input_value: run_inputs["i1"] },
      # wrong value
      {
        class: "int",
        input_name: slot_id + "." + "i2",
        input_value: run_inputs_failed_int["i2"].to_s,
      },
    ]
  end

  let(:params) do
    {
      name: app.title,
      inputs: params_inputs,
      workflow_id: workflow.uid,
      api:
        {
          name: app.title,
          inputs: params_inputs,
          workflow_id: workflow.uid,
        },
    }
  end

  let(:params_failed_int) do
    {
      name: app.title,
      inputs: params_inputs_failed_int,
      workflow_id: workflow.uid,
      api:
        {
          name: app.title,
          inputs: params_inputs_failed_int,
          workflow_id: workflow.uid,
        },
    }
  end

  let(:workflow_slot_id) { workflow.spec["input_spec"]["stages"].first["slotId"] }

  let(:stage_input_s1) { workflow_slot_id + "." + "s1" }
  let(:stage_input_s2) { workflow_slot_id + "." + "s2" }
  let(:stage_input_i1) { workflow_slot_id + "." + "i1" }
  let(:stage_input_i2) { workflow_slot_id + "." + "i2" }

  let(:api_run_params) do
    {
      "name": workflow.title,
      "input":
        {
          stage_input_s1 => run_inputs["s1"],
          stage_input_s2 => run_inputs["s2"],
          stage_input_i1 => run_inputs["i1"],
          stage_input_i2 => run_inputs["i2"],
        },
      "singleContext": true,
      "project": workflow.project,
      "timeoutPolicyByExecutable": {
        app.dxid => { "*" => { "days" => 5 } },
      },
    }
  end

  describe "create workflow with app" do
    before { allow_any_instance_of(Context).to receive(:logged_in?).and_return(true) }

    it "creates an app" do
      expect(app.user_id).to eq(user.id)
    end

    it "creates a workflow with app" do
      expect(workflow.spec["input_spec"]["stages"].first["app_uid"]).to eq(app.uid)
    end
  end

  describe "POST run_workflow" do
    before do
      authenticate!(user)
      allow(Users::ChargesFetcher).to receive(:exceeded_charges_limit?).and_return(false)
    end

    it "runs a workflow" do
      list_projects_response = { "#{workflow.project}": "ADMINISTER" }

      expect_any_instance_of(DNAnexusAPI)
        .to receive(:call)
        .with(workflow.dxid, "listProjects")
        .and_return(list_projects_response)

      run_response = {
        "id" => "analysis-#{SecureRandom.hex(12)}",
        "stages" => ["job-#{SecureRandom.hex(12)}"],
      }

      expect_any_instance_of(DNAnexusAPI)
        .to receive(:call)
        .with(workflow.dxid, "run", api_run_params)
        .and_return(run_response)

      post "run_workflow", params: params

      expect(response).to have_http_status(200)
      expect(parsed_response["id"]).to_not be_nil
      expect(Job.count).to eql(1)
      expect(Job.first.run_data["run_inputs"]).to eq(run_inputs)
    end

    it "do not runs a workflow with incorrect integer value and got error message" do
      post "run_workflow", params: params_failed_int

      expect(response).to have_http_status(422)
      expect(parsed_response["error"]["type"]).to eq("API Error")
      expect(parsed_response["error"]["message"])
        .to eq("#{run_inputs_failed_int.keys[0]}: value is not an integer")
    end

    context "when user exceeded charges limit" do
      before do
        allow(Users::ChargesFetcher).to receive(:exceeded_charges_limit?).and_return(true)
      end

      it "responds with an error" do
        post "run_workflow", params: params, format: :json

        expect(response.status).to eq(422)
        expect(parsed_response["error"]["message"]).to \
          include(I18n.t("api.errors.exceeded_charges_limit"))
      end
    end

    context "when user runs a workflow on forbidden instance types" do
      before do
        user.update(resources: user.resources - %w(baseline-4))
      end

      it "responds with an error" do
        post "run_workflow", params: params, format: :json

        expect(response.status).to eq(422)
        expect(parsed_response["error"]["message"]).to \
          include(I18n.t("workflows.errors.unsupported_instance_types", name: workflow.name))
      end
    end
  end
end
# rubocop:enable RSpec/MultipleMemoizedHelpers
