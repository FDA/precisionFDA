require 'rails_helper'

RSpec.describe TasksController, type: :controller do
  let(:host_lead) { create(:user, dxuser: "user_1") }
  let(:guest_lead) { create(:user, dxuser: "user_2") }
  let(:space) { create(:space, :group, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id) }
  let(:task) { create(:task, space: space) }
  let(:task_params) do
    {
      name: "name",
      description: "description",
      assignee_id: guest_lead.id,
    }
  end

  describe "task actions" do
    before { authenticate!(host_lead) }

    context "by host_admin" do
      it "returns json with task info" do
        get :task, space_id: space, id: task
        res = JSON.parse(response.body)

        expect(res["name"]).to eq(task.name)
        expect(res["completion_deadline_f"]).to eq(task.completion_deadline.strftime("%m/%d/%Y"))
        expect(res["comments_count"]).to eq(task.root_comments.size)
      end

      it "shows task" do
        get :show, space_id: space, id: task

        expect(response).to be_successful
      end

      it "creates task" do
        post :create, space_id: space, task: task_params

        expect(Task.count).to eq(1)
      end

      it "updates task" do
        patch :update, space_id: space, id: task, task: task_params.merge(name: "lark")

        expect(Task.last.name).to eq("lark")
      end

      it "destroys task" do
        post :destroy, space_id: space, id: task

        expect(Task.count).to eq(0)
      end

      it "makes task accepted" do
        post :accept, space_id: space, task_ids: [task.id]

        expect(Task.last.accepted?).to eq(true)
      end

      it "makes task declined" do
        post :decline, space_id: space, task_ids: [task.id]

        expect(Task.last.declined?).to eq(true)
      end

      it "makes task completed" do
        task.accepted!
        post :complete, space_id: space, task_ids: [task.id]

        expect(Task.last.completed?).to eq(true)
      end

      it "makes task active again" do
        task.completed!
        post :make_active, space_id: space, task_ids: [task.id]

        expect(Task.last.accepted?).to eq(true)
      end

      it "reassignes a task to given user" do
        post :reassign, space_id: space, id: task, task: { assignee_id: host_lead.id }

        expect(Task.last.assignee.dxuser).to eq(host_lead.dxuser)
      end

      it "renders new template with a copy of the task" do
        post :copy, space_id: space, id: task

        expect(response).to be_successful
        expect(response).to render_template("new")
      end

      it "reopens task for source user" do
        task.completed!

        post :reopen, space_id: space, task_ids: [task.id]

        expect(Task.last.open?).to eq(true)
      end

      it "doesn't allow to reopen task for assignee" do
        task.completed!
        authenticate!(guest_lead)

        post :reopen, space_id: space, task_ids: [task.id]

        expect(Task.last.open?).to eq(false)
      end
    end
  end
end
