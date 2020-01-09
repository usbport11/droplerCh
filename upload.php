<?php
$IP = '192.168.1.12';
$uploadFolder = __DIR__ . '/images/';
$onlinePath = 'http://' . $IP . '/test2/images/';
$response = array();
if (isset($_FILES['file'])) {
    $file = $_FILES['file'];
    $filename = uniqid() . '.' . (pathinfo($file['name'], PATHINFO_EXTENSION) ? : 'png');
    $result_upload = move_uploaded_file($file['tmp_name'], $uploadFolder . $filename);
    $response['filename'] = $filename;
    $response['link'] = $onlinePath . $response['filename'];
    $response['result_upload'] = $result_upload;
} 
else {
    $response['error'] = 'Error while uploading file ' . $_POST['file'];
}
echo json_encode($response);
?>