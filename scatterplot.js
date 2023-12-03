function drawscatter() {

    var margin = {top: 10, right: 10, bottom: 40, left: 50},
    width = document.getElementById("left2-div1").clientWidth - margin.left - margin.right,
    height = document.getElementById("left2-div1").clientHeight - margin.top - margin.bottom;

    d3.select("#my_datavizscatterplot").selectAll("*").remove();

    var svg = d3.select("#my_datavizscatterplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var tooltipCo = d3.select("body").append("div")
        .attr("class", "tooltipCo")
        .style("opacity", 0);

    var color = d3.scaleOrdinal()
        .domain(["Crop_Season", "Non_Crop_Season"])
        .range(["#587a33", "#ff7f0e"]);

    var s = "";
    if (ReturnWaterOrSoil() == "water")
        s = "water_clean_grouped.csv";
    else
        s = "soil_clean_grouped.csv";

    d3.csv(s).then(function(data) {

        updateChart(data, document.getElementById("x-axis-select").value, document.getElementById("y-axis-select").value);

        d3.select("#x-axis-select").on("change", function() {
            var selectedX = d3.select(this).property("value");
            var selectedY = d3.select("#y-axis-select").property("value");
            updateChart(data, selectedX, selectedY);
        });

        d3.select("#y-axis-select").on("change", function() {
            var selectedX = d3.select("#x-axis-select").property("value");
            var selectedY = d3.select(this).property("value");
            updateChart(data, selectedX, selectedY);
        });
    });

    // Function to calculate Pearson correlation coefficient
    function pearsonCorrelation(x, y) {
        let n = x.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
        for (let i = 0; i < n; i++) {
            sumX += x[i];
            sumY += y[i];
            sumXY += (x[i] * y[i]);
            sumX2 += (x[i] * x[i]);
            sumY2 += (y[i] * y[i]);
        }
        let numerator = sumXY - (sumX * sumY / n);
        let denominator = Math.sqrt((sumX2 - (sumX * sumX / n)) * (sumY2 - (sumY * sumY / n)));
        if (denominator === 0) return 0;
        return numerator / denominator;
    }

    function updateChart(data, xVariable, yVariable) {
        svg.selectAll("*").remove();

        var maxX = d3.max(data, function(d) { return +d[xVariable]; });
        var x = d3.scaleLinear()
            .domain([0, maxX * 1.1])
            .range([0, width]);

        var maxY = d3.max(data, function(d) { return +d[yVariable]; });
        var y = d3.scaleLinear()
            .domain([0, maxY * 1.1])
            .range([height, 0]);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));
        svg.append("text")
            .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom - 5) + ")")
            .style("text-anchor", "middle")
            .text(xVariable);

        svg.append("g")
            .call(d3.axisLeft(y));

        svg.append("g")			
            .attr("class", "grid")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)
                .ticks(10)
                .tickSize(-height)
                .tickFormat(""));

        svg.append("g")			
            .attr("class", "grid")
            .call(d3.axisLeft(y)
                .ticks(10)
                .tickSize(-width)
                .tickFormat(""));

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(yVariable);

        svg.selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
                .attr("cx", function(d) { return x(d[xVariable]); })
                .attr("cy", function(d) { return y(d[yVariable]); })
                .attr("r", 5)
                .style("fill", function(d) { return color(d.Crop_Season); })
                .on("mouseover", function(event, d) {
                    d3.select(this).transition().duration(200).style("fill", "red");
                    tooltipCo.transition().duration(200).style("opacity", .9);
                    tooltipCo.html( d.locName+ "<br/>" + d.visitDate)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function(d) {
                    d3.select(this).transition().duration(500).style("fill", function(d) { return color(d.Crop_Season); });
                    tooltipCo.transition().duration(500).style("opacity", 0);
                });

        let xValues = data.map(d => +d[xVariable]);
        let yValues = data.map(d => +d[yVariable]);
        let correlation = pearsonCorrelation(xValues, yValues);
        d3.select("#correlation-box").html("Correlation = " + correlation.toFixed(2));

        // Add legend background
            var legendBackground = svg.append("rect")
            .attr("class", "legend-bg")
            .attr("x", width - 130) // Adjust the position as needed
            .attr("y", height - (color.domain().length * 20) - 10) // Adjust based on the number of items and spacing
            .attr("width", 120) // Set the width of the legend box
            .attr("height", color.domain().length * 20 + 10) // Height based on number of items
            .style("fill", 'white') // Background color

        // Add legend
        var legend = svg.selectAll(".legend")
            .data(color.domain())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { 
                return "translate(" + (width - 30) + "," + (height - 20 - (i * 20)) + ")"; 
            });

        legend.append("rect")
            .attr("width", 13)
            .attr("height", 13)
            .style("fill", color);

        legend.append("text")
            .attr("x", -5)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .style("font-size", "12px")
            .text(function(d) { return d; });


}

}