<?php
if(isset($_GET['target'])){
    $targets = $_GET['target'];
}else{
    $targets = "title,description,tags";
}
if(isset($_GET['sort'])){
    $sort = $_GET['sort'];
}else{
    $sort = "-mylistCounter";
}

if (isset($_GET['id'])) {
    $content = file_get_contents("https://ext.nicovideo.jp/api/getthumbinfo/${_GET['id']}");
} elseif (isset($_GET['q'])) {
    $query = urlencode($_GET['q']);
    $content = file_get_contents("https://api.search.nicovideo.jp/api/v2/snapshot/video/contents/search?q=${query}&targets=${targets}&fields=thumbnailUrl,contentId,title,viewCounter,description&_sort=${sort}&_offset=0&_limit=50");
} elseif (isset($_GET['related'])) {
    $content = file_get_contents("http://flapi.nicovideo.jp/api/getrelation?video=${_GET['related']}");
}
if($content == ""){$content="{\"ERROR\":\"NO_CONTENT_RECEIVED\"}";}
echo $content;