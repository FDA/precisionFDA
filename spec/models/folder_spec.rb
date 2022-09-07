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

RSpec.describe Folder, type: :model do
  let(:user) { create(:user) }
  let!(:folders) { create_list(:folder, 3, :private, user: user) }

  describe ".private_count" do
    subject(:private_count) { described_class.private_count(user) }

    let(:folder) { folders.first }

    context "when all folders are private" do
      context "when one folder is not in root" do
        it "returns correct count" do
          folder.update(parent_folder_id: folders.last.id)
          expect(private_count).to eq(3)
        end
      end

      context "when all folders are in root" do
        it "returns correct count" do
          expect(private_count).to eq(3)
        end
      end

      context "when one folder does not belong to user" do
        before { folder.update(user: create(:user)) }

        it "returns correct count" do
          expect(private_count).to eq(2)
        end
      end
    end

    context "when not all folders are private" do
      before { folder.update(scope: Scopes::SCOPE_PUBLIC) }

      it "returns correct count" do
        expect(private_count).to eq(2)
      end
    end
  end

  describe "#children" do
    let(:folder) { folders.first }

    before do
      (folders - [folder]).each { |f| f.update(parent_folder_id: folder.id) }

      create(:folder, :in_space, parent_folder_id: folder.id, user: user)
      create(:folder, :public, user: user)
      create(:folder, :private, user: user, parent_folder_id: folder.id)
    end

    it "returns child nodes" do
      expect(folder.children.count).to eq(3)
    end
  end
end
