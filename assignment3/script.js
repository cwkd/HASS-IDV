var globalData = {};
//var data = {
//    resource_id: 'f1765b54-a209-4718-8d38-a39237f502b3', // the resource id
//    limit: 1000000, // get 5 results
////    q: 'clementi ang mo kio punggol bedok panjang' // query for 'jones'
//};
//$.ajax({
//    url: 'https://data.gov.sg/api/action/datastore_search',
//    data: data,
////    dataType: 'jsonp',
//    success: function(data) {
////        alert('Total results found: ' + data.result.total);
////        console.log(data);
////        drawBarChart(data.result.records);
//        globalData = data.result.records;
//        dataProcessingCallback(globalData);
//    },
//    failure: console.log('Data Fetch Failed')
//});

var currLoc = '';

const csv_path = 'assets/resale-flat-prices-based-on-registration-date-from-jan-2017-onwards.csv'

d3.csv(csv_path)
    .then(data => {
        globalData = data;
        console.log(Object.keys(globalData[0]));
        drawBarChart();
    })

    // set the dimensions and margins of the graph
    const margin = {top: 70, top_ext: 30, right: 30, right_ext: 30, bottom: 130, left: 60},
        backgroundWidth = 800,
        backgroundHeight = 700,
        buttonPaneHeight = backgroundHeight,
        buttonPaneWidth = 70,
        chartWidth = backgroundWidth - buttonPaneWidth - margin.left - margin.right,
        chartHeight = backgroundHeight - margin.top - margin.bottom;

