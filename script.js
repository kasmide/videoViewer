var config = JSON.parse(localStorage.getItem("config"));
if (!config) config = {}
if (!config["youtube"]) config["youtube"] = {}
if (!config["youtube"]["searchProvider"]) config["youtube"]["searchProvider"] = "youtube";
if (!config["youtube"]["viewer"]) config["youtube"]["viewer"] = "https://www.youtube-nocookie.com/embed/%s";
if (!config["youtube"]["invidiousInstance"]) config["youtube"]["invidiousInstance"] = "https://invidio.us/";
if (!config["youtube"]["apikey"]) config["youtube"]["apikey"] = youtubeKey;
if (!config["nicovideo"]) config["nicovideo"] = {}
if (!config["nicovideo"]["proxyUrl"]) config["nicovideo"]["proxyUrl"] = "./p.php"
localStorage.setItem("config", JSON.stringify(config));

window.onload = function () {
	if (deployed_revision != null) {
		this.document.getElementById("appinfo").innerHTML += " (" + deployed_revision + ")"
	}

	if (document.getElementById("Search").value == "") {
		document.getElementById("clear").style.display = "none";
	} else {
		document.getElementById("clear").style.display = "flex";
	}

	document.getElementById("Search").oninput = function () {
		if (document.getElementById("Search").value == "") {
			document.getElementById("clear").style.display = "none";
		} else {
			document.getElementById("clear").style.display = "flex";
		}
	};

	this.serviceMenuChange();
};

function serviceMenuChange() {
	switch (document.getElementById("service").value) {
		case "nico":
			document.getElementById("searchOptions_nico").style = "";
			document.getElementById("searchOptions_yt").style = "display:none";
			this.document.getElementById("SearchForm").style = "";
			this.document.getElementById("bookmark_menu").style = "display:none";
			break;
		case "youtube":
			document.getElementById("searchOptions_yt").style = "";
			document.getElementById("searchOptions_nico").style = "display:none";
			this.document.getElementById("SearchForm").style = "";
			this.document.getElementById("bookmark_menu").style = "display:none";
			break;
		case "bookmark":
			document.getElementById("searchOptions_nico").style = "display:none";
			document.getElementById("searchOptions_yt").style = "display:none";
			this.document.getElementById("SearchForm").style = "display:none";
			this.document.getElementById("bookmark_menu").style = "display:flex";
			break;
	}
}

function search() {
	//URLが入力された場合
	if (document.getElementById("Search").value.indexOf("://www.") != -1) {
		contentUrl = document.getElementById("Search").value;
		if (contentUrl.indexOf("://www.nicovideo.jp/") != -1) {
			type = "nico";
		}
		if (contentUrl.indexOf("://www.youtube.com/") != -1) {
			type = "youtube";
		}
		switch (type) {
			case "nico":
				if (contentUrl.indexOf("?") != -1) {
					contentUrl = contentUrl.substring(0, contentUrl.indexOf("?"));
				}
				contentID = contentUrl.substring(contentUrl.indexOf("sm"));
				showVideo(contentID, "nico");
				break;
			case "youtube":
				contentID = contentUrl.substring(contentUrl.indexOf("watch?v=") + 8);
				if (contentID.indexOf("&") != -1) {
					contentID = contentID.substring(0, contentID.indexOf("&"));
				}
				showVideo(contentID, "youtube");
				break;
		}
		//キーワードが入力された場合
	} else {
		document.getElementById("resultBox").innerHTML = "";
		document.getElementById("welcome").style = "display:none";
		document.getElementById("nothing_found").style = "display:none";
		if (document.getElementById("service").value == "bookmark") {
			showBookmark();
		}
		else if (document.getElementById("Search").value != "") {
			switch (document.getElementById("service").value) {
				case "nico":
					nicoSearch();
					break;
				case "youtube":
					switch (config["youtube"]["searchProvider"]) {
						case "invidious":
							invidiousSearch(0);
							break;
						case "youtube":
							youtubeSearch();
							break;
						default:
							youtubeSearch();
							break;
					}
					break;
			}
		} else { document.getElementById("nothing_found").style = "display:block"; document.getElementById("welcome").style = "display:none"; }
	}
}
function showBookmark() {
	var bookmark = JSON.parse(localStorage.getItem("bookmark"));
	if (bookmark != null && bookmark.length != 0) {
		for (i = 0; i != bookmark.length; i++) {
			videoType = bookmark[i][0].substring(0, bookmark[i][0].indexOf("|"));
			contentID = bookmark[i][0].substring(bookmark[i][0].indexOf("|") + 1);
			title = bookmark[i][1];
			thumb = bookmark[i][2];
			desc = bookmark[i][3];
			showResult(contentID, title, videoType, thumb, desc);
		}
	} else {
		document.getElementById("nothing_found").style = "display:block";
		document.getElementById("welcome").style = "display:none";
	}
}

