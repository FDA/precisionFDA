RSpec.describe Api::SpaceRequestsController, type: :controller do
  let(:host_lead) { create(:user, dxuser: "host_lead") }
  let(:guest_lead) { create(:user, dxuser: "guest_lead") }

  let(:space) do
    create(:space, :review, :active, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id)
  end

  describe "POST lock" do
    context "when user is authenticated" do
      before do
        authenticate!(host_lead)
      end

      context "when user isn't allowed to lock a space" do
        it "responds with forbidden" do
          allow(SpaceRequestPolicy).to receive(:can_lock?).and_return(false)

          post :lock, params: { id: space.id }

          expect(response).to be_forbidden
        end
      end

      context "when user is allowed to lock a space" do
        before do
          allow(SpaceRequestPolicy).to receive(:can_lock?).and_return(true)

          post :lock, params: { id: space.id }
        end

        it "locks a space" do
          expect { space.reload }.to change(space, :locked?).from(false).to(true)
          expect(space.confidential_spaces).to all(be_locked)
          expect(response).to be_successful
        end
      end
    end

    context "when user is not authenticated" do
      before do
        post :lock, params: { id: space.id }
      end

      it_behaves_like "unauthenticated"
    end
  end

  describe "POST unlock" do
    context "when user is authenticated" do
      before do
        authenticate!(host_lead)
      end

      context "when user isn't allowed to unlock a space" do
        it "responds with forbidden" do
          allow(SpaceRequestPolicy).to receive(:can_unlock?).and_return(false)
          post :unlock, params: { id: space.id }

          expect(response).to be_forbidden
        end
      end

      context "when user is allowed to unlock a space" do
        let(:space) do
          create(:space, :review, :locked, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id)
        end

        before do
          allow(SpaceRequestPolicy).to receive(:can_unlock?).and_return(true)

          post :unlock, params: { id: space.id }
        end

        it "unlocks a space" do
          expect { space.reload }.to change(space, :active?).from(false).to(true)

          expect(space.confidential_spaces).to all(be_active)
          expect(response).to be_successful
        end
      end
    end

    context "when user is not authenticated" do
      before do
        post :unlock, params: { id: space.id }
      end

      it_behaves_like "unauthenticated"
    end
  end

  describe "POST delete" do
    context "when user is authenticated" do
      before do
        authenticate!(host_lead)
      end

      context "when user isn't allowed to delete a space" do
        it "responds with forbidden" do
          allow(SpaceRequestPolicy).to receive(:can_delete?).and_return(false)

          post :delete, params: { id: space.id }

          expect(response).to be_forbidden
        end
      end

      context "when user is allowed to delete a space" do
        let(:space) do
          create(:space, :review, :locked, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id)
        end

        before do
          membership = instance_double(SpaceMembership)
          allow(SpaceMembership).to receive(:new_by_admin).and_return(membership)
          allow(SpaceRequestPolicy).to receive(:can_delete?).and_return(true)
          allow(SpaceService::Delete).to receive(:call).with(space, membership)

          post :delete, params: { id: space.id }
        end

        it "deletes a space" do
          expect(response).to be_successful
        end
      end
    end

    context "when user is not authenticated" do
      before do
        post :delete, params: { id: space.id }
      end

      it_behaves_like "unauthenticated"
    end
  end
end
