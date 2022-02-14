function appendData(data) {
    var header = document.getElementById("myTimestamp");
    var headerDiv  = document.createElement("div");
    tempStr = Date(data.update_timestamp);
    headerDiv.innerHTML = tempStr;
    header.appendChild(headerDiv);
    var myData = document.getElementById("myData");
    var rowCounter = 0;
    for (key in data.readings) {
        var row = document.createElement("tr");
        var col = document.createElement("td");
        if (rowCounter % 2 == 0) {
            row.className = "trEven"
        } else {
            row.className = "trOdd"
        }
        col.innerHTML = key;
        row.appendChild(col);
        line = data.readings[key];
        const sub_keys = ["national", "central", "north", "south", "east", "west"];
        for (idx in sub_keys) {
            var col = document.createElement("td");
            col.innerHTML = line[sub_keys[idx]];
            row.appendChild(col);
        }
        myData.appendChild(row);
        rowCounter++;
    }
}
let myJson = {};
fetch('https://api.data.gov.sg/v1/environment/psi')
    .then(response => response.json())
    .then(data => {
    myJson = data.items[0];
    appendData(myJson);});