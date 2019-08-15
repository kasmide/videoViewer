window.onload = function () {
    if (document.getElementById("service").value == "bookmark") {
        document.getElementById("Search").disabled = true;
        search();
    } else if (document.getElementById("Search").value != "") {
        search();
    }
}

function search() {
    document.getElementById("resultBox").innerHTML = "";
    if (document.getElementById("Search").value.indexOf("://www.") != -1) {
        contentID = document.getElementById("Search").value;
        if (contentID.indexOf("://www.nicovideo.jp/") != -1) {
            type = "nico";
        }
        if (contentID.indexOf("://www.youtube.com/") != -1) {
            type = "youtube";
        } switch (type) {
            case "nico":
                if (contentID.indexOf("?") != -1) {
                    contentID = contentID.substring(0, contentID.indexOf("?"));
                }
                contentID = contentID.substring(contentID.indexOf("sm"));
                showVideo(contentID, "nico")
                break;
            case "youtube":
                contentID = contentID.substring(contentID.indexOf("watch?v=") + 8);
                if (contentID.indexOf("&") != -1) {
                    contentID = contentID.substring(0, contentID.indexOf("&"));
                }
                showVideo(contentID, "youtube");
                break;
        }

    } else {
        results = "";
        switch (document.getElementById("service").value) {
            case "nico":
                document.getElementById("Search").disabled = false;
                nicoSearch();
                break;
            case "youtube":
                document.getElementById("Search").disabled = false;
                youtubeSearch();
                break;
            case "bookmark":
                document.getElementById("Search").disabled = true;
                showBookmark();
                break;
        }
    }
}
function showBookmark() {
    //resultHTML = "";
    bookmark = JSON.parse(localStorage.getItem("bookmark"));
    if (bookmark == null) { bookmark = []; }
    for (i = 0; i != bookmark.length; i++) {
        switch (bookmark[i].substring(0, bookmark[i].indexOf("|"))) {
            case "youtube":
                console.log(bookmark[i].substring(bookmark[i].indexOf("|") + 1));
                xhr = new XMLHttpRequest();
                xhr.open('GET', 'https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' + bookmark[i].substring(bookmark[i].indexOf("|") + 1) + '&key=AIzaSyDM4gXM9reVQCOj18XQ2wEh_eIgK7leL3E', false);
                xhr.send('');
                if (xhr.readyState == 4) {
                    var data = JSON.parse(xhr.responseText);
                    showResult(data['items'][0]['id'], data['items'][0]['snippet']['title'], "youtube", data['items'][0]['snippet']['thumbnails']['medium']['url'], data['items'][0]['snippet']['description'])
                }
                break;
            case "nico":
                console.log(bookmark[i].substring(bookmark[i].indexOf("|") + 1));
                xhr = new XMLHttpRequest();
                xhr.open('GET', './p.php?id=' + bookmark[i].substring(bookmark[i].indexOf("|") + 1), false);
                xhr.send('');
                if (xhr.readyState == 4) {
                    videoTitle = xhr.responseText.substring(xhr.responseText.indexOf("<title>") + 7, xhr.responseText.indexOf("</title>"));
                    videoThumb = xhr.responseText.substring(xhr.responseText.indexOf("<thumbnail_url>") + 15, xhr.responseText.indexOf("</thumbnail_url>"));
                    videoDesc = xhr.responseText.substring(xhr.responseText.indexOf("<description>") + 13, xhr.responseText.indexOf("</description>"));
                    showResult(bookmark[i].substring(bookmark[i].indexOf("|") + 1), videoTitle, "nico", videoThumb, videoDesc);
                }
                break;
        }
    }
}
function youtubeSearch() {
    xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://www.googleapis.com/youtube/v3/search?type=video&part=snippet&order=relevance&relevanceLanguage=ja&regionCode=JP&videoEmbeddable=true&q=' + document.getElementById("Search").value + '&key=AIzaSyDM4gXM9reVQCOj18XQ2wEh_eIgK7leL3E&maxResults=50');
    xhr.responseType = "json";
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var data = xhr.response;
            resultHTML = "";
            if (data['pageInfo']['totalResults'] != 0) {
                if (data['pageInfo']['totalResults'] >= 50) {
                    for (i = 0; i != 50; i++) {
                        showResult(data['items'][i]['id']['videoId'], data['items'][i]['snippet']['title'], "youtube", data['items'][i]['snippet']['thumbnails']['medium']['url'], data['items'][i]['snippet']['description'])
                    }
                } else {
                    for (i = 0; i != data['pageInfo']['totalResults']; i++) {
                        showResult(data['items'][i]['id']['videoId'], data['items'][i]['snippet']['title'], "youtube", data['items'][i]['snippet']['thumbnails']['medium']['url'], data['items'][i]['snippet']['description'])
                    }
                }
            } else { alert("検索結果は0件です") }
        }
    }
    xhr.send('');
}
function nicoSearch() {
    xhr = new XMLHttpRequest();
    xhr.open('GET', './p.php?q=' + document.getElementById("Search").value, true);
    xhr.responseType = 'json';
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var data = xhr.response;
            resultHTML = "";
            if (data['meta']['totalCount'] != 0) {
                if (data['meta']['totalCount'] >= 50) {
                    for (i = 0; i != 50; i++) {
                        showResult(data['data'][i]['contentId'], data['data'][i]['title'], "nico", data['data'][i]['thumbnailUrl'].replace("http://", "https://"), sm_to_link(data['data'][i]['description']));
                    }
                } else {
                    for (i = 0; i != data['meta']['totalCount']; i++) {
                        showResult(data['data'][i]['contentId'], data['data'][i]['title'], "nico", data['data'][i]['thumbnailUrl'].replace("http://", "https://"), sm_to_link(data['data'][i]['description']));
                    }
                }
            } else { alert("検索結果は0件です") }
        }
    }
    xhr.send('');
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
        desc = descA + desc
    } else { desc = "" }
    return desc;
}
function showResult(contentID, title, videoType, thumb, desc) {
    bookmark = JSON.parse(localStorage.getItem("bookmark"));
    if (bookmark == null) { bookmark = []; }
    if (bookmark.indexOf(videoType + "|" + contentID) == -1) {
        menuHTML = "<div class='result_menubox'><button class='bookmark menubutton' onclick=\"bookmark_new('" + videoType + "','" + contentID + "')\"><img class=menuicon32 src='./icons/32/bookmark-new.svg' alt='ブックマーク'></img></button><button class='result_more menubutton hidden' onclick=''><img class='menuicon32' src='./icons/32/info.svg' alt='詳細'></img></button></div>"
    } else {
        menuHTML = "<div class='result_menubox'><button class='bookmark menubutton' onclick=\"bookmark_del('" + videoType + "','" + contentID + "')\"><img class=menuicon32 src='./icons/32/bookmark-remove.svg' alt='削除'></img></button><button class='result_more menubutton hidden' onclick=''><img class='menuicon32' src='./icons/32/info.svg' alt='詳細'></img></button></div>"
    }
    //results=results+"<div class='result'><a class='result_imglink' href=javascript:showVideo('" + contentID + "','" + videoType + "')><img class='thumb' src='" + thumb + "' alt='thumbnail'></a><div class='result_info'> <a class=result href=javascript:showVideo('" + contentID + "','" + videoType + "')>" + title + "</a><p>" + desc + "</p></div>" + menuHTML + "</div>"
    document.getElementById("resultBox").insertAdjacentHTML("beforeend", "<div class='result'><a class='result_imglink' href=javascript:showVideo('" + contentID + "','" + videoType + "')><img class='thumb' src='" + thumb + "' alt='thumbnail'></a><div class='result_info'> <a class=result href=javascript:showVideo('" + contentID + "','" + videoType + "')>" + title + "</a><p>" + desc + "</p></div>" + menuHTML + "</div>");
}

