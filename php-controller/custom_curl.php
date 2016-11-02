<?php

function curl_init_custom_no_parameters($url){
	global $token;

	$ch = curl_init($url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array(
		"Authorization : " . $token
		));

	$data = curl_exec($ch);
	echo $data;
	return $data;
}


function curl_init_custom_with_parameters($url, $parameters){
	global $token;

	$ch = curl_init($url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
	curl_setopt($ch, CURLOPT_PROXY, '127.0.0.1:8888');
	curl_setopt($ch, CURLOPT_HTTPHEADER, array(
		"Authorization : " . $token
		));
	curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($parameters));

	$data = curl_exec($ch);
	curl_close($ch);
	echo $data;
	return $data;
}



function curl_init_custom_with_parameters_debug($url, $parameters){
	global $token;

	$ch = curl_init($url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array(
		"Authorization : " . $token
		));
	//curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($parameters));

	$data = curl_exec($ch);
	curl_close($ch);
	echo $data;
	return $data;
}

function GetAuth($url, $parameters)
{
	var_dump($parameters);
	$ch = curl_init($url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
	curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($parameters));

	$data = curl_exec($ch);
	curl_close($ch);

	$result = json_decode(json_decode(json_encode($data)), true);
	return $result;
}

function buildURL($controller, $method){
	global $baseURL;

	$url = $baseURL . $controller . '/' . $method;
	return $url;
}

?>






