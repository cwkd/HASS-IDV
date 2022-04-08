function computeYears(data) {
    data.columns.push('years');
    for (var i in data) {
        try {
            data[i].years = Math.round(data[i].apartment_price*.2/data[i].breakfast_price/3.65)/100;
        } catch {}
    }
    return data;
}

function computeDeposit(data) {
    data.columns.push('deposit');
    for (var i in data) {
        try {
            data[i].deposit = Math.round(data[i].apartment_price*20)/100;
        } catch {}
    }
    return data;
}

function capitaliseEachWord(str) {
    words = str.split(' ');
    for (var i in words) {
        words[i] = `${words[i][0].toUpperCase()}${words[i].substring(1)}`;
    }
    return words.join(' ');
}

function preloadBarChartBackground() {
    d3.select('#bar-chart').remove();
    var div = d3.select('#bar-chart-container');
    chartWidth = div.style('width').replace("px", "");
    chartHeight = div.style('width').replace("px", "")*3/4;
    axesWidth = chartWidth - margin.left - margin.right;
    axesHeight = chartHeight - margin.top - margin.bottom;
    d3.select('#bar-chart-container')
        .attr('height', chartHeight);
    svgBar = d3.select('#bar-chart-container')
        .style('height', chartHeight + 'px')
        .append('svg')
        .attr('id', 'bar-chart')
        .attr('class', 'chart-background')
        .style('height', chartHeight + 'px')
        .append("g")
        .attr('id', 'bar-chart-canvas')
        .attr('class', 'chart-canvas')
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    svgBar.append("text")
        .attr("transform", `translate(${axesWidth/2}, ${-margin.top*2/3})`)
        .attr('id', 'bar-chart-title')
        .attr('class', 'chart-title')
    // X Axis
    xBar = d3.scaleBand()
        .range([ 0, axesWidth ])
        .padding(0.2);
    svgBar.append("g")
        .attr('id', 'xAxisBar')
        .attr("transform", `translate(0, ${axesHeight})`)
        .call(d3.axisBottom(xBar))
        .selectAll("text")
        .attr("transform", "translate(0,0)rotate(-45)")
        .style("text-anchor", "end");
    xAxisBar = svgBar.select('#xAxisBar');
    // Y Axis
    yBar = d3.scaleLinear()
        .range([ axesHeight, 0]);
    svgBar.append("g")
        .attr('id', 'yAxisBar')
        .call(d3.axisLeft(yBar));
    yAxisBar = svgBar.select('#yAxisBar');
}

function plotByYears(data) {
    chartType = 'years';
    yMax = sortAndYMax(data, chartType);

    d3.select('#bar-chart-title')
        .text("Number of Years to Afford an Apartment Deposit");
    // X axis
    xBar.domain(data.map(d => capitaliseEachWord(d.city)))
    xAxisBar.call(d3.axisBottom(xBar))
        .selectAll("text")
        .attr("transform", "translate(0,0)rotate(-45)")
        .style("text-anchor", "end");
    // Add Y axis
    yBar.domain([0, Math.round(yMax/10)*10]);
    yAxisBar.call(d3.axisLeft(yBar));
    // Bars
    svgBar.selectAll("mybar")
        .data(data)
        .join("rect")
        .attr('class', 'bar')
        .on("mouseover", barOnMouseOver) //Add listener for the mouseover event
        .on("mouseout", barOnMouseOut)   //Add listener for the mouseout event
        .attr("x", d => xBar(capitaliseEachWord(d.city)))
        .attr('y', d => yBar(0))
        .attr("width", xBar.bandwidth())
        .attr("height", d => axesHeight - yBar(0));
    svgBar.selectAll('.bar')
        .transition()
        .duration(1500)
        .attr("y", d => yBar(d.years))
        .attr("height", d => axesHeight - yBar(d.years))
        .delay(function(d, i) {
            return(i*100);
        });

    //bar mouseover event handler function
    function barOnMouseOver(d, i) {
        d3.select(this).attr('class', 'bar-highlight');
        d3.select(this)
            .transition()     // adds animation
            .duration(200)
            .attr('width', xBar.bandwidth() + 6)
            .attr('x', function(d) { return xBar(capitaliseEachWord(d.city)) - 3; })
            .attr("y", function(d) { return yBar(d.years) - 10; })
            .attr("height", function(d) { return axesHeight - yBar(d.years) + 10; });
        svgBar.append("text")
            .attr('class', 'val')
            .attr('transform', `translate(${xBar(capitaliseEachWord(i.city)) + 10},
            ${yBar(i.years) - 15}), rotate(-90)`)
            .text(function() {
                return i.years;  // Value of the text
        });
    }
    //bar mouseout event handler function
    function barOnMouseOut(d, i) {
        // use the text label class to remove label on mouseout
        d3.select(this).attr('class', 'bar');
        d3.select(this)
          .transition()     // adds animation
          .duration(200)
          .attr('width', xBar.bandwidth())
          .attr('x', function(d) { return xBar(capitaliseEachWord(d.city)); })
          .attr("y", function(d) { return yBar(d.years); })
          .attr("height", function(d) { return axesHeight - yBar(d.years); });
        d3.selectAll('.val')
          .remove()
    }
}