function invidiousSearch(page) {
	xhr = new XMLHttpRequest();
	xhr.open(
		"GET",
		config["youtube"]["invidiousInstance"] + "api/v1/search?&page=" +
		page +
		"&index=1&hl=ja&type=video&sort_by=relevance" +
		"&relevanceLanguage=ja&q=" +
		document.getElementById("Search").value
	);
	xhr.responseType = "json";
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4) {
			var data = xhr.response;
			if (data != null) {
				{
					if (data.length != 0) {
						if (data.length >= 50) {
							for (i = 0; i != 50; i++) {
								showResult(
									data[i]["videoId"],
									data[i]["title"],
									"youtube",
									data[i]["videoThumbnails"][1]["url"],
									data[i]["description"]
								);
							}
						} else {
							for (i = 0; i != data.length; i++) {
								showResult(
									data[i]["videoId"],
									data[i]["title"],
									"youtube",
									data[i]["videoThumbnails"][1]["url"],
									data[i]["description"]
								);
							}
						}
					} else {
						document.getElementById("nothing_found").style = "display:block";
					}
				}
			} else {
				document.getElementById("nothing_found").style = "display:block";
				alert("Invidious API からデータを取得できませんでした。");
			}
		}
	};
	xhr.send("");
}

function youtubeSearch() {
	xhr = new XMLHttpRequest();
	xhr.open(
		"GET",
		"https://www.googleapis.com/youtube/v3/search?type=video&part=snippet&order=" +
		document.getElementsByClassName("sort")[1].value +
		"&relevanceLanguage=ja&regionCode=JP&videoEmbeddable=true&q=" +
		document.getElementById("Search").value +
		"&key=" +
		config["youtube"]["apikey"] +
		"&maxResults=50"
	);
	xhr.responseType = "json";
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4) {
			var data = xhr.response;
			if (data != null) {
				resultHTML = "";
				{
					try {
						if (data.error.errors[0].reason == "quotaExceeded") {
							alert("YouTube Data API の制限に達しました。時間をあけて再度お試しください");
							document.getElementById("nothing_found").style = "display:block";
							return;
						} else {
							alert(data.error.message);
						}
					} catch { }
					if (data["pageInfo"]["totalResults"] != 0) {
						if (data["pageInfo"]["totalResults"] >= 50) {
							for (i = 0; i != 50; i++) {
								showResult(
									data["items"][i]["id"]["videoId"],
									data["items"][i]["snippet"]["title"],
									"youtube",
									data["items"][i]["snippet"]["thumbnails"]["medium"]["url"],
									data["items"][i]["snippet"]["description"]
								);
							}
						} else {
							for (i = 0; i != data["pageInfo"]["totalResults"]; i++) {
								showResult(
									data["items"][i]["id"]["videoId"],
									data["items"][i]["snippet"]["title"],
									"youtube",
									data["items"][i]["snippet"]["thumbnails"]["medium"]["url"],
									data["items"][i]["snippet"]["description"]
								);
							}
						}
					} else {
						document.getElementById("nothing_found").style = "display:block";
					}
				}
			} else {
				document.getElementById("nothing_found").style = "display:block";
				alert("YouTube Data API からデータを取得できませんでした。");
			}
		}
	};
	xhr.send("");
}
function nicoSearch() {
	xhr = new XMLHttpRequest();
	xhr.open(
		"GET",
		config["nicovideo"]["proxyUrl"] + "?q=" + document.getElementById("Search").value + "&target=" + document.getElementsByClassName("target")[0].value + "&sort=" + document.getElementsByClassName("sort")[0].value,
		true
	);
	xhr.responseType = "json";
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4) {
			var data = xhr.response;
			if (data != null) {
				resultHTML = "";
				try {
					if (data["ERROR"] == "NO_CONTENT_RECEIVED") {
						alert("ニコニコ動画APIとプロキシサーバーの間での接続に問題が発生しました");
						document.getElementById("nothing_found").style = "display:block";
						return;
					}
				} catch { }
				if (data["meta"]["totalCount"] != 0) {
					if (data["meta"]["totalCount"] >= 50) {
						for (i = 0; i != 50; i++) {
							showResult(data["data"][i]["contentId"], data["data"][i]["title"], "nico", data["data"][i]["thumbnailUrl"].replace("http://", "https://"), sm_to_link(data["data"][i]["description"]));
						}
					} else {
						for (i = 0; i != data["meta"]["totalCount"]; i++) {
							showResult(data["data"][i]["contentId"], data["data"][i]["title"], "nico", data["data"][i]["thumbnailUrl"].replace("http://", "https://"), sm_to_link(data["data"][i]["description"]));
						}
					}
				} else {
					alert("検索結果は0件です");
				}
			} else {
				alert("ニコニコ動画検索用のプロキシサーバーから検索結果を取得できませんでした。\nページをホストしている環境でPHPが実行可能か確認してください");
				document.getElementById("nothing_found").style = "display:block";
			}
		}
	};
	xhr.send("");
}
function sm_to_link(desc) {
	if (desc != null) {
		ir = 0;
		descA = "";
		while (desc.search(/sm\d+/) != -1) {
			ir = desc.search(/sm\d+/);
			descA = descA + desc.substring(0, ir) + "<a href=javascript:showVideo('" + desc.match(/sm\d+/) + "','nico')>" + desc.match(/sm\d+/) + "</a>";
			desc = desc.substring(ir + desc.match(/sm\d+/)[0].length);
			//console.log(desc);
		}
		desc = descA + desc;
	} else {
		desc = "";
	}
	return desc;
}
function showResult(contentID, title, videoType, thumb, desc) {
	var bookmark = localStorage.getItem("bookmark");
	if (bookmark == null) {
		bookmark = [];
	}
	var result = document.createElement("div");
	result.classList.add("result");
	//サムネ要素
	var imglink = document.createElement("a");
	imglink.classList.add("result_imglink");
	imglink.href = "javascript:showVideo('" + contentID + "','" + videoType + "')";
	var thumbElem = document.createElement("img");
	thumbElem.classList.add("thumb");
	thumbElem.src = thumb;
	imglink.appendChild(thumbElem);
	result.appendChild(imglink);
	//動画情報要素
	var result_info = document.createElement("div");
	result_info.classList.add("result_info");
	var titleElem = document.createElement("a");
	titleElem.href = "javascript:showVideo('" + contentID + "','" + videoType + "')";
	titleElem.innerHTML = title;
	result_info.appendChild(titleElem);
	var descElem = document.createElement("p");
	descElem.innerHTML = desc;
	result_info.appendChild(descElem);
	result.appendChild(result_info);
	//ブックマークボタン
	var menuBox = document.createElement("div");
	menuBox.classList.add("result_menubox");
	var bookmarkBtn = document.createElement("button");
	bookmarkBtn.classList.add("bookmark", "menubutton");
	bookmarkIcon = document.createElement("i");
	if (bookmark.indexOf(videoType + "|" + contentID) == -1) {
		bookmarkBtn.setAttribute("onclick", 'bookmark_add("' + videoType + '","' + contentID + '")');
		bookmarkIcon.classList.add("ri-bookmark-line");
	} else {
		bookmarkBtn.setAttribute("onclick", 'bookmark_del("' + videoType + '","' + contentID + '")');
		bookmarkIcon.classList.add("ri-bookmark-fill");
	}
	bookmarkIcon.classList.add("menuicon");
	bookmarkBtn.appendChild(bookmarkIcon);
	menuBox.appendChild(bookmarkBtn);
	result.appendChild(menuBox);
	document.getElementById("resultBox").appendChild(result);
}

