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
        console.log(globalData);
        var temp = dataProcessingCallback(globalData);
        drawBarChart(extract_fields(temp));
    })
//const apiURL = 'https://data.gov.sg/api/action/datastore_search?resource_id=f1765b54-a209-4718-8d38-a39237f502b3 \
//&limit=1000000'
//
//fetch(apiURL)
//    .then(res => res.json())
//    .then(d => console.log(d))

function dataProcessingCallback(data) {
    var dataMap = {};
    for (var key in Object.keys(data)) {
        var row = data[key];
        try {
            var town = row.town;
        } catch {
//            console.log(row);
            continue
        }
        try {
            dataMap[town].push(row);
        } catch {
            dataMap[town] = [row];
        }
    }
    return dataMap;
}

function extract_fields(data) {
    var tempData = [];
    for (var location in data) {
        tempData.push({'location': location, 'number': data[location].length});
//        console.log(location)
    }
    return tempData;
}

function drawBarChart(data) {
    // set the dimensions and margins of the graph
    const margin = {top: 70, right: 30, bottom: 130, left: 60},
        width = 700 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select("#bar-chart")
        .append("svg")
        .attr('id', 'chart')
        .attr("class", "chart-background")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.append("text")
       .attr("transform", `translate(${width/2}, 0)`)
       .attr('class', 'bar-chart-title')
       .text("HDB Resale Transactions March 2022");

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
        .domain([0, 13000])
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
          .duration(400)
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
    townData = dataProcessingCallback(globalData)[town];

    localDataMap = getFlatTypePerMonth(townData);
    function getFlatTypePerMonth(data) {
        var dataMap = {};
        for (var key in data) {
            var flat_type = data[key]['flat_type'];
            var flat_model = data[key]['flat_model'];
            console.log(data[key]['month'], flat_type, flat_model);
            try {
                dataMap[data[key]['month']][flat_type][flat_model] += 1;
            } catch {
                try {
                    dataMap[data[key]['month']][flat_type][flat_model] = 1;
                } catch {
                    dataMap[data[key]['month']] = {};
                    dataMap[data[key]['month']][flat_type] = {};
                    dataMap[data[key]['month']][flat_type][flat_model] = 1;
                }
            }
            break
        }
        return dataMap;
    }
    console.log(localDataMap);
    function extract_fields(dataMap) {

    }
//    console.log(localDataMap);

    // set the dimensions and margins of the graph
    const margin = {top: 70, right: 30, bottom: 130, left: 60},
        width = 700 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;
//    d3.select('#chart').remove();
    // append the svg object to the body of the page
    var svg = d3.select("#bar-chart")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

      // Add X axis
      var x = d3.scaleLinear()
        .domain([0, 12000])
        .range([ 0, width ]);
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      // Add Y axis
      var y = d3.scaleLinear()
        .domain([35, 90])
        .range([ height, 0]);
      svg.append("g")
        .call(d3.axisLeft(y));

      // Add a scale for bubble size
      var z = d3.scaleLinear()
        .domain([200000, 1310000000])
        .range([ 4, 40]);

      // Add a scale for bubble color
      var myColor = d3.scaleOrdinal()
        .domain(Object.keys(localDataMap[Object.keys(localDataMap)[0]]))
        .range(d3.schemeSet2);

      // -1- Create a tooltip div that is hidden by default:
      var tooltip = d3.select("#bar-chart")
        .append("div")
          .style("opacity", 0)
          .attr("class", "tooltip")
          .style("background-color", "black")
          .style("border-radius", "5px")
          .style("padding", "10px")
          .style("color", "white")

      // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
      var showTooltip = function(d) {
        tooltip
          .transition()
          .duration(200)
        tooltip
          .style("opacity", 1)
          .html("Country: " + d.country)
          .style("left", (d3.mouse(this)[0]+30) + "px")
          .style("top", (d3.mouse(this)[1]+30) + "px")
      }
      var moveTooltip = function(d) {
        tooltip
          .style("left", (d3.mouse(this)[0]+30) + "px")
          .style("top", (d3.mouse(this)[1]+30) + "px")
      }
      var hideTooltip = function(d) {
        tooltip
          .transition()
          .duration(200)
          .style("opacity", 0)
      }

      // Add dots
      svg.append('g')
        .selectAll("dot")
        .data(localDataMap)
        .enter()
        .append("circle")
          .attr("class", "bubbles")
          .attr("cx", function (d) { return x(d.gdpPercap); } )
          .attr("cy", function (d) { return y(d.lifeExp); } )
          .attr("r", function (d) { return z(d.pop); } )
          .style("fill", function (d) { return myColor(d.continent); } )
        // -3- Trigger the functions
        .on("mouseover", showTooltip )
        .on("mousemove", moveTooltip )
        .on("mouseleave", hideTooltip )

}