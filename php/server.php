<?php 
$servername = "localhost";
$username = "root";
$password = ""; 
$dbname = "ecobank_db";

$conn = new mysqli($servername, $username, $password, $dbname);
    
if ($conn->connect_error) {
    die("connect lost: ". $conn->connect_error);
    }

?>
