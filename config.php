<?php
// Define the database configuration array
$dbConfig = [
    'servername' => 'localhost',
    'username'   => 'root',
    'password'   => '',
    'dbname'     => 'laundry'  // Ensure this matches your database name
];

// Create connection
$conn = new mysqli($dbConfig['servername'], $dbConfig['username'], $dbConfig['password'], $dbConfig['dbname']);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
}
?>
