# == Schema Information
#
# Table name: apps
#
#  id            :integer          not null, primary key
#  dxid          :string(255)
#  version       :string(255)
#  revision      :integer
#  title         :string(255)
#  readme        :text(65535)
#  user_id       :integer
#  scope         :string(255)
#  spec          :text(65535)
#  internal      :text(65535)
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  app_series_id :integer
#  verified      :boolean          default(FALSE), not null
#  uid           :string(255)
#  dev_group     :string(255)
#

require "rails_helper"

RSpec.describe App, type: :model do
  subject { app }

  let(:user) { create(:user, dxuser: "user") }

  # spaces
  let(:host_lead) { create(:user, dxuser: "user_1") }
  let(:guest_lead) { create(:user, dxuser: "user_2") }
  let(:verified) do
    create(
      :space,
      :verification,
      :verified,
      host_lead_id: host_lead.id,
      guest_lead_id: guest_lead.id,
    )
  end
  let(:non_verified) do
    create(
      :space,
      :verification,
      :non_verified,
      host_lead_id: host_lead.id,
      guest_lead_id: guest_lead.id,
    )
  end
  let(:membership_host) { create(:space_membership, user_id: host_lead.id) }
  let(:membership_guest) { create(:space_membership, user_id: guest_lead.id) }
  let(:space_scope) { verified.uid }

  let(:groups) do
    create(:space, :group, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id)
  end
  let(:space_scope_groups) { groups.uid }

  # app
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
      code: "emit os1 'Test App Output:-->'$s1",
    )
  end

  describe "when app is valid" do
    it { is_expected.to be_valid }
  end

  describe "when app is not in any space" do
    let(:app_space_scopes) { subject.space_scopes }

    it "app with a proper 'private' scope" do
      expect(app.scope).to eq "private"
    end

    it "returns a permitted app scopes" do
      expect(app_space_scopes).to eq %w(private public)
    end

    context "with available_job_spaces for host_lead user" do
      let(:available_job_spaces) { subject.available_job_spaces(host_lead) }
      let(:space) { Space.find(verified.id) }

      it "returns a proper app space scopes" do
        expect(available_job_spaces).to eq []
      end
    end

    context "with can_run_in_space for host_lead user" do
      let(:can_run_in_space) { subject.can_run_in_space?(host_lead, verified.id) }
      let(:space) { Space.find(verified.id) }

      it "returns a proper app space scopes" do
        expect(can_run_in_space).to be_falsey
      end
    end
  end

  describe "when app is in verified space" do
    before do
      app.update(scope: space_scope)
    end

    let(:app_space_scopes) { subject.space_scopes }

    it "returns a proper app space scopes" do
      expect(app_space_scopes).to eq [space_scope]
    end

    context "with available_job_spaces for host_lead user" do
      let(:available_job_spaces) { subject.available_job_spaces(host_lead) }
      let(:space) { Space.find(verified.id) }

      it "returns a proper app space scopes" do
        expect(available_job_spaces).to eq [space]
      end
    end

    context "with can_run_in_space for host_lead user" do
      let(:can_run_in_space) { subject.can_run_in_space?(host_lead, verified.id) }
      let(:space) { Space.find(verified.id) }

      it "returns a proper app space scopes" do
        expect(can_run_in_space).to be_truthy
      end
    end
  end

  describe "when app is in groups space" do
    before do
      app.update(scope: space_scope_groups)
    end

    let(:app_space_scopes) { subject.space_scopes }

    it "app with a proper scope" do
      expect(app.scope).to eq space_scope_groups
    end

    it "returns a proper app space scopes" do
      expect(app_space_scopes).to eq [space_scope_groups]
    end

    context "with available_job_spaces for host_lead user" do
      let(:available_job_spaces) { subject.available_job_spaces(host_lead) }
      let(:space) { Space.find(groups.id) }

      it "returns a proper app space scopes" do
        expect(available_job_spaces).to eq [space]
      end
    end

    context "with can_run_in_space for host_lead user" do
      let(:can_run_in_space) { subject.can_run_in_space?(host_lead, groups.id) }
      let(:space) { Space.find(groups.id) }

      it "returns a proper app space scopes" do
        expect(can_run_in_space).to be_truthy
      end
    end
  end
end
