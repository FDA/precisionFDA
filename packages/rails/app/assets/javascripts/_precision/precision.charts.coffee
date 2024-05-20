class Chart

  bytesDataScale = (bytes = 0, maxElement) ->
    GB = 1000000000
    MB = 1000000
    KB = 1000
    value = maxElement || bytes
    switch true
      when value > GB then return (bytes / GB).toFixed(1) + " GB"
      when value > MB then return (bytes / MB).toFixed(1) + " MB"
      when value > KB then return (bytes / KB).toFixed(1) + " KB"
      else return (bytes) + " B"

  loadData: (url, params, callback, custom_handler) ->
    @error(false)
    @loading(true)
    $.ajax({
      method: 'GET',
      url: url,
      data: params,
      success: (response) =>
        if typeof custom_handler == 'function'
          custom_handler(@chart, response)
        else
          @chart.series[0]?.remove()
          @chart.addSeries({
            name: 'values',
            data: response.data
          })
        @loading(false)
        if typeof callback == 'function'
          callback(response)
      error: =>
        @loading(false)
        @error(true)
        Precision.alert.show('Something went wrong')
    })

  constructor: (data, chartOptions = {}) ->

    Highcharts.setOptions({
      global: {
          useUTC: false
      }
    })

    @container = data.container
    @type = data.type
    @title = data.title

    @loading = ko.observable(false)
    @error = ko.observable(false)

    options = {
      chart: {
        type: @type,
        zoomType: 'x'
      },
      title: {
        text: @title
      },
      xAxis: {
        type: 'datetime'
      },
      yAxis: {
        title: {
          text: ''
        },
        labels: {
          formatter: () ->
            if data.convertBytes
              return bytesDataScale(this.value, this.axis.max)
            else
              return this.value
        }
      },
      tooltip: {
        pointFormatter: () ->
          if data.convertBytes
            return bytesDataScale(this.y)
          else return this.y
      },
      legend: {
        enabled: false
      }
    }
    Object.assign(options, chartOptions)
    @chart = Highcharts.chart(@container, options)


window.Precision ||= {}
window.Precision.Chart = Chart
