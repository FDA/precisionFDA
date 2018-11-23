class NotificationSettingsModal
  renderCheckbox: (name, value) ->
    div = document.createElement('div')
    div.classList.add('checkbox')
    label = document.createElement('label')
    input = document.createElement('input')
    input.setAttribute('type', 'checkbox')
    input.setAttribute('name', name)
    input.setAttribute('checked', 'checked') if value
    text = Precision.utils.splitAndCapitalize(name)

    $(label).append(input)
    $(label).append(text)
    $(div).append(label)
    return div

  renderCheckboxes: (preference = {}) ->
    @form.empty()
    for key of preference
      checkbox = @renderCheckbox(key, preference[key])
      @form.append(checkbox)

  saveSettings: () ->
    @modal.addClass('loading')
    data = {}
    @form.find('input').each((i, input) ->
      if input.checked
        data[input.getAttribute('name')] = 1
      else
        data[input.getAttribute('name')] = 0
    )
    $.post('/notification_preferences/change', data).then(
      () =>
        Precision.alert.show('Notification Settings Saved.', 'alert-success')
        @modal.modal('hide')
        @modal.removeClass('loading')
      () =>
        Precision.alert.show('Something Went Wrong.')
        @modal.modal('hide')
        @modal.removeClass('loading')
    )

  constructor: () ->
    document.addEventListener 'turbolinks:load', () =>
      @modal = $('#notification_settings_modal')
      @form = $('#notification_settings_modal form')
      @modal.on 'show.bs.modal', () =>
        @modal.addClass('loading')
        $.get('/notification_preferences').then((data) =>
          @renderCheckboxes(data.preference)
          @modal.removeClass('loading')
        )
      $('#notification_settings_modal_submit').on 'click', () => @saveSettings()

window.Precision ||= {}
window.Precision.notificationSettingsModal = new NotificationSettingsModal()
