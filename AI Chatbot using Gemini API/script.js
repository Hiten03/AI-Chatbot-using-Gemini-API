const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;
const API_KEY = "AIzaSyAw6cT4CfwNwuVkjaky4lYZa7tFBo7La9M";

const loadDataFromLocalStorage = () => {
    const themeColor = localStorage.getItem("theme-color");
    
    document.body.classList.toggle("light-mode", themeColor === "light_mode"); 
    localStorage.setItem("theme-color", themeButton.innerText); 
    themeButton.textContent = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    const defaultText = `<div class="default-text">
                            <h1>Welcome to the Chatbot!</h1>
                            <p>Type your message below and click send to start chatting.</p>
                        </div>`;

    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText; //Load chat data from local storage if available
    chatContainer.scrollTo(0, chatContainer.scrollHeight); //Scroll to the bottom of the chat container
}

loadDataFromLocalStorage();

const createElement = (html, className) => {
    //Function to create a chat div with the provided HTML and className
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = html;
    return chatDiv; //Return the created chat div 
}

const getChatResponse = async (incomingChatDiv) => {
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const pElement = document.createElement("p");

    //Fetch request to OpenAI API to get the response for the user input
    //Define the properties and data for the API request
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        { text: userText }
                    ]
                }
            ]
        }),
    };

    //Sent POST request to API, get response and set the response as paragraph element text
    try {
        const response = await fetch(API_URL, requestOptions);
        const result = await response.json();

        const content = result?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
        pElement.textContent = content.replace(/\*\*(.*?)\*\*/g, '$1');
    } catch (error) {
        pElement.classList.add("error"); //Add error class to paragraph element if there is an error
        pElement.textContent = "Oops! Something went wrong.";
    }

    //Remove the typing animation div and append the paragraph element to the chat details div
    incomingChatDiv.querySelector(".typing-animation").remove(); //Remove the typing animation div from the incoming chat div
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement); //Append the paragraph element to the chat details div
    chatContainer.scrollTo(0, chatContainer.scrollHeight); //Scroll to the bottom of the chat container
    localStorage.setItem("all-chats", chatContainer.innerHTML); //Store the chat container innerHTML in local storage
}

const copyResponse = (copyBtn) => {
    //Function to copy the response text to clipboard when the copy button is clicked
    const responseTextElement = copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(responseTextElement.textContent);
    copyBtn.textContent = "done";
    setTimeout(() => copyBtn.textContent = "content_copy", 1000); //Get the text content of the previous sibling element (the paragraph element)
}

const showTypingAnimation = () => {
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="/images/chatbot.jpg" alt="chatbot-img">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
            </div>`;

    //Create a chat div with the HTML and className "outgoing"        
    const incomingChatDiv = createElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight); //Scroll to the bottom of the chat container
    getChatResponse(incomingChatDiv); //Call getChatResponse function to get the response from the chatbot
}

const handleOutgoingChat = () => {
    userText = chatInput.value.trim();
    if (!userText) return; //If userText is empty, do not proceed

    const html = `<div class="chat-content">
        <div class="chat-details">
            <img src="/images/user.jpg" alt="user-img">
            <p></p>
        </div>
    </div>`;

    const outgoingChatDiv = createElement(html, "outgoing");
    outgoingChatDiv.querySelector("p").textContent = userText; //Set the user input text in the paragraph element
    document.querySelector(".default-text")?.remove(); //Remove the default text if it exists
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight); //Scroll to the bottom of the chat container
    chatInput.value = "";
    setTimeout(showTypingAnimation, 500);
};

themeButton.addEventListener("click", () => {
    //Toggle light mode on button click and store the theme color in local storage
    document.body.classList.toggle("light-mode"); //Toggle light theme on button click
    localStorage.setItem("theme-color", themeButton.innerText); //Store the theme color in local storage
    themeButton.textContent = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode"; //Change button text based on theme
});

deleteButton.addEventListener("click", () => {
    //Confirm before deleting all chats
    if(confirm("Are you sure you want to delete all chats?")) {
        localStorage.removeItem("all-chats"); //Remove all-chats from local storage
        loadDataFromLocalStorage(); //Reload the chat container to reflect the changes
    }
});

chatInput.addEventListener("keypress", (event) => {
    //Handle Enter key press to send chat
    if (event.key === "Enter") {
        event.preventDefault(); //Prevent default behavior of Enter key
        handleOutgoingChat(); //Call handleOutgoingChat function to send chat
    }
});

chatInput.addEventListener("input", () => {
    //Enable or disable send button based on input value
    sendButton.disabled = !chatInput.value.trim(); //Disable send button if chat input is empty
});

const initialHeight = chatInput.scrollHeight; //Store the initial height of the chat input

chatInput.addEventListener("input", () => {
    chatInput.computedStyleMap.height = `${initialHeight}px`; //Reset height to initial height
    chatInput.computedStyleMap.height = `${chatInput.scrollHeight}px`; //Set height to scroll height
});

sendButton.addEventListener("click", handleOutgoingChat);