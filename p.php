<?php
if ($_GET['id'] != NULL) {
    $content = file_get_contents("https://ext.nicovideo.jp/api/getthumbinfo/${_GET['id']}");
} elseif ($_GET['q'] != NULL) {
    $query = urlencode($_GET['q']);
    $content = file_get_contents("https://api.search.nicovideo.jp/api/v2/snapshot/video/contents/search?q=${query}&targets=title&fields=thumbnailUrl,contentId,title,viewCounter,description&_sort=-mylistCounter&_offset=0&_limit=50");
} elseif ($_GET['related'] != NULL) {
    $content = file_get_contents("http://flapi.nicovideo.jp/api/getrelation?video=${_GET['related']}");
}
if($content == ""){$content="{\"error\":\"no content received\"}";}
echo $content;
