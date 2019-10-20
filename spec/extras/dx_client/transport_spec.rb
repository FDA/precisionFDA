require "rails_helper"

describe DXClient::Transport do
  describe "#call" do
    subject(:client) { described_class.new(auth_token, api_server) }

    let(:auth_token) { "some-token" }
    let(:api_server) { "https://some.unreachable.server/" }
    let(:uri) { "#{api_server}#{dx_subject}/#{dx_method}" }
    let(:dx_subject) { "some-subject" }
    let(:dx_method) { "some-method" }
    let(:payload) { { someKey: "someValue" } }

    before do
      stub_request(:post, uri).to_return(body: {}.to_json)
    end

    it "builds URL and sends POST request to provided server" do
      client.call(dx_subject, dx_method)

      expect(WebMock).to have_requested(:post, uri)
    end

    it "sends proper Authorization and Content-Type headers" do
      client.call(dx_subject, dx_method)

      expect(WebMock).to have_requested(:post, uri).
        with(headers: {
          "Authorization" => "Bearer #{auth_token}",
          "Content-Type" => "application/json",
        })
    end

    context "when payload is provided" do
      it "sends payload as JSON body" do
        client.call(dx_subject, dx_method, payload)

        expect(WebMock).to have_requested(:post, uri).with(body: payload.to_json)
      end
    end

    context "when payload is not provided" do
      it "sends empty JSON object as payload" do
        client.call(dx_subject, dx_method)

        expect(WebMock).to have_requested(:post, uri).with(body: {}.to_json)
      end
    end
  end
end
