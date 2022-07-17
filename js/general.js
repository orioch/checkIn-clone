/* this function add the x and y to an array of objects 
for the chart object be able to draw them on the graph */
function addXY(arr) {
  if (arr[0].PRPOEAST) {
    for (const key of arr) {
      key.x = Number(key.PRPOEAST);
      key.y = Number(key.PRPONORTH);
    }
  } else {
    for (const key of arr) {
      key.x = Number(key[Object.keys(key)[0]]);
      key.y = Number(key[Object.keys(key)[1]]);
    }
  }
}

/* create short track according to the strat and the end times */
function createShortTrack(trck, startTime, endTime) {
  let start, end;

  let key = 0;

  while (trck[key].TIME !== startTime && key !== trck.length - 1) {
    key++;
  }
  start = key;
  while (trck[key].TIME !== endTime && key !== trck.length - 1) {
    key++;
  }
  end = key;

  return trck.slice(start, end);
}
/* */
function whenEnterFirstSegment(trck, pln) {
  for (const index in trck) {
    if (trck[index].ELHE < 200 && trck[index].IAS > 60) {
      for (const planObj of pln) {
        if (calculateDistance(trck[index], planObj) < 500) {
          return index;
        }
      }
    }
  }
  return null;
}

/* this funtion calulate distance between 2 points */
function calculateDistance(point, point2) {
  let distance = Math.sqrt(
    Math.pow(point.x - point2.x, 2) + Math.pow(point.y - point2.y, 2)
  );

  return distance;
}

function createPosition(trck, steps) {
  let newX = trck[0].x;
  let newY = trck[0].y;

  for (let i = 0; i < trck.length - 1; i++) {
    const distance = calculateDistance(trck[i], trck[i + 1]);
    const angle = Math.atan(
      (trck[i + 1].y - trck[i].y) / (trck[i + 1].x - trck[i].x)
    );

    if (steps >= distance) {
      if (trck[i + 1].x < trck[i].x) {
        newX -= distance * Math.cos(angle);
        newY -= distance * Math.sin(angle);
      } else {
        newX += distance * Math.cos(angle);
        newY += distance * Math.sin(angle);
      }

      steps -= distance;
    } else {
      if (trck[i + 1].x < trck[i].x) {
        newX -= steps * Math.cos(angle);
        newY -= steps * Math.sin(angle);
      } else {
        newX += steps * Math.cos(angle);
        newY += steps * Math.sin(angle);
      }

      let position = { x: newX, y: newY };
      return position;
    }
  }
}
/* 
current length is the length of the current point from the start.
*/
function calculateTotalLength(trck, firstIndex, addCurrentLength) {
  let totalLength = 0;

  for (let i = firstIndex; i < trck.length - 1; i++) {
    totalLength += calculateDistance(trck[i], trck[i + 1]);
    if (addCurrentLength) trck[i].currentLength = totalLength;
  }
  return totalLength;
}

function findNearest(point, trck) {
  let nearest = 0;
  for (let i in trck) {
    if (
      calculateDistance(point, trck[i]) <
      calculateDistance(point, trck[nearest])
    )
      nearest = i;
  }

  return Number(nearest);
}

function addPoints(pln, steps) {
  let newPlan = [];
  plnTotalLength = calculateTotalLength(pln, 0, false);
  for (let i = 0; i < plnTotalLength; i += steps) {
    newPlan.push(createPosition(pln, i));
    newPlan[newPlan.length - 1].matched = false;
  }
  return newPlan;
}

function addPlanProperties(trck, pln) {
  let range = pln.slice(0, 400);
  for (const i in trck) {
    trck[i].planPoint = range[findNearest(trck[i], range)];
    const planPointIndex = pln.findIndex((obj) => obj === trck[i].planPoint);
    pln[planPointIndex].matched = true;

    if (i != 0 && trck[i].planPoint !== trck[i - 1].planPoint) {
      const startIndex = pln.findIndex((obj) => obj === trck[i].planPoint);

      range = pln.slice(startIndex, startIndex + 400);
    }
  }
}

function addTrackPoints(trck, pln, name) {
  let range = trck.slice(0, 400);
  for (const i in pln) {
    pln[i][name + "Point"] = range[findNearest(pln[i], range)];
    if (i != 0 && pln[i][name + "Point"] !== pln[i - 1][name + "Point"]) {
      const startIndex = trck.findIndex(
        (obj) => obj === pln[i][name + "Point"]
      );
      range = trck.slice(startIndex, startIndex + 400);
    }
  }
}

function markExceedPointsPlan(pln, name) {
  let answer = [];
  for (const point of pln) {
    if (calculateDistance(point, point[name + "Point"]) > 500) {
      answer.push(point);
    }
  }
  return answer;
}

function markExceedPointsTrack(trck, plan, name) {
  const lastIndex = trck.findIndex(
    (point) => point.TIME === plan[plan.length - 1][name + "Point"].TIME
  );
  let answer = [];
  for (let index = 0; index <= lastIndex; index++) {
    if (calculateDistance(trck[index], trck[index].planPoint) > 500) {
      answer.push(trck[index]);
    }
  }
  return answer;
}

function timeToNumber(TIME) {
  let miliseconds = Number(TIME.substring(10, 13));
  let seconds = Number(TIME.substring(7, 9));
  let minuets = Number(TIME.substring(4, 6));

  return ((minuets * 60 + seconds) * 1000 + miliseconds) / 1000;
}

function SecToHHMMSS(seconds) {
  var sec_num = parseInt(seconds, 10); // don't forget the second parameter
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - hours * 3600) / 60);
  var seconds = sec_num - hours * 3600 - minutes * 60;

  if (hours < 10) {
    hours = "0" + hours;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return hours + ":" + minutes + ":" + seconds;
}

function timeBetTwoPoints(trck, indx2, indx1) {
  return SecToHHMMSS(
    timeToNumber(trck[indx2].TIME) - timeToNumber(trck[indx1].TIME)
  );
}

module.exports = {
  createShortTrack,
  createPosition,
  addXY,
  addTrackPoints,
  addPlanProperties,
  calculateDistance,
  findNearest,
  addPoints,
  timeToNumber,
  markExceedPointsPlan,
  markExceedPointsTrack,
  SecToHHMMSS,
  timeBetTwoPoints,
  whenEnterFirstSegment,
};
