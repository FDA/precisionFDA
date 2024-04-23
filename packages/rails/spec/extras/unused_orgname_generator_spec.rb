require "rails_helper"

describe UnusedOrgnameGenerator do
  let(:username) { "some.username" }
  let(:orgname) { "someusername" }

  context "when orgnamename is unused" do
    subject(:generator) { described_class.new(api) }

    let(:api) { instance_double("DNAnexusAPI", org_exists?: false) }

    it "calls API with provided orgname" do
      generator.call(username)

      expect(api).to have_received(:org_exists?).with("pfda..#{orgname}")
    end

    it "returns provided orgname" do
      expect(generator.call(username)).to eq(orgname)
    end
  end

  context "when orgname is used" do
    subject(:generator) { described_class.new(api) }

    let(:api) { instance_double("DNAnexusAPI") }
    let(:generated_orgname) { "#{orgname}.2" }

    before do
      allow(api).to receive(:org_exists?).and_return(true, false)
    end

    it "generates orgname and calls API with it until API says orgname is unused" do
      generator.call(username)

      expect(api).to have_received(:org_exists?).with("pfda..#{orgname}")
      expect(api).to have_received(:org_exists?).with("pfda..#{generated_orgname}")
    end

    it "returns generated orgname" do
      expect(generator.call(username)).to eq(generated_orgname)
    end
  end
end
