// add your JavaScript/D3 to this file


// JavaScript Code

//So far reading from this source... I was unable to change it before.
d3.csv('https://raw.githubusercontent.com/igcc2023/Temp/main/df_growth.csv')
    .then(function(rows) {
        //Common Functions and Variables for both maps
        function unpack(rows, key) {
            return rows.map(function(row) { return row[key]; });
        }

        var causes = [...new Set(rows.map(row => row.Cause))];

        //Function to update the choropleth map
        function updateChoropleth(cause) {
            var filteredData = rows.filter(row => row.Cause === cause);
            var [minGrowth, maxGrowth] = getMinMaxGrowth(cause);

            var data = [{
                type: 'choropleth',
                locationmode: 'USA-states',
                locations: unpack(filteredData, 'State'),
                z: unpack(filteredData, 'Growth').map(x => x * 100),
                text: unpack(filteredData, 'State').map((state, i) =>
                    `${state}<br>Growth in deaths from '99 to '20: ${parseFloat(filteredData[i].Growth * 100).toFixed(0)}%`),
                colorscale: 'Viridis',
                zmin: minGrowth,
                zmax: maxGrowth
            }];

            var layout = {
                title: 'Death Rate Growth from 1999 to 2020 for: '+ cause,
                geo: {
                    scope: 'usa',
                    countrycolor: 'rgb(255, 255, 255)',
                    showland: true,
                    landcolor: 'rgb(217, 217, 217)',
                    showlakes: true,
                    lakecolor: 'rgb(255, 255, 255)',
                    subunitcolor: 'rgb(255, 255, 255)',
                    lonaxis: {},
                    lataxis: {}
                }
            };

            Plotly.newPlot("plot2", data, layout, {showLink: false});
        }

        //Function to calculate min and max growth values
        function getMinMaxGrowth(cause) {
            var causeData = rows.filter(row => row.Cause === cause);
            var growthValues = causeData.map(row => parseFloat(row.Growth));
            var minGrowth = Math.min(...growthValues);
            var maxGrowth = Math.max(...growthValues);
            return [minGrowth * 100, maxGrowth * 100];
        }

        //Function to update the scattergeo map
        function updateScatterGeo(cause) {
            var filteredData = rows.filter(row => row.Cause === cause);
            var maxRate = Math.max(...filteredData.map(row => parseFloat(row.LatestRate)));

            var baseSize = 1; // Base size of the bubbles
            var scalingFactor = 65; // Factor to amplify differences

            var data = [{
                type: 'scattergeo',
                locationmode: 'USA-states',
                lat: unpack(filteredData, 'Lat'),
                lon: unpack(filteredData, 'Long'),
                text: unpack(filteredData, 'Name').map((name, i) =>
                    `${name}<br>Deaths p/100k People: ${filteredData[i].LatestRate}`),
                marker: {
                    size: unpack(filteredData, 'LatestRate').map(rate => baseSize + scalingFactor * (rate / maxRate)),
                    line: {
                        color: 'black',
                        width: 2
                    }
                }
            }];

            var layout = {
                title: 'Age-Adjusted Deaths per State for: ' + cause,
                showlegend: false,
                geo: {
                    scope: 'usa',
                    projection: {
                        type: 'albers usa'
                    },
                    showland: true,
                    landcolor: 'rgb(217, 217, 217)',
                    subunitwidth: 1,
                    countrywidth: 1,
                    subunitcolor: 'rgb(255,255,255)',
                    countrycolor: 'rgb(255,255,255)'
                },
            };

            Plotly.newPlot("plot", data, layout, {showLink: false});
        }

        //Function to update both maps
        function updateMaps(cause) {
            updateChoropleth(cause);
            updateScatterGeo(cause);
        }

        //Single shared slicer for both maps
        var select = d3.select('#slicer')
            .append('select')
              .attr('id', 'causeSelector')
              .on('change', function() {
                  var selectedCause = d3.select(this).property('value');
                  updateMaps(selectedCause);
              });

        select.selectAll('option')
            .data(causes)
            .enter()
            .append('option')
            .text(function (d) { return d; })
            .attr('value', function (d) { return d; });

        //Initialize maps
        updateMaps(causes[0]);
    })
    .catch(function(error) {
        console.error("Error loading data:", error);
    });
