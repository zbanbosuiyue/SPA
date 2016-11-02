<?php

$fileName = "../csv_files/test01.csv";

$csv = array_map("str_getcsv", file($fileName,FILE_SKIP_EMPTY_LINES));

$keys = array_shift($csv);

var_dump($keys);

foreach ($keys as $key=>$value){
	if(strtolower($value) == "sku"){
		$skuKey = $key;
	}

	if(strtolower($value) == "request_qty"){
		$requestQtyKey = $key;
	}
}


if (isset($skuKey) && isset($requestQtyKey)){
	foreach ($csv as $value){
		$skuArr[] = $value[$skuKey];
		$request_qty[] = $value[$requestQtyKey];
	}
} else{
	exit("Not found 'sku' or 'request_qty' as column name.");
}


?>