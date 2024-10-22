<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE");

// Include the configuration file
include 'config.php'; // Adjust the path as necessary

// Handle incoming requests
$request_method = $_SERVER["REQUEST_METHOD"];

switch ($request_method) {
    case 'GET':
        fetchDetergents($conn);
        break;
    case 'POST':
        addDetergent($conn);
        break;
    default:
        echo json_encode(["error" => "Invalid request method."]);
        break;
}

function fetchDetergents($conn) {
    $sql = "SELECT detergent_id, detergent_name, price FROM detergents";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $detergents = [];
        while ($row = $result->fetch_assoc()) {
            $detergents[] = $row;
        }
        echo json_encode($detergents);
    } else {
        echo json_encode([]);
    }
}

function addDetergent($conn) {
    $input = json_decode(file_get_contents("php://input"), true);
    
    // Validate input
    if (!isset($input['detergent_name']) || !isset($input['price'])) {
        echo json_encode(["error" => "Invalid input."]);
        return;
    }

    $detergent_name = $conn->real_escape_string($input['detergent_name']);
    $price = floatval($input['price']); // Ensure price is a float

    // Insert new detergent into the database
    $sql = "INSERT INTO detergents (detergent_name, price) VALUES ('$detergent_name', $price)";

    if ($conn->query($sql) === TRUE) {
        $new_id = $conn->insert_id; // Get the newly created ID
        echo json_encode(["message" => "Detergent added successfully.", "detergent_id" => $new_id]);
    } else {
        echo json_encode(["error" => "Failed to add detergent: " . $conn->error]);
    }
}

// Close connection
$conn->close();
?>
