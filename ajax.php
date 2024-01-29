<?php
include 'randomStringGenerator.php';
include 'database.php';

header('Content-Type: application/json');
$decodedParams = json_decode(file_get_contents('php://input'));
$response = array();




if (isset($decodedParams->scope) && !empty($decodedParams->scope)) {
    if ($decodedParams->scope == 'chat') {
        if (isset($decodedParams->action) && !empty($decodedParams->action)) {
            if ($decodedParams->action == 'addChat') {
                $chatName = $decodedParams->chatName;
                $chatId = generateRandomString(4);
                $chatStatus = $decodedParams->chatStatus;
                $chatCreateDate = $var['timestamp'];
                $userId = $decodedParams->userId;

                $stmt = $dbh->prepare("INSERT INTO chat (chatId, chatName, chatStatus, chatCreateDate) VALUES (:chatId, :chatName, :chatStatus, :chatCreateDate)");
                $stmt->bindParam(':chatId', $chatId);
                $stmt->bindParam(':chatName', $chatName);
                $stmt->bindParam(':chatStatus', $chatStatus);
                $stmt->bindParam(':chatCreateDate', $chatCreateDate);

                if ($stmt->execute()) {
                    $stmt = $dbh->prepare("INSERT INTO userhaschat (userId, chatId) VALUES (:userId, :chatId)");
                    $stmt->bindParam(':userId', $userId);
                    $stmt->bindParam(':chatId', $chatId);
                    if ($stmt->execute()) {
                        $response['status'] = '200';
                        $response['message'] = 'Chat added successfully to user';
                    } else {
                        $response['status'] = '500';
                        $response['message'] = 'Chat could not be added to user';
                        echo json_encode($response);
                        exit;
                    }
                    $response['status'] = '200';
                    $response['chatId'] = $chatId;
                    $response['message'] = 'Chat added successfully';
                } else {
                    $response['status'] = '500';
                    $response['message'] = 'Chat could not be added';
                    echo json_encode($response);
                    exit;
                }
            }
        }
    }
}

if (isset($decodedParams->scope) && !empty($decodedParams->scope)) {
    if ($decodedParams->scope == 'chat') {
        if (isset($decodedParams->action) && !empty($decodedParams->action)) {
            if ($decodedParams->action == 'getChatId') {
                $userId = $decodedParams->userId; // Assuming you have userId in the request
                // Add your database query to check if a chat already exists between the users
                $stmt = $dbh->prepare("SELECT chatId FROM userhaschat WHERE userId = :userId");
                $stmt->bindParam(':userId', $userId);

                if ($stmt->execute()) {
                    $existingChat = $stmt->fetch(PDO::FETCH_ASSOC);
                    if ($existingChat) {
                        // If a chat already exists, return the chatId
                        $response['status'] = '200';
                        $response['message'] = 'ChatId fetched successfully';
                        $response['data']['chatId'] = $existingChat['chatId'];
                    } else {
                        // If no chat exists, return a response indicating that
                        $response['status'] = '400';
                        $response['message'] = 'No chat found for the selected user';
                    }
                } else {
                    // Error in executing the query
                    $response['status'] = '500';
                    $response['message'] = 'Error fetching chatId';
                }
            }
        }
    }
}

