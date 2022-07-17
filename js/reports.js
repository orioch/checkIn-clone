const XLSX = require("xlsx-js-style");
const average = require("./averages");
const general = require("./general");
const exeption = require("./exeptions");

function xlsxReport(tracks, plans, name) {
  // write xlsx report
  const rows = rowsInitialization(tracks, plans, name);

  /* generate worksheet and workbook */
  let worksheet = XLSX.utils.json_to_sheet(rows);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  /* calculate column width */
  let max_width_title = rows.reduce((w, r) => Math.max(w, r.title.length), 10);
  worksheet["!cols"] = [
    { wch: max_width_title },
    { wch: 20 },
    { wch: 22 },
    { wch: 15 },
    { wch: 16 },
    { wch: 10 },
  ];

  XLSX.utils.sheet_add_aoa(
    worksheet,
    [
      [
        "",
        "מתחילת נתיב עד חצייה",
        "מחצייה עד ירידה מהנתיב",
        "עקיפת החוליה",
        "מחילוץ עד חצייה",
        "כללי",
      ],
    ],
    { origin: "A1" }
  );
  worksheet = addStyle(worksheet);
  return workbook;
}

function addStyle(worksheet) {
  for (const cell in worksheet) {
    //general cells styling
    worksheet[cell].s = {
      alignment: { vertical: "center", horizontal: "center" },
      font: { sz: "11" },
      border: { right: { style: "solid", color: "000000" } },
    };

    //styling titles
    if (cell[0] === "A" || (cell[1] === "1" && cell.length == 2)) {
      worksheet[cell].s.alignment = {
        vertical: "center",
        horizontal: "center",
      };
      worksheet[cell].s.font = { sz: "12" };
    }

    if (cell[1] === "2" && cell[0] !== "A") {
      if (worksheet[cell].v <= 150) {
        worksheet[cell].s.fill = { fgColor: { rgb: "8fce00" } };
      } else if (150 < worksheet[cell].v <= 500) {
        worksheet[cell].s.fill = { fgColor: { rgb: "ffda15" } };
      }

      if (500 < worksheet[cell].v) {
        worksheet[cell].s.fill = { fgColor: { rgb: "ff2a2a" } };
      }
    }

    if (cell[1] === "4" && cell[0] !== "A") {
      worksheet[cell].s.fill = { fgColor: { rgb: "ffda15" } };
    }
  }

  // IAS row coloring
  for (const cell in worksheet) {
    if (cell[1] === "5" && cell[0] !== "A") {
      if (worksheet[cell].v > 60) {
        worksheet[cell].s.fill = { fgColor: { rgb: "8fce00" } };
      } else {
        worksheet[cell].s.fill = { fgColor: { rgb: "ff2a2a" } };
      }
    }
  }

  for (const cell in worksheet) {
    if (cell[1] === "7" && cell[0] !== "A") {
      if (worksheet[cell].v <= 500) {
        worksheet[cell].s.fill = { fgColor: { rgb: "8fce00" } };
      } else {
        worksheet[cell].s.fill = { fgColor: { rgb: "ff2a2a" } };
      }
    }
  }

  for (const cell in worksheet) {
    if (cell[1] === "9" && cell[0] !== "A") {
      if (worksheet[cell].v >= 1000) {
        worksheet[cell].s.fill = { fgColor: { rgb: "8fce00" } };
      } else {
        worksheet[cell].s.fill = { fgColor: { rgb: "ff2a2a" } };
      }
    }
  }

  return worksheet;
}

function rowsInitialization(tracks, plans, name) {
  let rows = [];

  // rows.push(initialRows);
  rows.push(averageElheRow(tracks));
  rows.push(standardDeviationElheRow(tracks));
  rows.push(alertTotalTimeRow(tracks, 150));
  rows.push(averageIASRRow(tracks));
  rows.push(standardDeviationIASRRow(tracks));
  rows.push(averageDistanceAllRow(tracks, plans, name));
  rows.push(averageCalculationDistanceRMSRow(tracks));
  rows.push(minDistanceFromThreatRow(tracks, plans.general));
  rows.push(minDistanceFromRescueRow(tracks, plans.general));
  rows.push(timeFromRescueToBorderCrossRow(tracks.general, plans, name));
  rows.push(flightDuration(tracks.general));
  return rows;
}

function initialRows() {
  let row = {};
  row.title = "";
  return row;
}

//גובה ממוצע
function averageElheRow(trcks) {
  let row = {};
  row.title = "גובה ממוצע";
  row.first = average.averageELHE(trcks.first);
  row.second = average.averageELHE(trcks.second);
  row.third = average.averageELHE(trcks.third);
  row.fourth = average.averageELHE(trcks.fourth);
  row.general = average.averageELHE(trcks.general);

  return row;
}

