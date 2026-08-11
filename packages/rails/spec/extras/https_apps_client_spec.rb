require "rails_helper"

RSpec.describe HttpsAppsClient do
  describe "#auth_headers" do
    after { RequestContext.end_request }

    it "uses an explicit auth key instead of request-context credentials" do
      RequestContext.begin_request(1, "submitter", "submitter-token", { "Authorization" => "Key request-context-key" })

      client = described_class.new(auth_key: "explicit-auth-key")

      expect(client.send(:auth_headers)).to eq({ "Authorization" => "Key explicit-auth-key" })
    end

    it "forwards request-context authentication headers unchanged" do
      headers = {
        "Cookie" => "_precision-fda_session=encrypted-session",
        "Authorization" => "Key request-context-key",
      }
      RequestContext.begin_request(1, "submitter", "submitter-token", headers)

      expect(described_class.new.send(:auth_headers)).to eq(headers)
    end
  end
end
