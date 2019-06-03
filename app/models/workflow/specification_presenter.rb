class Workflow
  class SpecificationPresenter
    include ActiveModel::Validations

    validates :name, 'workflow/non_empty_string': true,
              'workflow/name_format': true
    validates :title, 'workflow/non_empty_string': true
    validates :project, presence: true
    validates :readme, 'workflow/non_empty_string': { allow_empty: true }
    validates :is_new, 'workflow/boolean_inclusion': true
    validates :existing_workflow_series, 'workflow/series_presence': true

    def initialize(params, context, slot_objects)
      @params = params
      @context = context
      @slot_objects = slot_objects
    end

    def build
      {
        name: name,
        title: title,
        user_id: context.user_id,
        spec: spec,
        readme: readme,
        revision: revision,
        scope: "private",
        workflow_series_id: workflow_series.id,
        project: project,
      }
    end

    def name
      params["workflow_name"]
    end

    def is_new
      params["is_new"]
    end

    private

    def project
      @project ||= context.user.try(:private_files_project)
    end

    def title
      params["workflow_title"]
    end

    def readme
      params["readme"]
    end

    def revision
      if existing_workflow_series
        workflow_series.latest_revision_workflow.revision + 1
      else
        1
      end
    end

    def workflow_series_dxid
      WorkflowSeries.construct_dxid(context.username, name)
    end

    def workflow_series
      @workflow_series ||= existing_workflow_series || new_workflow_series
    end

    def existing_workflow_series
      @existing_workflow_series ||= WorkflowSeries.find_by(dxid: workflow_series_dxid)
    end

    def new_workflow_series
      return nil unless is_new
      WorkflowSeries.create!(
        dxid: workflow_series_dxid,
        name: name,
        user_id: context.user_id,
        scope: "private"
      )
    end

    def spec
      spec_object = { input_spec: { stages: [] }, output_spec: { stages: [] } }
      slot_objects.each_with_object(spec_object) do |slot_presenter, spec|
        spec[:input_spec][:stages] << {
          "name": slot_presenter.name,
          "prev_slot": slot_presenter.prev_slot,
          "next_slot": slot_presenter.next_slot,
          "slotId": slot_presenter.slot_id,
          "app_dxid": slot_presenter.app.dxid,
          "app_uid": slot_presenter.uid,
          "inputs": slot_presenter.inputs,
          "outputs": slot_presenter.outputs,
          "instanceType": slot_presenter.instance_type,
          "stageIndex": slot_presenter.stage_index,
        }
      end
    end

    attr_reader :slot_objects, :context, :params
  end
end
