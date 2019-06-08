require 'rails_helper'
require 'disable_transactions_helper'
require 'auditor_helper'

RSpec.describe Auditor do
  describe "log other events" do
    let(:ip) { "172.18.0.1" }
    let(:user_name) { "user1" }

    before(:each) do
      Auditor.current_user = AuditLogUser.new(user_name, ip)
    end

    without_transactional_fixtures do
      it "writes given information to the audit log" do
        Auditor.file = StringIO.new

        auditor_data = {
          action: "create",
          record_type: "Org Provision",
          record: {
            message: "The system is about to start provisioning a new dxorg"
          }
        }
        Auditor.perform_audit(auditor_data)

        Auditor.file.rewind
        raw_result = Auditor.file.read
        result = parse_log(raw_result)

        expect(result.timestamp).not_to eq(nil)
        expect(result.username).to eq(user_name)
        expect(result.user_ip).to eq(ip)
        expect(result.event).to eq("create")
        expect(result.record_type).to eq("Org Provision")
        expect(result.record[:message]).to eq(auditor_data[:record][:message])
      end
    end
  end

  describe "logging models changes" do
    let(:ip) { "172.18.0.1" }
    let(:user) { create(:user) }

    before(:each) do
      Auditor.current_user = AuditLogUser.new(user.username, ip)
    end

    without_transactional_fixtures do
      it "writes to the audit log on create" do
        Auditor.file = StringIO.new

        note = create(:note, user: user)

        Auditor.file.rewind

        raw_result = Auditor.file.read
        result = parse_log(raw_result)

        expect(result.timestamp).not_to eq(nil)
        expect(result.username).to eq(user.username)
        expect(result.user_ip).to eq(ip)
        expect(result.event).to eq("create")
        expect(result.record_type).to eq("Note")
        expect(result.record[:id]).to eq(note.id)
      end
    end

    without_transactional_fixtures do
      it "writes to the audit log on update" do
        note = create(:note, user: user)
        Auditor.file = StringIO.new
        note.update(title: "new title")

        Auditor.file.rewind

        raw_result = Auditor.file.read
        result = parse_log(raw_result)

        expect(result.timestamp).not_to eq(nil)
        expect(result.username).to eq(user.username)
        expect(result.user_ip).to eq(ip)
        expect(result.event).to eq("update")
        expect(result.record_type).to eq("Note")
        expect(result.record[:id]).to eq(note.id)
      end
    end

    without_transactional_fixtures do
      it "writes to the audit log on destroy" do
        note = create(:note, user: user)
        Auditor.file = StringIO.new
        note.destroy!

        Auditor.file.rewind

        raw_result = Auditor.file.read
        result = parse_log(raw_result)

        expect(result.timestamp).not_to eq(nil)
        expect(result.username).to eq(user.username)
        expect(result.user_ip).to eq(ip)
        expect(result.event).to eq("destroy")
        expect(result.record_type).to eq("Note")
        expect(result.record[:id]).to eq(note.id)
      end
    end

    without_transactional_fixtures do
      it "writes to the audit log on transaction" do
        Auditor.file = StringIO.new
        Note.transaction do
          note = create(:note, user: user)
          note.destroy!
        end

        Auditor.file.rewind

        raw_result = Auditor.file.read
        results = raw_result[0..-3].split(",\n")
        result1 = parse_log(results[0])
        result2 = parse_log(results[1])

        expect(result1.timestamp).not_to eq(nil)
        expect(result1.username).to eq(user.username)
        expect(result1.user_ip).to eq(ip)
        expect(result1.event).to eq("create")
        expect(result1.record_type).to eq("Note")
        expect(result1.record).not_to eq(nil)

        expect(result2.timestamp).not_to eq(nil)
        expect(result2.username).to eq(user.username)
        expect(result2.user_ip).to eq(ip)
        expect(result2.event).to eq("destroy")
        expect(result2.record_type).to eq("Note")
        expect(result2.record).not_to eq(nil)
      end
    end
  end

  describe "suppress audit logging" do
    without_transactional_fixtures do
      it "doesn't log events when suppressed" do
        Auditor.file = StringIO.new
        Auditor.suppress do
          note = create(:note)
        end

        Auditor.file.rewind
        result = Auditor.file.read
        expect(result).to eq ""
      end
    end
  end
end
