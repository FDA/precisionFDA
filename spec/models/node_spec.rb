# == Schema Information
#
# Table name: nodes
#
#  id                      :integer          not null, primary key
#  dxid                    :string(255)
#  project                 :string(255)
#  name                    :string(255)
#  state                   :string(255)
#  description             :text(65535)
#  user_id                 :integer          not null
#  file_size               :bigint
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  parent_id               :integer
#  parent_type             :string(255)
#  scope                   :string(255)
#  parent_folder_id        :integer
#  sti_type                :string(255)
#  scoped_parent_folder_id :integer
#  uid                     :string(255)
#

require "rails_helper"

RSpec.describe Node, type: :model do
  let(:user) { create(:user, dxuser: "user") }
  let(:file_one) do
    create(
      :user_file,
      :private,
      user_id: user.id,
      parent_folder_id: nil,
      scoped_parent_folder_id: nil,
      )
  end
  let(:user_two) { create(:user, dxuser: "user2") }
  let(:file_two) do
    create(
      :user_file,
      :private,
      user_id: user_two.id,
      parent_folder_id: nil,
      scoped_parent_folder_id: nil,
    )
  end

  describe "permitted_in_space_context" do
    subject(:permitted_in_space_context) do
      described_class.permitted_in_space_context(space_context)
    end

    let!(:space) { create(:space, :review, state: :active) }

    let(:context) { Context.new(user.id, user.dxuser, SecureRandom.uuid, nil, nil) }
    let(:nodes_ids) { [file_one.id] }
    let(:space_context) { { context: context, space: space, nodes_ids: nodes_ids } }

    before do
      file_one.update(scope: space.uid)
      allow(space).to receive(:contributor_permission).
        with(context).and_return(true)
      allow(context).to receive(:user).
        and_return(user)
      allow(user).to receive(:space_uids).
        and_return([space.uid])
    end

    context "when context user is a contributor" do
      before do
        allow(space).to receive(:contributor_permission).
          with(context).and_return(true)
      end

      it "returns an array of a node object, permitted for space contributor context" do
        expect(permitted_in_space_context).to eq [file_one]
      end
    end

    context "when context user is a viewer and file is not belongs to him" do
      before do
        file_one.update(user_id: 2)
        allow(space).to receive(:contributor_permission).
          with(context).and_return(false)
      end

      it "returns an empty array" do
        expect(permitted_in_space_context).to eq []
      end
    end

    context "when context user is a viewer and file belongs to him" do
      let(:nodes_ids) { [file_two.id] }

      before do
        file_two.update(
          user_id: context.user_id,
          scope: space.uid,
        )
        allow(space).to receive(:contributor_permission).
          with(context).and_return(false)
      end

      it "returns an array with a node object, permitted for space viewer context" do
        expect(permitted_in_space_context).to eq [file_two]
      end
    end
  end

  describe "sin_comparison_inputs" do
    subject(:sin_comparison_inputs) { described_class.sin_comparison_inputs(ids) }

    let(:folder_one) { create(:folder, :private) }
    let(:file_two) do
      create(:user_file, :private, parent_folder_id: folder_one.id, scoped_parent_folder_id: nil)
    end
    let(:ids) { [file_one.id, file_two.id, folder_one.id] }

    context "when all nodes are 'private'" do
      context "when files are not comparison inputs" do
        it "returns a previous ids array without exclusions" do
          expect(sin_comparison_inputs).to eq ids
        end
      end

      context "when file_one is a comparison input" do
        let(:comparison) { create(:comparison, user_id: user.id) }
        let(:comparison_input) do
          create(
            :comparison_input,
            comparison_id: comparison.id,
            user_file_id: file_one.id,
          )
        end
        let(:excluded_ids) { ids - [file_one.id] }

        it "returns an ids array without id of comparison input file_one" do
          expect(comparison_input.user_file.id).to eq file_one.id
          expect(sin_comparison_inputs).to eq excluded_ids
        end
      end
    end

    context "when all nodes are 'public'" do
      before do
        file_one.update(scope: :public)
        file_two.update(scope: :public)
        folder_one.update(scope: :public)
      end

      context "when files are not comparison inputs" do
        it "returns a previous ids array without exclusions" do
          expect(sin_comparison_inputs).to eq ids
        end
      end

      context "when file_two is a comparison input" do
        let(:comparison) { create(:comparison, user_id: user.id, scope: :public) }
        let(:comparison_input) do
          create(
            :comparison_input,
            comparison_id: comparison.id,
            user_file_id: file_two.id,
            )
        end
        let(:excluded_ids) { ids - [file_two.id] }

        it "returns an ids array without id of comparison input file_two" do
          expect(comparison_input.user_file.id).to eq file_two.id
          expect(sin_comparison_inputs).to eq excluded_ids
        end
      end
    end

    context "when all nodes are in space" do
      let(:guest_lead) { create(:user, dxuser: "user_2") }
      let(:verified) do
        create(
          :space,
          :verification,
          :verified,
          host_lead_id: user.id,
          guest_lead_id: guest_lead.id,
          )
      end
      let(:space_scope) { verified.uid }

      before do
        file_one.update(scope: space_scope)
        file_two.update(scope: space_scope)
        folder_one.update(scope: space_scope)
      end

      context "when files are not comparison inputs" do
        it "returns a previous ids array without exclusions" do
          expect(sin_comparison_inputs).to eq ids
        end
      end

      context "when file_two is a comparison input" do
        let(:comparison) { create(:comparison, user_id: user.id, scope: space_scope) }
        let(:comparison_input) do
          create(
            :comparison_input,
            comparison_id: comparison.id,
            user_file_id: file_two.id,
            )
        end
        let(:excluded_ids) { ids - [file_two.id] }

        it "returns an ids array without id of comparison input file_two" do
          expect(comparison_input.user_file.id).to eq file_two.id
          expect(sin_comparison_inputs).to eq excluded_ids
        end
      end
    end
  end
end
