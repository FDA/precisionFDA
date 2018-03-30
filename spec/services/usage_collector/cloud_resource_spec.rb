require 'rails_helper'

RSpec.describe UsageCollector::CloudResource do

  let(:user) { create(:user, dxuser: "user_1") }

  around(:each) do |example|
    travel_to(Time.zone.parse("01.01.2018 12:00")) do
      example.run
    end
  end

  describe "#consumption" do

    before do
      Event::FileCreated.new(dxuser: user.dxuser, file_size: 80, created_at: Time.zone.now).save
      Event::FileCreated.new(dxuser: user.dxuser, file_size: 20, created_at: Time.zone.now).save
      Event::FileDeleted.new(dxuser: user.dxuser, file_size: -25, created_at: 20.hours.since).save
      Event::FileDeleted.new(dxuser: user.dxuser, file_size: -25, created_at: 20.hours.since).save
    end

    it "returns 0" do
      expect(
        described_class.consumption(10.hours.ago, Time.zone.now, user)
      ).to eq(0)
    end

    it "returns 1000" do
      expect(
        described_class.consumption(Time.zone.now, 10.hours.since, user)
      ).to eq(1000)
    end

    it "returns 1000" do
      expect(
        described_class.consumption(10.hours.since, 20.hours.since, user)
      ).to eq(1000)
    end

    it "returns 500" do
      expect(
        described_class.consumption(20.hours.since, 30.hours.since, user)
      ).to eq(500)
    end

    it "returns 549" do
      expect(
        described_class.consumption(20.hours.since, 30.hours.since + 59.minutes, user)
      ).to eq(549)
    end

  end
end
