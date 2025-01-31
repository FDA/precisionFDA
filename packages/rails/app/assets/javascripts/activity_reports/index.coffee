class ActivityReportsView

  humanizeSeconds = (seconds) ->

    result = 0 if !seconds

    hours = Math.floor(seconds / 3600).toString()
    minutes = Math.floor((seconds % 3600) / 60).toString()
    seconds = Math.floor(((seconds % 3600) % 60)).toString()

    hours = '0' + hours if hours.length < 2
    minutes = '0' + minutes if minutes.length < 2
    seconds = '0' + seconds if seconds.length < 2

    result = (hours + 'HRS ' + minutes + 'MINS')
    result = minutes + 'MINS' if hours == '00'
    result = seconds + 'SECS' if hours == '00' and minutes == '00'
    result = '0' if seconds == '00' and hours == '00' and minutes == '00'

    return result

  totalDataScale = (bytes = 0) ->
    GB = 1000000000
    MB = 1000000
    KB = 1000
    switch true
      when bytes > GB then return (bytes / GB).toFixed(1) + " GB"
      when bytes > MB then return (bytes / MB).toFixed(1) + " MB"
      when bytes > KB then return (bytes / KB).toFixed(1) + " KB"
      else return (bytes) + " B"

    # Validate date input format
  isValidDate = (dateStr) ->
    dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/
    if not dateRegex.test(dateStr)
       return false

    [month, day, year] = dateStr.split('/').map((item) -> parseInt(item)) # Use map after splitting
    date = new Date(year, month - 1, day) # JS months are 0-indexed
    date.getFullYear() == year and date.getMonth() == (month - 1) and date.getDate() == day

  validateAndSubmit: ->
    # Example logic for validation and submission
    date_at = $('input[name="date_at"]').val()
    date_to = $('input[name="date_to"]').val()

    if not isValidDate(date_at) or not isValidDate(date_to)
      alert 'Invalid dates. Please ensure both start and end dates are in MM/DD/YYYY format.'
      return false

    # Submit the form or trigger data loading
    @loadData()
    return true

  setDateRange: (type = 'week') ->
    # Generate date range dynamically
    date_at = moment()
    date_to = moment()
    switch type
      when 'day' then date_at = date_at.subtract(24, 'hours')
      when 'week' then date_at = date_at.startOf('week')
      when 'month' then date_at = date_at.startOf('month')
      when 'year' then date_at = date_at.startOf('year')
      else return false

    # Set values in inputs
    $('input[name="date_at"]').val(date_at.format('MM/DD/YYYY'))
    $('input[name="date_to"]').val(date_to.format('MM/DD/YYYY'))
    @loadData()

  loadData: ->
    # Read values from inputs
    date_at = $('input[name="date_at"]').val()
    date_to = $('input[name="date_to"]').val()


    # Convert to moments for validation and formatting
    moment_date_at = moment(date_at, 'MM/DD/YYYY')
    moment_date_to = moment(date_to, 'MM/DD/YYYY')

    if moment_date_at.isAfter(moment_date_to)
      alert 'Start date cannot be after end date!'
      return false

    # Use formatted dates in API parameters
    params = {
      date_at: moment_date_at.startOf('day').format('YYYY-MM-DD'),
      date_to: moment_date_to.endOf('day').format('YYYY-MM-DD')
    }


    ### Users Charts ###
    @users_views_chart.loadData '/api/activity_reports/user_viewed', params, (data) =>
      @userViewsTotal data.total

    @users_access_request_chart.loadData '/api/activity_reports/user_access_requested', params, (data) =>
      @userAccessTotal data.total

    @users_logins_chart.loadData '/api/activity_reports/user_logged_in', params, (data) =>
      @userLoginsTotal data.total
    ### Users Charts END ###

    ### Data Charts ###
    @data_upload_chart.loadData '/api/activity_reports/data_upload', params, (data) =>
      @dataUploadTotal totalDataScale(data.total)

    @data_generated_chart.loadData '/api/activity_reports/data_generated', params, (data) =>
      @dataGeneratedTotal totalDataScale(data.total)
      
    @data_download_chart.loadData '/api/activity_reports/data_download', params, (data) =>
      @dataDownloadTotal totalDataScale(data.total)
    ### Data Charts END ###
    
    ### Apps Charts ###
    @apps_created_chart.loadData '/api/activity_reports/app_created', params, (data) =>
      @appsCreatedTotal data.total

    @apps_published_chart.loadData '/api/activity_reports/app_published', params, (data) =>
      @appsPublishedTotal data.total
      
    @apps_run_chart.loadData '/api/activity_reports/app_run', params, (data) =>
      @appsRunTotal data.total
      
    @apps_jobs_run_chart.loadData '/api/activity_reports/job_run', params, null, (chart, response) ->
      series = chart.series[0]
      data = {
        name: 'Job run',
        data: response.data
      }
      if series
        series.update({
          name: data.name,
          data: data.data,
          color: data.color
        })
      else
        chart.addSeries(data)
      chart.update({
        legend: {
          enabled: true
        }
      })
    
    @apps_jobs_run_chart.loadData '/api/activity_reports/job_failed', params, null, (chart, response) ->
      series = chart.series[1]
      data = {
        name: 'Job failed',
        data: response.data,
        color: '#F40'
      }
      if series
        series.update({
          name: data.name,
          data: data.data,
          color: data.color
        })
      else
        chart.addSeries(data)
      chart.update({
        legend: {
          enabled: true
        }
      })
    ### Apps Charts END ###
    
    ### Challenges Charts ###
    @challenges_signup_chart.loadData '/api/activity_reports/users_signed_up_for_challenge', params, (data) =>
      @challengesSignupTotal data.total

    @challenges_submissions_chart.loadData '/api/activity_reports/submissions_created', params, (data) =>
      @challengesSubmissionsTotal data.total
    ### Challenges Charts END ###

  constructor: (data) ->
    # Initialize the view
    $('input[name="date_at"]').val(moment().startOf('week').format('MM/DD/YYYY'))
    $('input[name="date_to"]').val(moment().endOf('week').format('MM/DD/YYYY'))

    ### Users Charts ###
    @users_views_chart = new Precision.Chart({
      container: 'users_views_chart'
      type: 'area'
    })
    @userViewsTotal = ko.observable(0)

    @users_access_request_chart = new Precision.Chart({
      container: 'users_access_request_chart'
      type: 'area'
    })
    @userAccessTotal = ko.observable(0)

    @users_logins_chart = new Precision.Chart({
      container: 'users_logins_chart'
      type: 'area'
    })
    @userLoginsTotal = ko.observable(0)
    ### Users Charts END ###

    ### Data Charts ###
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
    ### Data Charts END ###
    
    ### Apps Charts ###
    @totalAppsTotal = data.other_data?.apps
    @publicAppsTotal = data.other_data?.public_apps
    @runtimeTotal = humanizeSeconds data.other_data?.runtime

    @apps_created_chart = new Precision.Chart({
      container: 'apps_created_chart'
      type: 'area'
    })
    @appsCreatedTotal = ko.observable(0)

    @apps_published_chart = new Precision.Chart({
      container: 'apps_published_chart'
      type: 'area'
    })
    @appsPublishedTotal = ko.observable(0)

    @apps_run_chart = new Precision.Chart({
      container: 'apps_run_chart'
      type: 'area'
    })
    @appsRunTotal = ko.observable(0)

    @apps_jobs_run_chart = new Precision.Chart({
      container: 'apps_jobs_run_chart'
      type: 'area'
    })
    ### Apps Charts END ###
    
    ### Challenges Charts ###
    @challenges_signup_chart = new Precision.Chart({
      container: 'challenges_signup_chart'
      type: 'area'
    })
    @challengesSignupTotal = ko.observable(0)

    @challenges_submissions_chart = new Precision.Chart({
      container: 'challenges_submissions_chart'
      type: 'area'
    })
    @challengesSubmissionsTotal = ko.observable(0)
    ### Challenges Charts END ###

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
