# == Schema Information
#
# Table name: notes
#
#  id         :integer          not null, primary key
#  title      :string(255)
#  content    :text(65535)
#  user_id    :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  scope      :string(255)
#  note_type  :string(255)
#

require "rails_helper"

RSpec.describe Note, type: :model do
  let(:user) { create(:user, dxuser: "user") }
  let(:note) { create(:note, user_id: user.id) }
  let(:file_private_one) do
    create(
      :user_file,
      :private,
      user_id: user.id,
      parent_folder_id: nil,
      scoped_parent_folder_id: nil,
    )
  end
  let(:file_private_two) do
    create(
      :user_file,
      :private,
      user_id: user.id,
      parent_folder_id: nil,
      scoped_parent_folder_id: nil,
    )
  end
  let(:file_private_three) do
    create(
      :user_file,
      :private,
      user_id: user.id,
      parent_folder_id: nil,
      scoped_parent_folder_id: nil,
    )
  end
  let(:file_public) do
    create(
      :user_file,
      :public,
      user_id: user.id,
      parent_folder_id: nil,
      scoped_parent_folder_id: nil,
    )
  end
  let(:attachment_one) do
    create(:attachment, note_id: note.id, item_id: file_private_one.id)
  end
  let(:attachment_two) do
    create(:attachment, note_id: note.id, item_id: file_private_two.id)
  end
  let(:attachment_three) do
    create(:attachment, note_id: note.id, item_id: file_private_three.id)
  end

  describe "files" do
    subject(:note_files) { note.files }

    context "when all attachments are of 'UserFile' item_type" do
      before do
        attachment_one.update(item_type: "UserFile")
        attachment_two.update(item_type: "UserFile")
        attachment_three.update(item_type: "UserFile")
      end

      it "note has all attachments created" do
        expect(note.attachments.count).to eq Attachment.all.count
      end

      it "returns all files attached" do
        expect(note_files.count).to eq Node.all.count
      end
    end

    context "when all attachments are of 'Node' item_type" do
      before do
        attachment_one.update(item_type: "Node")
        attachment_two.update(item_type: "Node")
        attachment_three.update(item_type: "Node")
      end

      it "note has all attachments created" do
        expect(note.attachments.count).to eq Attachment.all.count
      end

      it "returns all files attached" do
        expect(note_files.count).to eq Node.all.count
      end
    end

    context "when attachments are of both item_types" do
      before do
        attachment_one.update(item_type: "Node")
        attachment_two.update(item_type: "UserFile")
        attachment_three.update(item_type: "Node")
      end

      it "note has all attachments created" do
        expect(note.attachments.count).to eq Attachment.all.count
      end

      it "returns all files attached" do
        expect(note_files.count).to eq Node.all.count
      end
    end

    context "when attachments are both item_types" do
      before do
        attachment_one.update(item_type: "Node")
        attachment_two.update(item_type: "UserFile")
        attachment_three.update(item_type: "Node")
      end

      context "when one file has not acceptable parent_type" do
        before do
          file_private_one.update(parent_type: "App")
        end

        it "note has all attachments created" do
          expect(note.attachments.count).to eq Attachment.all.count
        end

        it "returns files attached, except one file" do
          expect(note_files.count).to eq Node.all.count - 1
        end
      end
    end
  end
end
