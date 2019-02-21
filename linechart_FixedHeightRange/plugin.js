var d3 = require('d3')

LineChart.defaultSettings = {
    "label": "country",
    "value": "value",
    "HorizontalAxis": "created",
    "limit": "10",
    "maxValue": 10,
    "minValue": 0
};

LineChart.settings = EnebularIntelligence.SchemaProcessor([
    {
        type: "key", name: "label", help: "Please specify the key of the data to be the label."
    }, {
        type: "key", name: "value", help: "Please specify the key of the data representing the value."
    }, {
        type: "key", name: "HorizontalAxis", help: "Please specify the key of the data horizontal axis."
    },
    {
        type: "select", name: "limit", help: "The number of data to be displayed", options: ["10", "20", "30", "all"]
    },
    {
        type: "text", name: "maxValue", help: "Please specify the number of the maximum value."
    },
    {
        type: "text", name: "minValue", help: "Please specify the number of the minimum value."
    }
], LineChart.defaultSettings);

function LineChart(settings, options) {
    var that = this;
    this.el = window.document.createElement('div');

    this.settings = settings;
    this.options = options;
    this.data = [];
    this.maxNumber = 0;
    this.minNumber = 0;

    var horizon = settings.HorizontalAxis;

    this.width = options.width || 700;
    this.height = (options.height || 500) - 50;

    this.maxvalue = settings.maxValue;
    this.minvalue = settings.minValue;

    this.margin = { top: 20, right: 80, bottom: 30, left: 50 }

    this.svg = d3.select(this.el).append("svg")
        .attr("class", "mainSvg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.x = d3.scaleTime().range([this.width, 0])
    this.y = d3.scaleLinear().range([0, this.height])
    this.z = ["#70C1B3", "#247BA0", "#FFE066", "#F25F5C", "#50514F", "#F45B69", "#211103", "#5C8001", "#23395B", "#470063"];

    this.valueline = d3.line()
        .x(function (d) {
            return that.x(d[horizon]);
        })
        .y(function (d) {
            return that.y(d[that.settings.value]);
        });
}

LineChart.prototype.addData = function (data) {
    var that = this;

    if (data instanceof Array) {

        var label = this.settings.label;
        var value = this.settings.value;
        var horizon = this.settings.HorizontalAxis;

        this.data = d3.nest()
            .key(function (d) { return d[label]; })
            .entries(data)
            .map(function (d, i) {
                d.values = d.values.filter(function (dd, ii) {
                    if (!isNaN(that.settings.limit))
                        return ii < that.settings.limit;
                    return ii;
                })
                return d;
            })
            .sort(function (a, b) {
                if (a.key < b.key) return -1;
                if (a.key > b.key) return 1;
                return 0;
            });

        // key ごとのソートではなくて、キーでカテゴライズされた要素をソートする
        this.data.forEach((v) => {
            v.values.sort((x, y) => {
                if (x.ts < y.ts) return -1;
                if (x.ts > y.ts) return 1;
                return 0;
            });
        });

        var concatLimitData = this.data.reduce(function (concatArray, d) {
            return concatArray.concat(d.values);
        }, []);

        this.x.domain(d3.extent(concatLimitData, function (d) {
            return d[horizon]; // 横軸の範囲
        }).reverse()
        )
        this.y.domain([this.maxvalue, this.minvalue])  // 縦軸の範囲

        d3.selectAll(".legend-label").remove()

        this.data.map(function (k, i) {

            that.svg.append("text")
                .attr("class", "legend-label")
                .text(function (d) {
                    return k.key;
                })
                .attr("x", function (d) { return (i * 100) + 10; })
                .attr("y", function (d) { return -5; })
                .attr("font-size", "18px")
                .attr("fill", function (d) {
                    return that.z[i]
                })
                .attr("stroke", function (d) {
                    return that.z[i]
                })
                .attr("font-family", 'Arial, Helvetica, sans-serif')
        })

        this.refresh();
    }

}

LineChart.prototype.clearData = function () {
    this.data = {};
    this.refresh();
}

LineChart.prototype.resize = function (options) {
    var that = this;
    this.width = options.width;
    this.height = options.height - 50;

    d3.select(".mainSvg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom);

    this.x.range([this.width - 100, 0])
    this.y.range([0, this.height])

    this.refresh();
}

LineChart.prototype.refresh = function () {
    var that = this;

    if (this.axisX) this.axisX.remove()
    if (this.axisY) this.axisY.remove()
    if (this.yText) this.yText.remove()

    this.axisX = this.svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + this.height + ")")
        .call(d3.axisBottom(this.x));

    this.axisY = this.svg.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(this.y))

    this.yText = this.axisY.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 10)
        .attr("dy", "0.71em")
        .attr("font-family", 'Arial, Helvetica, sans-serif')

    d3.selectAll(".line").remove()

    if (this.data.length > 0) {

        this.data.map(function (d, i) {
            that.svg.append("path")
                .data([d.values])
                .attr("class", "line")
                .attr("id", d.key + "-lineId")
                .attr("d", that.valueline)
                .attr("stroke", function (d) {
                    return that.z[i]
                })

        })
    }

}

LineChart.prototype.getEl = function () {
    return this.el;
}

window.EnebularIntelligence.register('linechart', LineChart);

module.exports = LineChart;