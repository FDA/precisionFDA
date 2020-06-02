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

RSpec.describe UserFile, type: :model do
  # rubocop:disable RSpec/AnyInstance
  let(:user) { create(:user, dxuser: "user") }
  let(:context) { Context.new(user.id, user.dxuser, SecureRandom.uuid, nil, nil) }
  let(:challenge_bot) { create(:user, dxuser: "challenge.bot") }
  let(:file_private_one) do
    create(
      :user_file,
      :private,
      user_id: context.user_id,
      parent_folder_id: nil,
      scoped_parent_folder_id: nil,
    )
  end
  let(:file_public) do
    create(
      :user_file,
      :public,
      user_id: context.user_id,
      parent_folder_id: nil,
      scoped_parent_folder_id: nil,
    )
  end

  describe "passes_consistency_check?" do
    context "when user_file is private" do
      subject(:passes_consistency_check) { file_private_one.passes_consistency_check?(user) }

      context "when user_file is independent and have proper projects with user" do
        before { file_private_one.update(project: user.private_files_project) }

        it "passes_consistency_check" do
          expect(passes_consistency_check).to be_truthy
        end
      end

      context "when user_file is independent and does not have proper projects with user" do
        before { file_private_one.update(project: user.public_files_project) }

        it "passes_consistency_check" do
          expect(passes_consistency_check).to be_falsey
        end
      end

      context "when user_file is not independent, a 'comparison' type and with proper project" do
        before do
          user.update(
            private_comparisons_project: "private-comparison-files-project\"",
          )
          file_private_one.update(
            parent_type: "Comparison",
            project: user.private_comparisons_project,
          )
        end

        it "passes_consistency_check" do
          expect(passes_consistency_check).to be_truthy
        end
      end

      context "when user_file is not independent and with unproper project" do
        before do
          file_private_one.update(
            parent_type: "Comparison",
            project: user.private_files_project,
          )
        end

        it "passes_consistency_check" do
          expect(passes_consistency_check).to be_falsey
        end
      end
    end

    context "when user_file is public" do
      subject(:passes_consistency_check) { file_public.passes_consistency_check?(user) }

      context "when user_file and user have proper projects" do
        before { file_public.update(project: user.public_files_project) }

        it "passes_consistency_check" do
          expect(passes_consistency_check).to be_truthy
        end
      end

      context "when user_file and user have different projects" do
        before { file_public.update(project: user.private_files_project) }

        it "passes_consistency_check" do
          expect(passes_consistency_check).to be_falsey
        end
      end
    end

    context "when user_file has space scope" do
      subject(:passes_consistency_check) { file_public.passes_consistency_check?(user) }

      let!(:space) { create(:space, :review, state: :active) }

      context "when user_file has state 'closed' and user have proper projects with space" do
        before do
          file_public.update(
            scope: space.uid,
            project: user.public_files_project,
          )
        end

        it "passes_consistency_check" do
          expect(passes_consistency_check).to be_truthy
        end
      end

      context "when user_file has state 'open' and have proper projects with space" do
        before do
          space.update(host_project: "host_project_for_user")
          allow(file_public).to receive(:space_object).
            and_return(space)
          allow(space).to receive(:project_for_user).
            with(user).and_return(space.host_project)
          file_public.update(
            scope: space.uid,
            project: space.host_project,
            state: "open",
          )
        end

        it "passes_consistency_check" do
          expect(passes_consistency_check).to be_truthy
        end
      end

      context "when user_file has state 'open' and does not have proper projects with space" do
        before do
          space.update(host_project: "host_project_for_user")
          allow(file_public).to receive(:space_object).
            and_return(space)
          allow(space).to receive(:project_for_user).
            with(user).and_return(space.host_project)
          file_public.update(scope: space.uid, state: "open")
        end

        it "passes_consistency_check" do
          expect(passes_consistency_check).to be_falsey
        end
      end
    end
  end

  describe "return parent_folder_name" do
    let(:folder_one) { create(:folder, :private) }
    let(:folder_two) { create(:folder) }
    let(:file_private_two) do
      create(:user_file, :private, parent_folder_id: folder_one.id, scoped_parent_folder_id: nil)
    end

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

    context "when file scope is in space" do
      let(:folder_name_one) { file_public_one.parent_folder_name("space") }

      context "when file is in public folder" do
        it "as a non root folder" do
          expect(folder_name_one).to eq(folder_two.name)
        end
      end
    end
  end

  describe "file_url" do
    context "when private file is not a challenge file" do
      let(:params) do
        {
          project: file_private_one.project,
          preauthenticated: true,
          filename: file_private_one.name,
          duration: 86_400,
        }
      end

      before do
        allow_any_instance_of(DNAnexusAPI).to receive(:call).
          with(file_private_one.dxid, "download", params).and_return("url")
        allow(Event::FileDownloaded).to receive(:create_for).
          with(file_private_one, context.user)
      end

      context "when inline param exists" do
        let(:inline) { "true" }

        it "returns url with inline param" do
          expect(file_private_one.file_url(context, inline)).to eq "url?inline"
        end
      end

      context "when inline param does not exists" do
        let(:inline) { nil }

        it "returns url without inline param" do
          expect(file_private_one.file_url(context, inline)).to eq "url"
        end
      end
    end

    context "when public file is a challenge card image" do
      let(:params) do
        {
          project: file_public.project,
          preauthenticated: true,
          filename: file_public.name,
          duration: 86_400,
        }
      end

      before do
        file_public.update(
          user_id: challenge_bot.id,
          parent_type: "User",
          parent_id: challenge_bot.id,
        )
        allow(User).to receive(:challenge_bot).and_return(challenge_bot)
        allow_any_instance_of(DNAnexusAPI).to receive(:call).
          with(file_public.dxid, "download", params).and_return("url")
        allow(Event::FileDownloaded).to receive(:create_for).
          with(file_public, context.user)
      end

      context "when inline param exists" do
        let(:inline) { "true" }

        it "returns url with inline param" do
          expect(file_public.file_url(context, inline)).to eq "url?inline"
        end
      end

      context "when inline param does not exists" do
        let(:inline) { nil }

        it "returns url without inline param" do
          expect(file_public.file_url(context, inline)).to eq "url"
        end
      end
    end
  end

  describe "submission_output?" do
    let(:challenge) { create(:challenge, :open, :skip_validate) }
    let(:job) { create(:job, user_id: user.id) }

    context "when private file is a Job output file" do
      before do
        file_private_one.update(parent_type: "Job", parent_id: job.id)
        create(:submission, challenge_id: challenge.id, user_id: user.id, job_id: job.id)
      end

      it "returns true" do
        expect(file_private_one.submission_output?).to be_truthy
      end
    end

    context "when private file is not a Job output file" do
      before { file_private_one.update(parent_type: "User", parent_id: challenge_bot.id) }

      it "returns false" do
        expect(file_private_one.submission_output?).to be_falsy
      end
    end
  end

  describe "challenge_card_image?" do
    before { allow(User).to receive(:challenge_bot).and_return(challenge_bot) }

    context "when public file is a challenge card image" do
      before do
        file_public.update(
          user_id: challenge_bot.id,
          parent_type: "User",
          parent_id: challenge_bot.id,
        )
      end

      it "file parent is a challenge_bot" do
        expect(file_public.parent).to eq(challenge_bot)
      end

      it "returns true" do
        expect(file_public.challenge_card_image?).to be_truthy
      end
    end

    context "when public file is not a challenge card image" do
      before { file_public.update(parent_type: "User", parent_id: user.id) }

      it "file parent is not a challenge_bot" do
        expect(file_public.parent).to eq(user)
      end

      it "returns false" do
        expect(file_public.challenge_card_image?).to be_falsy
      end
    end
  end

  describe "accessible_found_by" do
    before do
      allow(context).to receive(:logged_in?).and_return(true)
      allow(context).to receive(:user_id).and_return(context.user_id)
      allow(context).to receive(:user).and_return(user)
    end

    context "when file can be found" do
      it "return a proper file Object" do
        expect(described_class.accessible_found_by(context, file_private_one.uid)).
          to eq file_private_one
      end
    end

    context "when file can not be found" do
      let(:file_private_two) do
        create(:user_file, :private, parent_folder_id: nil, scoped_parent_folder_id: nil)
      end
      let(:user_file_query_result) { described_class.where(name: file_private_two.name) }

      before do
        allow(described_class).
          to receive(:accessible_by).
          with(context).
          and_return(user_file_query_result)
      end

      it "does not return a proper file Object" do
        expect(described_class.accessible_found_by(context, file_private_two.uid)).
          not_to eq file_private_one
      end
    end
  end

  describe "exist_refresh_state" do
    context "when file is accessible by user context and exists" do
      before do
        allow(context).to receive(:user).and_return(user)
        allow(context).to receive(:logged_in?).and_return(true)

        allow_any_instance_of(UserFile).
          to receive(:refresh_state).
          with(context).
          and_return(file_private_one)
      end

      it "returns a file object" do
        expect(UserFile.exist_refresh_state(context, file_private_one.uid)).to eq file_private_one
      end
    end

    context "when file is not accessible by context and exists" do
      before do
        allow(UserFile).
          to receive(:accessible_found_by).
          with(context, file_private_one.uid).
          and_return(nil)
      end

      it "does not return a file object" do
        expect(UserFile.exist_refresh_state(context, file_private_one.uid)).
          to eq nil
      end
    end
  end

  describe "refresh_state" do
    let(:challenge) { create(:challenge, :open, :skip_validate) }

    context "when private file is 'closed'" do
      it "does not return a file object" do
        expect(file_private_one.refresh_state(context)).to be nil
      end
    end

    context "when private file is 'open' and is not challenge file" do
      before do
        file_private_one.update(state: "open", parent_type: "User", parent_id: user.id)
        create(:submission, challenge_id: challenge.id, user_id: user.id)

        allow(User).to receive(:sync_file!).with(context, file_private_one.id)
      end

      it "returns a file object" do
        expect(file_private_one.challenge_file?).to be_falsy
        expect(file_private_one.refresh_state(context)).to eq(file_private_one)
      end

      it "returns a file object with a parent user" do
        expect(file_private_one.challenge_file?).to be_falsy
        expect(file_private_one.refresh_state(context).parent).to eq(user)
      end
    end

    context "when private file is 'open' and is a challenge file" do
      let(:challenge) { create(:challenge, :open, :skip_validate) }
      let(:job) { create(:job, user_id: user.id) }

      before do
        file_private_one.update(state: "open", parent_type: "Job", parent_id: job.id)
        create(:submission, challenge_id: challenge.id, user_id: user.id, job_id: job.id)

        allow(User).to receive(:sync_challenge_file!).with(file_private_one.id)
      end

      it "returns a file object" do
        expect(file_private_one.challenge_file?).to be_truthy
        expect(file_private_one.refresh_state(context)).to eq(file_private_one)
      end

      it "returns a file object with a parent job" do
        expect(file_private_one.challenge_file?).to be_truthy
        expect(file_private_one.refresh_state(context).parent).to eq(job)
      end
    end
  end

  describe "deletable?" do
    context "when a file is 'private'" do
      context "when a file has 'User' parent_type" do
        it "is deletable" do
          expect(file_private_one.deletable?).to be_truthy
        end
      end

      context "when a file has 'Job' parent_type" do
        before { file_private_one.update(parent_type: "Job") }

        it "is deletable" do
          expect(file_private_one.deletable?).to be_truthy
        end
      end
    end

    context "when a file is 'public'" do
      before { file_private_one.update(scope: "public") }

      context "when a file has 'Job' parent_type" do
        before { file_private_one.update(parent_type: "Job") }

        it "is deletable" do
          expect(file_private_one.deletable?).to be_truthy
        end
      end

      context "when a file has 'Comparison' parent_type" do
        before { file_private_one.update(parent_type: "Comparison") }

        it "is not deletable" do
          expect(file_private_one.deletable?).to be_falsy
        end
      end
    end

    context "when a file is 'private' and has 'User' parent_type" do
      let(:host_lead) { create(:user, dxuser: "user_1") }
      let(:guest_lead) { create(:user, dxuser: "user_2") }
      let(:verified) do
        create(
          :space,
          :verification,
          :verified,
          host_lead_id: host_lead.id,
          guest_lead_id: guest_lead.id,
        )
      end
      let(:non_verified) do
        create(
          :space,
          :verification,
          :non_verified,
          host_lead_id: host_lead.id,
          guest_lead_id: guest_lead.id,
        )
      end

      before { file_private_one.update(scope: "public") }

      context "when a file is in verified space" do
        before { file_private_one.update(scope: verified.uid) }

        it "is not deletable" do
          expect(file_private_one.deletable?).to be_falsy
        end
      end

      context "when a file is in non_verified space" do
        before { file_private_one.update(scope: non_verified.uid) }

        it "is deletable" do
          expect(file_private_one.deletable?).to be_truthy
        end
      end
    end
  end
  # rubocop:enable RSpec/AnyInstance
end
