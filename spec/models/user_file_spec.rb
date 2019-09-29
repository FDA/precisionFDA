require "rails_helper"

RSpec.describe UserFile, type: :model do
  let(:folder_one) { create(:folder, :private) }
  let(:file_one) do
    create(:user_file, :private, parent_folder_id: nil, scoped_parent_folder_id: nil)
  end
  let(:file_two) do
    create(:user_file, :private, parent_folder_id: folder_one.id, scoped_parent_folder_id: nil)
  end

  describe "return parent_folder_name" do
    let(:folder_name_one) { file_one.parent_folder_name("private") }
    let(:folder_name_two) { file_two.parent_folder_name("private") }

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
end
