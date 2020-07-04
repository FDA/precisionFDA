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

        expect { copier.copy(nodes, space.uid) }.to change(space.nodes, :size).from(0).to(4)

        nodes_root = space.nodes.where(scoped_parent_folder_id: nil).pluck(:name)
        nodes_in_folder = space.folders.where(name: "folder_one").first.children.pluck(:name)

        expect(nodes_root).to contain_exactly("file_one", "folder_one")
        expect(nodes_in_folder).to contain_exactly("file_two", "folder_two")
      end
    end

    context "when copy from space to public scope" do
      let(:source_space) { create(:space, :review, :accepted, host_lead_id: user.id) }
      let(:source_scope) { source_space.uid }
      let(:parent_folder_column) { "scoped_parent_folder_id" }

      it "copies files and folders recursively" do
        nodes = Node.where(id: [file_one.id, folder_one.id])

        result_nodes = Node.where(scope: "public")

        expect { copier.copy(nodes, "public") }.to change(result_nodes, :size).from(0).to(4)

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

        expect { copier.copy(nodes, "public") }.to change(result_nodes, :size).from(0).to(4)

        nodes_root = result_nodes.where(parent_folder_id: nil).pluck(:name)
        nodes_in_folder = result_nodes.where(name: "folder_one").first.children.pluck(:name)

        expect(nodes_root).to contain_exactly("file_one", "folder_one")
        expect(nodes_in_folder).to contain_exactly("file_two", "folder_two")
      end
    end

    context "when files and folders already exist in the destination scope" do
      pending "doesn't copy such nodes"
    end
  end
end
