class NotificationSettingsModal
  renderCheckbox: (name, value) ->
    formGroup = document.createElement('div')
    formGroup.classList.add('form-group')
    checkbox = document.createElement('div')
    checkbox.classList.add('checkbox')
    checkbox.classList.add('col-md-offset-5')
    label = document.createElement('label')
    input = document.createElement('input')
    input.setAttribute('type', 'checkbox')
    input.setAttribute('name', name)
    input.setAttribute('checked', 'checked') if value
    input.addEventListener 'change', (e) =>
      name = e.target.getAttribute('name')
      settings = @preference[@roleValue]
      settings[name] = e.target.checked if settings

    text = Precision.utils.splitAndCapitalize(name.replace(/^.*?_/g, ''))

    $(label).append(input)
    $(label).append(text)
    $(checkbox).append(label)
    $(formGroup).append(checkbox)
    return formGroup

  renderOption: (value = '') ->
    option = document.createElement('option')
    option.setAttribute('value', value)
    option.innerText = Precision.utils.splitAndCapitalize(value)
    return option

  renderCheckboxes: (role = {}) ->
    @settingsContainer.empty()
    settings = @preference[role]
    return false if !settings
    for key of settings
      checkbox = @renderCheckbox(key, settings[key])
      @settingsContainer.append(checkbox)

  renderRoles: (preference = {}) ->
    @roleSelect.empty()
    @roleSelect.append(@renderOption())
    for key of preference
      @roleSelect.append(@renderOption(key))

  saveSettings: () ->
    @modal.addClass('loading')

    data = {}
    for key, settings of @preference
      for key, value of settings
        settings[key] = if value then 1 else 0
      data = Object.assign(data, settings)

    $.post('/notification_preferences/change', data).then(
      () =>
        Precision.alert.showAboveAll('Notification Settings Saved.', 'alert-success')
        @modal.modal('hide')
        @modal.removeClass('loading')
      () =>
        Precision.alert.showAboveAll('Something Went Wrong.')
        @modal.modal('hide')
        @modal.removeClass('loading')
    )

  constructor: () ->
    document.addEventListener 'turbolinks:load', () =>
      @preference = {}
      @modal = $('#notification_settings_modal')
      @form = $('#notification_settings_modal form')
      @saveButton = $('#notification_settings_modal_submit')
      @checkAll = $('#notification_settings_modal_check_all')
      @checkAllInput = $('#notification_settings_modal_check_all_input')
      @roleSelect = $('#notification_settings_modal_role')
      @roleValue = null
      @settingsContainer = $('#notification_settings_modal_settings')
      @modal.on 'show.bs.modal', () =>
        @modal.addClass('loading')
        $.get('/notification_preferences').then((data) =>
          @preference = data.preference
          @renderRoles(@preference)
          @saveButton.attr('disabled', 'disabled')
          @checkAll.addClass('hidden')
          @settingsContainer.empty()
          @modal.removeClass('loading')
        )
      @saveButton.on 'click', () => @saveSettings()

      @roleSelect.on 'change', (e) =>
        role = e.target.value
        @roleValue = role
        if role
          @saveButton.removeAttr('disabled')
          @checkAll.removeClass('hidden')
          @renderCheckboxes(role)
        else
          @saveButton.attr('disabled', 'disabled')
          @checkAll.addClass('hidden')
          @settingsContainer.empty()

      @checkAllInput.on 'change', (e) =>
        checked = e.target.checked
        checkboxes = @settingsContainer.find('input[type="checkbox"]')
        checkboxes.each((index, checkbox) ->
          checkbox.checked = checked
          checkbox.dispatchEvent(new Event('change'))
          return true
        )

window.Precision ||= {}
window.Precision.notificationSettingsModal = new NotificationSettingsModal()
