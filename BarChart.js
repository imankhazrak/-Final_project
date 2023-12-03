
function fillSelectCombo(){
// List of numerical variables
const water_variables = ["TP", "TN", "disNH4", "disNO3", "disPO4"];        
 
const soil_variables = ['TP', 'TN', 'm3_P', 'm3_Fe', 'm3_Al', 'SPSC', 'wEX_P', 'wEX_NH3', 'wEX_NOx', 'pH', 'EC'];

variables = [];
document.getElementById("variable-selector").innerHTML = "";
   
files = "";
variables = [];   
if (ReturnWaterOrSoil() == "water")
{
   files = "water_clean_grouped.csv";
   variables = water_variables;
}
else
{
   files = "soil_clean_grouped.csv";
   variables = soil_variables;
}

const selector = d3.select("#variable-selector");

 // Populate the dropdown
 variables.forEach(variable => {
     selector.append("option")
             .text(variable)
             .attr("value", variable);
 });
}
function iii()
{
    fillSelectCombo();
 // Set dimensions and margins for the SVG
 const margin = { top: 20, right: 20, bottom: 80, left: 55 },
       width = document.getElementById("BarChart-div1").clientWidth - margin.left - margin.right,
       height = document.getElementById("BarChart-div1").clientHeight - margin.top - margin.bottom;

 // Append SVG object to the body
 const svg = d3.select("#my_dataviz")
               .append("g")
               .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
 
 // Select the tooltip div and define its properties
 const tooltipBar = d3.select("#tooltipBar");

 // Function to draw the chart
 function drawChart(selectedVariable) {
     // Clear existing chart
    svg.selectAll("*").remove();

    files = "";
    if (ReturnWaterOrSoil() == "water")
    {
        files = "water_clean_grouped.csv";
    
    }
    else
    {
        files = "soil_clean_grouped.csv";
    
    }
     // Load data from CSV file
     d3.csv(files).then(function(data) {
         // Parse the data
         data.forEach(d => {
            if (ReturnWaterOrSoil() == "water")
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
            
         });

         // Process data to stack by location and Crop_Season
         let processedData = Array.from(d3.group(data, d => d.Wetland_ID), ([Wetland_ID, values]) => {
             let entry = { Wetland_ID: Wetland_ID };
             values.forEach(v => {
                 entry[v.Crop_Season] = v[selectedVariable];
             });
             return entry;
         });

         // Stack the data
         const subgroups = ["Crop_Season", "Non_Crop_Season"];
         const stackedData = d3.stack().keys(subgroups)(processedData);

         // X scale
         const x = d3.scaleBand()
                     .domain(processedData.map(d => d.Wetland_ID))
                     .range([0, width])
                     .padding(0.1);

         // Add X axis
         svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).tickSizeOuter(0))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-90)")
            .style("font-size", "16px");

         // Y scale
         const y = d3.scaleLinear()
                     .domain([0, d3.max(stackedData, d => d3.max(d, d => d[1]))])
                     .range([height, 0]);

         // Add Y axis
         svg.append("g")
         .call(d3.axisLeft(y))
         .append("text")
         .attr("transform", "rotate(-90)")
         .attr("y", 6)
        // .attr("dy", "0.71em")
         .attr("dy", "-2.9em")
         .attr("text-anchor", "end")
         .text(selectedVariable)
         .style("fill", "black")
         .style("font-size", "16px");

         // Color palette
         const color = d3.scaleOrdinal()
                                .domain(subgroups)
                                .range(["#587a33", "#ff7f0e"]);

         // Add legend
         const legend = svg.append("g")
                         .attr("font-family", "sans-serif")
                         .attr("font-size", 14)
                         .attr("text-anchor", "end")
                         .selectAll("g")
                         .data(color.domain().slice().reverse())
                         .enter().append("g")
                             .attr("transform", (d, i) => `translate(0,${i * 20})`);

         legend.append("rect")
             .attr("x", width - 19)
             .attr("width", 19)
             .attr("height", 19)
             .attr("fill", color);

         legend.append("text")
             .attr("x", width - 24)
             .attr("y", 9.5)
             .attr("dy", "0.32em")
             .text(d => d);
                     
         // Show the bars
         svg.append("g")
            .selectAll("g")
            .data(stackedData)
            .enter().append("g")
              .attr("fill", d => color(d.key))
            .selectAll("rect")
            .data(d => d)
            .enter().append("rect")
              .attr("x", d => x(d.data.Wetland_ID))
              .attr("y", d => y(d[1]))
              .attr("height", d => y(d[0]) - y(d[1]))
              .attr("width", x.bandwidth())
              .on("mouseover", function(event, d) {
                 tooltipBar.style("visibility", "visible")
                        .text(`Value: ${(d[1] - d[0]).toFixed(2)}`) // Display the value
                        .style("left", (event.offsetX + 5) + "px")
                        .style("top", (event.offsetY - 5) + "px")
                        .style("font-size", "16px");
              })
              .on("mouseout", function() {
                 tooltipBar.style("visibility", "hidden");
              });
     });
     
 }

 // Initial chart drawing
 drawChart(variables[0]);

 const selector1 = d3.select("#variable-selector");
 // Update the chart when a new variable is selected
 selector1.on("change", function() {
     const selectedVariable = d3.select(this).property("value");
     drawChart(selectedVariable);
 });
}
