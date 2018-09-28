class SpacesTasksView extends Precision.SpacesTasks.PageModel
  getTaskById: (task_id) ->
    return $.get("/spaces/#{@space_id}/tasks/#{task_id}/task")

  updateSelected: (e) ->
    tasksActions = @selectedTasksActions()
    @selectedItems.remove e.target.value
    delete(tasksActions[e.target.value])
    if e.target.checked
      @selectedItems.push e.target.value
      tasksActions[e.target.value] = $(e.target).attr('data-actions')
      @selectedTasksActions(tasksActions)
    @toggleActions()

  toggleActions: () ->
    actions = []
    selectedActions = @selectedTasksActions()
    for taskId of selectedActions
      actions = actions.concat selectedActions[taskId].split(' ')
    actions = _.uniq(actions)
    $('[data-task-action]').addClass('hidden')
    for action in actions
      $("[data-task-action=#{'"' + action + '"'}]").removeClass('hidden')
    return actions

  acceptTasks: () ->
    @postAction("/spaces/#{@space_id}/tasks/accept", {
      task_ids: @selectedItems()
    }, 'Task(s) has been marked as accepted!')

  completeTasks: () ->
    @postAction("/spaces/#{@space_id}/tasks/complete", {
      task_ids: @selectedItems()
    }, 'Task(s) has been marked as completed!')

  createTask: () ->
    @newTaskModal.createTask()

  declineTasks: () ->
    @declineTaskModal.declineTask(@selectedItems())

  reopenTasks: () ->
    @reopenTaskModal.reopenTasks(@selectedItems())

  makeActiveTasks: () ->
    @makeActiveTaskModal.makeActiveTasks(@selectedItems())

  cloneTask: () ->
    @cloneTaskModal.cloneTask()

  editTask: () ->
    @editTaskModal.editTask(@selectedItems()[0])

  commentTask: () ->
    @newCommentModal.commentTask(@selectedItems()[0])

  reassignTask: () ->
    @reassignTaskModal.reassignTask(@selectedItems()[0])

  deleteTask: () ->
    @deleteTaskModal.deleteTask(@selectedItems()[0])

  constructor: (params) ->
    super()
    @selectedItems = ko.observableArray([])
    @selectedTasksActions = ko.observable({})
    @singleActions = ko.computed(() => !@actionsDisabled() and @selectedItems().length == 1)
    @multiActions = ko.computed(() => !@actionsDisabled() and @selectedItems().length > 0)
    @space_id = params.space_id

    @newTaskModal = new Precision.SpacesTasks.NewTaskModal(params)
    @newCommentModal = new Precision.SpacesTasks.NewCommentModal(params, 'comment_task_modal')

    @declineTaskModal = new Precision.SpacesTasks.DeclineTaskModal(params)
    @declineTaskModal.modal.on 'show.bs.modal', =>
      @declineTaskModal.tasksCount(@selectedItems().length)

    @reopenTaskModal = new Precision.SpacesTasks.ReopenTaskModal(params)
    @reopenTaskModal.modal.on 'show.bs.modal', =>
      @reopenTaskModal.tasksCount(@selectedItems().length)

    @makeActiveTaskModal = new Precision.SpacesTasks.MakeActiveTaskModal(params)
    @makeActiveTaskModal.modal.on 'show.bs.modal', =>
      @makeActiveTaskModal.tasksCount(@selectedItems().length)

    @cloneTaskModal = new Precision.SpacesTasks.CloneTaskModal(params)
    @cloneTaskModal.modal.on 'show.bs.modal', =>
      @cloneTaskModal.isLoading(true)
      @getTaskById(@selectedItems()[0]).then (res) =>
        @cloneTaskModal.task.name(res.name)
        @cloneTaskModal.task.assignee_id(res.assignee_id)
        @cloneTaskModal.task.response_deadline(res.response_deadline)
        @cloneTaskModal.task.completion_deadline(res.completion_deadline)
        @cloneTaskModal.task.description(res.description)
        @cloneTaskModal.isLoading(false)

    @editTaskModal = new Precision.SpacesTasks.EditTaskModal(params)
    @editTaskModal.modal.on 'show.bs.modal', =>
      @editTaskModal.isLoading(true)
      @getTaskById(@selectedItems()[0]).then (res) =>
        @editTaskModal.task.name(res.name)
        @editTaskModal.task.assignee_id(res.assignee_id)
        @editTaskModal.task.response_deadline(res.response_deadline)
        @editTaskModal.task.completion_deadline(res.completion_deadline)
        @editTaskModal.task.description(res.description)
        @editTaskModal.isLoading(false)

    @reassignTaskModal = new Precision.SpacesTasks.ReassignTaskModal(params)
    @reassignTaskModal.modal.on 'show.bs.modal', =>
      @reassignTaskModal.isLoading(true)
      @getTaskById(@selectedItems()[0]).then (res) =>
        @reassignTaskModal.task.name(res.name)
        @reassignTaskModal.task.assignee_id(res.assignee_id)
        @reassignTaskModal.task.response_deadline(res.response_deadline_f)
        @reassignTaskModal.task.completion_deadline(res.completion_deadline_f)
        @reassignTaskModal.task.description(res.description)
        @reassignTaskModal.isLoading(false)

    @deleteTaskModal = new Precision.SpacesTasks.DeleteTaskModal(params)
    @deleteTaskModal.modal.on 'show.bs.modal', =>
      @deleteTaskModal.isLoading(true)
      @getTaskById(@selectedItems()[0]).then (res) =>
        @deleteTaskModal.task.name(res.name)
        @deleteTaskModal.task.assignee_id(res.assignee_id)
        @deleteTaskModal.task.response_deadline(res.response_deadline)
        @deleteTaskModal.task.completion_deadline(res.completion_deadline)
        @deleteTaskModal.task.description(res.description)
        @deleteTaskModal.isLoading(false)

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

