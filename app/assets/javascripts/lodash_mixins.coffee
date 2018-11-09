_.mixin
  isBlank: (object) ->
    switch typeof object
      when 'boolean' then false
      when 'function' then false
      when 'number' then isNaN(object)
      else _.isEmpty(object)
  isPresent: (object) ->
    !_.isBlank(object)
,
  chain: false
