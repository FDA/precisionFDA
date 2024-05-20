require "rails_helper"

describe UnusedUsernameGenerator do
  let(:username) { "some.username" }

  context "when username is unused" do
    subject(:generator) { described_class.new(api) }

    let(:api) { instance_double("DNAnexusAPI", user_exists?: false) }

    it "calls API with provided username" do
      generator.call(username)

      expect(api).to have_received(:user_exists?).with(username)
    end

    it "returns provided username" do
      expect(generator.call(username)).to eq(username)
    end
  end

  context "when username is used" do
    subject(:generator) { described_class.new(api) }

    let(:api) { instance_double("DNAnexusAPI") }
    let(:generated_username) { "#{username}.2" }

    before do
      allow(api).to receive(:user_exists?).and_return(true, false)
    end

    it "generates username and calls API with it until API says username is unused" do
      generator.call(username)

      expect(api).to have_received(:user_exists?).with(username)
      expect(api).to have_received(:user_exists?).with(generated_username)
    end

    it "returns generated username" do
      expect(generator.call(username)).to eq(generated_username)
    end
  end
end