function showVideo(contentID, type) {
    video=document.createElement('iframe')
    video.id="video"
    document.getElementById('dialog').appendChild(video);
    document.getElementById('dialog').classList.add("show");
    switch (type) {
        case "nico":
            document.getElementById("video").src = "https://embed.nicovideo.jp/watch/" + contentID + "?jsapi=1&playerId=1";
            //こ↑こ↓参考にさせてもらいました→https://blog.hayu.io/web/create/nicovideo-embed-player-api
            document.getElementById("video").addEventListener('message', function (e) {
                console.log(e.data.data.playerStatus);
                if (e.data.data.playerStatus == 4) {
                    var xhr = new XMLHttpRequest();
                    xhr.open("GET", "./p.php" + document.getElementById("video").src.substring(33, document.getElementById("video").src.indexOf("?jsapi=1")))
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState == 4) {
                            var data = xhr.response;
                            showVideo(data.substring(data.indexOf("<url>") + 5, data.indexOf("</url>")), "nico");
                        }
                    }
                    xhr.send(null);
                }
            });
            break;
        case "youtube":
            document.getElementById("video").src = "https://www.youtube.com/embed/" + contentID + "?enablejsapi=1&autoplay=1";
            var player = new YT.Player("video", {
                events: {
                    'onStateChange': youtube_playrecommend
                }
            });
            break;
    }

}

