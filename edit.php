<?php
// Set headers for JSON response and CORS support
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE");
header("Access-Control-Max-Age: 3600");

// Include the configuration file for database connection
include 'config.php'; // Adjust the path if necessary

// Handle incoming requests
$request_method = $_SERVER["REQUEST_METHOD"];

if ($request_method === 'PUT') {
    // Get the raw input data
    $input = json_decode(file_get_contents("php://input"), true);
    
    if (isset($input['transaction_ids']) && isset($input['status'])) {
        bulkUpdateTransactions($conn, $input);
    } else {
        updateTransaction($conn);
    }
} else {
    echo json_encode(["error" => "Invalid request method."]);
}

// Function to update a transaction
function updateTransaction($conn) {
    // Retrieve JSON input
    $input = json_decode(file_get_contents("php://input"), true);
    error_log(print_r($input, true)); // Log the input data for debugging

    // Validate input
    if (!isset($input['transaction_id'], $input['cloth_id'], $input['quantity'], $input['detergent_id'], $input['user_id'], $input['status'])) {
        echo json_encode(["error" => "Invalid input. Missing fields."]);
        return;
    }

    // Fetch input values
    $transaction_id = intval($input['transaction_id']);
    $cloth_id = intval($input['cloth_id']);
    $detergent_id = intval($input['detergent_id']);
    $quantity = intval($input['quantity']);
    $user_id = intval($input['user_id']);
    $status = $input['status'];

    // Check if the transaction exists
    $stmt = $conn->prepare("SELECT * FROM transactions WHERE transaction_id = ?");
    $stmt->bind_param("i", $transaction_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(["error" => "No transaction found with that ID."]);
        return;
    }

    // Fetch cloth price
    $clothPrice = fetchPrice($conn, "clothes", "cloth_id", $cloth_id);
    if ($clothPrice === null) {
        echo json_encode(["error" => "Invalid cloth."]);
        return;
    }

    // Fetch detergent price
    $detergentPrice = fetchPrice($conn, "detergents", "detergent_id", $detergent_id, 'price');
    if ($detergentPrice === null) {
        echo json_encode(["error" => "Invalid detergent."]);
        return;
    }

    // Calculate total price
    $total_price = ($clothPrice * $quantity) + $detergentPrice;

    // Prepare and bind the update statement
    $stmt = $conn->prepare("UPDATE transactions SET user_id=?, cloth_id=?, detergent_id=?, quantity=?, total_price=?, status=? WHERE transaction_id=?");

    if (!$stmt) {
        echo json_encode(["error" => "Error preparing statement: " . $conn->error]);
        return;
    }

    $stmt->bind_param("iiidssi", $user_id, $cloth_id, $detergent_id, $quantity, $total_price, $status, $transaction_id);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(["message" => "Transaction updated successfully."]);
        } else {
            echo json_encode(["error" => "No transaction updated. Please check the data."]);
        }
    } else {
        echo json_encode(["error" => "Failed to update transaction: " . $stmt->error]);
    }

    // Close statement
    $stmt->close();
}

// Function to fetch price based on item type
function fetchPrice($conn, $table, $idField, $id, $priceColumn = 'price_per_item') {
    // Adjust the price column based on the table type
    if ($table === 'clothes') {
        $priceColumn = 'price_per_item'; // For clothes
    } elseif ($table === 'detergents') {
        $priceColumn = 'price'; // For detergents
    }

    $query = $conn->prepare("SELECT $priceColumn FROM $table WHERE $idField = ?");
    if (!$query) {
        error_log("Prepare failed: (" . $conn->errno . ") " . $conn->error);
        return null;
    }

    $query->bind_param("i", $id);
    $query->execute();
    $result = $query->get_result();
    
    if (!$result) {
        error_log("Query failed: (" . $query->errno . ") " . $query->error);
        return null;
    }

    return $result->fetch_assoc()[$priceColumn] ?? null;
}

// New function for bulk updating transaction statuses
function bulkUpdateTransactions($conn, $input) {
    $transactionIds = $input['transaction_ids'];
    $newStatus = $input['status'];

    // Prepare the transaction IDs for the SQL query
    $transactionIdsString = implode(',', array_map('intval', $transactionIds));

    // Prepare the SQL query
    $sql = "UPDATE transactions SET status = ? WHERE transaction_id IN ($transactionIdsString)";

    // Prepare and execute the statement
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $newStatus);

    if ($stmt->execute()) {
        $affectedRows = $stmt->affected_rows;
        echo json_encode(["message" => "Successfully updated $affectedRows transaction(s)"]);
    } else {
        echo json_encode(["error" => "Error updating transactions: " . $conn->error]);
    }

    $stmt->close();
}

// Close connection
$conn->close();
?>