function plotByDeposit(data) {
    chartType = 'deposit';
    yMax = sortAndYMax(data, chartType);

    d3.select('#bar-chart-title')
        .text("Price of an Apartment Deposit in USD");
    // X axis
    xBar.domain(data.map(d => capitaliseEachWord(d.city)))
    xAxisBar.call(d3.axisBottom(xBar))
        .selectAll("text")
        .attr("transform", "translate(0,0)rotate(-45)")
        .style("text-anchor", "end");
    // Add Y axis
    yBar.domain([0, Math.round(yMax+10000)]);
    yAxisBar.call(d3.axisLeft(yBar));
    // Bars
    svgBar.selectAll("mybar")
        .data(data)
        .join("rect")
        .attr('class', 'bar')
        .on("mouseover", barOnMouseOver) //Add listener for the mouseover event
        .on("mouseout", barOnMouseOut)   //Add listener for the mouseout event
        .attr("x", d => xBar(capitaliseEachWord(d.city)))
        .attr('y', d => yBar(0))
        .attr("width", xBar.bandwidth())
        .attr("height", d => axesHeight - yBar(0));
    svgBar.selectAll('.bar')
        .transition()
        .duration(1500)
        .attr("y", d => yBar(d.deposit))
        .attr("height", d => axesHeight - yBar(d.deposit))
        .delay(function(d, i) {
            return(i*100);
        });

    //bar mouseover event handler function
    function barOnMouseOver(d, i) {
        d3.select(this).attr('class', 'bar-highlight');
        d3.select(this)
            .transition()     // adds animation
            .duration(200)
            .attr('width', xBar.bandwidth() + 6)
            .attr('x', function(d) { return xBar(capitaliseEachWord(d.city)) - 3; })
            .attr("y", function(d) { return yBar(d.deposit) - 10; })
            .attr("height", function(d) { return axesHeight - yBar(d.deposit) + 10; });
        svgBar.append("text")
            .attr('class', 'val')
            .attr('transform', `translate(${xBar(capitaliseEachWord(i.city)) + 10},
            ${yBar(i.deposit) - 15}), rotate(-90)`)
            .text(function() {
                return i.deposit;  // Value of the text
        });
    }
    //bar mouseout event handler function
    function barOnMouseOut(d, i) {
        // use the text label class to remove label on mouseout
        d3.select(this).attr('class', 'bar');
        d3.select(this)
            .transition()     // adds animation
            .duration(200)
            .attr('width', xBar.bandwidth())
            .attr('x', function(d) { return xBar(capitaliseEachWord(d.city)); })
            .attr("y", function(d) { return yBar(d.deposit); })
            .attr("height", function(d) { return axesHeight - yBar(d.deposit); });
        d3.selectAll('.val')
            .remove()
    }
}

