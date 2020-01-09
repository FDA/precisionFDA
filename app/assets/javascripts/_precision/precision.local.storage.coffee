class LocalStorage

  set: (prop, value) ->
    storage = @getStorage()
    ls = if storage then JSON.parse(storage) else {}
    ls[prop] = value
    localStorage.setItem(@STORAGE_NAME, JSON.stringify(ls))

  get: (prop) ->
    storage = @getStorage()
    if !prop
      return if storage then JSON.parse(storage) else {}
    ls = JSON.parse(storage)
    return if (ls && ls[prop]) then  ls[prop] else false

  reset: () ->
    localStorage.setItem(@STORAGE_NAME, JSON.stringify({}))

  getStorage: () ->
    localStorage.getItem(@STORAGE_NAME)

  constructor: () ->
    @STORAGE_NAME = 'precision_fda_storage'


window.Precision ||= {}
window.Precision.LocalStorage = LocalStorage
