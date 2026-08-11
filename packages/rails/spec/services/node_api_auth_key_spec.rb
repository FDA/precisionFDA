require "rails_helper"

RSpec.describe NodeApiAuthKey, type: :service do
  def decrypt(key)
    JSON.parse(Rails.configuration.encryptor.decrypt_and_verify(key)).fetch("context")
  end

  describe ".generate" do
    let(:user) { create(:user) }

    it "encrypts the acting user identity together with the supplied platform token" do
      key = described_class.generate(user:, token: "platform-token")
      context = decrypt(key)

      expect(context).to include(
        "user_id" => user.id,
        "username" => user.dxuser,
        "token" => "platform-token",
        "org_id" => user.org_id,
      )
    end

    it "defaults the expiration to the requested duration" do
      travel_to(Time.zone.parse("2026-07-27 12:00:00 UTC")) do
        key = described_class.generate(user:, token: "platform-token", duration: 2.hours)

        expect(decrypt(key)["expiration"]).to eq(Time.now.to_i + 2.hours.to_i)
      end
    end

    it "clamps the expiration to the platform token expiration when it is sooner" do
      travel_to(Time.zone.parse("2026-07-27 12:00:00 UTC")) do
        platform_expiration = Time.now.to_i + 10.minutes.to_i
        key = described_class.generate(user:, token: "platform-token", expiration: platform_expiration)

        expect(decrypt(key)["expiration"]).to eq(platform_expiration)
      end
    end

    it "supports act-as flows where the token belongs to another principal" do
      key = described_class.generate(user:, token: "challenge-bot-token")
      context = decrypt(key)

      expect(context["user_id"]).to eq(user.id)
      expect(context["token"]).to eq("challenge-bot-token")
    end
  end

  describe ".from_context" do
    let(:user) { create(:user) }

    let(:context) do
      Context.new(user.id, user.dxuser, "session-token", Time.now.to_i + 1.week.to_i, user.org_id)
    end

    it "encrypts the session context fields" do
      key = described_class.from_context(context)
      decrypted = decrypt(key)

      expect(decrypted).to include(
        "user_id" => user.id,
        "username" => user.dxuser,
        "token" => "session-token",
        "org_id" => user.org_id,
      )
    end

    it "clamps the expiration to the requested duration" do
      travel_to(Time.zone.parse("2026-07-27 12:00:00 UTC")) do
        key = described_class.from_context(context, duration: 1.day)

        expect(decrypt(key)["expiration"]).to eq(Time.now.to_i + 1.day.to_i)
      end
    end
  end
end
