class ActivityReportsView

  totalDataScale = (bytes = 0) ->
    GB = 1000000000
    MB = 1000000
    KB = 1000
    switch true
      when bytes > GB then return (bytes / GB).toFixed(1) + " GB"
      when bytes > MB then return (bytes / MB).toFixed(1) + " MB"
      when bytes > KB then return (bytes / KB).toFixed(1) + " KB"
      else return (bytes) + " B"

  setDateRange: (type = 'week') ->

    date_at = moment()
    date_to = moment()

    switch type
      when 'day' then date_at = date_at.subtract(24, 'hours')
      when 'week' then date_at = date_at.startOf('week')
      when 'month' then date_at = date_at.startOf('month')
      when 'year' then date_at = date_at.startOf('year')
      else return false

    @dateAtDatepicker.setValue(date_at)
    @dateToDatepicker.setValue(date_to)
    @loadData()

  loadData: ->
    params = {
      date_at: @dateAtDatepicker.getValue(),
      date_to: @dateToDatepicker.getValue(),
    }
    @data_upload_chart.loadData '/admin/activity_reports/data_upload', params, (data) =>
      @dataUploadTotal totalDataScale(data.total)

    @data_generated_chart.loadData '/admin/activity_reports/data_generated', params, (data) =>
      @dataGeneratedTotal totalDataScale(data.total)
      
    @data_download_chart.loadData '/admin/activity_reports/data_download', params, (data) =>
      @dataDownloadTotal totalDataScale(data.total)

  constructor: (data) ->

    @dateAtDatepicker = new Precision.Datepicker $('.add-datetimepicker[name="date_at"]')[0], {
      dafaultValue: new Date(),
      format: 'MM/DD/YYYY',
      onChange: (e) =>
        @dateToDatepicker.minDate(e.date)
    }
    @dateToDatepicker = new Precision.Datepicker $('.add-datetimepicker[name="date_to"]')[0], {
      dafaultValue: new Date(),
      format: 'MM/DD/YYYY',
      onChange: (e) =>
        @dateAtDatepicker.maxDate(e.date)
    }

    @dataStorageTotal = totalDataScale(data.other_data?.data_storage)
    @numberOfFilesTotal = data.other_data?.number_of_files

    @data_upload_chart = new Precision.Chart({
      container: 'data_upload_chart'
      type: 'area',
      convertBytes: true
    })
    @dataUploadTotal = ko.observable(0)

    @data_download_chart = new Precision.Chart({
      container: 'data_download_chart'
      type: 'area',
      convertBytes: true
    })
    @dataDownloadTotal = ko.observable(0)

    @data_generated_chart = new Precision.Chart({
      container: 'data_generated_chart'
      type: 'area',
      convertBytes: true
    })
    @dataGeneratedTotal = ko.observable(0)
    
    @setDateRange()
    @loadData()

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

ActivityReportsController = Paloma.controller('Admin/ActivityReports',
  index: ->
    $container = $("body main")
    viewModel = new ActivityReportsView(@params)
    ko.applyBindings(viewModel, $container[0])
    
    $('#select_date_range').on 'click', (e) ->
      $(this).find('button').removeClass('active')
      $(e.target).addClass('active')
      viewModel.setDateRange $(e.target).attr('data-type')

    zoomOut = (chart) ->
      $('.chart.zoomed').removeClass('zoomed')
      $('body').removeClass('chart-zoomed')
      $('.chart-zoomed-modal').remove()
      chart.reflow() if chart
    
    zoomIn = (chartNode, chart) ->
      modal = document.createElement('div')
      $(modal).addClass('chart-zoomed-modal')
      $(modal).on 'click', zoomOut.bind(this, chart)
      $('body').addClass('chart-zoomed')
      $(chartNode).addClass('zoomed')
      $('body').append(modal)

    $('.chart').on 'click', (e) ->
      if $(e.target).hasClass('chart-zoom')
        e.preventDefault()
        chart_name = $(this).attr('data-name')
        chart = viewModel[chart_name]?.chart
        if !$(this).hasClass('zoomed')
          zoomIn(this, chart)
          chart?.reflow()
        else
          zoomOut(chart)
)
