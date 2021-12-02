// var data;

// function readTextFile() {
//   var rawFile = new XMLHttpRequest();
//   rawFile.open("GET", "./tally.json", true);
//   rawFile.onreadystatechange = function() {
//     if (rawFile.readyState === 4) {
//       var allText = rawFile.responseText;
//       document.getElementById("temp").innerHTML = allText;
//     }
//   };
//   rawFile.send();
//
// }
//
// readTextFile();
const addr = "3NKYYZt2nPYgr6ztWkUWq2nTdKPESW5KHPjqVeYopXXKWB2Aais3";
const assetName = "coffee";
const assetCode = "5YJHoDrZtMM1YLxHW1pP4nYwAqxJRg45XFtrPdvqLmT3AcrXjiojY2YtPH";
var recentTemperatures = [];
var recentQuantity = [];

document.getElementById("getTotal").addEventListener("click", function() {
  // var data = JSON.parse(document.getElementById("temp").innerHTML);
  // document.getElementById("temp").innerHTML = "";
  fetch("https://1c99-168-5-131-43.ngrok.io" + "/assettotal/" + assetName)
    .then(result => result.json())
    .then(json => parseInt(json.toString(), 10))
    .then(total => {
      document.getElementById("total-0").innerHTML = total.toString();
    })
});

document.getElementById("mint").addEventListener("click", function() {
  // var data = JSON.parse(document.getElementById("temp").innerHTML);
  // document.getElementById("temp").innerHTML = "";
  const quantity = document.getElementById("mintQuantity").value;
  const temperature = document.getElementById("mintTemperature").value;
  fetch("https://1c99-168-5-131-43.ngrok.io" + "/mint/"
    + addr + "/" +  assetName + "/" + quantity + "/" + temperature)
    .then(response => response.json())
    .then(json => {
      recentTemperatures.push(json.temperature);
      recentQuantity.push(json.quantity);
      const postEls = document.getElementsByClassName("contest-0"),
        postElsCount = postEls.length;
      const postElsTemp = document.getElementsByClassName("contest-1");
      for (let i = 0; i < Math.min(postElsCount, recentQuantity.length); i++) {
        document.getElementById(postEls[i].id).innerHTML = recentQuantity[recentQuantity.length - 1 - i];
        document.getElementById(postElsTemp[i].id).innerHTML = recentTemperatures[recentTemperatures.length - 1 - i];
      }
    })

});

document.getElementById("transact").addEventListener("click", function() {
  // var data = JSON.parse(document.getElementById("temp").innerHTML);
  // document.getElementById("temp").innerHTML = "";
  const quantity = document.getElementById("transactQuantity").value;
  const recipientAddr = document.getElementById("transactAddr").value;
  fetch("https://1c99-168-5-131-43.ngrok.io" + "/transfer/"
    + recipientAddr + "/" +  assetCode + "/" + quantity
    + "?metadata=tradebeans&securityRoot=4jEP8KeB6UuJrkMSckRpQPsxkP6W2Lqb5ni255mx2LMi")
    .then(response => response.json())
    .then(json => {
      document.getElementById("txID").innerHTML = json.txId;
    })

});