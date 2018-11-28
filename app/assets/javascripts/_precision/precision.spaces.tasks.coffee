class PageModel
  showAlert: (text = 'Something went wrong!', color) ->
    Precision.alert.showAboveAll(text, color, 3000)
  postAction: (url, data = {}, successMsg = '', method = 'POST') ->
    @actionsDisabled(true)
    @isLoading(true)
    $.ajax({
      url: url,
      method: method,
      data: data,
      success: (data, status, jqXHR) =>
        @refreshPage(successMsg)
      error: (response) =>
        try
          data = JSON.parse(response.responseText)
          if data.errors and Array.isArray(data.errors) and data.errors.length > 0
            text = data.errors[0]
        catch
          text = null
        finally
          @showAlert(text)
          @actionsDisabled(false)
          @isLoading(false)
    })
  refreshPage: (successMsg) ->
    @actionsDisabled(true)
    showAlert = () =>
      $('.modal').modal('hide')
      @showAlert(successMsg, 'alert-success')
      document.removeEventListener 'turbolinks:load', showAlert
    document.addEventListener 'turbolinks:load', showAlert
    Turbolinks.clearCache()
    Turbolinks.visit(window.location.toString(), { action: 'replace' })
  constructor: ->
    @actionsDisabled = ko.observable(false)
    @isLoading = ko.observable(false)

class ModalModel extends PageModel
  getUserNameById: (id) ->
    users = @users.filter (user) -> user.value == id
    if users.length
      return users[0].label
    else
      return 'User not found'
  clear: ->
    @assignTo.clearInput() if @assignTo
    @commentText(null) if @commentText
    @task.clear() if @task
  constructor: (params) ->
    super()
    @space_id = params.space_id
    @users = params.users
    @task = new TaskModel()

class TaskModel
  clear: () ->
    @id('')
    @name('')
    @assignee_id('')
    @response_deadline('')
    @completion_deadline('')
    @description('')
  constructor: (task = {}) ->
    @id = ko.observable(task.id)
    @name = ko.observable(task.name)
    @assignee_id = ko.observable(task.assignee_id)
    @response_deadline = ko.observable(task.response_deadline)
    @response_deadline_f = ko.observable(task.response_deadline_f)
    @completion_deadline = ko.observable(task.completion_deadline)
    @completion_deadline_f = ko.observable(task.completion_deadline_f)
    @description = ko.observable(task.description)

class NewTaskModal extends ModalModel
  createTask: () ->
    value = @assignTo.value
    userName = @assignTo.label
    name = @task.name()
    if value and value.length and name and name.length
      data = @newTaskForm.serialize()
      @postAction(
        "/spaces/#{@space_id}/tasks",
        data,
        "Task has been created and is awaiting a response from #{userName}."
      )
    else
      @showAlert('Please fill in all required fields.')
  constructor: (params) ->
    super(params)
    @newTaskForm = $('#create_task_modal form')
    $datePickers = @newTaskForm.find('.add-datetimepicker')
    @responseDeadline = new Precision.Datepicker $datePickers[0], {
      noDefaultValue: true,
      icon: true,
      format: 'MM/DD/YYYY'
    }
    @completionDeadline = new Precision.Datepicker $datePickers[1], {
      noDefaultValue: true,
      icon: true,
      format: 'MM/DD/YYYY'
    }
    @assignTo = new Precision.autocomplete({
      inputNode: $('#create_task_modal [name="task[assignee_id]"]')[0],
      options: params.users
    })

class CloneTaskModal extends ModalModel
  cloneTask: () ->
    data = @cloneTaskForm.serialize()
    userName = @assignTo.label
    @postAction(
      "/spaces/#{@space_id}/tasks",
      data,
      "Task has been cloned and is awaiting a response from #{userName}."
    )

  constructor: (params) ->
    super(params)
    @modal = $('#clone_task_modal')
    @cloneTaskForm = $('#clone_task_modal form')
    $datePickers = @cloneTaskForm.find('.add-datetimepicker')
    @responseDeadline = new Precision.Datepicker $datePickers[0], {
      noDefaultValue: true,
      icon: true,
      format: 'MM/DD/YYYY'
    }
    @completionDeadline = new Precision.Datepicker $datePickers[1], {
      noDefaultValue: true,
      icon: true,
      format: 'MM/DD/YYYY'
    }
    @assignTo = new Precision.autocomplete({
      inputNode: $('#clone_task_modal [name="task[assignee_id]"]')[0],
      options: params.users
    })
    @refreshTaskData = ko.computed () =>
      @assignTo.setValue(@task.assignee_id(), @getUserNameById(@task.assignee_id()))
      if @task.response_deadline()
        @responseDeadline.setValue moment(@task.response_deadline())
      if @task.completion_deadline()
        @completionDeadline.setValue moment(@task.completion_deadline())