function plotByBreakfast(data) {
    chartType = 'breakfast';
    yMax = sortAndYMax(data, chartType);

    d3.select('#bar-chart-title')
        .text("Price of Avocado Toast in USD");

    // X axis
    xBar.domain(data.map(d => capitaliseEachWord(d.city)))
    xAxisBar.call(d3.axisBottom(xBar))
        .selectAll("text")
        .attr("transform", "translate(0,0)rotate(-45)")
        .style("text-anchor", "end");
    // Add Y axis
    yBar.domain([0, yMax+2]);
    yAxisBar.call(d3.axisLeft(yBar));
    // Bars
    svgBar.selectAll("mybar")
        .data(data)
        .join("rect")
        .attr('class', 'bar')
        .on("mouseover", barOnMouseOver) //Add listener for the mouseover event
        .on("mouseout", barOnMouseOut)   //Add listener for the mouseout event
        .attr("x", d => xBar(capitaliseEachWord(d.city)))
        .attr('y', d => yBar(0))
        .attr("width", xBar.bandwidth())
        .attr("height", d => axesHeight - yBar(0));
    svgBar.selectAll('.bar')
        .transition()
        .duration(1500)
        .attr("y", d => yBar(d.breakfast_price))
        .attr("height", d => axesHeight - yBar(d.breakfast_price))
        .delay(function(d, i) {
            return(i*100);
        });

    //bar mouseover event handler function
    function barOnMouseOver(d, i) {
        d3.select(this).attr('class', 'bar-highlight');
        d3.select(this)
            .transition()     // adds animation
            .duration(200)
            .attr('width', xBar.bandwidth() + 6)
            .attr('x', function(d) { return xBar(capitaliseEachWord(d.city)) - 3; })
            .attr("y", function(d) { return yBar(d.breakfast_price) - 10; })
            .attr("height", function(d) { return axesHeight - yBar(d.breakfast_price) + 10; });
        svgBar.append("text")
            .attr('class', 'val')
            .attr('transform', `translate(${xBar(capitaliseEachWord(i.city)) + 10},
            ${yBar(i.breakfast_price) - 15}), rotate(-90)`)
            .text(function() {
                return i.breakfast_price;  // Value of the text
        });
    }
    //bar mouseout event handler function
    function barOnMouseOut(d, i) {
        // use the text label class to remove label on mouseout
        d3.select(this).attr('class', 'bar');
        d3.select(this)
            .transition()     // adds animation
            .duration(200)
            .attr('width', xBar.bandwidth())
            .attr('x', function(d) { return xBar(capitaliseEachWord(d.city)); })
            .attr("y", function(d) { return yBar(d.breakfast_price); })
            .attr("height", function(d) { return axesHeight - yBar(d.breakfast_price); });
        d3.selectAll('.val')
            .remove()
    }
}

function preloadBubbleChartBackground() {
    d3.select('#bubble-chart').remove();
    var div = d3.select('#bubble-chart-container');
    bubbleChartWidth = div.style('width').replace("px", "");
    bubbleAxesWidth = bubbleChartWidth - margin.left - margin.right;
    bubbleAxesHeight = bubbleAxesWidth;
    bubbleChartHeight = bubbleAxesHeight + margin.top + margin.bottom;
    svgBubble = d3.select('#bubble-chart-container')
        .style('height', bubbleChartHeight + 'px')
        .append('svg')
        .attr('id', 'bubble-chart')
        .attr('class', 'chart-background')
        .style('height', bubbleChartHeight + 'px')
        .append("g")
        .attr('id', 'bubble-chart-canvas')
        .attr('class', 'chart-canvas')
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    svgBubble.append("text")
        .attr("transform", `translate(${bubbleAxesWidth/2}, ${-margin.top*2/3})`)
        .attr('id', 'bubble-chart-title')
        .attr('class', 'chart-title')

    // X Axis
    xBubble = d3.scaleLinear()
        .range([ 0, bubbleAxesWidth ]);
    svgBubble.append("g")
        .attr('id', 'xAxisBubble')
        .attr("transform", `translate(0, ${bubbleAxesHeight})`)
        .call(d3.axisBottom(xBubble))
    xAxisBubble = svgBubble.select('#xAxisBubble');
    // Y Axis
    yBubble = d3.scaleLinear()
        .range([ bubbleAxesHeight, 0]);
    svgBubble.append("g")
        .attr('id', 'yAxisBubble')
        .call(d3.axisLeft(yBubble));
    yAxisBubble = svgBubble.select('#yAxisBubble');
    // Bubble size
    zBubble = d3.scaleLinear()
        .range([4, 40]);
}

