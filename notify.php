<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$host = "localhost";
$dbname = "wheresmy_Therapist";
$username = "wheresmy_manager";
$password = "Pushu@18#";

try {
  $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
  $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

  $data = json_decode(file_get_contents('php://input'), true);

  $name  = htmlspecialchars($data['name']);
  $email = htmlspecialchars($data['email']);
  $phone = htmlspecialchars($data['phone']);

  $stmt = $conn->prepare("INSERT INTO waitlist (full_name, email, phone) VALUES (?, ?, ?)");
  $stmt->execute([$name, $email, $phone]);

  echo json_encode(['success' => true]);
} catch(Exception $e) {
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>