class EditTaskModal extends ModalModel
  editTask: (task_id) ->
    data = @editTaskModal.serialize()
    @postAction(
      "/spaces/#{@space_id}/tasks/#{task_id}",
      data,
      'Task has been successfully edited.',
      'PATCH'
    )

  constructor: (params) ->
    super(params)
    @modal = $('#edit_task_modal')
    @editTaskModal = $('#edit_task_modal form')
    $datePickers = @editTaskModal.find('.add-datetimepicker')
    @responseDeadline = new Precision.Datepicker $datePickers[0], {
      noDefaultValue: true,
      icon: true,
      format: 'MM/DD/YYYY'
    }
    @completionDeadline = new Precision.Datepicker $datePickers[1], {
      noDefaultValue: true,
      icon: true,
      format: 'MM/DD/YYYY'
    }
    @assignTo = new Precision.autocomplete({
      inputNode: $('#edit_task_modal [name="task[assignee_id]"]')[0],
      options: params.users
    })
    @refreshTaskData = ko.computed () =>
      @assignTo.setValue(@task.assignee_id(), @getUserNameById(@task.assignee_id()))
      if @task.response_deadline()
        @responseDeadline.setValue moment(@task.response_deadline())
      if @task.completion_deadline()
        @completionDeadline.setValue moment(@task.completion_deadline())

class NewCommentModal extends ModalModel
  changeCommentText: (e) =>
    @commentText(e.target.innerText)
  commentTask: (task_id) ->
    if @commentText() and @commentText().length
      @postAction("/spaces/#{@space_id}/tasks/#{task_id}/comments", {
        comment: {
          body: @commentText()
          parent_id: @parentId()
        }
      }, 'Comment Successfully Added.')
    else
      @showAlert('Please enter comment text.')
  constructor: (params, modal_id) ->
    super(params)
    @modal = $("##{modal_id}")
    @parentId = ko.observable()
    @commentText = ko.observable()

class DeclineTaskModal extends ModalModel
  declineTask: (task_ids) ->
    @postAction("/spaces/#{@space_id}/tasks/decline", {
      task_ids: task_ids,
      comment: {
        body: @commentText()
      }
    }, 'Task(s) has been declined.')
  constructor: (params, tasksCount = 0) ->
    super(params)
    @modal = $('#decline_task_modal')
    @tasksCount = ko.observable(tasksCount)
    @commentText = ko.observable()

class ReopenTaskModal extends ModalModel
  reopenTasks: (task_ids) ->
    @postAction("/spaces/#{@space_id}/tasks/reopen", {
      task_ids: task_ids,
      comment: {
        body: @commentText()
      }
    }, 'Task(s) has been reopened.')
  constructor: (params, tasksCount = 0) ->
    super(params)
    @modal = $('#reopen_task_modal')
    @tasksCount = ko.observable(tasksCount)
    @commentText = ko.observable()

class MakeActiveTaskModal extends ModalModel
  makeActiveTasks: (task_ids) ->
    @postAction("/spaces/#{@space_id}/tasks/make_active", {
      task_ids: task_ids,
      comment: {
        body: @commentText()
      }
    }, 'Task(s) has been made active.')
  constructor: (params, tasksCount = 0) ->
    super(params)
    @modal = $('#make_active_task_modal')
    @tasksCount = ko.observable(tasksCount)
    @commentText = ko.observable()

class ReassignTaskModal extends ModalModel
  reassignTask: (task_id) ->
    value = @assignTo.value
    userName = @assignTo.label
    data = @reassignTaskForm.serialize()
    if value and value.length
      @postAction("/spaces/#{@space_id}/tasks/#{task_id}/reassign", data,
        "Task has been reassigned to #{userName}")
    else
      @showAlert('Please choose any user.')
  constructor: (params) ->
    super(params)
    @modal = $('#reassign_task_modal')
    @reassignTaskForm = $('#reassign_task_modal form')
    @commentText = ko.observable()
    @assignTo = new Precision.autocomplete({
      inputNode: $('#reassign_task_modal [name="task[assignee_id]"]')[0],
      options: params.users
    })
    @refreshTaskData = ko.computed () =>
      @assignTo.setValue(@task.assignee_id(), @getUserNameById(@task.assignee_id()))

class DeleteTaskModal extends ModalModel
  deleteTask: (task_id) ->
    data = @deleteTaskForm.serialize()
    @postAction("/spaces/#{@space_id}/tasks/#{task_id}", data, "Task has been deleted", 'DELETE')
  constructor: (params) ->
    super(params)
    @modal = $('#delete_task_modal')
    @deleteTaskForm = $('#delete_task_modal form')
    @commentText = ko.observable()

window.Precision ||= {}
window.Precision.SpacesTasks = {
  PageModel,
  NewTaskModal,
  CloneTaskModal,
  EditTaskModal,
  NewCommentModal,
  DeclineTaskModal,
  ReopenTaskModal,
  MakeActiveTaskModal,
  ReassignTaskModal,
  DeleteTaskModal
}
