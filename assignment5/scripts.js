var height = 1000, width = 600,
    margin = {top: 50, bottom: 100, left: 50, right: 100};

function computeYears(data) {
    data.columns.push('years');
    for (var i in data) {
        try {
//            console.log(data[i]['apartment price']*.2/data[i]['breakfast price']/365);
            data[i].years = data[i]['apartment price']*.2/data[i]['breakfast price']/365;
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

d3.csv('assets/data.csv')
    .then(function(data) {

        data = computeYears(data);

        var yMax = getYMax(data);
        function getYMax(temp) {
            var numbers = [];
            for (var i in temp) {
                numbers.push(temp[i].years);
            }
            return d3.max(numbers);
        }
//        console.log(yMax);

        var div = d3.select('.chart-container');
        chartWidth = div.style('width').replace("px", "");
        chartHeight = div.style('width').replace("px", "")*3/4;
        axesWidth = chartWidth - margin.left - margin.right;
        axesHeight = chartHeight - margin.top - margin.bottom;

//        console.log(div.style('width').replace("px", ""), div.style('height').replace("px", ""));
//        console.log(chartWidth, chartHeight);
//        console.log(axesWidth, axesHeight);

//        console.log(capitaliseEachWord(data[0]['city']), data.columns);
        const svg = d3.select('.chart-container')
            .style('height', chartHeight)
            .append('svg')
            .attr('id', 'chart')
            .attr('class', 'chart-background')
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);;


        svg.append("text")
           .attr("transform", `translate(${width/2}, ${-margin.top/2})`)
           .attr('class', 'chart-title')
           .text("Apartment Prices");

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
            .attr("y", d => y(d.years))
            .attr("width", x.bandwidth())
            .attr("height", d => axesHeight - y(d.years));
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

    });