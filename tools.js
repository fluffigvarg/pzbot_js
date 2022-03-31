// Calculate probability
function calcProbability(probablity = 1, throttle = 1) {
    const probablityComparison = Math.random();
    if (probablityComparison < (probablity * throttle)) {
      return true;
    } else {
      return false;
    }
  }

module.exports = {calcProbability};