//import { TestDisposableElement } from './elements/test-disposable.js';
import { ChatElement } from './elements/chat-view.js';


const chatView = new ChatElement();
document.body.append(chatView);


const q = document.getElementById('view');
const cv = /** @type {ChatElement} */ (q);

const updateChatButton = /** @type {HTMLButtonElement} */ (document.getElementById('chatButton'));

updateChatButton.addEventListener('click', (event) => {
  const number = Math.floor((36 ** 6) * Math.random())
  const chat = number.toString(36);
  chatView.chat = chat;
});
