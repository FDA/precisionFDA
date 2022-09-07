window.Precision ||= {}

window.Precision.utils =
  # Source: http://stackoverflow.com/questions/5575609/javascript-regexp-to-match-strings-using-wildcards-and
  globToRegex: (glob, modifiers) ->
    specialChars = "\\^$*+?.()|{}[]"
    regexChars = ["^"]
    i = 0

    while i < glob.length
      c = glob.charAt(i)
      switch c
        when "?"
          regexChars.push "."
        when "*"
          regexChars.push ".*"
        else
          regexChars.push "\\"  if specialChars.indexOf(c) >= 0
          regexChars.push c
      ++i
    regexChars.push "$"
    new RegExp(regexChars.join(""), modifiers)

  scrollOnAccordionCollapse: ($accordion) ->
    $accordion.on 'shown.bs.collapse', (e) ->
      $selected = $(e.target)
      $('html, body').animate({
        scrollTop: $selected.parent().offset().top
    }, 250)

  mockDelay: (time) ->
    return new Promise (resolve) ->
      T = setTimeout(() ->
        resolve()
        clearTimeout(T)
      , time)

  capitalize: (str) -> (str || '').replace(/\b\w/g, (l) -> l.toUpperCase())

  splitAndCapitalize: (str = '') ->
    return str.split('_').map((item) => @capitalize(item)).join(' ')

  scrollTo: (where) ->
    $([document.documentElement, document.body]).animate({
      scrollTop: where
    }, 0)

  digitsOnly: (str = '') ->
    return str if typeof str != 'string'
    return str.replace(/[^0-9.]/g, '')

  formatToPhoneNumber: (str = '') ->
    return str if typeof str != 'string'
    str = @digitsOnly(str)
    return str
    # ln = str.length
    # switch
    #   when ln > 0 and ln <= 3
    #     return str.replace(/(.*)/, '($1)')
    #   when ln > 3 and ln <= 6
    #     return str.replace(/(.{3})(.*)/, '($1) $2')
    #   when ln > 6 and ln <= 8
    #     return str.replace(/(.{3})(.{3})(.*)/, '($1) $2-$3')
    #   when ln > 8 and ln <= 10
    #     return str.replace(/(.{3})(.{3})(.{2})(.*)/, '($1) $2-$3-$4')
    #   else
    #     return str.replace(/(.{3})(.{3})(.{2})(.{2})(.*)/, '($1) $2-$3-$4')

  validatePhoneNumber: (number = '', countryCode = '') ->
    return false if typeof number != 'string' or typeof countryCode != 'string'
    number = @digitsOnly(number).length
    code = @digitsOnly(countryCode).length
    return (number + code) == 11

  findCountryCode: (country_codes = {}, countryID) ->
    return false if !countryID or isNaN(parseInt(countryID))
    countryID = parseInt(countryID)
    for code, ids of country_codes
      return code if ids.indexOf(countryID) > -1
    return false

  createOnScrollHandler: (parentNodeID, dataCont, getData) ->
    $parentNodeDIV = $("##{parentNodeID}")
    return false if !$parentNodeDIV.length

    _getData = _.debounce(getData, 150)

    scrollPos = 0
    onScrollHandler = () ->
      goDown = scrollPos < $parentNodeDIV.scrollTop()
      $dataCont = $parentNodeDIV.find(dataCont)
      if($parentNodeDIV.scrollTop() + $parentNodeDIV.height() >= $dataCont.height() - 20 and goDown)
        _getData()
      scrollPos = $parentNodeDIV.scrollTop()
    $parentNodeDIV.on 'scroll', onScrollHandler

  replaceSpaceSubstringWithNbsps: (string, substringLength) -> 
    spaceFill = Array(substringLength).fill(' ').join('')
    nbspFill = Array(substringLength).fill('\xa0').join('')
    string.replace(spaceFill, nbspFill)

  sanitizeInstanceTypeNbsp: (instanceType) -> {
    label: @replaceSpaceSubstringWithNbsps(instanceType.label, 4)
    value: instanceType.value
  }