function showVideo(contentID, type) {
	video = document.createElement("iframe");
	video.id = "video";
	document.getElementById("dialog").appendChild(video);
	document.getElementById("dialog").classList.add("show");
	switch (type) {
		case "nico":
			document.getElementById("video").src = "https://embed.nicovideo.jp/watch/" + contentID + "?jsapi=1&playerId=1";
			break;
		case "youtube":
			if (!config["youtube"]["viewer"]) config["youtube"]["viewer"] = "https://www.youtube-nocookie.com/embed/%s"
			document.getElementById("video").src = config["youtube"]["viewer"].replace("%s", contentID).replace("%i", config["youtube"]["invidiousInstance"]);
			break;
	}
}

function Close() {
	document.getElementById("dialog").classList.replace("show", "hide");
	document.getElementById("video").remove();
	document.getElementById("dialog").addEventListener("animationend", function () {
		document.getElementById("dialog").removeEventListener("animationend", this);
		document.getElementById("dialog").classList.remove("hide");
	});
}

function clear() {
	document.getElementById("Search").value = "";
	document.getElementById("clear").style.display = "none";
}

function bookmark_add(service, contentID) {
	var thumb = event.target.parentNode.parentNode.childNodes[0].childNodes[0].currentSrc; //画像src
	var title = event.target.parentNode.parentNode.childNodes[1].childNodes[0].childNodes[0].data; //タイトル
	var desc = event.target.parentNode.parentNode.childNodes[1].childNodes[1].innerHTML; //説明
	bookmark = JSON.parse(localStorage.getItem("bookmark"));
	if (bookmark == null) {
		bookmark = [];
	}
	if (bookmark.indexOf(service + "|" + contentID) == -1) {
		new_bookmark = [service + "|" + contentID, title, thumb, desc];
		bookmark.push(new_bookmark);
		localStorage.setItem("bookmark", JSON.stringify(bookmark));
	} else {
		console.error(contentID + ":すでに保存されています");
	}
	event.target.firstChild.classList.replace("ri-bookmark-line", "ri-bookmark-fill");
	event.target.setAttribute("onclick", 'bookmark_del("' + service + '","' + contentID + '")');
}

