class AppInputModel
  constructor: (spec, @viewModel) ->
    @className = spec.class
    @help = spec.help
    @label = spec.label
    @name = spec.name
    @defaultValue = spec.default
    @defaultFileValue = ko.observable()
    @isOptional = spec.optional
    @isRequired = !@isOptional
    @patterns = spec.patterns
    @choices = spec.choices

    @placeholder = @defaultValue

    @isClassAnArray = @className.indexOf('array') == 0

    @error = ko.observable(null)

    @licenseToAccept = ko.observable()
    @userLicense = ko.observable()

    @value = ko.observable()
    @valueDisplay = ko.computed(
      read: () =>
        switch @className
          when 'file'
            if !@value()?
              if @defaultValue?
                if @defaultFileValue()?
                  value = @defaultFileValue()
                  @licenseToAccept({license: value.license, user_license: value.user_license}) if value.license? && !value.user_license?.accepted
                  value.title
                else if @defaultValue.match(new RegExp(/^file-(.{24})$/, "i"))
                    params =
                      uid: @defaultValue
                      describe:
                        include:
                          license: true
                    Precision.api('/api/describe', params).done((value) =>
                      @defaultFileValue(value)
                      @licenseToAccept({license: value.license, user_license: value.user_license}) if value.license? && !value.user_license?.accepted
                    )
                    @defaultValue
                else
                  @error("Invalid default value: #{@defaultValue}")
                  @defaultValue
              else
                "Select file..."
            else
              @value().name
          else
            if !@value()?
              @defaultValue
            else
              @value()
      write: (value) =>
        if !value?
          @value(null)
        else
          switch @className
            when 'boolean'
              if value == 'true'
                @value(true)
              else if value == 'false'
                @value(false)
              else
                @value(null)
            else
              @value(value)
    )

    @isReady = ko.computed(=>
      @value()
      hasDefault = @defaultValue?
      isRequired = @isRequired
      hasData = @getDataForRun()? && @getDataForRun() != ''
      hasError = @error() != null
      return !hasError && (!isRequired || (isRequired && (hasData || hasDefault)))
    )

    @needsToBeSet = ko.computed(=>
      return @isRequired && !@isReady()
    )

    @objectSelector = new Precision.models.SelectorModel({
      title: "Select input for #{@label}"
      help: @help
      selectionType: "radio"
      selectableClasses: ["file"]
      onSave: (selected) =>
        @licenseToAccept(null)
        if !_.isArray(selected)
          @value({
            uid: selected.uid
            name: selected.title()
          })
          if selected.license()? && !selected.user_license.accepted()
            @licenseToAccept({license: selected.license(), user_license: selected.user_license()})
        else
          licensesToAccept = []
          # FIXME: This is untested
          @value(_.map(selected, (object) =>
            licensesToAccept.push({license: object.license(), user_license: object.user_license()}) if object.license()? && !object.user_license.accepted()
            return {
              uid: object.uid
              name: object.title()
            }
          ))

          @licenseToAccept(licensesToAccept) if licensesToAccept?

        deferred = $.Deferred()
        deferred.resolve(@value())
      listRelatedParams:
        # editable: true
        # scopes: ["private", "public"]
        classes: ["file", "note", "discussion", "answer", "comparison", "app", "asset", "job"]
      listModelConfigs: [
        {
          className: "file"
          name: "Files"
          apiEndpoint: "list_files"
          apiParams:
            states: ["closed"]
            describe:
              include:
                user: true
                org: true
                license: true
                all_tags_list: true
          patterns: @patterns
        }
        {
          className: "note"
          name: "Notes"
          apiEndpoint: "list_notes"
          apiParams:
            note_types: ["Note"]
            describe:
              include:
                user: true
                org: true
                all_tags_list: true
        }
        {
          className: "discussion"
          name: "Discussions"
          apiEndpoint: "list_notes"
          apiParams:
            note_types: ["Discussion"]
            describe:
              include:
                user: true
                org: true
                all_tags_list: true
        }
      ]
    })

  # Boolean Functions
  toggleTrue: (e) ->
    if @value() == true
      @value(null)
    else
      @value(true)
    $(".field-boolean .btn").blur()

  toggleFalse: (e) ->
    if @value() == false
      @value(null)
    else
      @value(false)
    $(".field-boolean .btn").blur()

  # File Functions
  openFileSelector: () ->
    @objectSelector.open()

  clear: () ->
    @valueDisplay(null)

  getDataForRun: () ->
    value = @value()
    if value? && value != ''
      try
        if @isClassAnArray && _.isString(value)
          value = value.replace(/(^\s*,)|(,\s*$)/g, '') # Remove any trailing/leading commas
          value = _.map(value.split(','), (data) =>
            data = $.trim(data) # Remove trailing/leading whitespace
            _data = data
            switch @className
              when 'int'
                data = parseInt(data, 10)
                if _.isString(_data) && _data != data.toString()
                  @error("#{_data} is not a valid integer")
                else
                  @error(null)
              when 'float'
                data = parseFloat(data)
                if _.isString(_data) && _data != data.toString()
                  @error("#{_data} is not a valid integer")
                else
                  @error(null)
          )
        else if @className == "hash" && _.isString(value)
          if value.length > 0
            try
              value = JSON.parse(value)
            catch error
              @error(error.message)
          else
            value = undefined
        else
          _value = value
          switch @className
            when 'int'
              value = parseInt(value, 10)
              if _.isString(_value) && _value != value.toString()
                @error("#{_value} is not a valid integer")
              else
                @error(null)
            when 'float'
              value = parseFloat(value)
              if _.isString(_value) && _value != value.toString()
                @error("#{_value} is not a valid float")
              else
                @error(null)
            when 'file'
              value = value.uid
            else
              value
      catch error
        value = undefined
    else
      value = undefined
    return value

window.Precision ||= {}
window.Precision.models || = {}
window.Precision.models.AppInputModel = AppInputModel
