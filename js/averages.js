const { calculateDistance } = require("./general");

//שגיאת סימולטור
const elheGlitch = 6000;

function averageELHE(trck) {
  let heightSum = 0;
  let glitchSum = 0;

  for (const pointObj of trck) {
    if (pointObj.ELHE != elheGlitch) {
      heightSum += Number(pointObj.ELHE);
    } else {
      glitchSum++;
    }
  }
  return Number(parseFloat(heightSum / (trck.length - glitchSum)).toFixed(2));
}

function averageIAS(trck) {
  let sum = 0;
  for (const pointObj of trck) {
    sum += Number(pointObj.IAS);
  }
  return Number(parseFloat(sum / trck.length).toFixed(2));
}

function averageDistanceBlue(trck) {
  let sum = 0;
  for (const pointObj of trck) {
    sum += calculateDistance(pointObj, pointObj.planPoint);
  }
  return Number(parseFloat(sum / trck.length).toFixed(2));
}

function averageDistanceYellow(pln, name) {
  let sum = 0;
  for (const pointObj of pln) {
    sum += calculateDistance(pointObj, pointObj[name + "Point"]);
  }
  return Number(parseFloat(sum / pln.length).toFixed(2));
}

function averageDistanceAll(trck, pln, name) {
  return Number(
    parseFloat(
      (averageDistanceBlue(trck) + averageDistanceYellow(pln, name)) / 2
    ).toFixed(2)
  );
}

function averageCalculationDistanceRMS(trck) {
  let distanceSum = 0;
  for (const pointObj of trck) {
    distanceSum += Number(calculateDistance(pointObj.planPoint, pointObj));
  }
  return Number(parseFloat(distanceSum / trck.length).toFixed(2));
}

// סטיית תקן ממוצע גובה
function standardDeviationElhe(trck) {
  let standardDeviationElheSum = 0;
  let glitchSum = 0;

  for (const pointObj of trck) {
    if (pointObj.ELHE != elheGlitch) {
      standardDeviationElheSum += Math.pow(
        Number(pointObj.ELHE) - averageELHE(trck),
        2
      );
    } else {
      glitchSum++;
    }
  }
  return Number(
    parseFloat(
      Math.sqrt(standardDeviationElheSum / (trck.length - glitchSum))
    ).toFixed(2)
  );
}

//סטיית תקן ממוצע מהירות
function standardDeviationIAS(trck) {
  let standardDeviationIASSum = 0;
  for (const pointObj of trck) {
    standardDeviationIASSum += Math.pow(
      Number(pointObj.IAS) - averageIAS(trck),
      2
    );
  }
  return Number(
    parseFloat(Math.sqrt(standardDeviationIASSum / trck.length)).toFixed(2)
  );
}

module.exports = {
  averageDistanceAll,
  averageDistanceBlue,
  averageDistanceYellow,
  averageELHE,
  averageIAS,
  averageCalculationDistanceRMS,
  standardDeviationElhe,
  standardDeviationIAS,
};
