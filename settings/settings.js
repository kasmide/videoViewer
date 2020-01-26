var config = JSON.parse(localStorage.getItem("config"));
if (!config) config = {}
if (!config["youtube"]) {
  config["youtube"] = {};
}
if (!config["youtube"]["searchProvider"]) config["youtube"]["searchProvider"] = "youtube";
if (!config["youtube"]["viewer"]) config["youtube"]["viewer"] = "https://www.youtube-nocookie.com/embed/%s";
if (!config["youtube"]["invidiousInstance"] || config["youtube"]["invidiousInstance"]=="") config["youtube"]["invidiousInstance"] = "https://invidio.us/";
if (!config["youtube"]["apiKey"] || config["youtube"]["apiKey"] == "") config["youtube"]["apiKey"] = youtubeKey;
localStorage.setItem("config", JSON.stringify(config));

window.onload = function () {
  this.document.getElementById("youtubeSearchProvider").value = config["youtube"]["searchProvider"];
  this.document.getElementById("iframeProvider").value = config["youtube"]["viewer"];
  this.document.getElementById("invidiousURL").value = config["youtube"]["invidiousInstance"];
  this.document.getElementById("youtubeAPIKey").value = config["youtube"]["apiKey"];
}
function youtubeSearchProvider() {
  config["youtube"]["searchProvider"] = event.srcElement.value
  localStorage.setItem("config", JSON.stringify(config));
}
function youtubeKeyChange() {
  console.log(config["youtube"]["apiKey"])
  config["youtube"]["apiKey"] = event.srcElement.value
  localStorage.setItem("config", JSON.stringify(config));
}
function iframeProviderChange() {
  config["youtube"]["viewer"] = event.srcElement.value
  localStorage.setItem("config", JSON.stringify(config));
}
function invidiousInstanceChange() {
  config["youtube"]["invidiousInstance"] = event.srcElement.value
  localStorage.setItem("config", JSON.stringify(config));
}
function reset() {
  localStorage.removeItem("config");
  location.reload();
}