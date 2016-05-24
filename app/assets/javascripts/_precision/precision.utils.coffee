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
