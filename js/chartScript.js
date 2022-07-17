const image = new Image();
image.src = "../media/navigation.png";
image.width = 20;
image.height = 20;

const ctx = document.getElementById("myChart").getContext("2d");
let pointsToDisplay = [];

const loadChart = async () => {
  let { name, plans, tracks } = await window.api.getRequires();
  console.log(plans.first[0]);
  console.log(tracks.first[0].TIME);
  document.getElementById("loading").style.display = "none";
  let planExeedPoints = markExceedPointsPlan(plans.first, name);
  let trackExeedPoints = markExceedPointsTrack(tracks.first, plans.first, name);

  const datasets = [
    pointDataSet("rgb(0, 0, 99, 0.5)", "track_point", image),
    pointDataSet("rgb(55, 171, 175)", "plan_point", "circle"),
    trackDataSet("rgb(0, 165, 0)", "track1", tracks.first),
    trackDataSet("rgb(0, 165, 0)", "track2", tracks.second),
    trackDataSet("rgb(0, 165, 0)", "track3", tracks.third),
    trackDataSet("rgb(0, 165, 0)", "track4", tracks.fourth),
    trackDataSet("rgb(255, 0, 0)", "plan_1", plans.first),
    trackDataSet("rgb(255, 0, 0)", "plan_2", plans.second),
    trackDataSet("rgb(255, 0, 0)", "plan_3", plans.third),

    rangeDataSet(
      "orange",
      "track_exceedPoints_1",
      markExceedPointsTrack(tracks.first, plans.first, name)
    ),
    rangeDataSet(
      "orange",
      "plan_exceedPoints_1",
      markExceedPointsPlan(plans.first, name)
    ),
    rangeDataSet(
      "orange",
      "track_exceedPoints_2",
      markExceedPointsTrack(tracks.second, plans.second, name)
    ),
    rangeDataSet(
      "orange",
      "plan_exceedPoints_2",
      markExceedPointsPlan(plans.second, name)
    ),
    rangeDataSet(
      "orange",
      "track_exceedPoints_3",
      markExceedPointsTrack(tracks.third, plans.third, name)
    ),
    rangeDataSet(
      "orange",
      "plan_exceedPoints_3",
      markExceedPointsPlan(plans.third, name)
    ),
  ];
  c1 = new Chart(ctx, {
    type: "scatter",

    data: {
      datasets: datasets,
    },
    options: {
      responsive: true,
      aspectRatio: 1,
      legend: {
        display: true,
        position: "right",
        align: "start",
        labels: {
          filter: function (item, chart) {
            return !item.text.includes("_");
          },
        },
        onClick: function (e, legendItem) {
          this.chart.data.datasets[0].data = [];
          this.chart.data.datasets[1].data = [];
          let segmentNumber = legendItem.text[legendItem.text.length - 1];
          let plansMeta = this.chart._getSortedDatasetMetas().filter((d) => {
            return d.controller._config.label.includes("plan");
          });
          let tracksMeta = this.chart._getSortedDatasetMetas().filter((d) => {
            return d.controller._config.label.includes("track");
          });
          for (const dataSet of plansMeta) {
            if (dataSet.controller._config.label.includes(segmentNumber)) {
              dataSet.hidden = !dataSet.hidden;
            }
          }
          for (const dataSet of tracksMeta) {
            if (dataSet.controller._config.label.includes(segmentNumber)) {
              dataSet.hidden = !dataSet.hidden;
            }
          }
          this.chart.update();
        },
      },
      plugins: {
        zoom: {
          // Container for pan options
          pan: {
            // Boolean to enable panning
            enabled: true,

            // Panning directions. Remove the appropriate direction to disable
            // Eg. 'y' would only allow panning in the y direction
            mode: "xy",
          },

          // Container for zoom options
          zoom: {
            // Boolean to enable zooming
            enabled: true,

            // Zooming directions. Remove the appropriate direction to disable
            // Eg. 'y' would only allow zooming in the y direction
            mode: "xy",
          },
        },
      },
      animation: {
        duration: 0,
      },
      events: ["click"],
      tooltips: {
        bodyFontColor: "rgba(255, 0, 0, 0)",
        footerFontColor: "rgba(255, 0, 0, 0)",
        displayColors: false,
        backgroundColor: "rgba(255, 0, 0, 0)",
        callbacks: {
          label: function (tooltipItem, data) {
            let trackData = data.datasets[tooltipItem.datasetIndex].data;
            sendData(trackData[tooltipItem.index]);
          },
        },
      },
    },
  });
};

/* this function called when the user clicking on some point on the graph
data is a object of a single point data
*/
function sendData(data) {
  if (data.TIME) {
    c1.data.datasets[0].rotation = data.HEADING;
    c1.data.datasets[0].data[0] = data;

    c1.update();
    console.log("IAS = " + data.IAS);
    console.log("ELHE = " + data.ELHE);
    console.log("TIME = " + data.TIME);
  } else {
    console.log(data);
    // c1.data.datasets[2].data[1] = data.trckPoint;
    c1.data.datasets[1].data[0] = data;
    c1.update();
  }
}

function trackDataSet(color, label, track) {
  return {
    borderColor: color,
    pointBorderColor: "rgba(255, 0, 0, 0)",
    pointRadius: 5,
    pointBackgroundColor: "rgba(255, 0, 0, 0)",
    label: label,
    showLine: "true",
    spanGaps: true,
    fill: "false",
    data: track,
    duration: 0,
  };
}
function pointDataSet(color, label, pointStyle) {
  return {
    borderColor: color,
    backgroundColor: color,
    pointStyle: pointStyle,
    pointRadius: 5,
    pointHoverRadius: 7,
    label: label,
    pointBackgroundColor: "blue",
    pointHoverBackgroundColor: "blue",
    data: [],
    duration: 0,
  };
}

function rangeDataSet(color, label, range) {
  return {
    borderColor: color,
    backgroundColor: "rgb(0, 0, 255, 0.5)",
    pointRadius: 5,
    pointHoverRadius: 4,
    pointBackgroundColor: color,
    label: label,
    pointBorderColor: color,
    pointHoverBackgroundColor: "orange",
    data: range,
    duration: 0,
  };
}

function printPoint(point) {
  c1.data.datasets[1].data[1] = point;
  c1.update();
}

function printRange(range) {
  c1.data.datasets[1].data[5] = range[0];
  c1.data.datasets[2].data[6] = range[range.length - 1];
  c1.update();
}

function removePoint() {
  c1.data.datasets[1].data[1] = {};
  c1.update();
}
document.getElementById("loading").style.display = "block";
loadChart();
