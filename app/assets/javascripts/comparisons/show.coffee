class LineChart
  constructor: (selector, dataset, @options) ->
    @margin =
      top: 20
      right: 20
      bottom: 75
      left: 75

    width = $(selector).width()
    height = window.innerHeight/2

    @w = width  - @margin.left - @margin.right
    @h = height - @margin.top - @margin.bottom

    xValues = _.map(dataset, @options.xParams.key)
    yValues = _.map(dataset, @options.yParams.key)

    xDomain = [@options.xParams.min ? d3.min(xValues), @options.xParams.max ? d3.max(xValues)]
    yDomain = [@options.yParams.min ? d3.min(yValues), @options.yParams.max ? d3.max(yValues)]

    @x = d3.scale.linear()
      .domain(xDomain)
      .range([0, @w])

    @y = d3.scale.linear()
      .domain(yDomain)
      .rangeRound([@h, 0])

    @svg = d3.select(selector)
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

  # Options:
  # xKey
  # yKey
  renderLine: (dataset) ->
    lineGenerator = d3.svg.line()
      .x((d) => @x(d[@options.xParams.key]))
      .y((d) => @y(d[@options.yParams.key]))
      .interpolate('linear')

    $g = @svg.selectAll('g.lines')
          .data([dataset])
        .enter()
          .append('g')
          .attr('class', 'lines')

    $lineGraph = $g.append('path')
                  .attr('class', 'line')
                  .attr('d', lineGenerator)

    $tooltip = d3.select("body")
    	.append("div")
      .attr('class', 'chart-tip')
    	.style("position", "absolute")
    	.style("z-index", "10")
    	.style("visibility", "hidden")
    	.text("")

    $g.append('g')
        .attr('class', 'circles')
      .selectAll(".circle")
        .data((d) -> d)
      .enter().append("svg:circle")
        .attr("class", "circle")
        .attr("cx", lineGenerator.x())
        .attr("cy", lineGenerator.y())
        .attr('r', 3.5)
        .on("mouseover", (d) ->
          $tooltip
            .text("Score: #{d['score']}")
            .style("visibility", "visible")
        )
      	.on("mousemove", () ->
          $tooltip.style("top", (event.pageY-50)+"px").style("left",(event.pageX)+"px")
        )
      	.on("mouseout", () ->
          $tooltip.style("visibility", "hidden").text("")
        )

      # TODO: refactor this
      # .append("text")
      #   .attr('class', 'tip')
      #   .text((d) -> d3.format('%')(d['score']))
      #   .attr("x", lineGenerator.x())
      #   .attr("y", lineGenerator.y())

  renderAxis: () ->
    @svg.append('text')
      .attr('class', 'y axis-label')
      .attr('text-anchor', 'middle')
      .attr('y', 10-@margin.left)
      .attr('x', -@h/2)
      .attr('transform', 'rotate(-90)')
      .text(@options.yParams.label)

    @svg.append('text')
      .attr('class', 'x axis-label')
      .attr('text-anchor', 'middle')
      .attr('y', @h + @margin.bottom - 10)
      .attr('x', @w/2)
      .text(@options.xParams.label)

    @svg.append('svg:g')
      .attr('class', 'x axis')
      .attr('transform', "translate(0, #{@h})")

    @svg.append('svg:g')
      .attr('class', 'y axis')
      .attr('transform', "translate(0, 0)")

    xAxis = d3.svg.axis()
              .scale(@x)
              .orient('bottom')
              .tickFormat((d) => d3.format(@options.xParams.format)(d))
              .innerTickSize(-@h)
              .outerTickSize(0)
              .tickPadding(10)

    yAxis = d3.svg.axis()
              .scale(@y)
              .orient('left')
              .tickFormat((d) => d3.format(@options.yParams.format)(d))
              .innerTickSize(-@w)
              .outerTickSize(0)
              .tickPadding(10)

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
  if @params.state == "done"
    meta = @params.meta
    dataset = _.map(meta["weighted_roc"]["data"], (datum) ->
      datumObject = {}
      for datakey, i in meta["weighted_roc"]["header"]
        if _.includes(["f_measure", "precision", "sensitivity"], datakey)
          datumObject[datakey] = parseFloat(datum[i])
        else
          datumObject[datakey] = parseInt(datum[i])
      return datumObject
    )

    new LineChart(".chart-precision-sensitivity", dataset, {
      yParams:
        key: 'precision'
        label: '% Precision'
        format: 'p'
        max: 1
      xParams:
        key: 'sensitivity'
        label: '% Sensitivity'
        format: 'p'
        max: 1
    })

  viewModel = {
    noteAttachModel: new Precision.models.NoteAttachModel(@params.id, 'Comparison')
  }

  ko.applyBindings(viewModel, $container[0])

