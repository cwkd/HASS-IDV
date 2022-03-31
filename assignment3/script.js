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

const csv_path = 'assets/resale-flat-prices-based-on-registration-date-from-jan-2017-onwards.csv'

d3.csv(csv_path)
    .then(data => {
        globalData = data;
        console.log(Object.keys(globalData[0]));
        temp = d3.rollups(globalData, v => v.length, d => d.town);
        drawBarChart(temp);
    })

// set the dimensions and margins of the graph
    const margin = {top: 70, right: 30, bottom: 130, left: 60},
        width = 700 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

function drawBarChart(data) {
    // append the svg object to the body of the page
    const svg = d3.select("#chart-container")
        .append("svg")
        .attr('id', 'chart')
        .attr("class", "chart-background")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.append("text")
       .attr("transform", `translate(${width/2}, ${-margin.top/2})`)
       .attr('class', 'bar-chart-title')
       .text("HDB Resale Transactions");

    data = data.map(function (d) {
    return {'location': d[0], 'number': d[1]}
    })
    // X axis
    const x = d3.scaleBand()
        .range([ 0, width ])
        .domain(data.map(d => d.location))
        .padding(0.2);
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, 12000])
        .range([ height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Bars
    svg.selectAll("mybar")
        .data(data)
        .join("rect")
        .attr('class', 'bar2')
        .on("mouseover", onMouseOver) //Add listener for the mouseover event
        .on("mouseout", onMouseOut)   //Add listener for the mouseout event
        .on('click', onClick)
        .attr("x", d => x(d.location))
        .attr("y", d => y(d.number))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.number))
        .attr("fill", "#69b3a2")

    //mouseover event handler function
    function onMouseOver(d, i) {
        d3.select(this).attr('class', 'highlight');
        d3.select(this)
          .transition()     // adds animation
          .duration(200)
          .attr('width', x.bandwidth() + 6)
          .attr('x', function(d) { return x(d.location) - 3; })
          .attr("y", function(d) { return y(d.number) - 10; })
          .attr("height", function(d) { return height - y(d.number) + 10; });
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
        d3.select(this).attr('class', 'bar2');
        d3.select(this)
          .transition()     // adds animation
          .duration(200)
          .attr('width', x.bandwidth())
          .attr('x', function(d) { return x(d.location); })
          .attr("y", function(d) { return y(d.number); })
          .attr("height", function(d) { return height - y(d.number); });
        d3.selectAll('.val')
          .remove()
    }
    //click event handler function
    function onClick(d, i) {
//        drawLocationChart(i['location']);
    }
}

function drawLocationChart(town) {
    townData = d3.group(globalData, d => d.town);
    transactionsByFlatType = d3.group(townData.get(town), d => d.flat_type);

    console.log(transactionsByFlatType);
    d3.select('#chart').remove();
    // append the svg object to the body of the page
    var svg = d3.select("#chart-container")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    var chartData = d3.rollup(
        transactionsByFlatType,
        function (v) {

        }
        )
}