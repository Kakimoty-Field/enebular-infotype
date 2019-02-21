var d3 = require("d3")

BarChart.defaultSettings = {
    "label": "country",
    "value": "value",
    "maxValue": "8000"
}

BarChart.settings = EnebularIntelligence.SchemaProcessor(
    [
        {
            "type": "key", "name": "label", "help": "Please specify the key of the data to be the label."
        }, {
            "type": "key", "name": "value", "help": "Please specify the key of the data representing the value."
        }, {
            "type": "text", "name": "maxValue", "help": "Please specify the number of the maximum value."
        },
    ]
    , BarChart.defaultSettings);

function BarChart(settings, options) {
    var that = this;
    this.el = window.document.createElement('div');
    this.settings = settings;
    this.options = options;
    this.data = [];

    this.colors = ["#70C1B3", "#247BA0", "#FFE066", "#F25F5C", "#50514F", "#F45B69", "#211103", "#5C8001", "#23395B", "#470063"];

    var margin = { top: 50, right: 50, bottom: 50, left: 120 },
        width = (options.width || 700) - margin.left - margin.right,
        height = (options.height || 500) - margin.top - margin.bottom;

    this.width = width;
    this.height = height;
    this.margin = margin;

    this.maxvalue = settings.maxValue;

    this.x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    this.y = d3.scale.linear()
        .range([height, 0]);

    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient("bottom");

    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient("left");

    this.svg = d3.select(this.el).append("svg")
        .attr('class', 'barchart')
        .attr('class', 'svgWrapper')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    this.base = this.svg.append("g")
        .attr("transform", "scale(1,1)translate(" + margin.left + "," + margin.top + ")");

    this.base.append("g")
        .attr("class", "x barchart__axis")
        .attr("transform", "translate(0," + that.height + ")")
        .call(that.xAxis)
        .append("text")
        .attr("transform", "rotate(0)")
        .attr("x", width + margin.left)
        .attr("y", 12)
        .attr("dy", ".71em")
        .style("text-anchor", "end");

    this.base.append("g")
        .attr("class", "y barchart__axis")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(that.settings.value);

    this.base.append("g")
        .attr("class", "barchart__labels");
}

BarChart.prototype.addData = function (data) {
    var that = this;

    if (data instanceof Array) {
        data.forEach(function (d) {
            that.data.push(d);
        });
        this.refresh();
    } else {
        this.data = [];
        this.data.push(data);
        this.refresh();
    }
}

BarChart.prototype.clearData = function () {
    this.data = [];
    this.refresh();
}

BarChart.prototype.calculate = function () {
    var that = this;
    var newdata = {};

    this.data.forEach(function (d) {
        var k = d[that.settings.label];
        if (!newdata[k]) newdata[k] = 0;
        newdata[k] += Number(d[that.settings.value]);
    });

    return Object.keys(newdata).map(function (k, i) {
        return {
            key: k,
            value: newdata[k].toFixed(2)
        }
    }).sort(function (a, b) {
        if (a.key < b.key) return -1;
        if (a.key > b.key) return 1;
        return 0;
    })
}

BarChart.prototype.resize = function (options) {
    var that = this;

    this.height = options.height - that.margin.top - that.margin.bottom;
    this.width = options.width - that.margin.left - that.margin.right;

    this.x.rangeRoundBands([0, this.width], .1);
    this.y.range([this.height, 0]);

    this.refresh();
}

BarChart.prototype.refresh = function () {
    var that = this;
    var data = this.calculate();
    var maxValue = this.maxvalue;

    this.x.domain(data.map(function (d) { return d.key; }));
    this.y.domain([0, maxValue]);

    var bar = this.base.selectAll(".barchart__bar").data(data);
    bar.enter().append("rect")

    bar.attr("class", "barchart__bar")
        .attr("fill", function (d, i) {
            return that.colors[i];
        })
        .transition()
        .duration(500)
        .attr("x", function (d) { return that.x(d.key); })
        .attr("width", that.x.rangeBand())
        .attr("y", function (d) { return that.y(d.value); })
        .attr("height", function (d) { return that.height - that.y(d.value); });

    bar.exit().remove();

    var valLabel = this.base.selectAll(".barchart__vallabel").data(data)
    valLabel.enter().append('text')
    valLabel.attr("class", "barchart__vallabel")
        .transition()
        .duration(500)
        .attr("x", function (d) {
            return that.x(d.key) + that.x.rangeBand() / 2 - d.value.toString().length * 3;
        })
        .attr("y", function (d, i) { return that.height; })
        .attr("fill", "#FFF")
        .attr("dy", "-1em")
        .text(function (d) { return d.value; });
    valLabel.exit().remove();

    this.svg = d3.select(this.el).transition();

    this.svg.select(".x.barchart__axis")
        .duration(500)
        .attr("transform", "translate(0," + that.height + ")")
        .call(this.xAxis);

    this.svg.select(".y.barchart__axis")
        .duration(500)
        .call(this.yAxis);
}

BarChart.prototype.getEl = function () {
    return this.el;
}

window.EnebularIntelligence.register('barchart', BarChart);
module.exports = BarChart;