function youtube_playrecommend(e) {
    if (e["data"] == 0) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://www.googleapis.com/youtube/v3/search?type=video&relatedToVideoId=" + document.getElementById("video").src.substring(30, document.getElementById("video").src.indexOf("?enablejsapi=1")) + "&part=snippet&key=AIzaSyDM4gXM9reVQCOj18XQ2wEh_eIgK7leL3E&videoEmbeddable=true")
        xhr.responseType = "json";
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                var data = xhr.response;
                showVideo(data["items"][0]["id"]["videoId"], "youtube");
            }
        }
        xhr.send(null);
        player = null;
    }
    console.log("PlayState" + e["data"])
}

window.addEventListener('message', (e) => {
    if (e.origin === 'https://embed.nicovideo.jp') {
        if (e["data"]["eventName"] == "playerStatusChange") {
            console.log(e["data"]["data"]["playerStatus"]);
            if (e["data"]["data"]["playerStatus"] == 4) {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", "./p.php?related=" + document.getElementById("video").src.substring(33, document.getElementById("video").src.indexOf("?jsapi=1")))
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4) {
                        var data = xhr.responseText;
                        showVideo(data.substring(data.indexOf("<url>") + 36, data.indexOf("</url>")), "nico");
                    }
                }
                xhr.send(null);
            }
        }
        if (e["data"]["eventName"] == "loadComplete") {
            document.getElementById("video").contentWindow.postMessage({
                eventName: 'play',
                sourceConnectorType: 1,
                playerId: "1",
            }, "https://embed.nicovideo.jp/");
        }
    }
});

function Close() {
    document.getElementById('dialog').classList.replace("show", "hide");
    document.getElementById("video").remove();
    document.getElementById("dialog").addEventListener("animationend", function () {
        document.getElementById("dialog").removeEventListener("animationend",this);
        document.getElementById('dialog').classList.remove("hide");
    });
}
function clear() {
    document.getElementById("Search").value = "";
    document.getElementById("clear").style.display = "none"
}
function bookmark_new(service, contentID) {
    bookmark = JSON.parse(localStorage.getItem("bookmark"));
    if (bookmark == null) { bookmark = []; }
    if (bookmark.indexOf(service + "|" + contentID) == -1) {
        bookmark.push(service + "|" + contentID);
        localStorage.setItem("bookmark", JSON.stringify(bookmark));
    }
    else {
        console.error(contentID + ":すでに保存されています");
    }
    event.target.firstChild.setAttribute("src", "./icons/32/bookmark-remove.svg")
    event.target.setAttribute("onclick", "bookmark_del(\"" + service + "\",\"" + contentID + "\")");
}
function bookmark_del(service, contentID) {
    bookmark = JSON.parse(localStorage.getItem("bookmark"));
    if (bookmark.indexOf(service + "|" + contentID) != -1) {
        bookmark.splice(bookmark.indexOf(service + "|" + contentID), 1);
        localStorage.setItem("bookmark", JSON.stringify(bookmark));
    }
    else {
        console.error(contentID + ":すでに削除されています");
    }
    event.target.firstChild.setAttribute("src", "./icons/32/bookmark-new.svg")
    event.target.setAttribute("onclick", "bookmark_new(\"" + service + "\",\"" + contentID + "\")");
}
