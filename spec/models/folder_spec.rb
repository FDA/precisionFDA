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
  # rubocop:disable RSpec/AnyInstance
  let(:user) { create(:user, dxuser: "user") }
  let(:context) { Context.new(user.id, user.dxuser, SecureRandom.uuid, nil, nil) }

  let(:folder_private_one) do
    create(:folder, :private, parent_folder_id: nil, scoped_parent_folder_id: nil)
  end
  let(:folder_private_two) do
    create(
      :folder,
      :private,
      parent_folder_id: folder_private_one.id,
      scoped_parent_folder_id: nil,
    )
  end
  let(:folder_private_three) do
    create(
      :folder,
      :private,
      parent_folder_id: nil,
      scoped_parent_folder_id: nil,
    )
  end

  describe "return private_count of user's files" do
    subject(:private_folders_count) { described_class.private_count(user) }

    before do
      folder_private_one.update(user_id: user.id)
      folder_private_three.update(user_id: user.id)
    end

    let(:other_user_id) { FFaker::Random.rand(5) }

    context "when all folders scopes are private" do
      context "when one file is not in root" do
        before { folder_private_two.update(user_id: user.id) }

        it "returns correct count" do
          expect(private_folders_count).to eq(3)
        end
      end

      context "when all folders are in root" do
        before { folder_private_two.update(user_id: user.id, parent_folder_id: nil) }

        it "returns correct count" do
          expect(private_folders_count).to eq(3)
        end
      end

      context "when one folder does not belong to user" do
        before { folder_private_two.update(user_id: other_user_id) }

        it "returns correct count" do
          expect(private_folders_count).to eq(2)
        end
      end
    end

    context "when not all folders scopes are private" do
      before { folder_private_two.update(user_id: user.id, parent_folder_id: nil, scope: "public") }

      context "when one public file is in root folder" do
        it "returns correct count" do
          expect(private_folders_count).to eq(2)
        end
      end
    end
  end
  # rubocop:enable RSpec/AnyInstance
end
