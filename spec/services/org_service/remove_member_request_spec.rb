RSpec.describe OrgService::RemoveMemberRequest do
  subject(:request_creator) { described_class.new(policy) }

  let(:policy) { double }
  let(:org) { build(:org) }
  let(:initiator) { build(:user) }
  let(:member) { build(:user) }

  describe "#call" do
    context "when policy is not satisfied" do
      before do
        allow(policy).to receive(:satisfied?).and_return(false)
      end

      it "raises RuntimeError" do
        expect { request_creator.call(org, initiator, member) }.to raise_error(RuntimeError)
      end
    end

    context "when policy is satisfied" do
      before do
        allow(policy).to receive(:satisfied?).and_return(true)
        allow(OrgActionRequest).to receive(:find_by)
      end

      it "doesn't raise error" do
        expect { request_creator.call(org, initiator, member) }.not_to raise_error
      end

      it "checks if request already exists" do
        request_creator.call(org, initiator, member)

        expect(OrgActionRequest).
          to(have_received(:find_by).
            with(
              initiator: initiator,
              org: org,
              member: member,
              action_type: OrgActionRequest::Type::REMOVE_MEMBER,
            ))
      end

      context "when request already exists" do
        before do
          allow(OrgActionRequest).to receive(:find_by).and_return(true)
        end

        it "raises RuntimeError" do
          expect { request_creator.call(org, initiator, member) }.to raise_error(RuntimeError)
        end
      end

      context "when request doesn't exist" do
        before do
          allow(OrgActionRequest).to receive(:find_by).and_return(nil)
          allow(OrgActionRequest).to receive(:create!)
        end

        it "doesn't raise error" do
          expect { request_creator.call(org, initiator, member) }.not_to raise_error
        end

        it "saves request in database" do
          request_creator.call(org, initiator, member)

          expect(OrgActionRequest).
            to(have_received(:create!).
              with(
                initiator: initiator,
                org: org,
                member: member,
                action_type: OrgActionRequest::Type::REMOVE_MEMBER,
                state: OrgActionRequest::State::NEW,
              ))
        end
      end
    end
  end
end
