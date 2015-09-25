class ROCChart
  constructor: (dataset) ->
    @margin =
      top: 50
      right: 50
      bottom: 50
      left: 100

    width = $(".roc-chart").width()
    height = 500

    @w = width  - @margin.left - @margin.right
    @h = height - @margin.top - @margin.bottom

    xValues = _.map(dataset, 'sensitivity')
    yValues = _.map(dataset, 'precision')

    xDomain = [d3.min(xValues) * 0.95, d3.max(xValues) * 1.05]
    yDomain = [d3.min(yValues) * 0.95, d3.max(yValues) * 1.05]

    @x = d3.scale.linear()
      .domain(xDomain)
      .range([0, @w])

    @y = d3.scale.linear()
      .domain(yDomain)
      .rangeRound([@h, 0])

    @svg = d3.select('.roc-chart')
        .append('svg:svg')
          # .attr('width', width)
          # .attr('height', height)
          .attr('class', 'svg-content-responsive chart')
          .attr("preserveAspectRatio", "xMinYMin meet")
          .attr("viewBox", "0 0 #{width} #{height}")
        .append("g")
          .attr("transform", "translate(" + @margin.left + "," + @margin.top + ")")

    @renderAxis()
    @renderLine(dataset)

  renderLine: (dataset) ->
    lineGenerator = d3.svg.line()
      .x((d) => @x(d.sensitivity))
      .y((d) => @y(d.precision))
      .interpolate('basis')

    g = @svg.selectAll('g.lines')
          .data([dataset])
        .enter()
          .append('g')
          .attr('class', 'lines')

    lineGraph = g.append('path')
                  .attr('class', 'line')
                  .attr('d', lineGenerator)

  renderAxis: () ->
    @svg.append('text')
      .attr('class', 'y axis-label')
      .attr('text-anchor', 'middle')
      .attr('y', 20-@margin.left)
      .attr('x', -@h/2)
      .attr('transform', 'rotate(-90)')
      .text('% Precision')

    @svg.append('text')
      .attr('class', 'x axis-label')
      .attr('text-anchor', 'middle')
      .attr('y', @h + @margin.bottom - 10)
      .attr('x', @w/2)
      .text('% Sensitivity')

    @svg.append('svg:g')
      .attr('class', 'x axis')
      .attr('transform', "translate(0, #{@h})")

    @svg.append('svg:g')
      .attr('class', 'y axis')
      .attr('transform', "translate(0, 0)")

    xAxis = d3.svg.axis()
              .scale(@x)
              .orient('bottom')
              .tickFormat((d) -> d3.format(".2%")(d))

    yAxis = d3.svg.axis()
              .scale(@y)
              .orient('left')
              .tickFormat((d) -> d3.format(".2%")(d))

    @svg.select('g.x.axis').call(xAxis)
    @svg.select('g.y.axis').call(yAxis)

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

ComparisonsController = Paloma.controller('Comparisons')
ComparisonsController::show = ->
  $container = $("body main")
  meta = @params.meta
  rocDataset = _.map(meta["weighted_roc"]["data"], (datum) ->
    return {
      precision: parseFloat(datum[4])
      sensitivity: parseFloat(datum[5])
    }
  )

  rocChart = new ROCChart(rocDataset)


  # viewModel = new ComparisonShowView(@params.meta)
  # ko.applyBindings(viewModel, $container[0])
