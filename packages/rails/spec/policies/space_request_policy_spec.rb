describe SpaceRequestPolicy do
  subject(:policy) { described_class }

  let(:space) { build(:space) }
  let(:user) { build(:user) }

  describe ".can_lock?" do
    context "when space is not active" do
      before do
        allow(space).to receive(:active?).and_return(false)
        allow(space).to receive(:shared?).and_return(true)
        allow(user).to receive(:review_space_admin?).and_return(true)
      end

      it "returns false" do
        expect(policy).not_to be_can_lock(user, space)
      end
    end

    context "when space is not shared" do
      before do
        allow(space).to receive(:active?).and_return(true)
        allow(space).to receive(:shared?).and_return(false)
        allow(user).to receive(:review_space_admin?).and_return(true)
      end

      it "returns false" do
        expect(policy).not_to be_can_lock(user, space)
      end
    end

    context "when user is not review space admin" do
      before do
        allow(space).to receive(:active?).and_return(true)
        allow(space).to receive(:shared?).and_return(true)
        allow(user).to receive(:review_space_admin?).and_return(false)
      end

      it "returns false" do
        expect(policy).not_to be_can_lock(user, space)
      end
    end

    context "when user is review space admin, space is shared and is activr" do
      before do
        allow(space).to receive(:active?).and_return(true)
        allow(space).to receive(:shared?).and_return(true)
        allow(user).to receive(:review_space_admin?).and_return(true)
      end

      it "returns true" do
        expect(policy).to be_can_lock(user, space)
      end
    end
  end

  shared_examples "locked space" do
    context "when space is not locked" do
      before do
        allow(space).to receive(:locked?).and_return(false)
        allow(space).to receive(:shared?).and_return(true)
        allow(user).to receive(:review_space_admin?).and_return(true)
      end

      it "returns false" do
        expect(policy).not_to be_can_unlock(user, space)
      end
    end

    context "when space is not shared" do
      before do
        allow(space).to receive(:locked?).and_return(true)
        allow(space).to receive(:shared?).and_return(false)
        allow(user).to receive(:review_space_admin?).and_return(true)
      end

      it "returns false" do
        expect(policy).not_to be_can_unlock(user, space)
      end
    end

    context "when user is not review space admin" do
      before do
        allow(space).to receive(:locked?).and_return(true)
        allow(space).to receive(:shared?).and_return(true)
        allow(user).to receive(:review_space_admin?).and_return(false)
      end

      it "returns false" do
        expect(policy).not_to be_can_unlock(user, space)
      end
    end

    context "when user is review space admin, space is shared and is locked" do
      before do
        allow(space).to receive(:locked?).and_return(true)
        allow(space).to receive(:shared?).and_return(true)
        allow(user).to receive(:review_space_admin?).and_return(true)
      end

      it "returns true" do
        expect(policy).to be_can_unlock(user, space)
      end
    end
  end

  # rubocop:disable RSpec/RepeatedExampleGroupBody
  describe ".can_unlock?" do
    include_examples "locked space"
  end

  describe ".can_delete?" do
    include_examples "locked space"
  end
  # rubocop:enable RSpec/RepeatedExampleGroupBody
end
