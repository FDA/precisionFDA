# == Schema Information
#
# Table name: orgs
#
#  id         :integer          not null, primary key
#  handle     :string(255)
#  name       :string(255)
#  admin_id   :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  address    :text(65535)
#  duns       :string(255)
#  phone      :string(255)
#  state      :string(255)
#  singular   :boolean
#  fedramp    :boolean          default(FALSE)
#

require "rails_helper"

RSpec.describe Org, type: :model do
  subject(:org) { create(:org) }

  describe "common org validations" do
    it { is_expected.to be_valid }
    it { is_expected.to validate_presence_of(:name) }
  end

  describe ".dissolve_org_action_request" do
    it "returns org dissolving action request" do
      org_action_request = create(:org_action_request_dissolve, org: org)

      expect(org.dissolve_org_action_request).to eq(org_action_request)
    end
  end

  describe "Org report" do
    let(:org_one) { Org.first }
    let(:user_two) { User.second }
    let(:user_one) { User.first }

    let(:sheet) { Axlsx::Package.new.workbook.add_worksheet(name: "Users") }
    let(:report) { Org.reports(sheet) }

    context "empty sheet created" do
      it "with proper name" do
        expect(sheet.name).to eq("Users")
      end

      it "with no rows added" do
        expect(sheet.rows.size).to eq(0)
      end
    end

    context "proper org was created" do
      it "with admin_id" do
        expect(org_one.handle).to eq("automationtestinggmbh")
        expect(org_one.id).to eq(1)
        expect(org_one.admin_id).to eq(1)
        expect(Org.count).to eq(1)
      end
    end

    context "proper users were created" do
      it "with org admin" do
        expect(user_one.dxuser).to eq("automationtestuser")
        expect(user_one.org_id).to eq(1)
      end

      it "without org admin" do
        expect(user_two.dxuser).to eq("challenge.bot.2")
        expect(user_two.org_id).to be_nil
      end
    end

    context "when org have a proper admin" do
      let(:report) { Org.reports(sheet) }

      it "creates a proper rows for org in report" do
        expect(report.rows[0].cells.map(&:value)).to include org_one.name
        expect(report.rows[1].cells.map(&:value)).to eq(
          ["Organization handle:", "automationtestinggmbh"]
        )
        expect(report.rows[2].cells.map(&:value)).to eq(
          ["Organization address:", "703 Market"]
        )
        expect(report.rows[3].cells.map(&:value)).to include "Organization phone:"
      end

      it "creates a proper cells for admin user in report" do
        expect(report.rows[4].cells.map(&:value)[0]).to eq "Admin:"
        expect(report.rows[4].cells.map(&:value)[2]).to eq user_one.dxuser
        expect(report.rows[4].cells.map(&:value)[5]).to eq user_one.email
      end

      it "does not create any more rows in a report" do
        expect(report.rows.size).to eq 6
      end
    end

    context "when org does not have admin user" do
      let(:report) { Org.reports(sheet) }
      before { org_one.update(admin_id: nil) }

      it "creates a proper rows for org in report" do
        expect(report.rows[0].cells.map(&:value)).to include org_one.name
        expect(report.rows[1].cells.map(&:value)).to eq(
          ["Organization handle:", "automationtestinggmbh"]
        )
        expect(report.rows[2].cells.map(&:value)).to eq(
          ["Organization address:", "703 Market"]
        )
        expect(report.rows[3].cells.map(&:value)).to include "Organization phone:"
      end

      it "creates a Warning message in a cell when no admin exists" do
        expect(report.rows[4].cells.map(&:value)[0]).to eq(
          "Warning: No admin exists for this Org: automationtestinggmbh"
        )
      end

      it "creates a proper cells for member user in report" do
        expect(report.rows[5].cells.map(&:value)[0]).to eq "Member:"
        expect(report.rows[5].cells.map(&:value)[2]).to eq user_one.dxuser
        expect(report.rows[5].cells.map(&:value)[5]).to eq user_one.email
      end

      it "does not create any more rows in a report" do
        expect(report.rows[6].cells.map(&:value)[0]).to be_nil
        expect(report.rows.size).to eq 7
      end
    end

    context "when org does not have admin and members users" do
      let(:report) { Org.reports(sheet) }
      before do
        org_one.update(admin_id: nil)
        user_one.update(org_id: nil)
      end

      it "creates a proper rows for org in report" do
        expect(report.rows[0].cells.map(&:value)).to include org_one.name
        expect(report.rows[1].cells.map(&:value)).to eq(
          ["Organization handle:", "automationtestinggmbh"]
        )
        expect(report.rows[2].cells.map(&:value)).to eq(
          ["Organization address:", "703 Market"]
        )
        expect(report.rows[3].cells.map(&:value)).to include "Organization phone:"
      end

      it "creates a Warning message in a cell when no admin exists" do
        expect(report.rows[4].cells.map(&:value)[0]).to eq(
          "Warning: No admin exists for this Org: automationtestinggmbh"
        )
      end

      it "creates a Warning message when no users exists for this org" do
        expect(report.rows[5].cells.map(&:value)[0]).to eq(
          "Warning: No users (Admin or Member) exists for this Org: #{org_one.handle}"
        )
      end

      it "does not create any more rows in a report" do
        expect(report.rows[6].cells.map(&:value)[0]).to be_nil
        expect(report.rows.size).to eq 7
      end
    end
  end
end

