window.onload = function () {
    if (document.getElementById("Search").value == "") {
        document.getElementById("clear").style.display = "none"
    } else {
        document.getElementById("clear").style.display = "flex";
    }
    document.getElementById("Search").oninput = function () {
        if (document.getElementById("Search").value == "") {
            document.getElementById("clear").style.display = "none"
        } else {
            document.getElementById("clear").style.display = "flex";
        }
    }
    document.getElementById("Search").onchange=search();
}

function search() {
    document.getElementById("resultBox").innerHTML = "";
    if (document.getElementById("service").value != "bookmark") {
        document.getElementById("Search").disabled = false;
        if (document.getElementById("Search").value != "") {
            //URLが入力された場合
            if (document.getElementById("Search").value.indexOf("://www.") != -1) {
                contentUrl = document.getElementById("Search").value;
                if (contentUrl.indexOf("://www.nicovideo.jp/") != -1) {
                    type = "nico";
                }
                if (contentUrl.indexOf("://www.youtube.com/") != -1) {
                    type = "youtube";
                } switch (type) {
                    case "nico":
                        if (contentUrl.indexOf("?") != -1) {
                            contentUrl = contentUrl.substring(0, contentUrl.indexOf("?"));
                        }
                        contentID = contentUrl.substring(contentUrl.indexOf("sm"));
                        showVideo(contentID, "nico")
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
                document.getElementById("welcome").hidden = true;
                switch (document.getElementById("service").value) {
                    case "nico":
                        document.getElementById("Search").disabled = false;
                        nicoSearch();
                        break;
                    case "youtube":
                        document.getElementById("Search").disabled = false;
                        youtubeSearch();
                        break;
                }
            }
        }else document.getElementById("welcome").hidden = false;
    } else {
        document.getElementById("Search").disabled = true;
        showBookmark();
    }
}
function showBookmark() {
    //resultHTML = "";
    var bookmark = JSON.parse(localStorage.getItem("bookmark"));
    if (bookmark == null) { bookmark = []; }
    console.log(bookmark.length)
    if (bookmark.length != 0) {
        for (i = 0; i != bookmark.length; i++) {
            videoType = bookmark[i][0].substring(0, bookmark[0][0].indexOf("|"))
            contentID = bookmark[i][0].substring(bookmark[0][0].indexOf("|") + 1)
            title = bookmark[i][1]
            thumb = bookmark[i][2]
            desc = bookmark[i][3]
            showResult(contentID, title, videoType, thumb, desc);
        }
    } else { document.getElementById("welcome").hidden = false; alert("ブックマークは空です") }
}
function youtubeSearch() {
    xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://www.googleapis.com/youtube/v3/search?type=video&part=snippet&order=relevance&relevanceLanguage=ja&regionCode=JP&videoEmbeddable=true&q=' + document.getElementById("Search").value + '&key=AIzaSyDM4gXM9reVQCOj18XQ2wEh_eIgK7leL3E&maxResults=50');
    xhr.responseType = "json";
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var data = xhr.response;
            if (data != null) {
                resultHTML = "";
                {
                    try { if (data.error.errors[0].reason == "quotaExceeded") alert("YouTube Data API の制限に達しました。時間をあけて再度お試しください"); document.getElementById("welcome").hidden = false; return; } catch{ }
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
            } else {
                document.getElementById("welcome").hidden = false;
                alert("YouTube Data API からデータを取得できませんでした。");
            }
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
            if (data != null) {
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
            } else {
                alert("ニコニコ動画検索用のプロキシサーバーから検索結果を取得できませんでした。ページをホストしている環境でPHPが実行可能か確認してください");
                document.getElementById("welcome").hidden = false;
            }
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
    var bookmark = localStorage.getItem("bookmark");
    if (bookmark == null) { bookmark = []; }
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
    var titleElem = document.createElement("a")
    titleElem.class = "result";
    titleElem.href = "javascript:showVideo('" + contentID + "','" + videoType + "')";
    titleElem.innerText = title;
    result_info.appendChild(titleElem);
    var descElem = document.createElement("p");
    descElem.innerText = desc;
    result_info.appendChild(descElem);
    result.appendChild(result_info);
    //ブックマークボタン
    var menuBox = document.createElement("div");
    menuBox.classList.add("result_menubox");
    var bookmarkBtn = document.createElement("button");
    bookmarkBtn.classList.add("bookmark", "menubutton");
    bookmarkIcon = document.createElement("img");
    if (bookmark.indexOf(videoType + "|" + contentID) == -1) {
        bookmarkBtn.setAttribute("onclick", "bookmark_add(\"" + videoType + "\",\"" + contentID + "\")");
        bookmarkIcon.src = "./icons/32/bookmark-new.svg";
    } else {
        bookmarkBtn.setAttribute("onclick", "bookmark_del(\"" + videoType + "\",\"" + contentID + "\")");
        bookmarkIcon.src = "./icons/32/bookmark-remove.svg";
    }
    bookmarkIcon.classList.add("menuicon32")
    bookmarkBtn.appendChild(bookmarkIcon);
    menuBox.appendChild(bookmarkBtn);
    result.appendChild(menuBox);
    document.getElementById("resultBox").appendChild(result)
}

function showVideo(contentID, type) {
    video = document.createElement('iframe')
    video.id = "video"
    document.getElementById('dialog').appendChild(video);
    document.getElementById('dialog').classList.add("show");
    switch (type) {
        case "nico":
            document.getElementById("video").src = "https://embed.nicovideo.jp/watch/" + contentID + "?jsapi=1&playerId=1";
            break;
        case "youtube":
            document.getElementById("video").src = "https://www.youtube.com/embed/" + contentID + "?enablejsapi=1&autoplay=1";
            break;
    }

}

function Close() {
    document.getElementById('dialog').classList.replace("show", "hide");
    document.getElementById("video").remove();
    document.getElementById("dialog").addEventListener("animationend", function () {
        document.getElementById("dialog").removeEventListener("animationend", this);
        document.getElementById('dialog').classList.remove("hide");
    });
}

function clear() {
    document.getElementById("Search").value = "";
    document.getElementById("clear").style.display = "none"
}

function bookmark_add(service, contentID) {
    var thumb = event.target.parentNode.parentNode.childNodes[0].childNodes[0].currentSrc;//画像src
    var title = event.target.parentNode.parentNode.childNodes[1].childNodes[0].childNodes[0].data;//タイトル
    var desc = event.target.parentNode.parentNode.childNodes[1].childNodes[0].innerText;//説明
    bookmark = JSON.parse(localStorage.getItem("bookmark"));
    if (bookmark == null) { bookmark = []; }
    if (bookmark.indexOf(service + "|" + contentID) == -1) {
        new_bookmark = [service + "|" + contentID, title, thumb, desc];
        bookmark.push(new_bookmark);
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
    if (bookmark == null) { bookmark = []; }
    for (i = 0; i != bookmark.length; i++) {
        if (bookmark[i][0] = service + "|" + contentID) {
            bookmark.splice(i, 1);
            localStorage.setItem("bookmark", JSON.stringify(bookmark));
            break;
        }
    }
    event.target.firstChild.setAttribute("src", "./icons/32/bookmark-new.svg")
    event.target.setAttribute("onclick", "bookmark_add(\"" + service + "\",\"" + contentID + "\")");
}
