/*jslint indent: 2, nomen: true, maxlen: 100, white: true  plusplus: true, browser: true*/
/*global $, arangoHelper, jasmine, describe, beforeEach, afterEach, it, spyOn, expect*/

(function () {
    "use strict";

    describe("The dashboard view", function () {

        var view, dyGraphConfigDummy, modalDummy;

        beforeEach(function () {
            window.App = {
                navigate: function () {
                    throw "This should be a spy";
                }
            };
            dyGraphConfigDummy = {
                getDetailChartConfig: function () {
                    return {
                        header: "dummyheader"
                    };
                },
                getDashBoardFigures: function () {
                    return ["a", "b", "c"];
                },
                getDefaultConfig: function (d) {
                    return {
                        header: "dummyheader",
                        div: "#" + d
                    };
                },
                mapStatToFigure: {
                    a: ["times", "x", "blub"],
                    d: ["times", "y"],
                    c: ["times", "z"],
                    abc: [1]
                },

                colors: [1, 2]

            };
            modalDummy = {
                hide: function () {
                },
                show: function () {
                }
            };
            window.modalView = modalDummy;

            view = new window.DashboardView({dygraphConfig: dyGraphConfigDummy});
        });

        afterEach(function () {
            delete window.App;
        });

        it("assert the basics", function () {


            expect(view.interval).toEqual(10000);
            expect(view.defaultFrame).toEqual(20 * 60 * 1000);
            expect(view.defaultDetailFrame).toEqual(2 * 24 * 60 * 60 * 1000);
            expect(view.history).toEqual({});
            expect(view.graphs).toEqual({});
            expect(view.alreadyCalledDetailChart).toEqual([]);

            expect(view.events).toEqual({
                "click .dashboard-chart": jasmine.any(Function),
                "mousedown .dygraph-rangesel-zoomhandle": jasmine.any(Function),
                "mouseup .dygraph-rangesel-zoomhandle": jasmine.any(Function)
            });

            expect(view.tendencies).toEqual({

                asyncRequestsCurrent: ["asyncRequestsCurrent", "asyncRequestsCurrentPercentChange"],
                asyncRequestsAverage: ["asyncPerSecond15M", "asyncPerSecondPercentChange15M"],
                clientConnectionsCurrent: ["clientConnectionsCurrent",
                    "clientConnectionsCurrentPercentChange"
                ],
                clientConnectionsAverage: [
                    "clientConnections15M", "clientConnectionsPercentChange15M"
                ],
                numberOfThreadsCurrent: [
                    "numberOfThreadsCurrent", "numberOfThreadsCurrentPercentChange"],
                numberOfThreadsAverage: ["numberOfThreads15M", "numberOfThreadsPercentChange15M"],
                virtualSizeCurrent: ["virtualSizeCurrent", "virtualSizePercentChange"],
                virtualSizeAverage: ["virtualSize15M", "virtualSizePercentChange15M"]
            });

            expect(view.barCharts).toEqual({
                totalTimeDistribution: [
                    "queueTimeDistributionPercent", "requestTimeDistributionPercent"
                ],
                dataTransferDistribution: [
                    "bytesSentDistributionPercent", "bytesReceivedDistributionPercent"]
            });


            expect(view.barChartsElementNames).toEqual({
                queueTimeDistributionPercent: "Queue Time",
                requestTimeDistributionPercent: "Request Time",
                bytesSentDistributionPercent: "Bytes sent",
                bytesReceivedDistributionPercent: "Bytes received"

            });

        });

        it("getDetailFigure", function () {
            var jQueryDummy = {
                attr: function () {

                }
            };
            spyOn(window, "$").andReturn(
                jQueryDummy
            );
            spyOn(jQueryDummy, "attr").andReturn("asyncRequestsChartContainer");
            expect(view.getDetailFigure({currentTarget: ""})).toEqual("requestsAsync");


        });
        it("getDetailFigure for clientConnections", function () {
            var jQueryDummy = {
                attr: function () {

                }
            };
            spyOn(window, "$").andReturn(
                jQueryDummy
            );
            spyOn(jQueryDummy, "attr").andReturn("clientConnectionsDistributionContainer");
            expect(view.getDetailFigure({currentTarget: ""})).toEqual("httpConnections");

        });


        it("showDetail", function () {
            spyOn(view, "getDetailFigure").andReturn("requestsAsync");
            spyOn(view, "getStatistics");
            spyOn(modalDummy, "hide");
            spyOn(modalDummy, "show");
            var jQueryDummy = {
                attr: function () {

                },
                on: function (a, b) {
                    b();
                },
                toggleClass: function (a, b) {

                },
                height: function () {
                    return 100;
                },
                width: function () {
                    return 100;
                }


            };
            spyOn(window, "$").andReturn(
                jQueryDummy
            );
            spyOn(window, "Dygraph");
            spyOn(dyGraphConfigDummy, "getDetailChartConfig").andCallThrough();
            spyOn(jQueryDummy, "on").andCallThrough();
            spyOn(jQueryDummy, "toggleClass");
            spyOn(jQueryDummy, "height").andCallThrough();
            spyOn(jQueryDummy, "width").andCallThrough();
            spyOn(view, "hidden");

            view.showDetail("");

            expect(view.getDetailFigure).toHaveBeenCalledWith("");
            expect(view.getStatistics).toHaveBeenCalledWith("requestsAsync");
            expect(view.getDetailFigure).toHaveBeenCalledWith("");
            expect(view.detailGraphFigure).toEqual("requestsAsync");
            expect(dyGraphConfigDummy.getDetailChartConfig).toHaveBeenCalledWith("requestsAsync");
            expect(modalDummy.hide).toHaveBeenCalled();
            expect(jQueryDummy.height).toHaveBeenCalled();
            expect(jQueryDummy.width).toHaveBeenCalled();
            expect(window.$).toHaveBeenCalledWith('#modal-dialog');
            expect(window.$).toHaveBeenCalledWith('.modal-chart-detail');
            expect(jQueryDummy.on).toHaveBeenCalledWith('hidden', jasmine.any(Function));
            expect(jQueryDummy.toggleClass).toHaveBeenCalledWith("modal-chart-detail", true);
            expect(modalDummy.show).toHaveBeenCalledWith("modalGraph.ejs",
                "dummyheader",
                undefined,
                undefined,
                undefined,
                view.events
            );
            expect(window.Dygraph).toHaveBeenCalledWith(
                document.getElementById("lineChartDetail"),
                undefined,
                {
                    header: "dummyheader",
                    height: 70,
                    width: 84
                });

        });

        it("hidden", function () {
            view.detailGraph = {destroy: function () {
            }};
            view.detailGraphFigure = 1;
            spyOn(view.detailGraph, "destroy");
            view.hidden();
            expect(view.detailGraph).toEqual(undefined);
            expect(view.detailGraphFigure).toEqual(undefined);

        });

        it("getCurrentSize", function () {
            var jQueryDummy = {
                attr: function () {

                },
                height: function () {
                    return 100;
                },
                width: function () {
                    return 100;
                }
            };
            spyOn(window, "$").andReturn(
                jQueryDummy
            );
            spyOn(jQueryDummy, "attr");
            spyOn(jQueryDummy, "height").andCallThrough();
            spyOn(jQueryDummy, "width").andCallThrough();

            expect(view.getCurrentSize("anyDiv")).toEqual({height: 100, width: 100});

            expect(jQueryDummy.height).toHaveBeenCalled();
            expect(jQueryDummy.width).toHaveBeenCalled();
            expect(window.$).toHaveBeenCalledWith('#anyDiv');
            expect(jQueryDummy.attr).toHaveBeenCalledWith("style", "");

        });

        it("getCurrentSize", function () {
            spyOn(dyGraphConfigDummy, "getDashBoardFigures").andCallThrough();
            spyOn(dyGraphConfigDummy, "getDefaultConfig").andCallThrough();
            spyOn(view, "getCurrentSize").andReturn({height: 80, width: 100});
            spyOn(window, "Dygraph");
            view.prepareDygraphs();
            expect(dyGraphConfigDummy.getDashBoardFigures).toHaveBeenCalled();
            expect(dyGraphConfigDummy.getDefaultConfig).toHaveBeenCalledWith("a");
            expect(dyGraphConfigDummy.getDefaultConfig).toHaveBeenCalledWith("b");
            expect(dyGraphConfigDummy.getDefaultConfig).toHaveBeenCalledWith("c");
            expect(view.getCurrentSize).toHaveBeenCalledWith("#a");
            expect(view.getCurrentSize).toHaveBeenCalledWith("#b");
            expect(view.getCurrentSize).toHaveBeenCalledWith("#c");
            expect(window.Dygraph).toHaveBeenCalledWith(
                document.getElementById("#a"),
                [],
                {
                    header: "dummyheader",
                    div: '#a',
                    height: 80,
                    width: 100
                }
            );
            expect(window.Dygraph).toHaveBeenCalledWith(
                document.getElementById("#b"),
                [],
                {
                    header: "dummyheader",
                    div: '#b',
                    height: 80,
                    width: 100
                }
            );
            expect(window.Dygraph).toHaveBeenCalledWith(
                document.getElementById("#c"),
                [],
                {
                    header: "dummyheader",
                    div: '#c',
                    height: 80,
                    width: 100
                }
            );

        });

        it("updateCharts", function () {
            view.isUpdating = true;
            spyOn(view, "updateLineChart");
            spyOn(view, "prepareD3Charts");
            spyOn(view, "prepareResidentSize");
            spyOn(view, "updateTendencies");

            view.graphs = {"a": 1, "b": 2, "c": 3};
            view.updateCharts();
            expect(view.prepareD3Charts).toHaveBeenCalledWith(true);
            expect(view.prepareResidentSize).toHaveBeenCalledWith(true);
            expect(view.updateTendencies).toHaveBeenCalled();
            expect(view.updateLineChart).toHaveBeenCalledWith("a", false);
            expect(view.updateLineChart).toHaveBeenCalledWith("b", false);
            expect(view.updateLineChart).toHaveBeenCalledWith("c", false);

        });

        it("updateCharts in detail mode", function () {
            view.isUpdating = true;
            spyOn(view, "updateLineChart");
            spyOn(view, "prepareD3Charts");
            spyOn(view, "prepareResidentSize");
            spyOn(view, "updateTendencies");

            view.detailGraph = "1";
            view.detailGraphFigure = "abc";
            view.updateCharts();
            expect(view.prepareD3Charts).not.toHaveBeenCalled();
            expect(view.prepareResidentSize).not.toHaveBeenCalled();
            expect(view.updateTendencies).not.toHaveBeenCalled();
            expect(view.updateLineChart).toHaveBeenCalledWith("abc", true);
        });

        it("updateTendencies", function () {
            var jQueryDummy = {
                text: function () {

                }
            };
            spyOn(window, "$").andReturn(
                jQueryDummy
            );
            spyOn(jQueryDummy, "text").andCallThrough();

            view.tendencies = {"a": 1, "b": 2, "c": 3};
            view.history = {
                "a": [1, 2],
                "b": [3, 4],
                "c": [5, 6]
            };
            view.updateTendencies();
            expect(window.$).toHaveBeenCalledWith('#a');
            expect(window.$).toHaveBeenCalledWith('#b');
            expect(window.$).toHaveBeenCalledWith('#c');
            expect(jQueryDummy.text).toHaveBeenCalledWith("1 (2 %)");
            expect(jQueryDummy.text).toHaveBeenCalledWith("3 (4 %)");
            expect(jQueryDummy.text).toHaveBeenCalledWith("5 (6 %)");

        });

        it("updateDateWindow for detail chart", function () {
            view.interval = 10;
            expect(view.updateDateWindow({dateWindow_: [100, 1000]}, true)).toEqual([100, 1000]);

        });

        it("updateDateWindow for normal chart", function () {
            view.defaultFrame = 10;
            expect(view.updateDateWindow("aaaa", false)).not.toEqual(undefined);

        });


        it("updateLineChart for normal chart", function () {
            var dyGraphDummy = {
                updateOptions: function () {
                }
            };
            spyOn(view, "updateDateWindow").andReturn([0, 100]);
            spyOn(dyGraphDummy, "updateOptions");
            view.graphs = {"aaaa": dyGraphDummy};
            view.updateLineChart("aaaa", false);
            expect(view.updateDateWindow).toHaveBeenCalledWith(dyGraphDummy, false);
            expect(dyGraphDummy.updateOptions).toHaveBeenCalledWith(
                {
                    file: undefined,
                    dateWindow: [0, 100]
                }
            );
        });

        it("updateLineChart for detail chart", function () {
            var dyGraphDummy = {
                updateOptions: function () {
                }
            };
            spyOn(view, "updateDateWindow").andReturn([0, 100]);
            spyOn(dyGraphDummy, "updateOptions");
            view.detailGraph = dyGraphDummy;
            view.updateLineChart("aaaa", true);
            expect(view.updateDateWindow).toHaveBeenCalledWith(dyGraphDummy, true);
            expect(dyGraphDummy.updateOptions).toHaveBeenCalledWith(
                {
                    file: undefined,
                    dateWindow: [0, 100]
                }
            );
        });

        it("mergeDygraphHistory", function () {
            spyOn(dyGraphConfigDummy, "getDashBoardFigures").andCallThrough();

            view.mergeDygraphHistory({
                times: [1234567, 234567],
                x: ["aa", "bb"],
                y: [11, 22],
                z: [100, 100]
            }, 0);

            expect(dyGraphConfigDummy.getDashBoardFigures).toHaveBeenCalledWith(true);
            expect(view.history.a).toEqual([
                [jasmine.any(Date) , "aa"]
            ]);
            expect(view.history.c).toEqual([
                [jasmine.any(Date) , 100]
            ]);

        });


        it("mergeHistory", function () {
            view.tendencies = {
                virtualSizeAverage: ["y", "z"]
            };
            view.barCharts = {
                barchart: "bb"
            };
            var param = {
                times: [1234567, 234567],
                x: ["aa", "bb"],
                y: [11, 22],
                z: [100, 100],
                residentSizePercent: [1, 2],
                nextStart: "tomorrow"
            };

            spyOn(view, "mergeDygraphHistory");
            spyOn(view, "mergeBarChartData");
            view.mergeHistory(param, false);
            expect(view.mergeBarChartData).toHaveBeenCalledWith("bb", param);
            expect(view.mergeDygraphHistory).toHaveBeenCalledWith(param, 0);
            expect(view.mergeDygraphHistory).toHaveBeenCalledWith(param, 1);

            expect(view.nextStart).toEqual("tomorrow");

            expect(view.history.residentSizeChart).toEqual([
                {
                    "key": "",
                    "color": dyGraphConfigDummy.colors[1],
                    "values": [
                        {
                            label: "used",
                            value: 200
                        }
                    ]
                },
                {
                    "key": "",
                    "color": dyGraphConfigDummy.colors[0],
                    "values": [
                        {
                            label: "used",
                            value: -100
                        }
                    ]
                }

            ]);

        });

        it("mergeHistory in detail Mode", function () {
            view.tendencies = {
                virtualSizeAverage: ["y", "z"]
            };
            view.barCharts = {
                barchart: "bb"
            };
            var param = {
                times: [1234567, 234567],
                x: ["aa", "bb"],
                y: [11, 22],
                z: [100, 100],
                residentSizePercent: [1, 2],
                nextStart: "tomorrow"
            };

            spyOn(view, "mergeDygraphHistory");
            spyOn(view, "mergeBarChartData");
            view.mergeHistory(param, true);
            expect(view.mergeBarChartData).not.toHaveBeenCalled();
            expect(view.mergeDygraphHistory).toHaveBeenCalledWith(param, 0);
            expect(view.mergeDygraphHistory).toHaveBeenCalledWith(param, 1);

        });


        it("mergeBarChartData", function () {
            view.barChartsElementNames = {
                b1: "bb",
                b2: "bc"
            };
            var v1 = {
                "key": "bb",
                "color": dyGraphConfigDummy.colors[0],
                "values": [
                    {label: "blub", value: 1},
                    {label: "blub", value: 2}
                ]
            }, v2 = {
                "key": "bc",
                "color": dyGraphConfigDummy.colors[1],
                "values": [
                    {label: "blub", value: 3},
                    {label: "blub", value: 4}
                ]
            };

            spyOn(view, "getLabel").andReturn("blub");
            expect(view.mergeBarChartData(["b1", "b2"],
                {
                    b1: {
                        cuts: ["cuts"],
                        values: [1, 2]
                    },
                    b2: {
                        cuts: ["cuts2"],
                        values: [3, 4]
                    }
                }
            )
            ).toEqual([v1, v2]);
            expect(view.getLabel).toHaveBeenCalledWith(["cuts"], 0);
            expect(view.getLabel).toHaveBeenCalledWith(["cuts"], 1);
            expect(view.getLabel).toHaveBeenCalledWith(["cuts2"], 0);
            expect(view.getLabel).toHaveBeenCalledWith(["cuts2"], 1);

        });


        it("getLabel with bad counter element", function () {
            expect(view.getLabel([1, 2, 3], 3)).toEqual(">3");
        });
        it("getLabel", function () {
            expect(view.getLabel([1, 2, 3], 2)).toEqual("2 - 3");
        });

        it("getLabel with counter = 0", function () {
            expect(view.getLabel([1, 2, 3], 0)).toEqual("0 - 1");
        });

        it("getStatistics with nextStart", function () {
            view.nextStart = 10000;
            view.server = {
                endpoint: "abcde",
                target: "xyz"
            };
            spyOn(view, "mergeHistory");
            spyOn($, "ajax").andCallFake(function (url, opt) {
                expect(url).toEqual(
                    "statistics/full?start=10000&serverEndpoint=abcde&DbServer=xyz"
                );
                expect(opt.async).toEqual(false);
                return {
                    done: function (y) {
                        y({
                            times: [1, 2, 3]
                        });
                    }
                };
            });

            view.getStatistics();
            expect(view.mergeHistory).toHaveBeenCalledWith({
                times: [1, 2, 3]
            }, false);
            expect(view.isUpdating).toEqual(true);

        });

        it("getStatistics without nextStart and no data yet", function () {
            view.server = {
                endpoint: "abcde",
                target: "xyz"
            };
            spyOn(view, "mergeHistory");
            spyOn(modalDummy, "show");
            spyOn($, "ajax").andCallFake(function (url, opt) {
                expect(opt.async).toEqual(false);
                return {
                    done: function (y) {
                        y({
                            times: []
                        });
                    }
                };
            });

            view.getStatistics();
            expect(view.mergeHistory).not.toHaveBeenCalled();
            expect(modalDummy.show).toHaveBeenCalledWith("modalWarning.ejs",
                "WARNING !");
            expect(view.isUpdating).toEqual(false);
        });

        it("getStatistics with not loaded figure", function () {
            view.nextStart = 10000;
            view.server = {
                endpoint: "abcde",
                target: "xyz"
            };
            spyOn(view, "mergeHistory");
            spyOn($, "ajax").andCallFake(function (url, opt) {
                expect(opt.async).toEqual(false);
                return {
                    done: function (y) {
                        y({
                            times: [1, 2, 3]
                        });
                    }
                };
            });

            view.getStatistics("abc");
            expect(view.mergeHistory).toHaveBeenCalledWith({
                times: [1, 2, 3]
            }, true);
            expect(view.isUpdating).toEqual(true);
            expect(view.alreadyCalledDetailChart).toEqual(["abc"]);

        });

        it("getStatistics with already loaded figure", function () {
            view.nextStart = 10000;
            view.alreadyCalledDetailChart = ["abc"];
            view.server = {
                endpoint: "abcde",
                target: "xyz"
            };
            spyOn(view, "mergeHistory");
            spyOn($, "ajax");

            view.getStatistics("abc");
            expect(view.mergeHistory).not.toHaveBeenCalledWith({
                times: [1, 2, 3]
            }, true);
            expect($.ajax).not.toHaveBeenCalled();
            expect(view.alreadyCalledDetailChart).toEqual(["abc"]);

        });


        /*

         prepareResidentSize: function (update) {
         var dimensions = this.getCurrentSize('#residentSizeChartContainer'),
         self = this, currentP =
         Math.round(self.history.residentSizeChart[0].values[0].value * 100) /100;
         nv.addGraph(function () {
         var chart = nv.models.multiBarHorizontalChart()
         */
        /*.width(dimensions.width * 0.3)
         .height(dimensions.height)*/
        /*

         .x(function (d) {
         return d.label;
         })
         .y(function (d) {
         return d.value;
         })
         .width(dimensions.width * 0.95)
         .height(dimensions.height)
         .margin({
         //top: dimensions.height / 8,
         right: dimensions.width / 10
         //bottom: dimensions.height / 22,
         //left: dimensions.width / 6*/
        /*

         })
         .showValues(false)
         .showYAxis(false)
         .showXAxis(false)
         .transitionDuration(350)
         .tooltips(false)
         .showLegend(false)
         .stacked(true)
         .showControls(false);
         chart.yAxis
         .tickFormat(function (d) {return d + "%";});
         chart.xAxis.showMaxMin(false);
         chart.yAxis.showMaxMin(false);
         d3.select('#residentSizeChart svg')
         .datum(self.history.residentSizeChart)
         .call(chart);
         d3.select('#residentSizeChart svg').select('.nv-zeroLine').remove();
         if (update) {
         d3.select('#residentSizeChart svg').select('#total').remove();
         d3.select('#residentSizeChart svg').select('#percentage').remove();
         }
         var data = [Math.round(self.history.virtualSizeCurrent[0] * 1000) / 1000 + "GB"];

         d3.select('#residentSizeChart svg').selectAll('#total')
         .data(data)
         .enter()
         .append("text")
         .style("font-size", dimensions.height / 8 + "px")
         .style("font-weight", 400)
         .style("font-family", "Open Sans")
         .attr("id", "total")
         .attr("x", dimensions.width /1.15)
         .attr("y", dimensions.height/ 2.1)
         .text(function(d){return d;});
         d3.select('#residentSizeChart svg').selectAll('#percentage')
         .data(data)
         .enter()
         .append("text")
         .style("font-size", dimensions.height / 10 + "px")
         .style("font-weight", 400)
         .style("font-family", "Open Sans")
         .attr("id", "percentage")
         .attr("x", dimensions.width * 0.1)
         .attr("y", dimensions.height/ 2.1)
         .text(currentP + " %");
         nv.utils.windowResize(chart.update);
         }, function() {
         d3.selectAll("#residentSizeChart .nv-bar").on('click',
         function() {
         // no idea why this has to be empty, well anyways...
         }
         );
         });
         },


         prepareD3Charts: function (update) {
         var v, self = this, barCharts = {
         totalTimeDistribution: [
         "queueTimeDistributionPercent", "requestTimeDistributionPercent"],
         dataTransferDistribution: [
         "bytesSentDistributionPercent", "bytesReceivedDistributionPercent"]
         }, f;

         _.each(Object.keys(barCharts), function (k) {
         var dimensions = self.getCurrentSize('#' + k
         + 'Container .dashboard-interior-chart');
         if (dimensions.width > 400 ) {
         f = 18;
         } else if (dimensions.width > 300) {
         f = 16;
         } else if (dimensions.width > 200) {
         f = 14;
         } else if (dimensions.width > 100) {
         f = 12;
         } else {
         f = 10;
         }
         var selector = "#" + k + "Container svg";
         nv.addGraph(function () {
         var chart = nv.models.multiBarHorizontalChart()
         .x(function (d) {
         return d.label;
         })
         .y(function (d) {
         return d.value;
         })
         .width(dimensions.width)
         .height(dimensions.height)
         .margin({
         top: dimensions.height / 8,
         right: dimensions.width / 35,
         bottom: dimensions.height / 22,
         left: dimensions.width / 6
         })
         .showValues(false)
         .showYAxis(true)
         .showXAxis(true)
         .transitionDuration(350)
         .tooltips(false)
         .showLegend(false)
         .showControls(false);

         chart.yAxis
         .tickFormat(function (d) {return Math.round(d* 100 * 100) / 100 + "%";});


         d3.select(selector)
         .datum(self.history[k])
         .call(chart);

         nv.utils.windowResize(chart.update);
         if (!update) {
         d3.select(selector)
         .append("text")
         .attr("x", dimensions.width * 0.5)
         .attr("y", dimensions.height / 12)
         .attr("id", "distributionHead")
         .style("font-size", f + "px")
         .style("font-weight", 400)
         .classed("distributionHeader", true)
         .style("font-family", "Open Sans")
         .text("Distribution");
         var v1 = self.history[k][0].key;
         var v2 = self.history[k][1].key;
         $('#' + k + "Legend").append(
         '<span style="font-weight: bold; color: ' +
         self.history[k][0].color + ';">' +
         '<div style="display: inline-block; position: relative;' +
         ' bottom: .5ex; padding-left: 1em;' +
         ' height: 1px; border-bottom: 2px solid ' +
         self.history[k][0].color + ';"></div>'
         + " " + v1 + '</span><br>' +
         '<span style="font-weight: bold; color: ' +
         self.history[k][1].color + ';">' +
         '<div style="display: inline-block; position: ' +
         'relative; bottom: .5ex; padding-left: 1em;' +
         ' height: 1px; border-bottom: 2px solid ' +
         self.history[k][1].color + ';"></div>'
         + " " + v2 + '</span><br>'
         );
         } else {
         d3.select(selector).select('.distributionHeader').remove();
         d3.select(selector)
         .append("text")
         .attr("x", dimensions.width * 0.5)
         .attr("y", dimensions.height / 12)
         .attr("id", "distributionHead")
         .style("font-size", f + "px")
         .style("font-weight", 400)
         .classed("distributionHeader", true)
         .style("font-family", "Open Sans")
         .text("Distribution");
         }
         }, function() {
         d3.selectAll(selector + " .nv-bar").on('click',
         function() {
         // no idea why this has to be empty, well anyways...
         }
         );
         });
         });

         },*/

        it("stopUpdating", function () {
            view.stopUpdating();
            expect(view.isUpdating).toEqual(false);
        });

        it("startUpdating with running timer", function () {
            view.timer = 1234;
            spyOn(window, "setInterval");
            view.startUpdating();
            expect(window.setInterval).not.toHaveBeenCalled();
        });

        it("startUpdating with no timer but no statistics updates", function () {
            spyOn(view, "getStatistics");
            spyOn(view, "updateCharts");
            view.isUpdating = false;
            spyOn(window, "setInterval").andCallFake(
                function (a) {
                    a();
                }
            );
            view.startUpdating();
            expect(window.setInterval).toHaveBeenCalled();
            expect(view.getStatistics).toHaveBeenCalled();
            expect(view.updateCharts).not.toHaveBeenCalled();
        });

        it("startUpdating with no timer and statistics updates", function () {
            spyOn(view, "getStatistics");
            spyOn(view, "updateCharts");
            view.isUpdating = true;
            spyOn(window, "setInterval").andCallFake(
                function (a) {
                    a();
                }
            );
            view.startUpdating();
            expect(window.setInterval).toHaveBeenCalled();
            expect(view.getStatistics).toHaveBeenCalled();
            expect(view.updateCharts).toHaveBeenCalled();
        });


        it("resize", function () {
            spyOn(view, "getCurrentSize").andReturn({
                width: 100,
                height: 10

            });
            spyOn(view, "prepareD3Charts");
            spyOn(view, "prepareResidentSize");

            var dyGraphDummy = {
                resize: function () {
                },
                maindiv_: {id: "maindiv"}
            };
            spyOn(dyGraphDummy, "resize");

            view.graphs = {"aaaa": dyGraphDummy};
            view.isUpdating = true;

            spyOn(window, "setInterval").andCallFake(
                function (a) {
                    a();
                }
            );
            view.resize();
            expect(view.getCurrentSize).toHaveBeenCalledWith("maindiv");
            expect(dyGraphDummy.resize).toHaveBeenCalledWith(100, 10);
            expect(view.prepareD3Charts).toHaveBeenCalledWith(true);
            expect(view.prepareResidentSize).toHaveBeenCalledWith(true);
        });

        it("resize when nothing is updating", function () {
            spyOn(view, "getCurrentSize").andReturn({
                width: 100,
                height: 10

            });
            spyOn(view, "prepareD3Charts");
            spyOn(view, "prepareResidentSize");

            var dyGraphDummy = {
                resize: function () {
                },
                maindiv_: {id: "maindiv"}
            };
            spyOn(dyGraphDummy, "resize");

            view.graphs = {"aaaa": dyGraphDummy};
            view.isUpdating = false;

            spyOn(window, "setInterval").andCallFake(
                function (a) {
                    a();
                }
            );
            view.resize();
            expect(view.getCurrentSize).not.toHaveBeenCalled();
            expect(dyGraphDummy.resize).not.toHaveBeenCalled();
            expect(view.prepareD3Charts).not.toHaveBeenCalled();
            expect(view.prepareResidentSize).not.toHaveBeenCalled();
        });

        it("resize with detail chart", function () {
            spyOn(view, "getCurrentSize").andReturn({
                width: 100,
                height: 10

            });
            spyOn(view, "prepareD3Charts");
            spyOn(view, "prepareResidentSize");

            var dyGraphDummy = {
                resize: function () {
                },
                maindiv_: {id: "maindiv"}
            };
            spyOn(dyGraphDummy, "resize");

            view.graphs = {};
            view.detailGraph = dyGraphDummy;
            view.isUpdating = true;

            spyOn(window, "setInterval").andCallFake(
                function (a) {
                    a();
                }
            );
            view.resize();
            expect(view.getCurrentSize).toHaveBeenCalledWith("maindiv");
            expect(dyGraphDummy.resize).toHaveBeenCalledWith(100, 10);
            expect(view.prepareD3Charts).toHaveBeenCalledWith(true);
            expect(view.prepareResidentSize).toHaveBeenCalledWith(true);
        });


        it("render without modal and no updating", function () {
            var jQueryDummy = {
                html: function () {

                }
            };
            spyOn(view, "startUpdating");
            spyOn(view, "getStatistics");
            spyOn(view, "prepareDygraphs");

            spyOn(view, "prepareD3Charts");
            spyOn(view, "prepareResidentSize");
            spyOn(view, "updateTendencies");

            spyOn(window, "$").andReturn(
                jQueryDummy
            );
            spyOn(jQueryDummy, "html");
            view.isUpdating = false;
            view.render(false);

            expect(window.$).toHaveBeenCalledWith(view.el);
            expect(view.startUpdating).toHaveBeenCalled();
            expect(view.getStatistics).toHaveBeenCalled();
            expect(view.prepareDygraphs).toHaveBeenCalled();

            expect(view.prepareD3Charts).not.toHaveBeenCalled();
            expect(view.prepareResidentSize).not.toHaveBeenCalled();
            expect(view.updateTendencies).not.toHaveBeenCalled();

            expect(jQueryDummy.html).toHaveBeenCalled();


        });

        it("render without modal and updating", function () {
            var jQueryDummy = {
                html: function () {

                }
            };
            spyOn(view, "startUpdating");
            spyOn(view, "getStatistics");
            spyOn(view, "prepareDygraphs");

            spyOn(view, "prepareD3Charts");
            spyOn(view, "prepareResidentSize");
            spyOn(view, "updateTendencies");


            spyOn(window, "$").andReturn(
                jQueryDummy
            );
            spyOn(jQueryDummy, "html");
            view.isUpdating = true;
            view.render(false);

            expect(window.$).toHaveBeenCalledWith(view.el);
            expect(view.startUpdating).toHaveBeenCalled();
            expect(view.getStatistics).toHaveBeenCalled();
            expect(view.prepareDygraphs).toHaveBeenCalled();

            expect(view.prepareD3Charts).toHaveBeenCalled();
            expect(view.prepareResidentSize).toHaveBeenCalled();
            expect(view.updateTendencies).toHaveBeenCalled();

            expect(jQueryDummy.html).toHaveBeenCalled();


        });

    });

}());
