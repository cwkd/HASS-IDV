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

function plotByYears(data) {
    chartType = 'years';
    d3.select('#chart').remove();
    data = computeYears(data);

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
        return d3.max(numbers);
    }

    var div = d3.select('.chart-container');
    chartWidth = div.style('width').replace("px", "");
    chartHeight = div.style('width').replace("px", "")*3/4;
    axesWidth = chartWidth - margin.left - margin.right;
    axesHeight = chartHeight - margin.top - margin.bottom;
    const svg = d3.select('.chart-container')
        .style('height', chartHeight)
        .append('svg')
        .attr('id', 'chart')
        .attr('class', 'chart-background')
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    svg.append("text")
        .attr("transform", `translate(${axesWidth/2}, ${-margin.top/4})`)
        .attr('class', 'chart-title')
        .text("Number of years to afford an apartment deposit");

    // X axis
    const x = d3.scaleBand()
        .range([ 0, axesWidth ])
        .domain(data.map(d => capitaliseEachWord(d.city)))
        .padding(0.2);
    svg.append("g")
        .attr("transform", `translate(0, ${axesHeight})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(0,0)rotate(-45)")
        .style("text-anchor", "end");
    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, Math.round(yMax+10)])
        .range([ axesHeight, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));
    // Bars
    svg.selectAll("mybar")
        .data(data)
        .join("rect")
        .attr('class', 'bar')
        .on("mouseover", barOnMouseOver) //Add listener for the mouseover event
        .on("mouseout", barOnMouseOut)   //Add listener for the mouseout event
        .attr("x", d => x(capitaliseEachWord(d.city)))
        .attr('y', d => y(0))
        .attr("width", x.bandwidth())
        .attr("height", d => axesHeight - y(0));
    svg.selectAll('.bar')
        .transition()
        .duration(800)
        .attr("y", d => y(d.years))
        .attr("height", d => axesHeight - y(d.years))
        .delay(function(d, i) {
            return(i*100);
        });

    //bar mouseover event handler function
    function barOnMouseOver(d, i) {
        d3.select(this).attr('class', 'bar-highlight');
        d3.select(this)
          .transition()     // adds animation
          .duration(200)
          .attr('width', x.bandwidth() + 6)
          .attr('x', function(d) { return x(capitaliseEachWord(d.city)) - 3; })
          .attr("y", function(d) { return y(d.years) - 10; })
          .attr("height", function(d) { return axesHeight - y(d.years) + 10; });
         svg.append("text")
         .attr('class', 'val')
         .attr('transform', `translate(${x(capitaliseEachWord(i.city)) + 10},
         ${y(i.years) - 15}), rotate(-90)`)
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
          .attr('width', x.bandwidth())
          .attr('x', function(d) { return x(capitaliseEachWord(d.city)); })
          .attr("y", function(d) { return y(d.years); })
          .attr("height", function(d) { return axesHeight - y(d.years); });
        d3.selectAll('.val')
          .remove()
    }
}

function plotByDeposit(data) {
    chartType = 'deposit';
    d3.select('#chart').remove();
    data = computeDeposit(data);

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
        return d3.max(numbers);
    }

    var div = d3.select('.chart-container');
    chartWidth = div.style('width').replace("px", "");
    chartHeight = div.style('width').replace("px", "")*3/4;
    axesWidth = chartWidth - margin.left - margin.right;
    axesHeight = chartHeight - margin.top - margin.bottom;
    const svg = d3.select('.chart-container')
        .style('height', chartHeight)
        .append('svg')
        .attr('id', 'chart')
        .attr('class', 'chart-background')
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    svg.append("text")
        .attr("transform", `translate(${axesWidth/2}, ${-margin.top/4})`)
        .attr('class', 'chart-title')
        .text("Price of an apartment deposit");

    // X axis
    const x = d3.scaleBand()
        .range([ 0, axesWidth ])
        .domain(data.map(d => capitaliseEachWord(d.city)))
        .padding(0.2);
    svg.append("g")
        .attr("transform", `translate(0, ${axesHeight})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(0,0)rotate(-45)")
        .style("text-anchor", "end");
    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, Math.round(yMax+10)])
        .range([ axesHeight, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));
    // Bars
    svg.selectAll("mybar")
        .data(data)
        .join("rect")
        .attr('class', 'bar')
        .on("mouseover", barOnMouseOver) //Add listener for the mouseover event
        .on("mouseout", barOnMouseOut)   //Add listener for the mouseout event
        .attr("x", d => x(capitaliseEachWord(d.city)))
        .attr('y', d => y(0))
        .attr("width", x.bandwidth())
        .attr("height", d => axesHeight - y(0));
    svg.selectAll('.bar')
        .transition()
        .duration(800)
        .attr("y", d => y(d.deposit))
        .attr("height", d => axesHeight - y(d.deposit))
        .delay(function(d, i) {
            return(i*100);
        });

    //bar mouseover event handler function
    function barOnMouseOver(d, i) {
        d3.select(this).attr('class', 'bar-highlight');
        d3.select(this)
          .transition()     // adds animation
          .duration(200)
          .attr('width', x.bandwidth() + 6)
          .attr('x', function(d) { return x(capitaliseEachWord(d.city)) - 3; })
          .attr("y", function(d) { return y(d.deposit) - 10; })
          .attr("height", function(d) { return axesHeight - y(d.deposit) + 10; });
         svg.append("text")
         .attr('class', 'val')
         .attr('transform', `translate(${x(capitaliseEachWord(i.city)) + 10},
         ${y(i.deposit) - 15}), rotate(-90)`)
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
          .attr('width', x.bandwidth())
          .attr('x', function(d) { return x(capitaliseEachWord(d.city)); })
          .attr("y", function(d) { return y(d.deposit); })
          .attr("height", function(d) { return axesHeight - y(d.deposit); });
        d3.selectAll('.val')
          .remove()
    }
}

