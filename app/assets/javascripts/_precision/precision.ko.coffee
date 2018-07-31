ko.bindingHandlers.shortText = {
  update: (elem, valueAccessor) ->
    old_value = valueAccessor()
    if old_value.length > 50
      value = old_value.substring(0,32) + '.....' + old_value.slice(-12)
    else
      value = old_value
    $(elem).text(value)
}
