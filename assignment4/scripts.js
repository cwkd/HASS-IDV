var width = 1000, height = 600;

var popData = {};
var mapData = {};
var globalData = {};

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

function drawMap(data) {
    var svg = d3.select("#map")
//        .attr("viewBox", `0 0 ${width} ${height}`);
//    console.log(svg.style('width').replace("px", ""), svg.style('height').replace("px", ""))

    mapData = data[0];
    popData = convertToAllCaps(data[1]);
    popDataMap = getDataMap(popData);

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
//        console.log(popDataMap);
        svgWidth = d3.select('#map').style('width').replace("px", "");
        svgHeight = d3.select('#map').style('height').replace("px", "");
        marginRight = svgHeight*.05
        marginBottom = svgWidth*.025
        boxWidth = svgWidth*.35
        boxHeight = svgHeight*.2

        // tooltip box
        svg.append('rect')
            .attr('id', 'info-box')
            .attr('class', 'box')
            .attr('width', boxWidth)
            .attr('height', boxHeight)
            .attr('transform', `translate(${svgWidth - marginRight - boxWidth},
            ${svgHeight - marginBottom - boxHeight})`);
        // tooltip text
        svg.append('text')
            .attr('class', 'box-text')
            .attr('transform', `translate(${svgWidth - marginRight - boxWidth/2},
            ${svgHeight - marginBottom - boxHeight*4/6})`)
            .text(`Planning Area: ${planningArea}`);
        svg.append('text')
            .attr('class', 'box-text')
            .attr('transform', `translate(${svgWidth - marginRight - boxWidth/2},
            ${svgHeight - marginBottom - boxHeight*2/5})`)
            .text(`Subzone: ${subzone}`);
        svg.append('text')
            .attr('class', 'box-text')
            .attr('transform', `translate(${svgWidth - marginRight - boxWidth/2},
            ${svgHeight - marginBottom - boxHeight*1/6})`)
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
}

function redraw() {
    drawMap(globalData);
}

// Load external data and boot
Promise.all([d3.json("assets/sgmap.json"), d3.csv("assets/population2021.csv")])
    .then(d => {
        globalData = d;
        redraw();
    })

//window.addEventListener('resize', redraw)