//סטיית תקן גובה
function standardDeviationElheRow(trcks) {
  let row = {};
  row.title = `ס"ת גובה`;
  row.first = average.standardDeviationElhe(trcks.first);
  row.second = average.standardDeviationElhe(trcks.second);
  row.third = average.standardDeviationElhe(trcks.third);
  row.fourth = average.standardDeviationElhe(trcks.fourth);
  row.general = average.standardDeviationElhe(trcks.general);

  return row;
}

//זמן כולל של כל החריגות מעל 150 (alert)
function alertTotalTimeRow(trcks, maxELHE) {
  let row = {};
  row.title = `זמן מעל 150`;
  row.first = parseFloat(
    exeption
      .elheException(trcks.first, maxELHE)
      .reduce((n, { seconds }) => n + seconds, 0)
  ).toFixed(2);
  row.second = parseFloat(
    exeption
      .elheException(trcks.second, maxELHE)
      .reduce((n, { seconds }) => n + seconds, 0)
  ).toFixed(2);
  row.third = parseFloat(
    exeption
      .elheException(trcks.third, maxELHE)
      .reduce((n, { seconds }) => n + seconds, 0)
  ).toFixed(2);
  row.fourth = parseFloat(
    exeption
      .elheException(trcks.fourth, maxELHE)
      .reduce((n, { seconds }) => n + seconds, 0)
  ).toFixed(2);
  row.general = parseFloat(
    exeption
      .elheException(trcks.general, maxELHE)
      .reduce((n, { seconds }) => n + seconds, 0)
  ).toFixed(2);

  return row;
}

//מהירות ממוצעת
function averageIASRRow(trcks) {
  let row = {};
  row.title = `מהירות ממוצעת`;
  row.first = average.averageIAS(trcks.first);
  row.second = average.averageIAS(trcks.second);
  row.third = average.averageIAS(trcks.third);
  row.fourth = average.averageIAS(trcks.fourth);
  row.general = average.averageIAS(trcks.general);

  return row;
}

//ס"ת מהירות
function standardDeviationIASRRow(trcks) {
  let row = {};
  row.title = `ס"ת מהירות`;
  row.first = average.standardDeviationIAS(trcks.first);
  row.second = average.standardDeviationIAS(trcks.second);
  row.third = average.standardDeviationIAS(trcks.third);
  row.fourth = average.standardDeviationIAS(trcks.fourth);
  row.general = average.standardDeviationIAS(trcks.general);

  return row;
}

//מרחק ממוצע מהנתיב
function averageDistanceAllRow(trcks, plns, name) {
  let row = {};
  row.title = `מרחק ממוצע מהנתיב`;
  row.first = average.averageDistanceAll(trcks.first, plns.first, name);
  row.second = average.averageDistanceAll(trcks.second, plns.second, name);

  return row;
}

//מרחק RMS
function averageCalculationDistanceRMSRow(trcks) {
  let row = {};
  row.title = `מרחק RMS`;
  row.first = average.averageCalculationDistanceRMS(trcks.first);
  row.second = average.averageCalculationDistanceRMS(trcks.second);
  row.third = average.averageCalculationDistanceRMS(trcks.third);
  row.fourth = average.averageCalculationDistanceRMS(trcks.fourth);
  row.general = average.averageCalculationDistanceRMS(trcks.general);

  return row;
}

//מינימום מרחק מאיום
function minDistanceFromThreatRow(trcks, pln) {
  let row = {};
  row.title = `מינימום מרחק מאיום`;
  row.third = Number(
    parseFloat(
      general.calculateDistance(
        pln[5189],
        trcks.third[general.findNearest(pln[5189], trcks.third)]
      )
    ).toFixed(2)
  );

  row.fourth = Number(
    parseFloat(
      general
        .calculateDistance(
          pln[5189],
          trcks.fourth[general.findNearest(pln[5189], trcks.fourth)]
        )
        .toFixed(2)
    )
  );

  return row;
}

//מינימום מרחק לנקודת חילוץ
function minDistanceFromRescueRow(trcks, pln) {
  let row = {};
  row.title = `מינימום מרחק לנקודת חילוץ`;
  row.third = Number(
    parseFloat(
      general
        .calculateDistance(
          pln[5951],
          trcks.third[general.findNearest(pln[5951], trcks.third)]
        )
        .toFixed(2)
    )
  );

  return row;
}

//זמן מחצייה
function timeFromRescueToBorderCrossRow(trck, plns, name) {
  let row = {};
  row.title = `זמן מחצייה עד חילוץ`;
  row.general = general.timeBetTwoPoints(
    trck,
    trck.findIndex(
      (point) =>
        point.x == plns.third[plns.third.length - 1][`${name}Point`].x &&
        point.y == plns.third[plns.third.length - 1][`${name}Point`].y
    ),
    general.findNearest(plns.second[0], trck)
  );

  return row;
}

//משך התרגיל
function flightDuration(trck) {
  let row = {};
  row.title = `משך התרגיל`;
  row.general = general.SecToHHMMSS(
    general.timeToNumber(trck[trck.length - 1].TIME)
  );
  return row;
}

module.exports = {
  xlsxReport,
};
