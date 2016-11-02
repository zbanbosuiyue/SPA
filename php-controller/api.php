<?php
require_once('custom_curl.php');

$AuthURL = "https://api.linnworks.net//api/Auth/AuthorizeByApplication";

$appId = "35f5cb6e-022a-4243-91b6-5f5344eb67f2";
$appSecret = "65d0acaa-8bd6-48dc-9240-1e8e10ff5e98";
$oldToken = "2e82a94780925690923b0cc95b3bedbb";

$baseURL = "https://eu1.linnworks.net//api/";

$data = array('applicationId' => $appId, 'applicationSecret' => $appSecret, 'token' => $oldToken);

$fileName = $oldToken;

$testMode = true;

if (file_exists($fileName)){
	$tokenFile = fopen($fileName, 'r') or die("Unable to open file!");
	$token = fread($tokenFile, filesize($fileName));
	fclose($tokenFile);
}else{
	$result = GetAuth($AuthURL, $data);
	$token = $result["Token"];

	$file = fopen($fileName, 'w') or die("Unable to open file!");
	fwrite($file, $token);
	fclose($file);
}

if (isset($_GET["controller"]) && isset($_GET["method"])){
	$controller = $_GET["controller"];
	$method = $_GET["method"];
	$url = buildURL($controller, $method);

	curl_init_custom_no_parameters($url);

}

if (isset($_GET["controller_post"]) && isset($_GET["method_post"])){
	$parameters = json_decode(file_get_contents('php://input'),true);
	
	$controller = $_GET["controller_post"];
	$method = $_GET["method_post"];

	$url = buildURL($controller, $method);

	switch ($method) {
		case "GetListTransfers":
			curl_init_custom_with_parameters($url, $parameters);
			break;
		default:
			curl_init_custom_with_parameters($url, $parameters);
	}
	
}



?>






