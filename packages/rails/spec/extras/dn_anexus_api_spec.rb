require "rails_helper"

RSpec.shared_examples "call" do
  it "calls transport with provided arguments" do
    client.send(client_method, *client_method_args)

    expect(transport).to have_received(:call).
      with(expected_subject, expected_method, expected_payload)
  end
end

describe DNAnexusAPI do
  subject(:client) { described_class.new(token, api_server) }

  let(:token) { "some-token" }
  let(:api_server) { "https://some.unreachable.server" }
  let(:transport) { instance_double("DXClient::Transport", call: nil) }
  let(:payload) { { someKey: "someValue" } }

  before do
    allow(DXClient::Transport).to receive(:new).and_return(transport)
  end

  describe "#call" do
    it_behaves_like "call" do
      let(:subject) { "some-subject" }
      let(:method) { "some-method" }

      let(:client_method) { :call }
      let(:client_method_args) { [subject, method, payload] }

      let(:expected_subject) { subject }
      let(:expected_method) { method }
      let(:expected_payload) { payload }
    end
  end

  describe "#user_new" do
    it_behaves_like "call" do
      let(:client_method) { :user_new }
      let(:client_method_args) { [payload] }

      let(:expected_subject) { "user" }
      let(:expected_method) { "new" }
      let(:expected_payload) { payload }
    end
  end

  describe "#app_describe" do
    it_behaves_like "call" do
      let(:app_dxid) { "some-app_dxid" }

      let(:client_method) { :app_describe }
      let(:client_method_args) { [app_dxid, payload] }

      let(:expected_subject) { app_dxid }
      let(:expected_method) { "describe" }
      let(:expected_payload) { payload }
    end
  end

  describe "#app_new" do
    it_behaves_like "call" do
      let(:client_method) { :app_new }
      let(:client_method_args) { [payload] }

      let(:expected_subject) { "app" }
      let(:expected_method) { "new" }
      let(:expected_payload) { payload }
    end

    # context "when charges mismatch response error was returned" do
    #   before do
    #     response_error = {
    #       error: {
    #         type: "InvalidInput",
    #         message: "The specified user or org (org-pfda..garry.potter) that will be " \
    #                   "responsible for charges associated with this app version does " \
    #                   "not match the one responsible for charges associated with the app " \
    #                   "(org-pfda..albus.dumbledore)",
    #       },
    #     }.to_json

    #     allow(transport).to receive(:call).and_raise(RuntimeError, response_error)
    #   end

    #   it "raises ChargesMismatchError exception" do
    #     expect { client.app_new(payload) }.to raise_error(DXClient::Errors::ChargesMismatchError)
    #   end
    # end

    context "when another kind of error was returned" do
      before do
        response_error = {
          error: {
            type: "InvalidInput",
            message: "Some error message",
          },
        }.to_json

        allow(transport).to receive(:call).and_raise(RuntimeError, response_error)
      end

      it "raises an appropriate exception" do
        expect { client.app_new(payload) }.to raise_error(RuntimeError)
      end
    end
  end

  describe "#file_new" do
    it_behaves_like "call" do
      let(:name) { "some-name" }
      let(:project) { "some-project" }

      let(:client_method) { :file_new }
      let(:client_method_args) { [name, project, payload] }

      let(:expected_subject) { "file" }
      let(:expected_method) { "new" }
      let(:expected_payload) { payload.merge(name: name, project: project) }
    end
  end

  describe "#file_download" do
    it_behaves_like "call" do
      let(:file_dxid) { "some-file_dxid" }

      let(:client_method) { :file_download }
      let(:client_method_args) { [file_dxid, payload] }

      let(:expected_subject) { file_dxid }
      let(:expected_method) { "download" }
      let(:expected_payload) { payload }
    end
  end

  describe "#file_rename" do
    it_behaves_like "call" do
      let(:file_dxid) { "some-file_dxid" }
      let(:project_dxid) { "some-project_dxid" }
      let(:name) { "some-name" }

      let(:client_method) { :file_rename }
      let(:client_method_args) { [file_dxid, project_dxid, name] }

      let(:expected_subject) { file_dxid }
      let(:expected_method) { "rename" }
      let(:expected_payload) { { project: project_dxid, name: name } }
    end
  end

  describe "#file_describe" do
    it_behaves_like "call" do
      let(:file_dxid) { "some-file_dxid" }

      let(:client_method) { :file_describe }
      let(:client_method_args) { [file_dxid, payload] }

      let(:expected_subject) { file_dxid }
      let(:expected_method) { "describe" }
      let(:expected_payload) { payload }
    end
  end

  describe "#org_invite" do
    it_behaves_like "call" do
      let(:org) { "some-org" }
      let(:invitee) { "some-user" }

      let(:client_method) { :org_invite }
      let(:client_method_args) { [org, invitee, payload] }

      let(:expected_subject) { org }
      let(:expected_method) { "invite" }
      let(:expected_payload) { payload.merge(invitee: invitee) }
    end
  end

  describe "#org_new" do
    it_behaves_like "call" do
      let(:handle) { "some-handle" }
      let(:name) { "some-name" }

      let(:client_method) { :org_new }
      let(:client_method_args) { [handle, name, payload] }

      let(:expected_subject) { "org" }
      let(:expected_method) { "new" }
      let(:expected_payload) { payload.merge(handle: handle, name: name) }
    end
  end

  describe "#org_update_billing_info" do
    it_behaves_like "call" do
      let(:billing_info) { "some-billing-info" }
      let(:org) { "some-org" }

      let(:client_method) { :org_update_billing_info }
      let(:client_method_args) { [org, billing_info, payload] }

      let(:expected_subject) { org }
      let(:expected_method) { "updateBillingInformation" }
      let(:expected_payload) { payload.merge(billingInformation: billing_info) }
    end
  end

  describe "#org_describe" do
    it_behaves_like "call" do
      let(:org_dxid) { "some-org" }

      let(:client_method) { :org_describe }
      let(:client_method_args) { [org_dxid, payload] }

      let(:expected_subject) { org_dxid }
      let(:expected_method) { "describe" }
      let(:expected_payload) { payload }
    end
  end

  describe "#workflow_run" do
    it_behaves_like "call" do
      let(:workflow) { "some-workflow" }
      let(:project) { "some-project" }
      let(:input) { "some-input" }

      let(:client_method) { :workflow_run }
      let(:client_method_args) { [workflow, project, input, payload] }

      let(:expected_subject) { workflow }
      let(:expected_method) { "run" }
      let(:expected_payload) { payload.merge(project: project, input: input) }
    end
  end

  describe "#workflow_new" do
    it_behaves_like "call" do
      let(:project) { "some-project" }

      let(:client_method) { :workflow_new }
      let(:client_method_args) { [project, payload] }

      let(:expected_subject) { "workflow" }
      let(:expected_method) { "new" }
      let(:expected_payload) { payload.merge(project: project) }
    end
  end

  describe "#project_clone" do
    it_behaves_like "call" do
      let(:source_project) { "source-project" }
      let(:destination_project) { "destination-project" }

      let(:client_method) { :project_clone }
      let(:client_method_args) { [source_project, destination_project, payload] }

      let(:expected_subject) { source_project }
      let(:expected_method) { "clone" }
      let(:expected_payload) { payload.merge(project: destination_project) }
    end
  end

  describe "#project_update" do
    it_behaves_like "call" do
      let(:project) { "project" }

      let(:client_method) { :project_update }
      let(:client_method_args) { [project, payload] }

      let(:expected_subject) { project }
      let(:expected_method) { "update" }
      let(:expected_payload) { payload }
    end
  end

  describe "#org_remove_member" do
    it_behaves_like "call" do
      let(:org) { "some-org" }
      let(:user) { "some-user" }

      let(:client_method) { :org_remove_member }
      let(:client_method_args) { [org, user, payload] }

      let(:expected_subject) { org }
      let(:expected_method) { "removeMember" }
      let(:expected_payload) { payload.merge(user: user) }
    end
  end

  describe "#project_new" do
    it_behaves_like "call" do
      let(:name) { "some-name" }

      let(:client_method) { :project_new }
      let(:client_method_args) { [name, payload] }

      let(:expected_subject) { "project" }
      let(:expected_method) { "new" }
      let(:expected_payload) { payload.merge(name: name) }
    end
  end

  describe "#project_invite" do
    it_behaves_like "call" do
      let(:project) { "some-project" }
      let(:invitee) { "some-invitee" }
      let(:level) { "some-level" }

      let(:client_method) { :project_invite }
      let(:client_method_args) { [project, invitee, level, payload] }

      let(:expected_subject) { project }
      let(:expected_method) { "invite" }
      let(:expected_payload) { payload.merge(invitee: invitee, level: level) }
    end
  end

  describe "#project_destroy" do
    it_behaves_like "call" do
      let(:project) { "project" }

      let(:client_method) { :project_destroy }
      let(:client_method_args) { [project, payload] }

      let(:expected_subject) { project }
      let(:expected_method) { "destroy" }
      let(:expected_payload) { payload }
    end
  end

  describe "#user_update" do
    it_behaves_like "call" do
      let(:user) { "some-user" }

      let(:client_method) { :user_update }
      let(:client_method_args) { [user, payload] }

      let(:expected_subject) { user }
      let(:expected_method) { "update" }
      let(:expected_payload) { payload }
    end
  end

  describe "#org_find_members" do
    it_behaves_like "call" do
      let(:org_dxid) { "some-org" }

      let(:client_method) { :org_find_members }
      let(:client_method_args) { [org_dxid, payload] }

      let(:expected_subject) { org_dxid }
      let(:expected_method) { "findMembers" }
      let(:expected_payload) { payload }
    end
  end

  describe "#project_describe" do
    it_behaves_like "call" do
      let(:project) { "project" }

      let(:client_method) { :project_describe }
      let(:client_method_args) { [project, payload] }

      let(:expected_subject) { project }
      let(:expected_method) { "describe" }
      let(:expected_payload) { payload }
    end
  end

  describe "#project_remove_objects" do
    it_behaves_like "call" do
      let(:project) { "project" }
      let(:objects) { %w(some-objects) }

      let(:client_method) { :project_remove_objects }
      let(:client_method_args) { [project, objects, payload] }

      let(:expected_subject) { project }
      let(:expected_method) { "removeObjects" }
      let(:expected_payload) { payload.merge(objects: objects) }
    end
  end

  describe "#applet_new" do
    it_behaves_like "call" do
      let(:project) { "project" }

      let(:client_method) { :applet_new }
      let(:client_method_args) { [project, payload] }

      let(:expected_subject) { "applet" }
      let(:expected_method) { "new" }
      let(:expected_payload) { payload.merge(project: project) }
    end
  end

  describe "#applet_describe" do
    it_behaves_like "call" do
      let(:applet_dxid) { "some-applet_dxid" }

      let(:client_method) { :applet_describe }
      let(:client_method_args) { [applet_dxid, payload] }

      let(:expected_subject) { applet_dxid }
      let(:expected_method) { "describe" }
      let(:expected_payload) { payload }
    end
  end

  describe "#system_describe_data_objects" do
    it_behaves_like "call" do
      let(:objects) { ["some-file"] }

      let(:client_method) { :system_describe_data_objects }
      let(:client_method_args) { [objects, payload] }

      let(:expected_subject) { "system" }
      let(:expected_method) { "describeDataObjects" }
      let(:expected_payload) { payload.merge(objects: objects) }
    end
  end

  describe "#system_find_jobs" do
    it_behaves_like "call" do
      let(:client_method) { :system_find_jobs }
      let(:client_method_args) { [payload] }

      let(:expected_subject) { "system" }
      let(:expected_method) { "findJobs" }
      let(:expected_payload) { payload }
    end
  end

  describe "#system_find_orgs" do
    it_behaves_like "call" do
      let(:client_method) { :system_find_orgs }
      let(:client_method_args) { [payload] }

      let(:expected_subject) { "system" }
      let(:expected_method) { "findOrgs" }
      let(:expected_payload) { payload }
    end
  end

  describe "#system_find_projects" do
    it_behaves_like "call" do
      let(:client_method) { :system_find_projects }
      let(:client_method_args) { [payload] }

      let(:expected_subject) { "system" }
      let(:expected_method) { "findProjects" }
      let(:expected_payload) { payload }
    end
  end

  describe "#system_find_apps" do
    it_behaves_like "call" do
      let(:client_method) { :system_find_apps }
      let(:client_method_args) { [payload] }

      let(:expected_subject) { "system" }
      let(:expected_method) { "findApps" }
      let(:expected_payload) { payload }
    end
  end

  describe "#app_run" do
    let(:app_dxid) { "some-dxid" }

    context "when no revision given" do
      it_behaves_like "call" do
        let(:client_method) { :app_run }
        let(:client_method_args) { [app_dxid, nil, payload] }

        let(:expected_subject) { app_dxid }
        let(:expected_method) { "run" }
        let(:expected_payload) { payload }
      end
    end

    context "when revision given" do
      it_behaves_like "call" do
        let(:revision) { "some-revision" }
        let(:client_method) { :app_run }
        let(:client_method_args) { [app_dxid, revision, payload] }

        let(:expected_subject) { "#{app_dxid}/#{revision}" }
        let(:expected_method) { "run" }
        let(:expected_payload) { payload }
      end
    end
  end

  describe "#job_terminate" do
    let(:job_dxid) { "some-dxid" }

    it_behaves_like "call" do
      let(:client_method) { :job_terminate }
      let(:client_method_args) { [job_dxid, payload] }

      let(:expected_subject) { job_dxid }
      let(:expected_method) { "terminate" }
      let(:expected_payload) { payload }
    end
  end
end
