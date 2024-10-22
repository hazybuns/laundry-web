<?php

// Include your config.php file for database connection
// Include your config.php file here
// require_once 'config.php';

// Function to get the database connection
function getDbConnection() {
    $host = 'localhost'; // Your database host
    $db = 'pos'; // Your database name
    $user = 'your_username'; // Your database username
    $pass = 'your_password'; // Your database password

    try {
        $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        echo "Connection failed: " . $e->getMessage();
        exit();
    }
}

// Fetch all transactions
function fetchAllTransactions() {
    $pdo = getDbConnection();
    $stmt = $pdo->prepare("SELECT * FROM transactions");
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Fetch transactions by user ID
function fetchTransactionsByUserId($userId) {
    $pdo = getDbConnection();
    $stmt = $pdo->prepare("SELECT * FROM transactions WHERE user_id = :user_id");
    $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Fetch transaction details by transaction ID
function fetchTransactionDetailsById($transactionId) {
    $pdo = getDbConnection();
    $stmt = $pdo->prepare("SELECT * FROM transactions WHERE transaction_id = :transaction_id");
    $stmt->bindParam(':transaction_id', $transactionId, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

// Handle requests
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['action'])) {
        switch ($_GET['action']) {
            case 'fetch_all':
                $transactions = fetchAllTransactions();
                echo json_encode(['success' => true, 'transactions' => $transactions]);
                break;
            case 'fetch_by_user':
                if (isset($_GET['user_id'])) {
                    $userId = intval($_GET['user_id']);
                    $transactions = fetchTransactionsByUserId($userId);
                    echo json_encode(['success' => true, 'transactions' => $transactions]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'User ID is required.']);
                }
                break;
            case 'fetch_transaction':
                if (isset($_GET['transaction_id'])) {
                    $transactionId = intval($_GET['transaction_id']);
                    $transaction = fetchTransactionDetailsById($transactionId);
                    if ($transaction) {
                        echo json_encode(['success' => true, 'transaction' => $transaction]);
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Transaction not found.']);
                    }
                } else {
                    echo json_encode(['success' => false, 'message' => 'Transaction ID is required.']);
                }
                break;
            default:
                echo json_encode(['success' => false, 'message' => 'Invalid action.']);
                break;
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'No action specified.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
}

?>
