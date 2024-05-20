# This Class contains main methods: list, create, update
# to manage workflow stages output folder ('folder' field)
#
# LIST & CREATE - folder 'listFolder' & 'newFolder' api calls.
#   class-xxxx - is a project, depends upon workflow scope: private or public
# UPDATE - workflow 'update' api call.

class OutputFolderService
  def initialize(api:, context:, workflow:)
    @api = api
    @context = context
    @workflow = workflow
  end

  # return an array of child folders for current_folder = parent folder
  def list(current_folder)
    # Ensure API availability
    api.call("system", "greet")

    api.call(files_project, "listFolder", { folder: current_folder, only: 'folders' })
  end

  def update(workflow, folder)
    # Ensure API availability
    api.call("system", "greet")

    update_params = update_params(workflow, folder)
    api.call(workflow.dxid, 'update', {
      stages: stages_hash(update_params[:stages_ids], update_params[:folder]),
      editVersion: update_params[:edit_version]
    })
  end

  # parents: true - parent folders should be created if they do not exist
  def create(folder)
    # Ensure API availability
    api.call("system", "greet")

    api.call(files_project, "newFolder", { parents: true, folder: folder })
  end

  private

  attr_reader :api, :context, :workflow

  def files_project
    user = JSON.parse(context.to_json)['user']
    scope = JSON.parse(workflow.to_json)['scope']
    scope == 'private' ? user['private_files_project'] : user['public_files_project']
  end

  def update_params(workflow, folder)
    { stages_ids: workflow.stages_ids,
      folder: { folder: folder },
      edit_version: api.call(workflow.dxid, "describe")['editVersion'].to_i }
  end

  def stages_hash(stages_ids, folder)
    stages_hash = {}
    stages_ids.each do |slot_id|
      stages_hash = stages_hash.merge("#{slot_id}" => folder)
    end
    stages_hash
  end
end
