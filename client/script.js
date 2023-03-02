import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

function loader(elem) {
  elem.textContent = "";

  loadInterval = setInterval(() => {
    elem.textContent += ".";

    if (elem.textContent.length > 3) elem.textContent = "";
  }, 300);
}

function typeText(elem, text) {
  let index = 0;

  let intervalId = setInterval(() => {
    if (index < text.length) {
      elem.textContent += text.charAt(index);

      let shouldScroll = chatContainer.clientHeight <= elem.clientHeight;
      if (shouldScroll) {
        elem.scrollIntoView(false);
      }

      console.log("scrollTop:", chatContainer.scrollTop);
      console.log("scrollHeight: ", chatContainer.scrollHeight);
      index++;
    } else {
      clearInterval(intervalId);
    }
  }, 20);
}

//

function generatgeUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);
  return `id-${timestamp}=${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return `
    <div class="wrapper ${isAi && "ai"}">
      <div class="chat">
        <div class="profile">
          <img src="${isAi ? bot : user}" alt="${isAi ? "bot" : "user"}">
        </div>
        <div class="message" id="${uniqueId}">${value}</div>
      </div>
    </div>
    `;
}

async function handleSubmit(e) {
  e.preventDefault();

  const data = new FormData(form);
  const input = form.children[0];
  input.value = "";

  // user message
  chatContainer.innerHTML += chatStripe(false, data.get("propmpt"));

  // ai message
  const uniqueId = generatgeUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop += chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  // fetch response
  const response = await fetch("http://localhost:5000", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("propmpt"),
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {
    const error = await response.text();

    messageDiv.innerHTML = "Something went wrong :(";
    alert(error);
  }
}

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.key === "Enter") handleSubmit(e);
});
