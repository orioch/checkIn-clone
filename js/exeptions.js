const { calculateDistance, timeToNumber } = require("./general");

function elheException(trck, maxELHE) {
  let exceptionsList = [];
  for (let i = 0; i < trck.length; i++) {
    if (trck[i].ELHE >= maxELHE) {
      let exception = { points: [], seconds: 0 };
      let startTime = timeToNumber(trck[i].TIME);
      while (i < trck.length && trck[i].ELHE >= maxELHE) {
        exception.points.push(trck[i]);
        i++;
      }
      let endTime = timeToNumber(trck[i - 1].TIME);
      exception.seconds = endTime - startTime;
      exceptionsList.push(exception);
    }
  }
  return exceptionsList;
}

function blueDistanceException(trck) {
  let exceptionsList = [];
  for (let i = 0; i < trck.length; i++) {
    if (calculateDistance(trck[i], trck[i].planPoint) > 500) {
      let exception = { points: [], seconds: 0 };
      let startTime = timeToNumber(trck[i].TIME);
      while (
        i < trck.length &&
        calculateDistance(trck[i], trck[i].planPoint) > 500
      ) {
        exception.points.push(trck[i]);
        i++;
      }
      let endTime = timeToNumber(trck[i - 1].TIME);
      exception.seconds = endTime - startTime;
      exceptionsList.push(exception);
    }
  }
  return exceptionsList;
}

function YellowDistanceException(pln, name) {
  let exceptionsList = [];
  for (let i = 0; i < pln.length; i++) {
    if (calculateDistance(pln[i], pln[i][name + "Point"]) > 500) {
      let exception = { points: [], seconds: 0 };
      let startTime = timeToNumber(pln[i][name + "Point"].TIME);
      while (
        i < pln.length &&
        calculateDistance(pln[i], pln[i][name + "Point"]) > 500
      ) {
        exception.points.push(pln[i][name + "Point"]);
        i++;
      }
      let endTime = timeToNumber(pln[i - 1][name + "Point"].TIME);
      exception.seconds = endTime - startTime;
      exceptionsList.push(exception);
    }
  }
  return exceptionsList;
}

module.exports = {
  elheException,
  blueDistanceException,
  YellowDistanceException,
};
