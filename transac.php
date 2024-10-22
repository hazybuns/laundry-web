<?php
// Set headers for JSON response and CORS support
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, DELETE");

// Include the configuration file for database connection
include 'config.php'; // Adjust the path if necessary

// Handle incoming requests
$request_method = $_SERVER["REQUEST_METHOD"];

switch ($request_method) {
    case 'GET':
        if (isset($_GET['action'])) {
            switch ($_GET['action']) {
                case 'fetch_users':
                    fetchUsers($conn);
                    break;
                case 'fetch_cloths':
                    fetchCloths($conn);
                    break;
                case 'fetch_detergents':
                    fetchDetergents($conn);
                    break;
                case 'fetch_pending_transactions':
                    fetchPendingTransactions($conn);
                    break;
                case 'fetchCompletedTransactions':
                    fetchCompletedTransactions($conn);
                    break;
                default:
                    fetchTransactions($conn);
                    break;
            }
        } else {
            fetchTransactions($conn);
        }
        break;
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        if (isset($input['action']) && $input['action'] === 'update_payment_status') {
            updatePaymentStatus($conn, $input);
        } else {
            addTransaction($conn);
        }
        break;
    default:
        echo json_encode(["error" => "Invalid request method."]);
        break;
}

// Function to fetch all transactions
function fetchTransactions($conn) {
    $sql = "SELECT t.*, u.name AS user_name, t.created_at 
            FROM transactions t 
            LEFT JOIN users u ON t.user_id = u.user_id 
            ORDER BY t.created_at DESC"; // Added created_at and sorting
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $transactions = [];
        while ($row = $result->fetch_assoc()) {
            // Format the created_at timestamp
            $row['created_at'] = date('Y-m-d H:i:s', strtotime($row['created_at']));
            $transactions[] = $row;
        }
        echo json_encode($transactions);
    } else {
        echo json_encode([]); // Return empty array if no transactions found
    }
}

// Function to fetch all users
function fetchUsers($conn) {
    $sql = "SELECT user_id, name FROM users"; // Select user_id and name
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $users = [];
        while ($row = $result->fetch_assoc()) {
            $users[] = $row; // Fetch user_id and name
        }
        echo json_encode($users); // Return the list of users
    } else {
        echo json_encode([]); // Return empty array if no users found
    }
}

// Function to fetch all cloths
function fetchCloths($conn) {
    $sql = "SELECT cloth_id AS id, cloth_type AS name, price_per_item FROM clothes"; 
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        $cloths = [];
        while ($row = $result->fetch_assoc()) {
            $cloths[] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'price_per_item' => $row['price_per_item']
            ];
        }
        echo json_encode($cloths);
    } else {
        echo json_encode([]); // Return empty array if no cloths found
    }
}

// Function to fetch all detergents
function fetchDetergents($conn) {
    $sql = "SELECT detergent_id AS id, detergent_name AS name, price FROM detergents"; 
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $detergents = [];
        while ($row = $result->fetch_assoc()) {
            $detergents[] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'price' => $row['price']
            ];
        }
        echo json_encode($detergents);
    } else {
        echo json_encode([]); // Return empty array if no detergents found
    }
}

// Function to add a transaction
function addTransaction($conn) {
    $input = json_decode(file_get_contents("php://input"), true);
    error_log(print_r($input, true)); // Log the input data for debugging

    // Validate input
    if (!isset($input['cloth_id'], $input['quantity'], $input['detergent_id'], $input['user_id'])) {
        echo json_encode(["error" => "Invalid input. Missing fields."]);
        return;
    }

    $cloth_id = intval($input['cloth_id']);
    $detergent_id = intval($input['detergent_id']);
    $quantity = intval($input['quantity']);
    $user_id = intval($input['user_id']);

    // Fetch cloth price
    $clothQuery = $conn->prepare("SELECT price_per_item FROM clothes WHERE cloth_id = ?");
    $clothQuery->bind_param("i", $cloth_id);
    $clothQuery->execute();
    $clothResult = $clothQuery->get_result();
    $clothPrice = $clothResult->fetch_assoc()['price_per_item'] ?? null; 

    // Fetch detergent price
    $detergentQuery = $conn->prepare("SELECT price FROM detergents WHERE detergent_id = ?");
    $detergentQuery->bind_param("i", $detergent_id);
    $detergentQuery->execute();
    $detergentResult = $detergentQuery->get_result();
    $detergentPrice = $detergentResult->fetch_assoc()['price'] ?? null;

    if ($clothPrice === null || $detergentPrice === null) {
        echo json_encode(["error" => "Invalid cloth or detergent."]);
        return;
    }

    $total_price = ($clothPrice * $quantity) + $detergentPrice;

    $stmt = $conn->prepare("INSERT INTO transactions (user_id, cloth_id, detergent_id, quantity, total_price, status) VALUES (?, ?, ?, ?, ?, 'pending')");
    $stmt->bind_param("iiids", $user_id, $cloth_id, $detergent_id, $quantity, $total_price);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Transaction added successfully.", "transaction_id" => $conn->insert_id]);
    } else {
        echo json_encode(["error" => "Failed to add transaction."]);
    }
    $stmt->close();
}

// New function to update payment status and transaction status
function updatePaymentStatus($conn, $input) {
    $transaction_id = $input['transaction_id'];
    $payment_status = $input['payment_status'];
    $status = $input['status'];
    
    $sql = "UPDATE transactions 
            SET payment_status = ?, status = ?, payment_date = CURRENT_TIMESTAMP 
            WHERE transaction_id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssi", $payment_status, $status, $transaction_id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
    
    $stmt->close();
}

// New function to fetch pending transactions
function fetchPendingTransactions($conn) {
    $sql = "SELECT t.*, u.name AS user_name 
            FROM transactions t
            LEFT JOIN users u ON t.user_id = u.user_id
            WHERE (t.status = 'Pending' OR t.status = 'Ready to Pick-Up') 
            AND t.payment_status = 'pending'
            ORDER BY t.created_at DESC";
    
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        $transactions = array();
        while($row = $result->fetch_assoc()) {
            // Format the created_at timestamp
            $row['created_at'] = date('Y-m-d H:i:s', strtotime($row['created_at']));
            $transactions[] = $row;
        }
        echo json_encode($transactions);
    } else {
        echo json_encode([]);
    }
}

// New function to fetch completed transactions
function fetchCompletedTransactions($conn) {
    if (!isset($_GET['month'])) {
        echo json_encode(['error' => 'Month parameter is required']);
        return;
    }

    $month = $_GET['month'];
    $startDate = $month . "-01";
    $endDate = date("Y-m-t", strtotime($startDate));

    $sql = "SELECT t.transaction_id as id, u.name as customerName, t.payment_date as date, t.total_price as amount, t.status 
            FROM transactions t
            JOIN users u ON t.user_id = u.user_id
            WHERE t.status = 'Picked-Up' 
            AND t.payment_status = 'completed'
            AND t.payment_date BETWEEN ? AND ?
            ORDER BY t.payment_date DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $startDate, $endDate);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $transactions = array();
        while($row = $result->fetch_assoc()) {
            $row['date'] = date('Y-m-d H:i:s', strtotime($row['date']));
            $transactions[] = $row;
        }
        echo json_encode(['transactions' => $transactions]);
    } else {
        echo json_encode(['transactions' => []]);
    }
}

?>
