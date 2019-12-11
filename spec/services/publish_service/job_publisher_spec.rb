require "rails_helper"

describe PublishService::JobPublisher do
  subject(:publisher) { described_class.new(context) }

  let(:user_id) { 1 }
  let(:space_id) { 123 }
  let(:job_project) { "project-job" }
  let(:space_project) { "project-space" }
  let(:simple_scope) { "simple-scope" }
  let(:space_scope) { "space-#{space_id}" }

  let(:job) { instance_double(Job, update!: nil, publishable_by?: true, project: job_project) }
  let(:user) { instance_double(User, id: user_id) }
  let(:not_publishable_job) { instance_double(Job, with_lock: nil, publishable_by?: false) }
  let(:context) { instance_double(Context, user: user, user_id: user_id, api: api) }
  let(:api) { instance_double("DNAnexusAPI", project_clone: nil) }
  let(:space) { instance_double("Space", id: space_id, project_for_user: space_project) }

  before do
    allow(SpaceEventService).to receive(:call)
    allow(job).to receive(:with_lock).and_yield
    allow(not_publishable_job).to receive(:with_lock).and_yield
  end

  describe ".publish" do
    it "obtains lock on job" do
      publisher.publish([job], simple_scope)

      expect(job).to have_received(:with_lock)
    end

    it "checks if job is publishable" do
      publisher.publish([job], simple_scope)

      expect(job).to have_received(:publishable_by?).with(context, simple_scope)
    end

    context "when job is publishable" do
      it "updates job's scope" do
        publisher.publish([job], simple_scope)

        expect(job).to have_received(:update!).with(scope: simple_scope)
      end

      context "when scope is a space" do
        before do
          allow(DNAnexusAPI).to receive(:new).and_return(api)
          allow(Space).to receive(:find_by!).and_return(space)
          publisher.publish([job], space_scope)
        end

        it "creates :job_added SpaceEvent" do
          expect(SpaceEventService).to have_received(:call).
            with(space_id, user_id, nil, job, :job_added)
        end
      end

      context "when scope is not a space" do
        it "doesn't create SpaceEvent" do
          expect(SpaceEventService).not_to have_received(:call)
        end
      end
    end

    it "returns number of published jobs" do
      expect(publisher.publish([job, not_publishable_job], simple_scope)).to eq(1)
    end
  end
end