function plotByBreakfast(data) {
    chartType = 'breakfast';
    d3.select('#chart').remove();
    console.log(data)

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
        return d3.max(numbers);
    }

    var div = d3.select('.chart-container');
    chartWidth = div.style('width').replace("px", "");
    chartHeight = div.style('width').replace("px", "")*3/4;
    axesWidth = chartWidth - margin.left - margin.right;
    axesHeight = chartHeight - margin.top - margin.bottom;
    const svg = d3.select('.chart-container')
        .style('height', chartHeight)
        .append('svg')
        .attr('id', 'chart')
        .attr('class', 'chart-background')
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    svg.append("text")
        .attr("transform", `translate(${axesWidth/2}, ${-margin.top/4})`)
        .attr('class', 'chart-title')
        .text("Price of breakfast");

    // X axis
    const x = d3.scaleBand()
        .range([ 0, axesWidth ])
        .domain(data.map(d => capitaliseEachWord(d.city)))
        .padding(0.2);
    svg.append("g")
        .attr("transform", `translate(0, ${axesHeight})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(0,0)rotate(-45)")
        .style("text-anchor", "end");
    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, Math.round(yMax/10)*10+5])
        .range([ axesHeight, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));
    // Bars
    svg.selectAll("mybar")
        .data(data)
        .join("rect")
        .attr('class', 'bar')
        .on("mouseover", barOnMouseOver) //Add listener for the mouseover event
        .on("mouseout", barOnMouseOut)   //Add listener for the mouseout event
        .attr("x", d => x(capitaliseEachWord(d.city)))
        .attr('y', d => y(0))
        .attr("width", x.bandwidth())
        .attr("height", d => axesHeight - y(0));
    svg.selectAll('.bar')
        .transition()
        .duration(800)
        .attr("y", d => y(d.breakfast_price))
        .attr("height", d => axesHeight - y(d.breakfast_price))
        .delay(function(d, i) {
            return(i*100);
        });

    //bar mouseover event handler function
    function barOnMouseOver(d, i) {
        d3.select(this).attr('class', 'bar-highlight');
        d3.select(this)
          .transition()     // adds animation
          .duration(200)
          .attr('width', x.bandwidth() + 6)
          .attr('x', function(d) { return x(capitaliseEachWord(d.city)) - 3; })
          .attr("y", function(d) { return y(d.breakfast_price) - 10; })
          .attr("height", function(d) { return axesHeight - y(d.breakfast_price) + 10; });
         svg.append("text")
         .attr('class', 'val')
         .attr('transform', `translate(${x(capitaliseEachWord(i.city)) + 10},
         ${y(i.breakfast_price) - 15}), rotate(-90)`)
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
          .attr('width', x.bandwidth())
          .attr('x', function(d) { return x(capitaliseEachWord(d.city)); })
          .attr("y", function(d) { return y(d.breakfast_price); })
          .attr("height", function(d) { return axesHeight - y(d.breakfast_price); });
        d3.selectAll('.val')
          .remove()
    }
}



var height = 1000, width = 600,
    margin = {top: 100, bottom: 100, left: 50, right: 100};

var globalData = {};
var chartType = 'years';

function redraw() {
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
        if (target == 'years') {
        plotByYears(globalData);
        }
        if (target == 'deposit') {
            plotByDeposit(globalData);
        }
        if (target == 'breakfast') {
            plotByBreakfast(globalData);
        }
    }
}

d3.csv('assets/data.csv')
    .then(d => {
        globalData = d;
        plotByYears(d)
    });

window.addEventListener('resize', redraw)