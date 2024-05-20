RSpec.describe InvitationSearcher do
  subject(:searcher) { described_class }

  describe "::call" do
    let(:first_name) { "John" }
    let(:last_name) { "Doe" }
    let(:email) { "email@example.com" }
    let(:not_exists) { "not_exists" }

    let!(:invitation) do
      invitation_params = {
        email: email,
        first_name: first_name,
        last_name: last_name,
        user_id: nil,
      }

      create(:invitation, invitation_params)
    end

    context "when query is blank" do
      let(:query) { nil }

      it "returns all relations" do
        expect(searcher.call(query).size).to eq(1)
      end
    end

    context "when query is given" do
      context "when query is any part of email" do
        it "returns matched results" do
          expect(searcher.call("mail").size).to eq(1)
          expect(searcher.call("@").size).to eq(1)
          expect(searcher.call(not_exists).size).to eq(0)
        end
      end

      context "when query is any part of first name" do
        it "returns matched results" do
          expect(searcher.call("jo").size).to eq(1)
          expect(searcher.call("hn").size).to eq(1)
          expect(searcher.call(not_exists).size).to eq(0)
        end
      end

      context "when query is any part of last name" do
        it "returns matched results" do
          expect(searcher.call("do").size).to eq(1)
          expect(searcher.call("oe").size).to eq(1)
          expect(searcher.call(not_exists).size).to eq(0)
        end
      end

      context "when exclude is given" do
        it "excludes given ids" do
          expect(searcher.call("mail", invitation.id).size).to eq(0)
        end
      end
    end
  end
end
