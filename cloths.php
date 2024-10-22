<?php
// Set headers for JSON response and CORS support
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE");

// Include the configuration file for database connection
include 'config.php'; // Adjust the path if necessary

// Handle incoming requests
$request_method = $_SERVER["REQUEST_METHOD"];

switch ($request_method) {
    case 'GET':
        fetchClothes($conn);
        break;
    case 'POST':
        addCloth($conn);
        break;
    default:
        echo json_encode(["error" => "Invalid request method."]);
        break;
}

// Function to fetch all clothes
function fetchClothes($conn) {
    $sql = "SELECT cloth_id, cloth_type, price_per_item FROM clothes";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $clothes = [];
        while ($row = $result->fetch_assoc()) {
            $clothes[] = $row;
        }
        echo json_encode($clothes);
    } else {
        echo json_encode([]); // Return empty array if no clothes found
    }
}

// Function to add a new cloth item
function addCloth($conn) {
    // Get input data from request body (JSON)
    $input = json_decode(file_get_contents("php://input"), true);
    
    // Validate input
    if (!isset($input['cloth_type']) || !isset($input['price_per_item'])) {
        echo json_encode(["error" => "Invalid input."]);
        return;
    }

    // Clean and validate input
    $cloth_type = $conn->real_escape_string($input['cloth_type']);
    $price_per_item = floatval($input['price_per_item']); // Ensure price is a float

    // Prepare and execute the insert statement
    $stmt = $conn->prepare("INSERT INTO clothes (cloth_type, price_per_item) VALUES (?, ?)");
    $stmt->bind_param("sd", $cloth_type, $price_per_item); // "sd" means string and double

    if ($stmt->execute()) {
        $new_id = $stmt->insert_id; // Get the newly created ID
        echo json_encode(["message" => "Cloth added successfully.", "cloth_id" => $new_id]);
    } else {
        echo json_encode(["error" => "Failed to add cloth: " . $stmt->error]);
    }

    // Close the statement
    $stmt->close();
}

// Close connection
$conn->close();
?>
