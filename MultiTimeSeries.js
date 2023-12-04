function drawPlot1()
{
    s = "";
    //console.log(window.filename);
    if (ReturnWaterOrSoil() == "water")
        s = "water_clean_grouped.csv";
    else
        s = "soil_clean_grouped.csv";

    d3.csv(s).then(function(data) {
    data.forEach(d => {
        d.visitDate = new Date(d.visitDate);
        if(s == "water_clean_grouped.csv")
        {
            d.TP = +d.TP;
            d.TN = +d.TN;
            d.disNH4 = +d.disNH4;
            d.disNO3 = +d.disNO3;
            d.disPO4 = +d.disPO4;
        }
        else
        {
            d.TP = +d.TP;
            d.TN = +d.TN;
            d.m3_P = +d.m3_P;
            d.m3_Fe = +d.m3_Fe;
            d.m3_Al = +d.m3_Al;
            d.SPSC = +d.SPSC;
            d.wEX_P = +d.wEX_P;
            d.wEX_NH3 = +d.wEX_NH3;
            d.wEX_NOx = +d.wEX_NOx;
            d.pH = +d.pH;
            d.EC = +d.EC;
        }
        //mohsen added this code
        d.Wetland_ID = d.Wetland_ID;
        d.locName = d.locName;
        d.samp_type = d.samp_type;
        d.sampleID = d.sampleID;
        d.samp_notes = d.samp_notes;
        d.x = +d.x;
        d.y = +d.y;
     });

    let tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    drawPlot();

    function drawPlot() {
        d3.select("#plotArea").selectAll("*").remove();

        let margin = { top: 5, right: 20, bottom: 40, left: 50 };
        let width = document.getElementById("top2-div1").clientWidth - margin.left - margin.right;
        let height = document.getElementById("top2-div1").clientHeight - margin.top - margin.bottom - 10;
        let svg = d3.select("#plotArea").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        
        let xScale = d3.scaleTime()
            .domain(d3.extent(data, d => d.visitDate))
            .range([0, width]);
        
        let maxDataValue = getMaxValueForSelectedLocations();

        let yScale = d3.scaleLinear()
            .domain([0, maxDataValue * 1.1])
            .range([height, 0]);

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale));


            svg.append("g")
            .attr("class", "grid")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale)
                .ticks(5)
                .tickSize(-height)
                .tickFormat("")
            );
            svg.append("g")
                .attr("class", "grid")
                .call(d3.axisLeft(yScale)
                    .ticks(10)
                    .tickSize(-width)
                    .tickFormat("")
                );
            svg.append("g")
                .attr("class", "axis")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(xScale));
                    
        // Function to update Y-axis label
        function updateYAxisLabel() {
            let selectedVariable = ReturnRadio();
            let yAxisLabel = svg.select(".y-axis-label");

            if(yAxisLabel.empty()) {
                yAxisLabel = svg.append("text")
                    .attr("class", "y-axis-label axis-label");
            }

            yAxisLabel
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text(selectedVariable);
        }
        
        // Function to get maximum value for selected locations
        function getMaxValueForSelectedLocations() {
            let maxValue = 0;
            let selectedVariable = ReturnRadio();
            [ActivePin1, ActivePin2, ActivePin3].forEach(pin => {
                if (IsActiveMarker(pin)) {
                    let selectedLocation = pin.title;
                    let filteredData = data.filter(d => d.Wetland_ID === selectedLocation);
                    let locationMax = d3.max(filteredData, d => d[selectedVariable]);
                    if (locationMax > maxValue) {
                        maxValue = locationMax;
                    }
                }
            });
            return maxValue;
        }
        // Add Y Axis
        svg.select(".axis-left").remove(); // Remove previous y-axis if exists
        svg.append("g")
            .attr("class", "axis axis-left")
            .call(d3.axisLeft(yScale));
        

        function getSelectedLocationNames() {
            let names = [];
            [ActivePin1, ActivePin2, ActivePin3].forEach(pin => {
                if (IsActiveMarker(pin)) {
                    let selectedLocation = pin.title;
                    let uniqueName = data.find(d => d.Wetland_ID === selectedLocation)?.locName;
                    if (uniqueName && !names.includes(uniqueName)) {
                        names.push(uniqueName);
                    }
                }
            });
            return names;
        }
    
        let selectedLocationNames = getSelectedLocationNames();
    
        // Define color for each location dynamically
        let locationColors = selectedLocationNames.reduce((colors, name, index) => {
            if (index === 1) { // If it's the second item (index starts from 0)
                colors[name] = "red"; // Set the color to red
            } else {
                colors[name] = d3.schemeCategory10[index % 10]; // Other colors remain the same
            }            return colors;
        }, {});
    
       
            

        // Update Y-axis label
        updateYAxisLabel(ReturnRadio());
        let showLocation2 = IsActiveMarker(ActivePin2);
        let showLocation3 = IsActiveMarker(ActivePin3)
        ii = 1;
        while(ii <= 3){
        //locationDropdowns.forEach((dropdown, index) => {
           // if ((ii === 2 && !showLocation2) || (ii === 3 && !showLocation3)) {
             //   return;
           // }

            let selectedLocation = null;

            if(ii == 1)
                if(IsActiveMarker(ActivePin1))
                    selectedLocation = ActivePin1.title;
                else
                {
                    ++ii;
                    continue;
                }
            else
            if(ii == 2)
                if(IsActiveMarker(ActivePin2))
                    selectedLocation = ActivePin2.title;
                else
                {
                    ++ii;
                    continue;
                }
            else
                if(IsActiveMarker(ActivePin3))
                    selectedLocation = ActivePin3.title;
                else
                {
                    ++ii;
                    continue;
                }

            let selectedVariable = ReturnRadio();

            let filteredData = data.filter(d => d.Wetland_ID === selectedLocation);

            let medianData = Array.from(d3.group(filteredData, d => d.visitDate), ([date, values]) => {
                return { visitDate: new Date(date), value: d3.median(values, v => v[ReturnRadio()]) };
            });

            medianData.sort((a, b) => a.visitDate - b.visitDate);

            let line = d3.line()
                .x(d => xScale(d.visitDate))
                .y(d => yScale(d.value));

            svg.append("path")
                .datum(medianData)
                .attr("class", `line location${ii}`)
                .attr("d", line);

            svg.selectAll(`.dot.location${ii}`)
                .data(filteredData)
                .enter().append("circle")
                .attr("class", `circle location${ii}`)
                .attr("r", 6)
                .attr("cx", d => xScale(d.visitDate))
                .attr("cy", d => yScale(d[ReturnRadio()]))
                .on("mouseover", function(event, d) {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9)
                        .style("width", "150px")    // Set width, adjust as needed
                        .style("height", "40px");
                    tooltip.html("Date: " + d3.timeFormat("%Y-%m-%d")(d.visitDate) + "<br/>Value: " + d[ReturnRadio()])
                        .style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY - 28) + "px")
                        .style("font-size", "16px");
                })
                .on("mouseout", function(d) {
                    tooltip.transition().duration(500).style("opacity", 0);
                })
                .on("click", function(event, d) {
                    
                    if (reddot != null && reddot.setMap) {
                        // Remove the marker from the map
                        reddot.setMap(null);
                    }
                    aa = document.getElementById("left1-div1");
                    s = "<center><font color='orange'>Sample Information</font></center>"+
                    "<font color='orange' >ID:</font> " + d["sampleID"] +
                    "<br><font color='orange' >Location:</font> " + d["locName"] +
                    
                    "<br> <font color='orange' >Type:</font> " + d["samp_type"] + 
                    "<br><font color='orange' > Notes:</font> " + d["samp_notes"];
                    
                    aa.innerHTML = s;
                    
                    var doticon = {
                        url: "images/reddot.png",
                        scaledSize: new google.maps.Size(15, 15), // size
                    };

                    reddot = new google.maps.Marker({
                        position: {lat: d["y"], lng: d["x"]},
                        map: map,
                        title: 'Wetland_ID',
                        icon: doticon
                    });

                    if (!svg.selectAll(".select-circle").empty()) 
                        // If elements exist, remove them
                        svg.selectAll(".select-circle").remove();


                    window.savedCirclePosition = { x: xScale(d.visitDate), y: yScale(d[ReturnRadio()]) };
                    ss = event.currentTarget.className.animVal;
                    window.WhichActivePin = parseInt(ss[ss.length - 1],10);
                    // Tooltip code remains the same
            
                    // Draw a new red circle around the clicked circle
                    svg.append("circle")
                        .attr("class", "select-circle")
                        .attr("r", 10) // Adjust the radius as needed
                        .attr("cx", xScale(d.visitDate))
                        .attr("cy", yScale(d[ReturnRadio()]))
                        .attr("stroke", "orange")
                        .attr("stroke-width", 2)
                        .attr("fill", "none");
                    
                });

               
            ii = ii + 1;
        }

         // Add legend
         let legend = svg.append("g")
         .attr("class", "legend")
         .attr("transform", `translate(${margin.left - 40}, ${height+27})`); // Adjust position as needed
 
         selectedLocationNames.forEach((location, index) => {
         let legendEntry = legend.append("g")
             .attr("transform", `translate(${index * 170}, 0)`); // Adjust spacing as needed
 
         legendEntry.append("rect")
             .attr("width", 10)
             .attr("height", 10)
             .style("fill", locationColors[location]);
 
         legendEntry.append("text")
             .attr("x", 15)
             .attr("y", 7)
             .text(location)
             .style("font-size", "12px")
             .attr("alignment-baseline","middle");
     });

        if((window.savedCirclePosition.y != 0) || (window.savedCirclePosition.x != 0)){
            svg.append("circle")
                .attr("class", "select-circle")
                .attr("r", 10) // Adjust the radius as needed
                .attr("cx", window.savedCirclePosition.x)
                .attr("cy", window.savedCirclePosition.y)
                .attr("stroke", "orange")
                .attr("stroke-width", 2)
                .attr("fill", "none");
        }
    }
});
}