if (isset($decodedParams->scope) && !empty($decodedParams->scope)) {
    if ($decodedParams->scope == 'chat') {
        if (isset($decodedParams->action) && !empty($decodedParams->action)) {
            if ($decodedParams->action == 'getChats') {
                $stmt = $dbh->prepare("SELECT c.chatId, c.chatName, c.chatStatus, c.chatCreatedate, u.userId FROM userhaschat as u
                INNER JOIN chat as c ON u.chatId = c.chatId");

                if ($stmt->execute()) {
                    $response['status'] = '200';
                    $response['message'] = 'Chats fetched successfully';
                    $response['data'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
                } else {
                    $response['status'] = '500';
                    $response['message'] = 'Chats could not be fetched';
                    echo json_encode($response);
                    exit;
                };
            }
        }
    }
}

if (isset($decodedParams->scope) && !empty($decodedParams->scope)) {
    if ($decodedParams->scope == 'chat') {
        if (isset($decodedParams->action) && !empty($decodedParams->action)) {
            if ($decodedParams->action == 'changeChatName') {
                $chatId = $decodedParams->chatId;
                $chatName = $decodedParams->chatName;

                $stmt = $dbh->prepare("UPDATE chat SET chatName = :chatName WHERE chatId = :chatId");
                $stmt->bindParam(':chatId', $chatId);
                $stmt->bindParam(':chatName', $chatName);

                if ($stmt->execute()) {
                    $response['status'] = '200';
                    $response['message'] = 'Chat name changed successfully';
                } else {
                    $response['status'] = '500';
                    $response['message'] = 'Chat name could not be changed';
                    echo json_encode($response);
                    exit;
                };
            }
        }
    }
}


if (isset($decodedParams->scope) && !empty($decodedParams->scope)) {
    if ($decodedParams->scope == 'chat') {
        if (isset($decodedParams->action) && !empty($decodedParams->action)) {
            if ($decodedParams->action == 'getChatById') {
                $stmt = $dbh->prepare("SELECT chatId, chatName, chatStatus, chatCreatedate FROM chat where chatId = :chatId");
                $stmt->bindParam(':chatId', $decodedParams->chatId);

                if ($stmt->execute()) {
                    $response['status'] = '200';
                    $response['message'] = 'Chat fetched successfully';
                    $response['data'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
                } else {
                    $response['status'] = '500';
                    $response['message'] = 'Chats could not be fetched';
                    echo json_encode($response);
                    exit;
                };
            }
        }
    }
}

if (isset($decodedParams->scope) && !empty($decodedParams->scope)) {
    if ($decodedParams->scope == 'message') {
        if (isset($decodedParams->action) && !empty($decodedParams->action)) {
            if ($decodedParams->action == 'getLatestMessage') {
                $stmt = $dbh->prepare("SELECT m.messageContent, m.messageCreateDate, m.messageOwner, c.chatName, c.chatId
                FROM chathasmessages AS chm 
                INNER JOIN messages AS m ON chm.messageId = m.messageId
                INNER JOIN chat AS c ON chm.chatId = c.chatId
                INNER JOIN (
                    SELECT chatId, MAX(m.messageCreateDate) AS maxCreateDate
                    FROM chathasmessages AS chm
                    INNER JOIN messages AS m ON chm.messageId = m.messageId
                    GROUP BY chatId
                ) AS latestMessage ON m.messageCreateDate = latestMessage.maxCreateDate AND c.chatId = latestMessage.chatId");

                if ($stmt->execute()) {
                    $response['status'] = '200';
                    $response['message'] = 'Latest messages fetched successfully';
                    $response['data'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
                } else {
                    $response['status'] = '500';
                    $response['message'] = 'Latest messages could not be fetched';
                    echo json_encode($response);
                    exit;
                };
            }
        }
    }
}

if (isset($decodedParams->scope) && !empty($decodedParams->scope)) {
    if ($decodedParams->scope == 'message') {
        if (isset($decodedParams->action) && !empty($decodedParams->action)) {
            if ($decodedParams->action == 'getMessages') {
                $stmt = $dbh->prepare(" SELECT m.messageContent, m.messageCreateDate, m.messageOwner, c.chatName
                                       FROM chathasmessages as chm 
                                       INNER JOIN messages as m ON chm.messageId = m.messageId
                                       INNER JOIN chat as c ON chm.chatId = c.chatId
                                       WHERE chm.chatId = :chatId
                                       ORDER BY m.messageCreateDate");
                $stmt->bindParam(':chatId', $decodedParams->chatId);

                if ($stmt->execute()) {
                    $response['status'] = '200';
                    $response['message'] = 'Messages fetched successfully';
                    $response['data'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
                } else {
                    $response['status'] = '500';
                    $response['message'] = 'Messages could not be fetched';
                    echo json_encode($response);
                    exit;
                };
            }
        }
    }
}

if (isset($decodedParams->scope) && !empty($decodedParams->scope)) {
    if ($decodedParams->scope == 'message') {
        if (isset($decodedParams->action) && !empty($decodedParams->action)) {
            if ($decodedParams->action == 'sendMessage') {
                $messageContent = $decodedParams->messageContent;
                $messageId = generateRandomString(4);
                $messageCreateDate = $var['timestamp'];
                $chatId = $decodedParams->chatId;
                $owner = $decodedParams->messageOwner;

                $stmt = $dbh->prepare("INSERT INTO messages (messageId, messageOwner, messageContent, messageCreateDate) VALUES (:messageId, :messageOwner, :messageContent, :messageCreateDate)");
                $stmt->bindParam(':messageId', $messageId);
                $stmt->bindParam(':messageOwner', $owner);
                $stmt->bindParam(':messageContent', $messageContent);
                $stmt->bindParam(':messageCreateDate', $messageCreateDate);

                if ($stmt->execute()) {
                    $stmt = $dbh->prepare("INSERT INTO chathasmessages (chatId, messageId) VALUES (:chatId, :messageId)");
                    $stmt->bindParam(':chatId', $chatId);
                    $stmt->bindParam(':messageId', $messageId);
                    if ($stmt->execute()) {
                        $response['status'] = '200';
                        $response['message'] = 'Message added successfully to chat';
                    } else {
                        $response['status'] = '500';
                        $response['message'] = 'Message could not be added to chat';
                        echo json_encode($response);
                        exit;
                    }
                    $response['status'] = '200';
                    $response['message'] = 'Message added successfully';
                } else {
                    $response['status'] = '500';
                    $response['message'] = 'Message could not be added';
                    echo json_encode($response);
                    exit;
                }
            }
        }
    }
}

if (isset($_POST['scope']) && !empty($_POST['scope'])) {
    if ($_POST['scope'] == 'user') {
        if (isset($_POST['action']) && !empty($_POST['action'])) {
            if ($_POST['action'] == 'uploadOwnUserImage') {
                $userId = $_POST['userId'];
                $uploadDir = 'images/';
                $fileTmpName = $_FILES['file']['tmp_name'];

                if (!file_exists($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }

                $screenId = generateRandomString(4);

                // Check if record with the same screenEntityId already exists
                $existingStmt = $dbh->prepare("SELECT * FROM screens WHERE screenEntityId = :screenEntityId");
                $existingStmt->bindParam(':screenEntityId', $userId);
                $existingStmt->execute();
                $existingRecord = $existingStmt->fetch(PDO::FETCH_ASSOC);

                if ($existingRecord) {
                    // If record exists, set screenIsActive to 0
                    $updateStmt = $dbh->prepare("UPDATE screens SET screenIsActive = 0 WHERE screenEntityId = :screenEntityId");
                    $updateStmt->bindParam(':screenEntityId', $userId);
                    $updateStmt->execute();
                }

                if (move_uploaded_file($fileTmpName, $uploadDir . $screenId . '.png')) {
                    $stmt = $dbh->prepare("INSERT INTO screens (screenId, screenEntityId, screenCreateDate, screenIsActive) VALUES (:screenId, :screenEntityId, :screenCreateDate, 1)");
                    $stmt->bindParam(':screenId', $screenId);
                    $stmt->bindParam(':screenEntityId', $userId);
                    $stmt->bindParam(':screenCreateDate', $var['timestamp']);

                    if ($stmt->execute()) {
                        $response['status'] = '200';
                        $response['message'] = 'Image uploaded successfully';
                    } else {
                        $response['status'] = '500';
                        $response['message'] = 'Image could not be uploaded';
                        echo json_encode($response);
                        exit;
                    }
                } else {
                    $response['status'] = '500';
                    $response['message'] = 'Image could not be uploaded';
                    echo json_encode($response);
                    exit;
                }
            }
        }
    }
}

if (isset($_POST['scope']) && !empty($_POST['scope'])) {
    if ($_POST['scope'] == 'user') {
        if (isset($_POST['action']) && !empty($_POST['action'])) {
            if ($_POST['action'] == 'uploadUserImage') {
                $userId = $_POST['userId'];
                $uploadDir = 'images/';
                $fileTmpName = $_FILES['file']['tmp_name'];

                if (!file_exists($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }

                $screenId = generateRandomString(4);

                // Check if record with the same screenEntityId already exists
                $existingStmt = $dbh->prepare("SELECT * FROM screens WHERE screenEntityId = :screenEntityId");
                $existingStmt->bindParam(':screenEntityId', $userId);
                $existingStmt->execute();
                $existingRecord = $existingStmt->fetch(PDO::FETCH_ASSOC);

                if ($existingRecord) {
                    // If record exists, set screenIsActive to 0
                    $updateStmt = $dbh->prepare("UPDATE screens SET screenIsActive = 0 WHERE screenEntityId = :screenEntityId");
                    $updateStmt->bindParam(':screenEntityId', $userId);
                    $updateStmt->execute();
                }

                if (move_uploaded_file($fileTmpName, $uploadDir . $screenId . '.png')) {
                    $stmt = $dbh->prepare("INSERT INTO screens (screenId, screenEntityId, screenCreateDate, screenIsActive) VALUES (:screenId, :screenEntityId, :screenCreateDate, 1)");
                    $stmt->bindParam(':screenId', $screenId);
                    $stmt->bindParam(':screenEntityId', $userId);
                    $stmt->bindParam(':screenCreateDate', $var['timestamp']);

                    if ($stmt->execute()) {
                        $response['status'] = '200';
                        $response['message'] = 'Image uploaded successfully';
                        $response['screenId'] = $screenId;
                    } else {
                        $response['status'] = '500';
                        $response['message'] = 'Image could not be uploaded';
                        echo json_encode($response);
                        exit;
                    }
                } else {
                    $response['status'] = '500';
                    $response['message'] = 'Image could not be uploaded';
                    echo json_encode($response);
                    exit;
                }
            }
        }
    }
}


if (isset($decodedParams->scope) && !empty($decodedParams->scope)) {
    if ($decodedParams->scope == 'user') {
        if (isset($decodedParams->action) && !empty($decodedParams->action)) {
            if ($decodedParams->action == 'getUserId') {
                $chatId = $decodedParams->chatId;

                $stmt = $dbh->prepare("SELECT userId FROM userhaschat WHERE chatId = :chatId");
                $stmt->bindParam(':chatId', $chatId);

                if ($stmt->execute()) {
                    $existingUser = $stmt->fetch(PDO::FETCH_ASSOC);
                    if ($existingUser) {
                        $response['status'] = '200';
                        $response['message'] = 'UserId fetched successfully';
                        $response['userId'] = $existingUser['userId'];
                    } else {
                        $response['status'] = '400';
                        $response['message'] = 'No user found for the selected chat';
                    }
                } else {
                    $response['status'] = '500';
                    $response['message'] = 'Error fetching userId';
                }
            }
        }
    }
}

if (isset($decodedParams->scope) && !empty($decodedParams->scope)) {
    if ($decodedParams->scope == 'user') {
        if (isset($decodedParams->action) && !empty($decodedParams->action)) {
            if ($decodedParams->action == 'getUsers') {
                $stmt = $dbh->prepare("SELECT userId, userName FROM user WHERE userIsActive = 1");

                if ($stmt->execute()) {
                    $response['status'] = '200';
                    $response['message'] = 'Users fetched successfully';
                    $response['data'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
                } else {
                    $response['status'] = '500';
                    $response['message'] = 'Users could not be fetched';
                    echo json_encode($response);
                    exit;
                };
            }
        }
    }
}

if (isset($decodedParams->scope) && !empty($decodedParams->scope)) {
    if ($decodedParams->scope == 'user') {
        if (isset($decodedParams->action) && !empty($decodedParams->action)) {
            if ($decodedParams->action == 'changeUserName') {
                $userId = $decodedParams->userId;
                $userName = $decodedParams->userName;

                $stmt = $dbh->prepare("UPDATE user SET userName = :userName WHERE userId = :userId");
                $stmt->bindParam(':userId', $userId);
                $stmt->bindParam(':userName', $userName);

                if ($stmt->execute()) {
                    $response['status'] = '200';
                    $response['message'] = 'User name changed successfully';
                } else {
                    $response['status'] = '500';
                    $response['message'] = 'User name could not be changed';
                    echo json_encode($response);
                    exit;
                };
            }
        }
    }
}

if (isset($decodedParams->scope) && !empty($decodedParams->scope)) {
    if ($decodedParams->scope == 'user') {
        if (isset($decodedParams->action) && !empty($decodedParams->action)) {
            if ($decodedParams->action == 'addUser') {
                $userId = generateRandomString(4);
                $userName = $decodedParams->userName;
                $stmt = $dbh->prepare("INSERT INTO user (userId, userName, userCreateDate) VALUES (:userId, :userName, :userCreateDate)");
                $stmt->bindParam(':userId', $userId);
                $stmt->bindParam(':userName', $userName);
                $stmt->bindParam(':userCreateDate', $var['timestamp']);
                if ($stmt->execute()) {
                    $response['status'] = '200';
                    $response['message'] = 'Users Added successfully';
                } else {
                    $response['status'] = '500';
                    $response['message'] = 'Users could not be added';
                    echo json_encode($response);
                    exit;
                };
            }
        }
    }
}

if (isset($decodedParams->scope) && !empty($decodedParams->scope)) {
    if ($decodedParams->scope == 'screen') {
        if (isset($decodedParams->action) && !empty($decodedParams->action)) {
            if ($decodedParams->action == 'getScreenByUserId') {
                $userId = $decodedParams->userId;
                $stmt = $dbh->prepare("SELECT screenId FROM screens WHERE screenEntityId = :userId AND screenIsActive = 1");
                $stmt->bindParam(':userId', $userId);

                if ($stmt->execute()) {
                    $existingScreen = $stmt->fetch(PDO::FETCH_ASSOC);
                    if ($existingScreen) {
                        $response['status'] = '200';
                        $response['message'] = 'Screen fetched successfully';
                        $response['screenId'] = $existingScreen['screenId'];
                    } else {
                        $response['status'] = '400';
                        $response['message'] = 'No screen found for the selected user';
                    }
                } else {
                    $response['status'] = '500';
                    $response['message'] = 'Error fetching screen';
                }
            }
        }
    }
}

echo json_encode($response);
exit;
