import { IoMdSend } from "react-icons/io";

export default defineContentScript({
  matches: ['*://*.linkedin.com/*'],
  main() {
    console.log('LinkedIn Magic Stick Extension activated');

    function createPromptModal(): void {

      const backdrop = document.createElement('div');
      backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(5px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      `;


      const modal = document.createElement('div');
      modal.style.cssText = `
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
        width: 500px;
        display: flex;
        flex-direction: column;
        max-height: 60vh;
      `;
      backdrop.appendChild(modal);


      const textarea = document.createElement('textarea');
      textarea.placeholder = 'Type your message...';
      textarea.style.cssText = `
        width: 100%;
        height: 100px;
        padding: 10px;
        border-radius: 5px;
        border: 1px solid #ccc;
        margin-bottom: 10px;
        resize: none;
      `;
      modal.appendChild(textarea);


      const generateButton = document.createElement('button');

      generateButton.innerHTML = "Generate &#x27A2;";


      generateButton.style.cssText = `
        background-color: #0077b5;
        color: white;
        border: none;
        border-radius: 5px;
        padding: 10px 20px;
        cursor: pointer;
        align-self: flex-end;
      `;
      modal.appendChild(generateButton);

      let generatedMessage = '';

      function showChatInterface(): void {

        modal.innerHTML = '';


        const chatBox = document.createElement('div');
        chatBox.style.cssText = `
          flex-grow: 1;
          overflow-y: auto;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          margin-bottom: 10px;
          max-height: 200px;
        `;
        modal.appendChild(chatBox);


        modal.appendChild(textarea);


        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
          display: flex;
          justify-content: right;
        `;
        modal.appendChild(buttonContainer);


        const regenerateButton = document.createElement('button');
        regenerateButton.innerHTML = '&#x27F3; Regenerate';
        regenerateButton.style.cssText = `
          background-color: #0077b5;
          color: white;
          border: none;
          border-radius: 5px;
          padding: 10px 15px;
          cursor: pointer;
         
        `;
        buttonContainer.appendChild(regenerateButton);


        const insertButton = document.createElement('button');
        insertButton.innerHTML = '&#x21e9; Insert';
        insertButton.style.cssText = `
          background-color: transparent;
          color: black;
          border: 1pt solid black;
          border-radius: 5px;
          padding: 10px 15px;
          cursor: pointer;
          margin-left:3px;
        `;
        buttonContainer.appendChild(insertButton);

        function addMessageToChatBox(sender: 'You' | 'AI', message: string): void {
          const messageElement = document.createElement('div');
          messageElement.style.cssText = `
            margin-bottom: 10px;
            padding: 5px 10px;
            border-radius: 10px;
            max-width: 70%;
            ${sender === 'You' ? 'margin-left: auto; background-color: #d2d3d4;' : 'background-color: #b6dff0;'}
          `;
          messageElement.textContent = `${message}`;
          chatBox.appendChild(messageElement);
          chatBox.scrollTop = chatBox.scrollHeight;
        }

     
        addMessageToChatBox('You', textarea.value.trim());
        addMessageToChatBox('AI', generatedMessage);

        regenerateButton.onclick = () => {
          generatedMessage = "Thank you for the opportunity! If you have any more questions or if there's anything else I can help you with, feel free to ask.";
          addMessageToChatBox('AI', generatedMessage);
        };

        insertButton.onclick = () => {
          const messageBox = document.querySelector('.msg-form__contenteditable');
          if (messageBox instanceof HTMLElement) {
            messageBox.innerHTML = '';
            const paragraph = document.createElement('p');
            paragraph.textContent = generatedMessage;
            messageBox.appendChild(paragraph);
            // messageBox.textContent = generatedMessage;
            const inputEvent = new Event('input', { bubbles: true, cancelable: true });
            messageBox.dispatchEvent(inputEvent);


            console.log(`Inserted "${generatedMessage}" into the LinkedIn message box.`);
            backdrop.remove();
          } else {
            console.log('Message box not found!');
          }
        };
      }

      generateButton.onclick = () => {
        const inputText = textarea.value.trim();
        if (!inputText) return;

        generatedMessage = "Thank you for the opportunity! If you have any more questions or if there's anything else I can help you with, feel free to ask.";
        showChatInterface();
      };

      document.body.appendChild(backdrop);
    }


    function createMagicStickButton() {
      const button = document.createElement('button');
      button.innerHTML = '🪄';
      button.style.cssText = `
        position: absolute;
        right: 10px;
        top: 70%;
        transform: translateY(-50%);
        background-color: white;
        color: blue;
        border: none;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        font-size: 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      button.title = 'Magic Stick';


      button.onclick = () => {
        console.log('Magic stick clicked!');
        createPromptModal();
      };
      return button;
    }

    function injectMagicStickButton() {
      const messageBoxes = document.querySelectorAll('.msg-form__contenteditable');

      messageBoxes.forEach((box) => {
        let button: HTMLButtonElement | undefined; // Explicitly define the type

        // Show the button on focus/click
        box.addEventListener('focus', () => {
          const existingButton = box.parentElement?.querySelector('.magic-stick-button');
          if (!existingButton) {
            button = createMagicStickButton();
            button.classList.add('magic-stick-button');
            box.parentElement?.appendChild(button);

           
            button.addEventListener('mousedown', (e) => {
              e.stopPropagation(); 
            });
          }
        });


        box.addEventListener('focusout', (e) => {
          const focusEvent = e as FocusEvent
          const relatedTarget = focusEvent.relatedTarget as HTMLElement | null;
          if (!relatedTarget || !relatedTarget.classList.contains('magic-stick-button')) {
            if (button) {
              button.remove(); // Remove the button on focusout
              button = undefined; // Clear the reference
            }
          }
        });
      });
    }



  
    injectMagicStickButton();


    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        injectMagicStickButton();
      }
    }).observe(document, { subtree: true, childList: true });
  },
});
