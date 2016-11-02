<?php
$target_dir = "../uploads/";
$target_file = $target_dir . basename($_FILES["file"]["name"]);
$uploadOk = 1;
$fileType = pathinfo($target_file,PATHINFO_EXTENSION);

$mimes = array('application/vnd.ms-excel','text/plain','text/csv','text/tsv');

if(in_array($_FILES['file']['type'],$mimes)){
  // do something
    $msg["Message"] = "File is a text type file";
    $uploadOk = 1;
} else {
    $msg["Error"] = "File is not a csv.";
    $uploadOk = 0;
}
/*
$msg = array();
// Check if image file is a actual image or fake image
if(isset($_POST["submit"])) {
    $check = getimagesize($_FILES["fileToUpload"]["tmp_name"]);
    if($check !== false) {
        array_push($msg, "Message", "File is an image - " . $check["mime"] . ".");
        $uploadOk = 1;
    } else {
        array_push($msg, "Error", "File is not an image.");
        $uploadOk = 0;
    }
}

*/
// Check if file already exists
if (file_exists($target_file)) {
    $msg["Message"] = "File Exist. The original file will be replaced.";
    $uploadOk = 1;
}
// Check file size
if ($_FILES["file"]["size"] > 500000) {
    $msg["Error"] = "File is too large (over 5M).";
    $uploadOk = 0;
}
// Allow certain file formats
if($fileType != "csv" && $fileType != "txt") {
   $msg["Error"] = "File is not a csv.";
    $uploadOk = 0;
}

// Check if $uploadOk is set to 0 by an error
if ($uploadOk == 0) {
    $msg["Error"] = "Upload not success.";
// if everything is ok, try to upload file
} else {
    if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
        $msg["Success"] = "The file ". basename( $_FILES["file"]["name"]). " has been uploaded.";
        $msg["Path"] = $target_file;

    } else {
        $msg["Error"] = "Error occurs.";
    }
}


echo json_encode($msg);
?>