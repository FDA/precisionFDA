require "rails_helper"

RSpec.describe UserFile, type: :model do
  describe "return parent_folder_name" do
    let(:folder_one) { create(:folder, :private) }
    let(:file_private_one) do
      create(:user_file, :private, parent_folder_id: nil, scoped_parent_folder_id: nil)
    end
    let(:file_private_two) do
      create(:user_file, :private, parent_folder_id: folder_one.id, scoped_parent_folder_id: nil)
    end

    let(:folder_two) { create(:folder) }
    let(:file_public_one) do
      create(:user_file, :public, parent_folder_id: nil, scoped_parent_folder_id: folder_two.id)
    end

    context "when scope is private" do
      let(:folder_name_one) { file_private_one.parent_folder_name("private") }
      let(:folder_name_two) { file_private_two.parent_folder_name("private") }

      context "when file is in root folder" do
        it "as a root folder" do
          expect(folder_name_one).to eq("/")
        end
      end

      context "when file is in non root folder" do
        it "as a non root folder" do
          expect(folder_name_two).to eq(folder_one.name)
        end
      end
    end

    context "when scope is not private" do
      let(:folder_name_one) { file_public_one.parent_folder_name("public") }

      context "when file is in public folder" do
        it "as a non root folder" do
          expect(folder_name_one).to eq(folder_two.name)
        end
      end
    end
  end
end
