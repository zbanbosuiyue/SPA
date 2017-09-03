<?php
require_once('custom_curl.php');

$AuthURL = "https://api.linnworks.net//api/Auth/AuthorizeByApplication";

$appId = "2abb5f32-76d3-4875-96c8-b81377c830dc";
$appSecret = "ec16ba28-2b70-42c0-8345-087942528f64";
$zenhydroToken = "cc759b0b7d564d3d03f54f7187a2598e";

$baseURL = "https://us.linnworks.net//api/";

$authString = "Authorization";

if( !function_exists('apache_request_headers') ) {
	$authString = "AUTHORIZATION";
	function apache_request_headers() {
		
		$arh = array();
		$rx_http = '/\AHTTP_/';
		foreach($_SERVER as $key => $val) {
			if( preg_match($rx_http, $key) ) {
				$arh_key = preg_replace($rx_http, '', $key);
				$rx_matches = array();
				$rx_matches = explode('_', $arh_key);
				if( count($rx_matches) > 0 and strlen($arh_key) > 2 ) {
					foreach($rx_matches as $ak_key => $ak_val) $rx_matches[$ak_key] = ucfirst($ak_val);
					$arh_key = implode('-', $rx_matches);
				}
				$arh[$arh_key] = $val;
			}
		}
		return($arh);
	}
}

$headers = apache_request_headers();

var_dump($headers);
var_dump($_GET);

$data = array('applicationId' => $appId, 'applicationSecret' => $appSecret, 'token' => $zenhydroToken);

if (isset($_GET["controller"]) && isset($_GET["method"])){
	$controller = $_GET["controller"];
	$method = $_GET["method"];
	$url = buildURL($controller, $method);

	$result = curl_init_custom_no_parameters($url);
	var_dump($result);

}

if (isset($_GET["controller_post"]) && isset($_GET["method_post"])){
	$parameters = json_decode(file_get_contents('php://input'),true);
	
	$controller = $_GET["controller_post"];
	$method = $_GET["method_post"];

	$url = buildURL($controller, $method);
	$result = curl_init_custom_with_parameters($url, $parameters);
}
/*

if(isset($headers[$authString])){

	$oldToken = $headers[$authString];
	$fileName = $zenhydroToken;
	$data = array('applicationId' => $appId, 'applicationSecret' => $appSecret, 'token' => $zenhydroToken);

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

		$result = curl_init_custom_no_parameters($url);

		if (strpos($result, 'Message') !== false) {
		    $result = GetAuth($AuthURL, $data);
		    $token = $result["Token"];
		    $file = fopen($fileName, 'w') or die("Unable to open file!");
		    fwrite($file, $token);
		    fclose($file);
		}

	}

	if (isset($_GET["controller_post"]) && isset($_GET["method_post"])){
		$parameters = json_decode(file_get_contents('php://input'),true);
		
		$controller = $_GET["controller_post"];
		$method = $_GET["method_post"];

		$url = buildURL($controller, $method);
		$result = curl_init_custom_with_parameters($url, $parameters);


		if (strpos($result, 'Message') !== false) {
		    $result = GetAuth($AuthURL, $data);
		    $token = $result["Token"];
		    $file = fopen($fileName, 'w') or die("Unable to open file!");
		    fwrite($file, $token);
		    fclose($file);
		}
	}

}
*/
?>






