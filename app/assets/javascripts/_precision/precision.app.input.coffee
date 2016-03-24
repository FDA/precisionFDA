class AppInputModel
  constructor: (spec, @viewModel) ->
    @klass = spec.class
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

    @isClassAnArray = @klass.indexOf('array') == 0

    @error = ko.observable(null)

    @licenseToAccept = ko.observable()

    @value = ko.observable()
    @valueDisplay = ko.computed(
      read: () =>
        switch @klass
          when 'file'
            if !@value()?
              if @defaultValue?
                if @defaultFileValue()?
                  value = @defaultFileValue()
                  @licenseToAccept(value.license) if value.license? && !value.license_accepted
                  value.name
                else
                  params =
                    uid: @defaultValue
                    include:
                      license: true
                  Precision.api('/api/describe_file', params).done((value) =>
                    @defaultFileValue(value)
                    @licenseToAccept(value.license) if value.license? && !value.license_accepted
                  )
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
          switch @klass
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
    @viewModel.fileSelector.open(this, @value.peek())

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
            switch @klass
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
        else if @klass == "hash" && _.isString(value)
          if value.length > 0
            try
              value = JSON.parse(value)
            catch error
              @error(error.message)
          else
            value = undefined
        else
          _value = value
          switch @klass
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
