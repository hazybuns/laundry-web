<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE");

// Include the database configuration
include 'config.php';

// Handle different API endpoints
if (isset($_GET['action'])) {
    $action = $_GET['action'];

    if ($action === 'dailyIncome') {
        getDailyIncome($conn);
    } elseif ($action === 'customerCount') {
        getCustomerCount($conn);
    } elseif ($action === 'monthlyIncome') {
        getMonthlyIncome($conn);
    } elseif ($action === 'fetchTransactions' && isset($_GET['month'])) {
        fetchMonthlyReport($conn, $_GET['month']);
    } else {
        echo json_encode(["error" => "Invalid action"]);
    }
} else {
    echo json_encode(["error" => "No action provided"]);
}

// Function to get daily income (only completed payments, based on payment_date)
function getDailyIncome($conn) {
    $today = date('Y-m-d');
    $sql = "SELECT SUM(total_price) as total FROM transactions 
            WHERE DATE(payment_date) = ? AND payment_status = 'completed'";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s', $today);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo json_encode(["total" => (float)$row['total'] ?: 0]);
    } else {
        echo json_encode(["total" => 0]);
    }
}

// Function to get customer count (based on payment_date and completed payments)
function getCustomerCount($conn) {
    $today = date('Y-m-d');
    $sql = "SELECT COUNT(DISTINCT user_id) as count 
            FROM transactions 
            WHERE DATE(payment_date) = ? AND payment_status = 'completed'";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s', $today);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo json_encode(["count" => (int)$row['count']]);
    } else {
        echo json_encode(["count" => 0]);
    }
}

// Function to get monthly income (only completed payments)
function getMonthlyIncome($conn) {
    $currentMonth = date('Y-m');
    $sql = "SELECT SUM(total_price) as total FROM transactions 
            WHERE DATE_FORMAT(created_at, '%Y-%m') = ? AND payment_status = 'completed'";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s', $currentMonth);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo json_encode(["total" => (float)$row['total'] ?: 0]);
    } else {
        echo json_encode(["total" => 0]);
    }
}

// Function to fetch monthly transactions and user data
function fetchMonthlyReport($conn, $selectedMonth) {
    if (preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', $selectedMonth)) {
        $sql = "SELECT t.transaction_id, u.name AS username, t.created_at, t.total_price, t.status, t.payment_status 
                FROM transactions t
                JOIN users u ON t.user_id = u.user_id
                WHERE DATE_FORMAT(t.created_at, '%Y-%m') = ?";
                
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('s', $selectedMonth);
        $stmt->execute();
        $result = $stmt->get_result();

        $transactions = [];

        while ($row = $result->fetch_assoc()) {
            $transactions[] = [
                'id' => $row['transaction_id'],
                'customerName' => $row['username'],
                'date' => $row['created_at'],
                'amount' => (float)$row['total_price'],
                'status' => $row['status'],
                'paymentStatus' => $row['payment_status']
            ];
        }

        echo json_encode($transactions);
    } else {
        echo json_encode(["error" => "Invalid month format"]);
    }
}

// Close the connection
$conn->close();
?>
