var config = JSON.parse(localStorage.getItem("config"));
if (!config) config = {}
if (!config["youtube"]) config["youtube"] = {}
if (!config["youtube"]["searchProvider"]) config["youtube"]["searchProvider"] = "invidious";
if (!config["youtube"]["viewer"]) config["youtube"]["viewer"] = "https://www.youtube-nocookie.com/embed/%s";
if (!config["youtube"]["invidiousInstance"]) config["youtube"]["invidiousInstance"] = "https://invidio.us/";
if (!config["youtube"]["apikey"]) config["youtube"]["apikey"] = youtubeKey;
if (!config["nicovideo"]) config["nicovideo"] = {}
if (!config["nicovideo"]["proxyUrl"]) config["nicovideo"]["proxyUrl"] = "./p.php"

window.onload = function () {
  this.document.getElementById("youtubeSearchProvider").value = config["youtube"]["searchProvider"];
  this.document.getElementById("iframeProvider").value = config["youtube"]["viewer"];
  this.document.getElementById("invidiousURL").value = config["youtube"]["invidiousInstance"];
  this.document.getElementById("youtubeAPIKey").value = config["youtube"]["apikey"];
  this.document.getElementById("nicoProxyUrl").value = config["nicovideo"]["proxyUrl"]
}
function youtubeSearchProvider() {
  config["youtube"]["searchProvider"] = event.srcElement.value
  localStorage.setItem("config", JSON.stringify(config));
}
function youtubeKeyChange() {
  console.log(config["youtube"]["apikey"])
  config["youtube"]["apikey"] = event.srcElement.value
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
function nicoProxyChange() {
  config["nicovideo"]["proxyUrl"] = event.srcElement.value
  localStorage.setItem("config", JSON.stringify(config));
}
function reset() {
  localStorage.removeItem("config");
  location.reload();
}