function plotBubbleChart(data) {
    var xMax = getXMax(data);
    var yMax = getYMax(data);
    var zMax = getZMax(data);
    function getXMax(temp) {
        var numbers = [];
        for (var i in temp) {
            numbers.push(temp[i].breakfast_price);
        }
        return d3.max(numbers, d => +d);
    }
    function getYMax(temp) {
        var numbers = [];
        for (var i in temp) {
            numbers.push(temp[i].deposit);
        }
        return d3.max(numbers, d => +d);
    }
    function getZMax(temp) {
        var numbers = [];
        for (var i in temp) {
            numbers.push(temp[i].years);
        }
        return d3.max(numbers, d => +d);
    }

    data.sort(function(b, a) {
            return b.years - a.years;
        });

    d3.select('#bubble-chart-title')
        .text("Deposit vs Avocado Toast vs Number of Years");

    // X axis: Breakfast
    xBubble.domain([0, xMax+2])
    xAxisBubble.call(d3.axisBottom(xBubble))
    // Add Y axis: Deposit
    yBubble.domain([0, yMax+10000]);
    yAxisBubble.call(d3.axisLeft(yBubble));
    // Bubble Size: Years
    zBubble.domain([0, Math.round(zMax/10)*10])

    const showTooltip = function(event, d) {
        tooltipText
//            .transition()
//            .duration(200)
            .style("opacity", 1)
            .attr("x", event.layerX - margin.left)
            .attr("y", event.layerY - margin.top - bubbleAxesHeight*.06)
            .style('fill', 'white')
            .text(`${capitaliseEachWord(d.city)}: ${d.years}`);
        tooltip
//            .transition()
//            .duration(200)
            .style("opacity", 1);
        tooltip
            .attr('width', tooltipText._groups[0][0].textLength.baseVal.value+10);
        tooltip
            .attr("x", event.layerX - margin.left - tooltip.attr('width')/2)
            .attr("y", event.layerY - margin.top - bubbleAxesHeight*.1);
    }
    const moveTooltip = function(event, d) {
        tooltipText
            .attr("x", event.layerX - margin.left)
            .attr("y", event.layerY - margin.top - bubbleAxesHeight*.06);
        tooltip
            .attr('width', tooltipText._groups[0][0].textLength.baseVal.value+10);
        tooltip
            .attr("x", event.layerX - margin.left - tooltip.attr('width')/2)
            .attr("y", event.layerY - margin.top - bubbleAxesHeight*.1);
    }
    const hideTooltip = function(event, d) {
        tooltip
//            .transition()
//            .duration(200)
            .style("opacity", 0);
        tooltip
            .attr('x', 0)
            .attr('y', 0);
        tooltipText
//            .transition()
//            .duration(200)
        tooltipText
            .text('')
            .attr('x', 0)
            .attr('y', 0);
    }

    svgBubble.append('g')
        .selectAll('dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'bubbles')
        .attr("cx", function (d) { return xBubble(d.breakfast_price); } )
        .attr("cy", function (d) { return yBubble(d.deposit); } )
        .attr("r", function (d) { return zBubble(d.years); } )
        .on("mouseover", showTooltip )
        .on("mousemove", moveTooltip )
        .on("mouseleave", hideTooltip );

    tooltip = svgBubble
        .append("rect")
            .style("opacity", 0)
            .attr('id', 'bubble-tooltip')
            .attr("class", "tooltip")
            .attr('width', bubbleAxesWidth*.3)
            .attr('height', bubbleChartHeight*.05)
            .attr('rx', 10)
            .attr('ry', 10)
            .style("background-color", "black")
//            .style("border-radius", "5px")
            .style("padding", "10px")
    tooltipText = svgBubble.append('text')
            .attr('id', 'bubble-tooltip-text')
//            .style("color", "white")

}

// Convenience function to precompute some derivatives
function preprocessData(data) {
    data = computeYears(data);
    data = computeDeposit(data);
    return data;
}

// Convenience function for sorting and finding specific yMax
function sortAndYMax(data, target) {
//    console.log(data);
    if (target == 'years') {
        // sort data
        data.sort(function(b, a) {
            return a.years - b.years;
        });

        var yMax = getYMax(data);
        function getYMax(temp) {
            var numbers = [];
            for (var i in temp) {
                numbers.push(temp[i].years);
            }
            return d3.max(numbers, d => +d);
        }
    }
    if (target == 'deposit') {
        // sort data
        data.sort(function(b, a) {
            return a.deposit - b.deposit;
        });

        var yMax = getYMax(data);
        function getYMax(temp) {
            var numbers = [];
            for (var i in temp) {
                numbers.push(temp[i].deposit);
            }
            return d3.max(numbers, d => +d);
        }
    }
    if (target == 'breakfast') {
        // sort data
        data.sort(function(b, a) {
            return a.breakfast_price - b.breakfast_price;
        });

        var yMax = getYMax(data);
        function getYMax(temp) {
            var numbers = [];
            for (var i in temp) {
                numbers.push(temp[i].breakfast_price);
            }
            return d3.max(numbers, d => +d);
        }
    }
    return yMax;
}

function update(data, target) {
    chartType = target
    yMax = sortAndYMax(data, target);
    xBar.domain(data.map(d => capitaliseEachWord(d.city)));
    xAxisBar.transition().duration(1500).call(d3.axisBottom(xBar))
        .selectAll("text")
        .attr("transform", "translate(0,0)rotate(-45)")
        .style("text-anchor", "end");

    if (target == 'years') {
        d3.select('#bar-chart-title')
            .text("Number of Years to Afford an Apartment Deposit");
        yBar.domain([0, Math.round(yMax/10)*10]);
        yAxisBar.transition().duration(1500).call(d3.axisLeft(yBar));
        // Bars
        var u = svgBar.selectAll("rect")
            .data(data);
        u.enter()
            .append("rect") // Add a new rect for each new elements
            .attr('class', 'bar')
            .merge(u) // get the already existing elements as well
            .transition() // and apply changes to all of them
            .duration(1500)
            .attr("x", function(d) { return xBar(capitaliseEachWord(d.city)); })
            .attr("y", function(d) { return yBar(d.years); })
            .attr("width", xBar.bandwidth())
            .attr("height", function(d) { return axesHeight - yBar(d.years); });
        svgBar.selectAll('.bar')
            .on("mouseover", barOnMouseOver) //Add listener for the mouseover event
            .on("mouseout", barOnMouseOut);   //Add listener for the mouseout event

        //bar mouseover event handler function
        function barOnMouseOver(d, i) {
            d3.select(this).attr('class', 'bar-highlight');
            d3.select(this)
                .transition()     // adds animation
                .duration(200)
                .attr('width', xBar.bandwidth() + 6)
                .attr('x', function(d) { return xBar(capitaliseEachWord(d.city)) - 3; })
                .attr("y", function(d) { return yBar(d.years) - 10; })
                .attr("height", function(d) { return axesHeight - yBar(d.years) + 10; });
            svgBar.append("text")
                .attr('class', 'val')
                .attr('transform', `translate(${xBar(capitaliseEachWord(i.city)) + 10},
                ${yBar(i.years) - 15}), rotate(-90)`)
                .text(function() {
                    return i.years;  // Value of the text
            });
        }
        //bar mouseout event handler function
        function barOnMouseOut(d, i) {
            // use the text label class to remove label on mouseout
            d3.select(this).attr('class', 'bar');
            d3.select(this)
                .transition()     // adds animation
                .duration(200)
                .attr('width', xBar.bandwidth())
                .attr('x', function(d) { return xBar(capitaliseEachWord(d.city)); })
                .attr("y", function(d) { return yBar(d.years); })
                .attr("height", function(d) { return axesHeight - yBar(d.years); });
            d3.selectAll('.val')
                .remove()
        }
    }
    if (target == 'deposit') {
        d3.select('#bar-chart-title')
            .text("Price of an Apartment Deposit in USD");
        yBar.domain([0, Math.round(yMax+10000)]);
        yAxisBar.transition().duration(1500).call(d3.axisLeft(yBar));

        // Bar
        var u = svgBar.selectAll("rect")
            .data(data);
        u.enter()
            .append("rect") // Add a new rect for each new elements
            .attr('class', 'bar')
            .merge(u) // get the already existing elements as well
            .transition() // and apply changes to all of them
            .duration(1500)
            .attr("x", function(d) { return xBar(capitaliseEachWord(d.city)); })
            .attr("y", function(d) { return yBar(d.deposit); })
            .attr("width", xBar.bandwidth())
            .attr("height", function(d) { return axesHeight - yBar(d.deposit); });
        svgBar.selectAll('.bar')
            .on("mouseover", barOnMouseOver) //Add listener for the mouseover event
            .on("mouseout", barOnMouseOut);   //Add listener for the mouseout event

        //bar mouseover event handler function
        function barOnMouseOver(d, i) {
            d3.select(this).attr('class', 'bar-highlight');
            d3.select(this)
                .transition()     // adds animation
                .duration(200)
                .attr('width', xBar.bandwidth() + 6)
                .attr('x', function(d) { return xBar(capitaliseEachWord(d.city)) - 3; })
                .attr("y", function(d) { return yBar(d.deposit) - 10; })
                .attr("height", function(d) { return axesHeight - yBar(d.deposit) + 10; });
            svgBar.append("text")
                .attr('class', 'val')
                .attr('transform', `translate(${xBar(capitaliseEachWord(i.city)) + 10},
                ${yBar(i.deposit) - 15}), rotate(-90)`)
                .text(function() {
                    return i.deposit;  // Value of the text
            });
        }
        //bar mouseout event handler function
        function barOnMouseOut(d, i) {
            // use the text label class to remove label on mouseout
            d3.select(this).attr('class', 'bar');
            d3.select(this)
                .transition()     // adds animation
                .duration(200)
                .attr('width', xBar.bandwidth())
                .attr('x', function(d) { return xBar(capitaliseEachWord(d.city)); })
                .attr("y", function(d) { return yBar(d.deposit); })
                .attr("height", function(d) { return axesHeight - yBar(d.deposit); });
            d3.selectAll('.val')
                .remove()
        }
    }
    if (target == 'breakfast') {
        d3.select('#bar-chart-title')
            .text("Price of Avocado Toast in USD");
        yBar.domain([0, Math.round(yMax)+2]);
        yAxisBar.transition().duration(1500).call(d3.axisLeft(yBar));

        // Bar
        var u = svgBar.selectAll("rect")
            .data(data);
        u.enter()
            .append("rect") // Add a new rect for each new elements
            .attr('class', 'bar')
            .merge(u) // get the already existing elements as well
            .transition() // and apply changes to all of them
            .duration(1500)
            .attr("x", function(d) { return xBar(capitaliseEachWord(d.city)); })
            .attr("y", function(d) { return yBar(d.breakfast_price); })
            .attr("width", xBar.bandwidth())
            .attr("height", function(d) { return axesHeight - yBar(d.breakfast_price); });
        svgBar.selectAll('.bar')
            .on("mouseover", barOnMouseOver) //Add listener for the mouseover event
            .on("mouseout", barOnMouseOut);   //Add listener for the mouseout event

        //bar mouseover event handler function
        function barOnMouseOver(d, i) {
            d3.select(this).attr('class', 'bar-highlight');
            d3.select(this)
                .transition()     // adds animation
                .duration(200)
                .attr('width', xBar.bandwidth() + 6)
                .attr('x', function(d) { return xBar(capitaliseEachWord(d.city)) - 3; })
                .attr("y", function(d) { return yBar(d.breakfast_price) - 10; })
                .attr("height", function(d) { return axesHeight - yBar(d.breakfast_price) + 10; });
            svgBar.append("text")
                .attr('class', 'val')
                .attr('transform', `translate(${xBar(capitaliseEachWord(i.city)) + 10},
                ${yBar(i.breakfast_price) - 15}), rotate(-90)`)
                .text(function() {
                    return i.breakfast_price;  // Value of the text
            });
        }
        //bar mouseout event handler function
        function barOnMouseOut(d, i) {
            // use the text label class to remove label on mouseout
            d3.select(this).attr('class', 'bar');
            d3.select(this)
                .transition()     // adds animation
                .duration(200)
                .attr('width', xBar.bandwidth())
                .attr('x', function(d) { return xBar(capitaliseEachWord(d.city)); })
                .attr("y", function(d) { return yBar(d.breakfast_price); })
                .attr("height", function(d) { return axesHeight - yBar(d.breakfast_price); });
            d3.selectAll('.val')
                .remove()
        }
    }

}

var height = 1000, width = 600,
    margin = {top: 100, bottom: 100, left: 50, right: 100};

var globalData;
var chartType = 'years';
var svgBar, xBar, yBar, xAxisBar, yAxisBar;
var svgBubble, xBubble, yBubble, zBubble, xAxisBubble, yAxisBubble, tooltip;

function redrawBarChart() {
    preloadBarChartBackground();
    if (chartType == 'years') {
        plotByYears(globalData);
    }
    if (chartType == 'deposit') {
        plotByDeposit(globalData);
    }
    if (chartType == 'breakfast') {
        plotByBreakfast(globalData);
    }
}

function updateChart(target) {
    if (target == chartType) {

    } else {
        update(globalData, target);
    }
}

d3.csv('assets/data.csv')
    .then(d => {
        globalData = preprocessData(d);
        preloadBarChartBackground();
        preloadBubbleChartBackground();
        plotByYears(globalData);
        plotBubbleChart(globalData);
    });

window.addEventListener('resize', redrawBarChart)