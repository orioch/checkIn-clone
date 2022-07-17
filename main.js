const general = require("./js/general");
const exeption = require("./js/exeptions");

const csv = require("csv-parser");
const XLSX = require("xlsx-js-style");

const fs = require("fs");
const { app, BrowserWindow, dialog, ipcMain } = require("electron");

const { xlsxReport } = require("./js/reports");

let { plan } = require("./data/plan");
let track = [];
let name = "";
let win = null;
let startTime = "";
let endTime = "";

app.on("ready", () =>
  dialog
    .showOpenDialog({
      buttonLabel: "yes yes choose this file!",
    })
    .then((result) => {
      name = result.filePaths[0].replace(/^.*[\\\/]/, "");
      name = name.replace(/.csv/, "");
      console.log("current name = " + name);
      /* read times text file */
      fs.readFile(
        "./data/times/" + name + "5.txt",
        { encoding: "utf8", flag: "r" },
        function (err, data) {
          if (err) console.log(err);
          else {
            startTime = " " + data.slice(137, 145) + ".000";
            endTime = " " + data.slice(147, 155) + ".000";
          }
        }
      );
      readCsv(result.filePaths[0]);
    })
);
//ffffff
/* read csv */
function readCsv(path) {
  fs.createReadStream("./data/csv/" + name + ".csv")
    .pipe(csv())
    .on("data", (data) => track.push(data))
    .on("end", () => {
      console.log(name + " is done reading");
      let { tracks, plans } = setUpTracks(
        track,
        plan,
        name,
        startTime,
        endTime
      );
      // printReport(tracks, plans, name);
      console.log("report has printed");
      openGuiWindow();

      ipcMain.handle("getRequires", async (event, args) => {
        return {
          name: name,
          plans: plans,
          tracks: tracks,
        };
      });
    });
}

function setUpTracks(track, plan, name, startTime, endTime) {
  track = general.createShortTrack(track, startTime, endTime);
  general.addXY(track);
  general.addXY(plan);
  plan = general.addPoints(plan, 5);
  general.addPlanProperties(track, plan);
  general.addTrackPoints(track, plan, name);
  return splitToSegment(track, plan);
}

function printReport(tracks, plans, name) {
  /* create an XLSX file and try to save to Presidents.xlsx */
  const workbook = xlsxReport(tracks, plans, name);
  XLSX.writeFile(workbook, "Report.xlsx");
}

function openGuiWindow() {
  win = new BrowserWindow({
    frame: true,
    width: 800,
    height: 600,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: __dirname + "/js/preload.js",
    },
  });
  // win.webContents.openDevTools();
  win.loadFile("./html/main.html");
}

function splitToSegment(trck, pln) {
  /* create variabels for the segments */
  let tracks = {};
  let plans = {};
  plans.general = pln;
  tracks.general = trck;

  plans.first = pln.slice(0, 2213);
  tracks.first = trck.slice(
    general.whenEnterFirstSegment(trck, plans.first),
    trck.findIndex(
      (point) =>
        point.x == plans.first[plans.first.length - 1][`${name}Point`].x &&
        point.y == plans.first[plans.first.length - 1][`${name}Point`].y
    )
  );

  plans.second = pln.slice(2213, 4141);
  name;
  tracks.second = trck.slice(
    trck.findIndex(
      (point) =>
        point.x == plans.second[0][`${name}Point`].x &&
        point.y == plans.second[0][`${name}Point`].y
    ),
    trck.findIndex(
      (point) =>
        point.x == plans.second[plans.second.length - 1][`${name}Point`].x &&
        point.y == plans.second[plans.second.length - 1][`${name}Point`].y
    )
  );

  plans.third = pln.slice(4141, 5951);
  tracks.third = trck.slice(
    trck.findIndex(
      (point) =>
        point.x == plans.third[0][`${name}Point`].x &&
        point.y == plans.third[0][`${name}Point`].y
    ),
    trck.findIndex(
      (point) =>
        point.x == plans.third[plans.third.length - 1][`${name}Point`].x &&
        point.y == plans.third[plans.third.length - 1][`${name}Point`].y
    )
  );

  plans.fourth = pln.slice(2213, pln.length - 1);
  tracks.fourth = trck.slice(
    trck.findIndex(
      (point) =>
        point.x == plans.third[plans.third.length - 1][`${name}Point`].x &&
        point.y == plans.third[plans.third.length - 1][`${name}Point`].y
    ),
    trck.length - 1
  );
  return { tracks: tracks, plans: plans };
}

module.exports = {
  name,
  getPlan: () => plan,
  getTrack: () => results,
};
