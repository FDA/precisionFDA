require "rails_helper"

RSpec.describe CopyService::NodeCopier, type: :service do
  subject(:copier) { described_class.new(api: api, user: user) }

  let(:user) { create(:user) }
  let(:api) { instance_double(DNAnexusAPI, project_clone: nil) }

  describe "#copy" do
    let(:source_scope) { "private" }
    let(:parent_folder_column) { "parent_folder_id" }
    let(:file_one) { create(:user_file, name: "file_one", scope: source_scope, user: user) }
    let(:folder_one) { create(:folder, name: "folder_one", scope: source_scope, user: user) }

    let(:file_two) do
      create(
        :user_file,
        scope: source_scope,
        name: "file_two",
        user: user,
        parent_folder_column => folder_one.id,
      )
    end

    let(:folder_two) do
      create(
        :folder,
        name: "folder_two",
        scope: source_scope,
        user: user,
        parent_folder_column => folder_one.id,
      )
    end

    before do
      file_two.reload
      folder_two.reload
    end

    context "when copy from space to space" do
      let(:space) { create(:space, :review, :accepted, host_lead_id: user.id) }
      let(:source_space) { create(:space, :review, :accepted, host_lead_id: user.id) }
      let(:source_scope) { source_space.uid }
      let(:parent_folder_column) { "scoped_parent_folder_id" }

      it "copies files and folders recursively" do
        nodes = Node.where(id: [file_one.id, folder_one.id])

        expect { copier.copy(nodes, space.uid, nil) }.to change(space.nodes, :size).from(0).to(4)

        nodes_root = space.nodes.where(scoped_parent_folder_id: nil).pluck(:name)
        nodes_in_folder = space.folders.where(name: "folder_one").first.children.pluck(:name)

        expect(nodes_root).to contain_exactly("file_one", "folder_one")
        expect(nodes_in_folder).to contain_exactly("file_two", "folder_two")
      end

      it "copies folders recursively and sync files and subfolders if folder already exists" do
        nodes = Node.where(id: folder_one.id)
        copier.copy(nodes, space.uid, nil)

        create(:user_file, scope: source_scope, name: "added_file_one", user:, parent_folder_column => folder_one.id)
        added_folder_one = create(:folder, scope: source_scope, name: "added_folder_one", user:, parent_folder_column => folder_one.id)
        create(:user_file, scope: source_scope, name: "added_file_two", user:, parent_folder_column => added_folder_one.id)

        expect { copier.copy(nodes, space.uid, nil) }.to change(space.nodes, :size).from(3).to(6)

        copy_folder = space.folders.where(name: "folder_one").first
        nodes_in_folder = copy_folder.children.pluck(:name)
        nodes_in_copy_subfolder = copy_folder.children.where(name: "added_folder_one").first.children.pluck(:name)
        expect(nodes_in_folder).to contain_exactly("file_two", "folder_two", "added_file_one", "added_folder_one")
        expect(nodes_in_copy_subfolder).to contain_exactly("added_file_two")
      end

      it "copies folders recursively and copy files and folders to a subfolder" do
        nodes = Node.where(id: folder_one.id)
        copier.copy(nodes, space.uid, nil)

        added_file_one = create(:user_file, scope: source_scope, name: "added_file_one", user:, parent_folder_column => nil)
        added_folder_one = create(:folder, scope: source_scope, name: "added_folder_one", user:, parent_folder_column => nil)
        create(:user_file, scope: source_scope, name: "added_file_two", user:, parent_folder_column => added_folder_one.id)

        space_folder_two = space.folders.where(name: "folder_one").first.children.where(name: "folder_two").first
        expect { copier.copy([added_file_one, added_folder_one], space.uid, space_folder_two.id) }.to change(space.nodes, :size).from(3).to(6)

        nodes_in_copy_folder = space_folder_two.children.pluck(:name)
        nodes_in_copy_subfolder = space_folder_two.children.where(name: "added_folder_one").first.children.pluck(:name)
        expect(nodes_in_copy_folder).to contain_exactly("added_file_one", "added_folder_one")
        expect(nodes_in_copy_subfolder).to contain_exactly("added_file_two")
      end
    end

    context "when copy from space to public scope" do
      let(:source_space) { create(:space, :review, :accepted, host_lead_id: user.id) }
      let(:source_scope) { source_space.uid }
      let(:parent_folder_column) { "scoped_parent_folder_id" }

      it "copies files and folders recursively" do
        nodes = Node.where(id: [file_one.id, folder_one.id])

        result_nodes = Node.where(scope: "public")

        expect { copier.copy(nodes, "public", nil) }.to change(result_nodes, :size).from(0).to(4)

        nodes_root = result_nodes.where(parent_folder_id: nil).pluck(:name)
        nodes_in_folder = result_nodes.where(name: "folder_one").first.children.pluck(:name)

        expect(nodes_root).to contain_exactly("file_one", "folder_one")
        expect(nodes_in_folder).to contain_exactly("file_two", "folder_two")
      end
    end

    context "when copy from private to public scope" do
      let(:source_scope) { "private" }
      let(:parent_folder_column) { "parent_folder_id" }

      it "copies files and folders recursively" do
        nodes = user.nodes.where(id: [file_one.id, folder_one.id])

        result_nodes = Node.where(scope: "public")

        expect { copier.copy(nodes, "public", nil) }.to change(result_nodes, :size).from(0).to(4)

        nodes_root = result_nodes.where(parent_folder_id: nil).pluck(:name)
        nodes_in_folder = result_nodes.where(name: "folder_one").first.children.pluck(:name)

        expect(nodes_root).to contain_exactly("file_one", "folder_one")
        expect(nodes_in_folder).to contain_exactly("file_two", "folder_two")
      end
    end
  end
end
