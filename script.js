document.addEventListener("DOMContentLoaded", async function () {
  const userProfile = document.querySelector(".user-profile");
  userProfile.addEventListener("click", function () {
    document.getElementById("userImageInput").click();
  });

  document
    .getElementById("userImageInput")
    .addEventListener("change", async function (event) {
      const file = event.target.files[0];

      if (file) {
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "ajax.php");

        const newFormData = new FormData();
        newFormData.append("file", file);
        newFormData.append("userId", "239B");
        newFormData.append("scope", "user");
        newFormData.append("action", "uploadOwnUserImage");

        xhr.onload = async function () {
          if (xhr.status === 200) {
            const screenImage = await getScreenImage("239B");
            const profilePictureImg = document.querySelector(".user-profile");
            profilePictureImg.src = "images/" + screenImage + ".png";
          } else {
            console.error("Request failed with status:", xhr.status);
          }
        };

        xhr.send(newFormData);
      }
    });

  const toggleButton = document.querySelector(".dark-light");
  const colors = document.querySelectorAll(".color");
  const storedTheme = localStorage.getItem("selectedTheme");

  if (storedTheme) {
    document.body.setAttribute("data-theme", storedTheme);
    const selectedColor = document.querySelector(
      `[data-color="${storedTheme}"]`
    );
    if (selectedColor) {
      selectedColor.classList.add("selected");
    }
  }

  colors.forEach((color) => {
    color.addEventListener("click", (e) => {
      colors.forEach((c) => c.classList.remove("selected"));
      const theme = color.getAttribute("data-color");
      document.body.setAttribute("data-theme", theme);
      color.classList.add("selected");

      localStorage.setItem("selectedTheme", theme);
    });
  });

  const isDarkMode = localStorage.getItem("darkMode") === "true";

  if (isDarkMode) {
    document.body.classList.add("dark-mode");
  }

  toggleButton.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    localStorage.setItem(
      "darkMode",
      document.body.classList.contains("dark-mode")
    );
  });

  const messageInput = document.getElementById("messageInput");
  const chatAreaMain = document.querySelector(".chat-area-main");

  messageInput.addEventListener("keypress", async function (event) {
    if (event.key === "Enter") {
      const message = messageInput.value.trim();

      if (message !== "") {
        const ownerMsgDiv = document.createElement("div");
        ownerMsgDiv.classList.add("chat-msg", "js-chat-msg", "owner");

        const chatMsgProfile = document.createElement("div");
        chatMsgProfile.classList.add("chat-msg-profile");

        const screenImage = await getScreenImage("239B");

        const chatMsgImg = document.createElement("img");
        chatMsgImg.classList.add("chat-msg-img");
        chatMsgImg.src = "images/" + screenImage + ".png";

        const chatMsgDate = document.createElement("div");
        chatMsgDate.classList.add("chat-msg-date");
        const currentTime = new Date();
        const hours = currentTime.getHours();
        const minutes = currentTime.getMinutes();

        const formattedTime = formatTime(hours, minutes);

        chatMsgDate.textContent = `Message send ${formattedTime}`;

        const chatMsgContentDiv = document.createElement("div");
        chatMsgContentDiv.classList.add("chat-msg-content");

        const newMessage = document.createElement("div");
        newMessage.classList.add("chat-msg-text-owner");
        newMessage.textContent = message;

        chatAreaMain.appendChild(ownerMsgDiv);
        ownerMsgDiv.scrollIntoView({ behavior: "smooth", block: "end" });
        ownerMsgDiv.appendChild(chatMsgProfile);
        chatMsgProfile.appendChild(chatMsgImg);
        chatMsgProfile.appendChild(chatMsgDate);
        ownerMsgDiv.appendChild(chatMsgContentDiv);
        chatMsgContentDiv.appendChild(newMessage);

        messageInput.value = "";

        setTimeout(() => {
          insertMessage();
        }, 2000);

        const chatId = localStorage.getItem("chatId");

        const messageOwner = "owner";

        sendMessage(message, messageOwner, chatId);
        showLatestMessage(message, chatId);
      }
    }
  });

  let fakeMessageIndices =
    JSON.parse(localStorage.getItem("fakeMessageIndices")) || {};

  async function insertMessage() {
    var fake = [
      "Hi there, I'm Fabio and you?",
      "Nice to meet you",
      "How are you?",
      "Not too bad, thanks",
      "What do you do?",
      "That's awesome",
      "Codepen is a nice place to stay",
      "I think you're a nice person",
      "Why do you think that?",
      "Can you explain?",
      "Anyway I've gotta go now",
      "It was a pleasure chat with you",
      "Time to make a new codepen",
      "Bye",
      ":)",
    ];

    const chatId = localStorage.getItem("chatId");

    let fakeMessageIndex = fakeMessageIndices[chatId] || 0;

    const call = await fetch("ajax.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scope: "message",
        action: "getMessages",
        chatId: chatId,
      }),
    });

    const response = await call.json();

    if (response.status === "200") {
      const getUserId = await fetch("ajax.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scope: "user",
          action: "getUserId",
          chatId: chatId,
        }),
      });

      const userIdData = await getUserId.json();
      const userId = userIdData.userId;

      const screenId = await getScreenImage(userId);

      const fakeMessage = fake[fakeMessageIndex];

      fakeMessageIndex = (fakeMessageIndex + 1) % fake.length;

      fakeMessageIndices[chatId] = fakeMessageIndex;

      localStorage.setItem(
        "fakeMessageIndices",
        JSON.stringify(fakeMessageIndices)
      );

      const msgDiv = document.createElement("div");
      msgDiv.classList.add("chat-msg", "js-chat-msg");

      const chatMsgProfile = document.createElement("div");
      chatMsgProfile.classList.add("chat-msg-profile");

      const chatMsgImg = document.createElement("img");
      chatMsgImg.classList.add("chat-msg-img");
      chatMsgImg.src = "images/" + screenId + ".png";

      const chatMsgDate = document.createElement("div");
      chatMsgDate.classList.add("chat-msg-date");

      const currentTime = new Date();
      const hours = currentTime.getHours();
      const minutes = currentTime.getMinutes();

      const formattedTime = formatTime(hours, minutes);

      chatMsgDate.textContent = `Message send ${formattedTime}`;

      const chatMsgContentDiv = document.createElement("div");
      chatMsgContentDiv.classList.add("chat-msg-content");

      const newMessage = document.createElement("div");
      newMessage.classList.add("chat-msg-text-bot");
      newMessage.textContent = fakeMessage;

      chatAreaMain.appendChild(msgDiv);
      msgDiv.scrollIntoView({ behavior: "smooth", block: "end" });
      msgDiv.appendChild(chatMsgProfile);
      chatMsgProfile.appendChild(chatMsgImg);
      chatMsgProfile.appendChild(chatMsgDate);
      msgDiv.appendChild(chatMsgContentDiv);
      chatMsgContentDiv.appendChild(newMessage);

      const messageOwner = "bot";

      sendMessage(fakeMessage, messageOwner, chatId);
      showLatestMessage(fakeMessage, chatId);
    }
  }

  async function getScreenImage(userId) {
    const getScreenId = await fetch("ajax.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scope: "screen",
        action: "getScreenByUserId",
        userId: userId,
      }),
    });

    const screenAnswer = await getScreenId.json();

    if (screenAnswer.status === "200") {
      return screenAnswer.screenId;
    }
  }

  async function sendMessage(message, messageOwner, chatId) {
    const call = await fetch("ajax.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scope: "message",
        action: "sendMessage",
        messageContent: message,
        chatId: chatId,
        messageOwner: messageOwner,
      }),
    });

    const response = await call.json();
  }

  async function fetchChats() {
    const call = await fetch("ajax.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scope: "chat",
        action: "getChats",
      }),
    });

    const response = await call.json();

    if (response.status === "200") {
      return response.data; 
    } else {
      throw new Error("Failed to fetch chats");
    }
  }

  const clickHandler = function () {
    document.getElementById("fileInput").click();
  };

  document
    .querySelector(".profile-picture")
    .addEventListener("click", clickHandler);

  async function fileInputChangeHandler(event, userId) {
    const file = event.target.files[0];
    var chatId = localStorage.getItem("chatId");
    const getUserId = await fetch("ajax.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scope: "user",
        action: "getUserId",
        chatId: chatId,
      }),
    });

    const userIdData = await getUserId.json();
    var userId = userIdData.userId;

    console.log(userId);

    if (file) {
      let xhr = new XMLHttpRequest();
      xhr.open("POST", "ajax.php");

      const newFormData = new FormData();
      newFormData.append("file", file);
      newFormData.append("userId", userId);
      newFormData.append("scope", "user");
      newFormData.append("action", "uploadUserImage");

      xhr.onload = function () {
        if (xhr.status === 200) {
          var response = JSON.parse(xhr.responseText);
          screenId = response.screenId;
          const userChat = document.querySelector(`.js-chat-${chatId}`);
          const userChatImg = userChat.querySelector(".msg-img");
          userChatImg.src = "images/" + screenId + ".png";
          drawMessages(chatId);
        } else {
          console.error("Request failed with status:", xhr.status);
        }
      };

      xhr.send(newFormData);
      document.getElementById("fileInput").value = "";
      document.querySelector(".profile-picture").removeEventListener("click", clickHandler);
      event.target.files[0] = "";

    }
  }

  document
    .getElementById("fileInput")
    .addEventListener("change", fileInputChangeHandler);

  async function drawMessages(chatId) {
    const call = await fetch("ajax.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scope: "message",
        action: "getMessages",
        chatId: chatId,
      }),
    });

    const response = await call.json();

    if (response.status === "200") {
      var allChatMsg = document.querySelectorAll(".js-chat-msg");
      if (allChatMsg[0]) {
        allChatMsg.forEach(function (chatMsg) {
          chatMsg.remove();
        });
      }

      const chatId = localStorage.getItem("chatId");
      const chatName = document.querySelector(`.js-chat-${chatId}`);

      const chatArea = document.querySelector(".chat-area");
      const chatAreaHeader = document.querySelector(".chat-area-header");
      const chatAreaMain = document.querySelector(".chat-area-main");
      const chatAreaFooter = document.querySelector(".chat-area-footer");

      const msgUsername = chatName.querySelector(".msg-username");
      const detailTitle = document.querySelector(".detail-title");
      detailTitle.textContent = msgUsername.textContent;

      const chatHeaderTitle = chatAreaHeader.querySelector(".chat-area-title");
      chatHeaderTitle.textContent = msgUsername.textContent;

      const chat = await fetch("ajax.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scope: "chat",
          action: "getChatById",
          chatId: chatId,
        }),
      });

      const answerChat = await chat.json();

      const unixTimestamp = answerChat.data[0].chatCreatedate;

      const date = new Date(unixTimestamp * 1000); 

      const options = { day: "numeric", month: "long", year: "numeric" };
      const formattedDate = date.toLocaleDateString("en-GB", options);

      const detailArea = document.querySelector(".detail-area");
      const detailCreateDate = detailArea.querySelector(".detail-subtitle");
      detailCreateDate.textContent = `Created on ${formattedDate}`;

      const profilePicture = document.getElementById("profilePicture");
      const profilePictureImg =
        profilePicture.querySelector(".profile-picture");

      profilePictureImg.addEventListener("click", clickHandler);

      const getUserId = await fetch("ajax.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scope: "user",
          action: "getUserId",
          chatId: chatId,
        }),
      });

      const userIdData = await getUserId.json();
      const userId = userIdData.userId;

      const getScreenId = await fetch("ajax.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scope: "screen",
          action: "getScreenByUserId",
          userId: userId,
        }),
      });

      const screenAnswer = await getScreenId.json();

      screenId = screenAnswer.screenId;

      profilePictureImg.src = "images/" + screenId + ".png";

      const getOwnerScreenId = await fetch("ajax.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scope: "screen",
          action: "getScreenByUserId", 
          userId: "239B",
        }),
      });

      var ownerScreenAnswer = await getOwnerScreenId.json();
      var ownerScreenId = ownerScreenAnswer.screenId;

      response.data.forEach(function (messageData) {
        if (messageData.messageOwner == "owner") {
          const ownerMsgDiv = document.createElement("div");
          ownerMsgDiv.classList.add("chat-msg", "js-chat-msg", "owner");

          const chatMsgProfile = document.createElement("div");
          chatMsgProfile.classList.add("chat-msg-profile");

          const chatMsgImgOwner = document.createElement("img");
          chatMsgImgOwner.classList.add("chat-msg-img", "img-owner");
          chatMsgImgOwner.src = "images/" + ownerScreenId + ".png";

          const chatMsgDate = document.createElement("div");
          chatMsgDate.classList.add("chat-msg-date");
          const currentTime = new Date();
          const hours = currentTime.getHours();
          const minutes = currentTime.getMinutes();
          const formattedTime = formatTime(hours, minutes);
          chatMsgDate.textContent = `Message send ${formattedTime}`;

          const chatMsgContentDiv = document.createElement("div");
          chatMsgContentDiv.classList.add("chat-msg-content");

          const newMessage = document.createElement("div");
          newMessage.classList.add("chat-msg-text-owner");
          newMessage.textContent = messageData.messageContent;

          chatArea.appendChild(chatAreaMain);
          chatAreaMain.appendChild(ownerMsgDiv);
          ownerMsgDiv.scrollIntoView({ behavior: "smooth", block: "end" });
          ownerMsgDiv.appendChild(chatMsgProfile);
          chatMsgProfile.appendChild(chatMsgImgOwner);
          chatMsgProfile.appendChild(chatMsgDate);
          ownerMsgDiv.appendChild(chatMsgContentDiv);
          chatMsgContentDiv.appendChild(newMessage);
        } else {
          const chatMsg = document.createElement("div");
          chatMsg.classList.add("chat-msg", "js-chat-msg");

          const chatMsgProfile = document.createElement("div");
          chatMsgProfile.classList.add("chat-msg-profile");

          const chatMsgImg = document.createElement("img");
          chatMsgImg.classList.add("chat-msg-img");
          chatMsgImg.src = "images/" + screenId + ".png";

          const chatMsgDate = document.createElement("div");
          chatMsgDate.classList.add("chat-msg-date");

          const unixTimestamp = messageData.messageCreateDate;

          const messageDate = new Date(unixTimestamp * 1000);

          const hours = messageDate.getHours();
          const minutes = messageDate.getMinutes();

          const formattedTime = formatTime(hours, minutes);

          chatMsgDate.textContent = `Message send ${formattedTime}`;

          const chatMsgContentDiv = document.createElement("div");
          chatMsgContentDiv.classList.add("chat-msg-content");

          var newMessage = document.createElement("div");
          newMessage.classList.add("chat-msg-text-bot");
          newMessage.textContent = messageData.messageContent;

          chatArea.appendChild(chatAreaMain);
          chatAreaMain.appendChild(chatMsg);
          chatMsg.scrollIntoView({ behavior: "smooth", block: "end" });
          chatMsg.appendChild(chatMsgProfile);
          chatMsgProfile.appendChild(chatMsgImg);
          chatMsgProfile.appendChild(chatMsgDate);
          chatMsg.appendChild(chatMsgContentDiv);
          chatMsgContentDiv.appendChild(newMessage);
        }
      });

      const emojiDrawer = document.createElement("div");
      emojiDrawer.classList.add("emoji-drawer", "hidden");
      emojiDrawer.innerHTML = `
        <div id="drawer" class="emoji-drawer">
          <div class="emoji" onclick="addEmoji(this.innerHTML)">😀</div>
          <div class="emoji" onclick="addEmoji(this.innerHTML)">😃</div>
          <div class="emoji" onclick="addEmoji(this.innerHTML)">😄</div>
          <div class="emoji" onclick="addEmoji(this.innerHTML)">😁</div>
          <div class="emoji" onclick="addEmoji(this.innerHTML)">😆</div>
          <div class="emoji" onclick="addEmoji(this.innerHTML)">😂</div>
          <div class="emoji" onclick="addEmoji(this.innerHTML)">😜</div>
          <div class="emoji" onclick="addEmoji(this.innerHTML)">😳</div>
          <div class="emoji" onclick="addEmoji(this.innerHTML)">🤢</div>
          <div class="emoji" onclick="addEmoji(this.innerHTML)">❤️</div>
          <div class="emoji" onclick="addEmoji(this.innerHTML)">💔</div>
          <div class="emoji" onclick="addEmoji(this.innerHTML)">✅</div>
          <div class="emoji" onclick="addEmoji(this.innerHTML)">🖕🏼</div>
          <div class="emoji" onclick="addEmoji(this.innerHTML)">👋🏼</div>
          <div class="emoji" onclick="addEmoji(this.innerHTML)">🖥️</div>
        </div>
      `;

      chatArea.appendChild(chatAreaFooter);
      chatArea.appendChild(emojiDrawer);
    }
  }

  function showLatestMessage(message, chatId) {
    const chatName = document.querySelector(`.js-chat-${chatId}`);
    chatName.querySelector(".msg-message").innerHTML = message;
  }

  async function getLatestMessages() {
    const call = await fetch("ajax.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scope: "message",
        action: "getLatestMessage",
      }),
    });

    const response = await call.json();

    if (response.status === "200") {
      return response.data;
    } else {
      throw new Error("Failed to fetch latest messages");
    }
  }

  async function createChatElement(chat) {
    const latestMessages = await getLatestMessages();
    const screenImage = await getScreenImage(chat.userId);

    const conversationArea = document.querySelector(".conversation-area");
    const newChat = document.createElement("div");
    newChat.classList.add(
      "msg",
      chat.chatStatus,
      "js-chat",
      `js-chat-${chat.chatId}`
    );
    // Add a line to remove the "active" class from all chat elements
    document.querySelectorAll(".js-chat").forEach((chatElement) => {
      chatElement.classList.remove("active");
    });

    const chatId = chat.chatId;
    newChat.onclick = function () {
      // Remove the "active" class from all chat elements
      document.querySelectorAll(".js-chat").forEach((chatElement) => {
        chatElement.classList.remove("active");
      });

      localStorage.setItem("chatId", chatId);

      newChat.classList.add("active");

      drawMessages(chatId);
    };

    const chatProfile = document.createElement("div");
    chatProfile.classList.add("msg-profile", "group");

    const chatIcon = document.createElement("img");
    chatIcon.classList.add("msg-img");
    chatIcon.src = "images/" + screenImage + ".png";

    chatProfile.appendChild(chatIcon);

    const chatDetail = document.createElement("div");
    chatDetail.classList.add("msg-detail");

    const userImageScreen = await getScreenImage("239B");

    const userProfileImg = document.querySelector(".user-profile");
    userProfileImg.src = "images/" + userImageScreen + ".png";

    const chatUsername = document.createElement("div");
    chatUsername.classList.add("msg-username");
    chatUsername.textContent = chat.chatName;

    const chatContent = document.createElement("div");
    chatContent.classList.add("msg-content");

    chatDetail.appendChild(chatUsername);
    chatDetail.appendChild(chatContent);

    newChat.appendChild(chatProfile);
    newChat.appendChild(chatDetail);

    conversationArea.insertBefore(newChat, conversationArea.firstChild); // Add new chat to the top

    const chatMessage = document.createElement("span");
    chatMessage.classList.add("msg-message");
    chatContent.appendChild(chatMessage);

    latestMessages.forEach((message) => {
      if (message.chatId === chat.chatId) {
        chatMessage.textContent = message.messageContent;
      }
    });
  }

  async function loadChats() {
    try {
      const chatList = await fetchChats();

      // Create chat elements based on the retrieved data
      chatList.forEach((chat) => {
        createChatElement(chat);
      });
      checkAndNavigateToChat();
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    }
  }

  var userCreateButton = document.querySelector(".createUserButton");
  var createUserForm = document.getElementById("createUserForm");
  var userName = document.getElementById("userName");
  var submitUserButton = document.getElementById("submitUser");

  userCreateButton.addEventListener("click", function () {
    var computedStyle = window.getComputedStyle(createUserForm);

    if (computedStyle.display === "none") {
      createUserForm.style.display = "block";
    } else {
      createUserForm.style.display = "none";
    }
  });

  submitUserButton.addEventListener("click", async function () {
    try {
      if (userName.value.trim() === "") {
        alert("Please enter a Name.");
        return;
      }

      const addUserCall = await fetch("ajax.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scope: "user",
          action: "addUser",
          userName: userName.value.trim(),
        }),
      });

      const addUserResponse = await addUserCall.json();

      if (addUserResponse.status === "200") {
        userName.value = "";
        const users = await getUsers();
        createButtons(users);
      } else {
        console.error("Failed to add a new user to the database");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  });

  // Get the modal
  var modal = document.getElementById("myModal");
  var btn = document.querySelector(".add");
  var span = document.getElementsByClassName("close")[0];

  // Function to create buttons based on user data
  function createButtons(users) {
    const userButtonsContainer = document.querySelector(".modal-content");

    // Remove only the dynamically created buttons
    const existingButtons = document.querySelectorAll(".user-button");
    existingButtons.forEach((button) => button.remove());

    users.forEach((user) => {
      const button = document.createElement("button");
      button.textContent = user.userName;
      button.classList.add("addUser", "user-button");
      button.addEventListener("click", async function () {
        try {
          const call = await fetch("ajax.php", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              scope: "chat",
              action: "getChatId",
              userId: user.userId,
            }),
          });

          const response = await call.json();

          if (response.status === "200" && response.data.chatId) {
            modal.style.display = "none";
            localStorage.setItem("chatId", response.data.chatId);
            checkAndNavigateToChat();
          } else {
            const addChatCall = await fetch("ajax.php", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                scope: "chat",
                action: "addChat",
                chatName: user.userName,
                chatStatus: "online",
                userId: user.userId,
              }),
            });

            const addChatResponse = await addChatCall.json();

            if (addChatResponse.status === "200") {
              modal.style.display = "none";
              const chat = document.querySelectorAll(".js-chat");
              chat.forEach((c) => c.remove());
              localStorage.setItem("chatId", addChatResponse.chatId);
              loadChats();
              checkAndNavigateToChat();
            } else {
              modal.style.display = "none";
              console.error("Failed to add a new chat to the database");
            }
          }
        } catch (error) {
          console.error("An error occurred:", error);
        }
      });

      userButtonsContainer.appendChild(button);
    });
  }
  btn.onclick = async function () {
    try {
      const users = await getUsers();
      createButtons(users);
      modal.style.display = "block";
    } catch (error) {
      console.error(error.message);
    }
  };

  span.onclick = function () {
    modal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  async function getUsers() {
    const call = await fetch("ajax.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scope: "user",
        action: "getUsers",
      }),
    });

    const response = await call.json();

    if (response.status === "200") {
      return response.data;
    } else {
      throw new Error("Failed to fetch users");
    }
  }

  function formatTime(hours, minutes) {
    const amPm = hours >= 12 ? "pm" : "am";
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${amPm}`;
  }

  // Function to check for chatId in localStorage and navigate to the chat
  function checkAndNavigateToChat() {
    const chatId = localStorage.getItem("chatId");
    if (chatId) {
      document.querySelectorAll(".js-chat").forEach((chatElement) => {
        chatElement.classList.remove("active");
      });

      let lookForOtherElement = setInterval(function () {
        const element = document.querySelector(`.js-chat-${chatId}`);
        if (typeof element != "undefined" && element != null) {
          element.classList.add("active");
          // Call drawMessages with the chatId
          drawMessages(chatId);
          clearInterval(lookForOtherElement);
        }
      }, 1);
    }
  }
  loadChats();
});

function addEmoji(emoji) {
  let inputEle = document.getElementById("messageInput");

  inputEle.value += emoji;
}

function toggleEmojiDrawer() {
  let drawer = document.querySelector(".emoji-drawer");

  if (drawer.classList.contains("hidden")) {
    drawer.classList.remove("hidden");
  } else {
    drawer.classList.add("hidden");
  }
}

function toggleName() {
  const divDetailTitle = document.querySelector(".detail-title");
  const divDetailTitleValue = divDetailTitle.innerHTML;
  divDetailTitle.style.display = "none";

  const divDetailTitleInput = document.querySelector(".changeUserName");
  divDetailTitleInput.style.display = "block";
  divDetailTitleInput.value = divDetailTitleValue;
}

async function changeUserName() {
  const divDetailTitle = document.querySelector(".detail-title");
  const divDetailTitleInput = document.querySelector(".changeUserName");
  const divDetailTitleInputValue = divDetailTitleInput.value;

  const chatId = localStorage.getItem("chatId");

  const getUserId = await fetch("ajax.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      scope: "user",
      action: "getUserId",
      chatId: chatId,
    }),
  });

  const userIdData = await getUserId.json();
  const userId = userIdData.userId;

  const changeUserName = await fetch("ajax.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      scope: "user",
      action: "changeUserName",
      userId: userId,
      userName: divDetailTitleInputValue,
    }),
  });

  const changeUserNameData = await changeUserName.json();

  if (changeUserNameData.status === "200") {
    const changeChatName = await fetch("ajax.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scope: "chat",
        action: "changeChatName",
        chatId: chatId,
        chatName: divDetailTitleInputValue,
      }),
    });
    const changeChatNameData = await changeChatName.json();
    if (changeChatNameData.status === "200") {
      const chatName = document.querySelector(`.js-chat-${chatId}`);
      const chatDetail = chatName.querySelector(".msg-detail");
      const chatUsername = chatDetail.querySelector(".msg-username");
      const chatAreaTitle = document.querySelector(".chat-area-title");
      chatAreaTitle.textContent = divDetailTitleInputValue;
      chatUsername.textContent = divDetailTitleInputValue;
    }
    divDetailTitle.innerHTML = divDetailTitleInputValue;
    divDetailTitle.style.display = "block";

    divDetailTitleInput.style.display = "none";
  } else {
    console.error("Failed to change user name");
  }
}
