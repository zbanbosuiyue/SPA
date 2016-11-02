<?php

function curl_init_custom_no_parameters($url, $token){
	$ch = curl_init($url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array(
		"Authorization : " . $token
		));
	$data = curl_exec($ch);
	var_dump($data);
	curl_close($ch);
	$result = json_decode(json_decode(json_encode($data)), true);
	return $result;
}


function curl_init_custom_with_parameters($url, $token, $parameters){
	$ch = curl_init($url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array(
		"Authorization : " . $token
		));
	curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($parameters));

	$data = curl_exec($ch);
	var_dump($data);
	curl_close($ch);
	$result = json_decode(json_decode(json_encode($data)), true);
	return $result;
}

?>