SpacesController = Paloma.controller('Spaces', {
  tasks: ->
    $container = $("#ko_spaces_tasks_container")
    viewModel = new SpacesTasksView(@params)
    ko.applyBindings(viewModel, $container[0])

    editable = $(viewModel.newCommentModal.modal).find('.add-atwho')
    editable.atwho({
      at: "@",
      insertTpl: '<a href="/users/${name}" target="_blank">@${name}</a>',
      data: @params.users.map (user) -> user.label
    })
    editable.on 'input', viewModel.newCommentModal.changeCommentText
    editable.on 'inserted.atwho', viewModel.newCommentModal.changeCommentText

    $('.select-all-tasks').on 'change', (e) ->
      checked = e.target.checked
      $('.select-task').each((index, item) ->
        item.checked = checked
        $(item).trigger('change')
        return true
      )
    $('.select-task').on 'change', (e) ->
      viewModel.updateSelected(e)
    $('#spaces_tasks_accept').on 'click', (e) ->
      viewModel.acceptTasks()
    $('#spaces_tasks_complete').on 'click', (e) ->
      viewModel.completeTasks()
    $('#create_task_modal_submit').on 'click', (e) ->
      viewModel.createTask()
    $('#decline_task_modal_submit').on 'click', (e) ->
      viewModel.declineTasks()
    $('#reopen_task_modal_submit').on 'click', (e) ->
      viewModel.reopenTasks()
    $('#make_active_task_modal_submit').on 'click', (e) ->
      viewModel.makeActiveTasks()
    $('#clone_task_modal_submit').on 'click', (e) ->
      viewModel.cloneTask()
    $('#edit_task_modal_submit').on 'click', (e) ->
      viewModel.editTask()
    $('#reassign_task_modal_submit').on 'click', (e) ->
      viewModel.reassignTask()
    $('#delete_task_modal_submit').on 'click', (e) ->
      viewModel.deleteTask()
    $('#comment_task_modal_submit').on 'click', (e) ->
      viewModel.commentTask()

    $('.modal').on 'hide.bs.modal', () ->
      viewModel.newTaskModal.clear()
      viewModel.newCommentModal.clear()
      viewModel.reopenTaskModal.clear()
      viewModel.makeActiveTaskModal.clear()
      viewModel.declineTaskModal.clear()
      viewModel.cloneTaskModal.clear()
      viewModel.editTaskModal.clear()
      viewModel.reassignTaskModal.clear()
      viewModel.deleteTaskModal.clear()

})
