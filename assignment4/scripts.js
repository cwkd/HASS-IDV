var width = 1000, height = 600;

function processData(data) {

}

// Load external data and boot
Promise.all([d3.json("assets/sgmap.json"), d3.csv("assets/population2021.csv")])
    .then(data => {
        var svg = d3.select("#map")
            .attr("viewBox", `0 0 ${width} ${height}`);

        console.log(data[0]);
        console.log(data[0].features[0].properties);
        console.log(data[1]);

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
            .attr("d", geopath)
            .attr("fill", "black");

        function districtOnMouseOver(d, i) {
            d3.select(this);
            console.log(i);
        }

        function districtOnMouseOut(d, i) {
            d3.select(this);
            console.log(i);
        }
    })