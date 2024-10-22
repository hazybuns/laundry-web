<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE");

// Include the configuration file
include 'config.php';

// Create a new connection using the $dbConfig array
$conn = new mysqli($dbConfig['servername'], $dbConfig['username'], $dbConfig['password'], $dbConfig['dbname']);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Handle POST requests for registration and login
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $action = $_POST['action'] ?? null;

    // Registration logic
    if ($action === 'register') {
        $name = $_POST['name'] ?? null; // User's name
        $email = $_POST['email'] ?? null; // User's email
        $password = $_POST['password'] ?? null; // User's password
        $role = $_POST['role'] ?? 'user'; // Default to 'user' if not provided

        // Validate inputs
        if ($name && filter_var($email, FILTER_VALIDATE_EMAIL) && $password) {
            $sql = "SELECT user_id FROM users WHERE email = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $result = $stmt->get_result();

            // Check if email already exists
            if ($result->num_rows > 0) {
                echo json_encode(["error" => "Email already exists"]);
            } else {
                // Hash the password before storing
                $passwordHash = password_hash($password, PASSWORD_BCRYPT);
                $sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("ssss", $name, $email, $passwordHash, $role);
                
                // Execute the statement and check for success
                if ($stmt->execute()) {
                    echo json_encode(["message" => "User registered successfully"]);
                } else {
                    echo json_encode(["error" => "Error: " . $stmt->error]);
                }
            }
            $stmt->close();
        } else {
            echo json_encode(["error" => "Invalid input"]);
        }
    }
    // Login logic
    elseif ($action === 'login') {
        $email = $_POST['email'] ?? null; // User's email
        $password = $_POST['password'] ?? null; // User's password

        // Validate inputs
        if ($email && filter_var($email, FILTER_VALIDATE_EMAIL) && $password) {
            $sql = "SELECT user_id, password, role FROM users WHERE email = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $result = $stmt->get_result();

            // Check if user exists
            if ($result->num_rows > 0) {
                $user = $result->fetch_assoc();
                // Verify the password
                if (password_verify($password, $user['password'])) {
                    echo json_encode([
                        "message" => "Login successful", 
                        "role" => $user['role'], 
                        "id" => $user['user_id'] // Return user_id
                    ]);
                } else {
                    echo json_encode(["error" => "Invalid password"]);
                }
            } else {
                echo json_encode(["error" => "No such user found"]);
            }
            $stmt->close();
        } else {
            echo json_encode(["error" => "Invalid input"]);
        }
    } else {
        echo json_encode(["error" => "Invalid action"]);
    }
} else {
    echo json_encode(["error" => "Invalid request method"]);
}

// Close the database connection
$conn->close();
?>
