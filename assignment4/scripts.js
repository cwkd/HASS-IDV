var width = 1000, height = 600;

var popData = {};
var mapData = {};

function convertToAllCaps(data) {
    data.columns.push('Key');
    for (var i in data) {
        try {
            data[i]['Key'] = `${data[i]['Planning Area'].toUpperCase()} ${data[i]['Subzone'].toUpperCase()}`;
        } catch {
        }
    }
    return data;
}

function getDataMap(data) {
    var dataMap = {}
    for (var i in data) {
        key = data[i]['Key']
        dataMap[key] = data[i]['Population']
    }
    return dataMap;
}

// Load external data and boot
Promise.all([d3.json("assets/sgmap.json"), d3.csv("assets/population2021.csv")])
    .then(data => {
        var svg = d3.select("#map")
            .attr("viewBox", `0 0 ${width} ${height}`);

        mapData = data[0];
        popData = convertToAllCaps(data[1]);
        popDataMap = getDataMap(popData);


//        console.log(data[0]);
//        console.log(data[0].features[0].properties);
//        console.log(popDataMap);

        // Map and projection
        var projection = d3.geoMercator()
            .center([103.851959, 1.290270])
            .fitExtent([[20, 20], [980, 580]], data[0]);

        var geopath = d3.geoPath().projection(projection);

        svg.append("g")
            .attr("id", "districts")
            .selectAll("path")
            .data(data[0].features)
            .enter()
            .append("path")
            .on('mouseover', districtOnMouseOver)
            .on('mouseout', districtOnMouseOut)
//            .on('click', districtOnMouseOver)
            .attr("d", geopath)
            .attr('class', 'district');

//        console.log(svg.style('width'), svg.style('height'));

        function districtOnMouseOver(d, i) {
            d3.select(this)
                .attr('class', 'district-highlight');
            planningArea = i.properties['Planning Area Name'];
            subzone = i.properties['Subzone Name'];
            queryKey = `${planningArea} ${subzone}`
            population = popDataMap[queryKey] || '-';
            console.log(popDataMap);
            svg.append('rect')
                .attr('id', 'info-box')
                .attr('class', 'box')
                .attr('transform', `translate(${svg.style('width').replace("px", "")*0.7},
                ${svg.style('height').replace("px", "")*0.85})`);
            svg.append('text')
                .attr('class', 'box-text')
                .attr('transform', `translate(${svg.style('width').replace("px", "")*0.9},
                ${svg.style('height').replace("px", "")*0.91})`)
                .text(`Planning Area: ${planningArea}`);
            svg.append('text')
                .attr('class', 'box-text')
                .attr('transform', `translate(${svg.style('width').replace("px", "")*0.9},
                ${svg.style('height').replace("px", "")*.975})`)
                .text(`Subzone: ${subzone}`);
            svg.append('text')
                .attr('class', 'box-text')
                .attr('transform', `translate(${svg.style('width').replace("px", "")*0.9},
                ${svg.style('height').replace("px", "")*1.04})`)
                .text(`Population: ${population}`);
            console.log(planningArea, subzone, population)
        }

        function districtOnMouseOut(d, i) {
            d3.select(this)
                .attr('class', 'district');
            d3.selectAll('.box')
                .remove();
            d3.selectAll('.box-text')
                .remove();
        }
    })