function bookmark_del(service, contentID) {
	bookmark = JSON.parse(localStorage.getItem("bookmark"));
	if (bookmark == null) {
		bookmark = [];
	}
	for (i = 0; i != bookmark.length; i++) {
		if (bookmark[i][0] == service + "|" + contentID) {
			bookmark.splice(i, 1);
			localStorage.setItem("bookmark", JSON.stringify(bookmark));
			break;
		}
	}
	event.target.firstChild.classList.replace("ri-bookmark-fill", "ri-bookmark-line");
	event.target.setAttribute("onclick", 'bookmark_add("' + service + '","' + contentID + '")');
}

function bookmark_export() {
	if (localStorage.getItem("bookmark") != null) {
		var a = document.createElement("a");
		a.href = URL.createObjectURL(new Blob([localStorage.getItem("bookmark")], {
			type: "application/json"
		}));
		a.download = "bookmark.json";
		a.click();
	} else {
		alert("ブックマークは空です");
	}
}
function bookmark_import() {
	var input = document.createElement("input");
	input.type = "file";
	input.accept = "application/json";
	input.addEventListener("change", function () {
		if (input.files.length != 0) {
			if (input.files[0].type == "application/json") {
				var reader = new FileReader();
				reader.readAsText(input.files[0]);
				reader.addEventListener("load", function () {
					var added = 0;
					var ignored = 0;
					var bookmark = JSON.parse(localStorage.getItem("bookmark"));
					if (bookmark == null) {
						bookmark = [];
					}
					try {
						var bookmarkToImport = JSON.parse(reader.result);
					} catch (e) {
						alert("エラー:\n" + e.message);
						return;
					}
					for (i = 0; i != bookmarkToImport.length; i++) {
						var found = false;
						for (var n = 0; n != bookmark.length; n++) {
							if (bookmark[n].indexOf(bookmarkToImport[i][0]) != -1) {
								ignored++;
								found = true;
								break;
							}
						}
						if (!found) {
							bookmark.push(bookmarkToImport[i]);
							added++;
						}
						console.log(bookmarkToImport[i][0] + bookmark[0].indexOf(bookmarkToImport[i][0]));
					}
					localStorage.setItem("bookmark", JSON.stringify(bookmark));
					showBookmark();
					alert("インポートが完了しました。\n\n結果:\n追加されたアイテム数: " + added + "\nスキップされたアイテム数: " + ignored);
				});
			} else {
				alert("選択されたファイルの MIME タイプは application/json ではなく " + input.files[0].type + " です。");
			}
		}
	})
	input.click();

}
function bookmark_delall() {
	if (confirm("すべてのブックマークを削除します。よろしいですか？")) {
		localStorage.removeItem("bookmark");
		document.getElementById("resultBox").innerHTML = "";
		showBookmark();
	};
}