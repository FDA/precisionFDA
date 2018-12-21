class SpacesTaskShowView extends Precision.SpacesTasks.PageModel
  acceptTasks: () ->
    @postAction("/spaces/#{@space_id}/tasks/accept", {
      task_ids: [@task.id]
    }, 'Task(s) has been marked as accepted!')

  completeTasks: () ->
    @postAction("/spaces/#{@space_id}/tasks/complete", {
      task_ids: [@task.id]
    }, 'Task(s) has been marked as completed!')

  createTask: () ->
    @newTaskModal.createTask()

  declineTasks: () ->
    @declineTaskModal.declineTask([@task.id])

  reopenTasks: () ->
    @reopenTaskModal.reopenTasks([@task.id])

  makeActiveTasks: () ->
    @makeActiveTaskModal.makeActiveTasks([@task.id])

  cloneTask: () ->
    @cloneTaskModal.cloneTask(@task.id)

  editTask: () ->
    @editTaskModal.editTask(@task.id)

  commentTask: () ->
    @newCommentModal.commentTask(@task.id)

  replyComment: () ->
    @replyCommentModal.commentTask(@task.id)

  reassignTask: () ->
    @reassignTaskModal.reassignTask(@task.id)

  deleteTask: () ->
    @deleteTaskModal.deleteTask(@task.id)

  constructor: (params) ->
    super()
    @space_id = params.space_id
    @task = params.task
    @newCommentModal = new Precision.SpacesTasks.NewCommentModal(params, 'comment_task_modal')
    @replyCommentModal = new Precision.SpacesTasks.NewCommentModal(params, 'reply_comment_modal')
    @atwhoModals = [@newCommentModal, @replyCommentModal]

    @declineTaskModal = new Precision.SpacesTasks.DeclineTaskModal(params, 1)
    @reopenTaskModal = new Precision.SpacesTasks.ReopenTaskModal(params, 1)
    @makeActiveTaskModal = new Precision.SpacesTasks.MakeActiveTaskModal(params, 1)

    @cloneTaskModal = new Precision.SpacesTasks.CloneTaskModal(params)
    @cloneTaskModal.modal.on 'show.bs.modal', =>
      @cloneTaskModal.task.name(@task.name)
      @cloneTaskModal.task.assignee_id(@task.assignee_id)
      @cloneTaskModal.task.response_deadline(@task.response_deadline)
      @cloneTaskModal.task.completion_deadline(@task.completion_deadline)
      @cloneTaskModal.task.description(@task.description)

    @editTaskModal = new Precision.SpacesTasks.EditTaskModal(params)
    @editTaskModal.modal.on 'show.bs.modal', =>
      @editTaskModal.task.name(@task.name)
      @editTaskModal.task.assignee_id(@task.assignee_id)
      @editTaskModal.task.response_deadline(@task.response_deadline)
      @editTaskModal.task.completion_deadline(@task.completion_deadline)
      @editTaskModal.task.description(@task.description)

    @reassignTaskModal = new Precision.SpacesTasks.ReassignTaskModal(params)
    @reassignTaskModal.modal.on 'show.bs.modal', =>
      @reassignTaskModal.task.name(@task.name)
      @reassignTaskModal.task.assignee_id(@task.assignee_id)
      @reassignTaskModal.task.response_deadline(@task.response_deadline_f)
      @reassignTaskModal.task.completion_deadline(@task.completion_deadline_f)
      @reassignTaskModal.task.description(@task.description)

    @deleteTaskModal = new Precision.SpacesTasks.DeleteTaskModal(params)
    @deleteTaskModal.modal.on 'show.bs.modal', =>
      @deleteTaskModal.task.name(@task.name)
      @deleteTaskModal.task.assignee_id(@deleteTaskModal.getUserNameById(@task.assignee_id))
      @deleteTaskModal.task.response_deadline(@task.response_deadline_f)
      @deleteTaskModal.task.completion_deadline(@task.completion_deadline_f)
      @deleteTaskModal.task.description(@task.description)

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

TasksController = Paloma.controller('Tasks', {
  show: ->
    $container = $("body main")
    viewModel = new SpacesTaskShowView(@params)
    ko.applyBindings(viewModel, $container[0])

    viewModel.atwhoModals.map (modal) =>
      editable = $(modal.modal).find('.add-atwho')
      editable.atwho({
        at: "@",
        insertTpl: '<a href="/users/${name}" target="_blank">@${name}</a>',
        data: @params.users.map (user) -> user.label
      })
      editable.on 'input', modal.changeCommentText
      editable.on 'inserted.atwho', modal.changeCommentText

    $(document).ready ->
      Precision.nestedComments.initTreads()

      commentsBodies = $(".pfda-comment-body p")
      regex = Precision.MENTIONS_CONST.regex
      replace = Precision.MENTIONS_CONST.replace

      commentsBodies.each (index, commentsBody) ->
        commentsBody.innerHTML = commentsBody.innerHTML.replace(regex, replace)

    $('#task_show_accept').on 'click', (e) ->
      viewModel.acceptTasks()
    $('#task_show_complete').on 'click', (e) ->
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
    $('#reply_comment_modal_submit').on 'click', (e) ->
      viewModel.replyComment()

    $('.nested-comment--show-new-comment').on 'click', (e) ->
      e.preventDefault()
      parentId = $(e.target).attr('data-parent-id')
      viewModel.replyCommentModal.parentId(parentId)
      $('#reply_comment_modal').modal('show')

    $('.modal').on 'hide.bs.modal', () ->
      viewModel.newCommentModal.clear()
      viewModel.replyCommentModal.clear()
      viewModel.reopenTaskModal.clear()
      viewModel.makeActiveTaskModal.clear()
      viewModel.declineTaskModal.clear()
      viewModel.cloneTaskModal.clear()
      viewModel.editTaskModal.clear()
      viewModel.reassignTaskModal.clear()
      viewModel.deleteTaskModal.clear()

})
