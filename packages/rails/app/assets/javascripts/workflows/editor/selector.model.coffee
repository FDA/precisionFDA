class SelectorModel
  openModal: (modal) =>
    @setIOValueModal(modal)
    @objectSelector.open()

  getListedFiles: () ->
    params = {
      states: ["closed"],
      scopes: @accessibleScope,
      describe: {
        include: {
          user: true
          all_tags_list: false
        }
      }
    }
    $.post('/api/list_files', params).then (objects) => @listedFiles(objects)

  constructor: (scope) ->
    @setIOValueModal = ko.observable(null)
    @listedFiles = ko.observableArray([])
    @accessibleScope = scope
    @objectSelector = new Precision.models.SelectorModel({
      title: 'Select default file for field',
      selectionType: 'radio',
      selectableClasses: ['file'],
      studies: [],
      listRelatedParams: {
        classes: ['file']
      },
      listModelConfigs: [
        {
          className: 'file'
          name: 'Files'
          apiEndpoint: 'list_files'
          listedFiles: @listedFiles()

        }
      ],
      onSave: (selected) =>
        @setIOValueModal().setFileValue(selected) if @setIOValueModal()
        deferred = $.Deferred()
        deferred.resolve(selected)
    })
    @getListedFiles()

window.Precision ||= {}
window.Precision.wfEditor ||= {}
window.Precision.wfEditor.SelectorModel = SelectorModel