function drawBarChart() {
    try {
        d3.select('#chart').remove();
    } catch {

    }
    temp = d3.rollups(globalData, v => v.length, d => d.town);
    // append the svg object to the body of the page
    const svg = d3.select("#chart-container")
        .append("svg")
        .attr('id', 'chart')
        .attr("class", "chart-background")
        .attr("width", backgroundWidth)
        .attr("height", backgroundHeight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.append("text")
       .attr("transform", `translate(${backgroundWidth/2}, ${-margin.top/2})`)
       .attr('class', 'bar-chart-title')
       .text("HDB Resale Transactions");

    temp = temp.map(function (d) {
    return {'location': d[0], 'number': d[1]}
    })
    var yMax = getYMax(temp);
    function getYMax(temp) {
        var numbers = [];
        for (var i in temp) {
            numbers.push(temp[i].number);
        }
        return d3.max(numbers);
    }
    // X axis
    const x = d3.scaleBand()
        .range([ 0, chartWidth ])
        .domain(temp.map(d => d.location))
        .padding(0.2);
    svg.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, Math.round((yMax+2000)/1000)*1000])
        .range([ chartHeight, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Bars
    svg.selectAll("mybar")
        .data(temp)
        .join("rect")
        .attr('class', 'bar')
        .on("mouseover", onMouseOver) //Add listener for the mouseover event
        .on("mouseout", onMouseOut)   //Add listener for the mouseout event
        .on('click', onClick)
        .attr("x", d => x(d.location))
        .attr("y", d => y(d.number))
        .attr("width", x.bandwidth())
        .attr("height", d => chartHeight - y(d.number));

    //mouseover event handler function
    function onMouseOver(d, i) {
        d3.select(this).attr('class', 'highlight');
        d3.select(this)
          .transition()     // adds animation
          .duration(200)
          .attr('width', x.bandwidth() + 6)
          .attr('x', function(d) { return x(d.location) - 3; })
          .attr("y", function(d) { return y(d.number) - 10; })
          .attr("height", function(d) { return chartHeight - y(d.number) + 10; });
         svg.append("text")
         .attr('class', 'val')
         .attr('transform', `translate(${x(i.location) + 10},
         ${y(i.number) - 15}), rotate(-90)`)
         .text(function() {
             return i.number;  // Value of the text
         });
    }

    //mouseout event handler function
    function onMouseOut(d, i) {
        // use the text label class to remove label on mouseout
        d3.select(this).attr('class', 'bar');
        d3.select(this)
          .transition()     // adds animation
          .duration(200)
          .attr('width', x.bandwidth())
          .attr('x', function(d) { return x(d.location); })
          .attr("y", function(d) { return y(d.number); })
          .attr("height", function(d) { return chartHeight - y(d.number); });
        d3.selectAll('.val')
          .remove()
    }
    //click event handler function
    function onClick(d, i) {
        currLoc = i['location']
        drawLocationChart(currLoc);
    }
}

function drawLocationChart(town) {
    townData = d3.group(globalData, d => d.town);
    transactionsByFlatType = d3.groups(townData.get(town), d => d.flat_type);

    d3.select('#chart').remove();
    // append the svg object to the body of the page
    var svg = d3.select("#chart-container")
      .append("svg")
        .attr('id', 'chart')
        .attr("class", "chart-background")
        .attr("width", backgroundWidth)
        .attr("height", backgroundHeight)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    svg.append("text")
       .attr("transform", `translate(${backgroundWidth/2}, ${-margin.top/2})`)
       .attr('class', 'bar-chart-title')
       .text(`Transactions in ${town} by Flat Type`);

    temp = transactionsByFlatType.map(
        function (d) {
            return {'flat_type': d[0], 'number': d[1].length}
        }
    )
    var yMax = getYMax(temp);
    function getYMax(temp) {
        var numbers = [];
        for (var i in temp) {
            numbers.push(temp[i].number);
        }
        return d3.max(numbers);
    }
    // X axis
    const x = d3.scaleBand()
        .range([ 0, chartWidth ])
        .domain(temp.map(d => d.flat_type))
        .padding(0.2);
    svg.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, Math.round((yMax+1000)/1000)*1000])
        .range([ chartHeight, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Bars
    svg.selectAll("mybar")
        .data(temp)
        .join("rect")
        .attr('class', 'bar')
        .on("mouseover", barOnMouseOver) //Add listener for the mouseover event
        .on("mouseout", barOnMouseOut)   //Add listener for the mouseout event
        .attr("x", d => x(d.flat_type))
        .attr("y", d => y(d.number))
        .attr("width", x.bandwidth())
        .attr("height", d => chartHeight - y(d.number));

    // Back button
    d3.select('#chart')
        .append('circle')
        .attr('id', 'back-button')
        .attr('class', 'button')
        .attr("transform", `translate(${backgroundWidth-margin.right-10}, ${margin.top})`)
        .on('mouseover', buttonOnMouseOver)
        .on('mouseout', buttonOnMouseOut)
        .on('click', backButtonCallback);
    d3.select('#chart')
        .append('text')
        .attr('id', 'back-button-text')
        .attr('class', 'button-text')
        .attr("transform", `translate(${backgroundWidth-margin.right-10}, ${margin.top+5})`)
        .style("text-anchor", "middle")
        .on('mouseover', textOnMouseOver)
        .on('mouseout', textOnMouseOut)
        .on('click', backButtonCallback)
        .text('Back');

    // Model button
    d3.select('#chart')
        .append('circle')
        .attr('id', 'test-button')
        .attr('class', 'button')
        .attr("transform", `translate(${backgroundWidth-margin.right-10}, ${margin.top+60})`)
        .on('mouseover', buttonOnMouseOver)
        .on('mouseout', buttonOnMouseOut)
        .on('click', modelButtonCallback)
        .attr('r', '25')
        .attr('class', 'button');
    d3.select('#chart')
        .append('text')
        .attr('id', 'test-button-text')
        .attr('class', 'button-text')
        .attr("transform", `translate(${backgroundWidth-margin.right-10}, ${margin.top+65})`)
        .style("text-anchor", "middle")
        .on('mouseover', textOnMouseOver)
        .on('mouseout', textOnMouseOut)
        .on('click', modelButtonCallback)
        .text('Model');


    //bar mouseover event handler function
    function barOnMouseOver(d, i) {
        d3.select(this).attr('class', 'button-highlight');
        d3.select(this)
          .transition()     // adds animation
          .duration(200)
          .attr('width', x.bandwidth() + 6)
          .attr('x', function(d) { return x(d.flat_type) - 3; })
          .attr("y", function(d) { return y(d.number) - 10; })
          .attr("height", function(d) { return chartHeight - y(d.number) + 10; });
         svg.append("text")
         .attr('class', 'val')
         .attr('transform', `translate(${x(i.flat_type) + 10},
         ${y(i.number) - 15}), rotate(-90)`)
         .text(function() {
             return i.number;  // Value of the text
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
          .attr('x', function(d) { return x(d.flat_type); })
          .attr("y", function(d) { return y(d.number); })
          .attr("height", function(d) { return chartHeight - y(d.number); });
        d3.selectAll('.val')
          .remove()
    }

    //button mouseover event handler function
    function buttonOnMouseOver(d, i) {
        d3.select(this).attr('class', 'button-highlight');
        objId = this.id;
        textId = objId + '-text';
        d3.select(this)
          .transition()     // adds animation
          .duration(200);
        d3.select(`#${textId}`)
            .attr('class', 'button-text-highlight')
            .transition()     // adds animation
            .duration(200);
    }

    //button mouseout event handler function
    function buttonOnMouseOut(d, i) {
        // use the text label class to remove label on mouseout
        d3.select(this).attr('class', 'button');
        d3.select(this)
          .transition()     // adds animation
          .duration(200);
        d3.select(`#${textId}`)
            .attr('class', 'button-text')
            .transition()     // adds animation
            .duration(200);
    }

    function textOnMouseOver(d, i) {
        d3.select(this)
          .attr('class', 'button-text-highlight')
          .transition()     // adds animation
          .duration(200);
        objId = this.id.substring(0, this.id.length-5);
        d3.select(`#${objId}`)
            .attr('class', 'button-highlight')
            .transition()     // adds animation
            .duration(200);
    }

    function textOnMouseOut(d, i) {
        // use the text label class to remove label on mouseout
        d3.select(this)
          .attr('class', 'button-text')
          .transition()     // adds animation
          .duration(200);
        objId = this.id.substring(0, this.id.length-5);
        d3.select(`#${objId}`)
            .attr('class', 'button')
            .transition()     // adds animation
            .duration(200);
    }

    //click event handler function
    function backButtonCallback(d, i) {
        currLoc = '';
        drawBarChart();
    }

    //click event handler function
    function modelButtonCallback(d, i) {
        drawLocationChart2(currLoc);
    }
}

function drawLocationChart2(town) {
    townData = d3.group(globalData, d => d.town);
    transactionsByFlatModel = d3.groups(townData.get(town), d => d.flat_model);

    d3.select('#chart').remove();
    // append the svg object to the body of the page
    var svg = d3.select("#chart-container")
      .append("svg")
        .attr('id', 'chart')
        .attr("class", "chart-background")
        .attr("width", backgroundWidth)
        .attr("height", backgroundHeight)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    svg.append("text")
       .attr("transform", `translate(${backgroundWidth/2}, ${-margin.top/2})`)
       .attr('class', 'bar-chart-title')
       .text(`Transactions in ${town} by Flat Model`);

    temp = transactionsByFlatModel.map(
        function (d) {
            return {'flat_model': d[0], 'number': d[1].length}
        }
    )
    var yMax = getYMax(temp);
    function getYMax(temp) {
        var numbers = [];
        for (var i in temp) {
            numbers.push(temp[i].number);
        }
        return d3.max(numbers);
    }
    // X axis
    const x = d3.scaleBand()
        .range([ 0, chartWidth ])
        .domain(temp.map(d => d.flat_model))
        .padding(0.2);
    svg.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, Math.round((yMax+1000)/1000)*1000])
        .range([ chartHeight, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Bars
    svg.selectAll("mybar")
        .data(temp)
        .join("rect")
        .attr('class', 'bar')
        .on("mouseover", barOnMouseOver) //Add listener for the mouseover event
        .on("mouseout", barOnMouseOut)   //Add listener for the mouseout event
        .attr("x", d => x(d.flat_model))
        .attr("y", d => y(d.number))
        .attr("width", x.bandwidth())
        .attr("height", d => chartHeight - y(d.number));

    // Back button
    d3.select('#chart')
        .append('circle')
        .attr('id', 'back-button')
        .attr('class', 'button')
        .attr("transform", `translate(${backgroundWidth-margin.right-10}, ${margin.top})`)
        .on('mouseover', buttonOnMouseOver)
        .on('mouseout', buttonOnMouseOut)
        .on('click', backButtonCallback);
    d3.select('#chart')
        .append('text')
        .attr('id', 'back-button-text')
        .attr('class', 'button-text')
        .attr("transform", `translate(${backgroundWidth-margin.right-10}, ${margin.top+5})`)
        .style("text-anchor", "middle")
        .on('mouseover', textOnMouseOver)
        .on('mouseout', textOnMouseOut)
        .on('click', backButtonCallback)
        .text('Back');

    // Type Button
    d3.select('#chart')
        .append('circle')
        .attr('id', 'test-button')
        .attr('class', 'button')
        .attr("transform", `translate(${backgroundWidth-margin.right-10}, ${margin.top+60})`)
        .on('mouseover', buttonOnMouseOver)
        .on('mouseout', buttonOnMouseOut)
        .on('click', typeButtonCallback)
        .attr('class', 'button');
    d3.select('#chart')
        .append('text')
        .attr('id', 'test-button-text')
        .attr('class', 'button-text')
        .attr("transform", `translate(${backgroundWidth-margin.right-10}, ${margin.top+65})`)
        .style("text-anchor", "middle")
        .on('mouseover', textOnMouseOver)
        .on('mouseout', textOnMouseOut)
        .on('click', typeButtonCallback)
        .text('Type');


    //bar mouseover event handler function
    function barOnMouseOver(d, i) {
        d3.select(this).attr('class', 'highlight');
        d3.select(this)
          .transition()     // adds animation
          .duration(200)
          .attr('width', x.bandwidth() + 6)
          .attr('x', function(d) { return x(d.flat_model) - 3; })
          .attr("y", function(d) { return y(d.number) - 10; })
          .attr("height", function(d) { return chartHeight - y(d.number) + 10; });
         svg.append("text")
         .attr('class', 'val')
         .attr('transform', `translate(${x(i.flat_model) + 10},
         ${y(i.number) - 15}), rotate(-90)`)
         .text(function() {
             return i.number;  // Value of the text
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
          .attr('x', function(d) { return x(d.flat_model); })
          .attr("y", function(d) { return y(d.number); })
          .attr("height", function(d) { return chartHeight - y(d.number); });
        d3.selectAll('.val')
          .remove()
    }

    //button mouseover event handler function
    function buttonOnMouseOver(d, i) {
        d3.select(this).attr('class', 'button-highlight');
        objId = this.id;
        textId = objId + '-text';
        d3.select(this)
          .transition()     // adds animation
          .duration(200);
        d3.select(`#${textId}`)
            .attr('class', 'button-text-highlight')
            .transition()     // adds animation
            .duration(200);
    }

    //button mouseout event handler function
    function buttonOnMouseOut(d, i) {
        // use the text label class to remove label on mouseout
        d3.select(this).attr('class', 'button');
        d3.select(this)
          .transition()     // adds animation
          .duration(200);
        d3.select(`#${textId}`)
            .attr('class', 'button-text')
            .transition()     // adds animation
            .duration(200);
    }

    function textOnMouseOver(d, i) {
        d3.select(this)
          .attr('class', 'button-text-highlight')
          .transition()     // adds animation
          .duration(200);
        objId = this.id.substring(0, this.id.length-5);
        d3.select(`#${objId}`)
            .attr('class', 'button-highlight')
            .transition()     // adds animation
            .duration(200);
    }

    function textOnMouseOut(d, i) {
        // use the text label class to remove label on mouseout
        d3.select(this)
          .attr('class', 'button-text')
          .transition()     // adds animation
          .duration(200);
        objId = this.id.substring(0, this.id.length-5);
        d3.select(`#${objId}`)
            .attr('class', 'button')
            .transition()     // adds animation
            .duration(200);
    }

    //click event handler function
    function backButtonCallback(d, i) {
        currLoc = '';
        drawBarChart();
    }

    //click event handler function
    function typeButtonCallback(d, i) {
        drawLocationChart(currLoc);
    }
}