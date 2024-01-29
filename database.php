<?php
$user = 'root';
$pass = '';



try {
    $dbh = new PDO('mysql:host=localhost;dbname=messageapp', $user, $pass);
} catch (PDOException $e) {
    echo 'Connection failed: ' . $e->getMessage();
    exit;
}
