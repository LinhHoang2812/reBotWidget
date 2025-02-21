(function(window, document) {
  // Define our ChatWidget object
  const ChatWidget = {
    openChat: false,
    streaming: false,
    messages: [],
    thinking: false,
    chats: [],

    init: function(config = {}) {
      // Optionally allow overriding defaults via config
      ChatWidget.openChat = config.openChat || false;
      ChatWidget.messages = [];
      ChatWidget.chats = [];
      
      // Load external Font Awesome stylesheet if not already loaded
      if (!document.querySelector('link[href*="font-awesome"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
        link.integrity = 'sha512-1ycn6IcaQQ40/MKBW2W4Rhis/DbILU74C1vSrLJxCq57o941Ym01SwNsOMqvEBFlcgUa6xLiPY/NS5R+E6ztJQ==';
        link.crossOrigin = 'anonymous';
        link.referrerPolicy = 'no-referrer';
        document.head.appendChild(link);
      }

      // Insert custom styles
      const styles = `
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@100..800&display=swap');

        /* Use widget-container instead of chat-container */
        #widget-container { 
            font-family: 'Sora', sans-serif;
            font-weight: 200;
            font-size: 14px;
        }
        textarea::-webkit-scrollbar {
            width: 5px;
        }
        textarea::-webkit-scrollbar-thumb {
            -webkit-border-radius: 10px;
            border-radius: 1rem;
            background: rgb(216, 216, 216);
            -webkit-box-shadow: inset 0 0 6px rgba(183, 183, 183, 0.5);
        }
        .textarea-container {
            -webkit-clip-path: inset(0 0 0 0 round 16px);
            clip-path: inset(0 0 0 0 round 16px);
            border-radius: 1rem;
            width: 100%;
            overflow: hidden;
            border-width: 1px;
            border-style: solid;
            border-color: #9ca3af;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
        } 
        .chat{
            height:100%;
            overflow-y:auto;
        }
        .chat::-webkit-scrollbar {
            width: 5px;
        }
        .chat::-webkit-scrollbar-thumb {
            -webkit-border-radius: 10px;
            border-radius: 10px;
            background: rgb(216, 216, 216);
            -webkit-box-shadow: inset 0 0 6px rgba(183, 183, 183, 0.5);
        } 
        .dot-typing {
            position: relative;
            left: -9999px;
            width: 10px;
            height: 10px;
            border-radius: 5px;
            background-color: red;
            color: red;
            box-shadow: 9984px 0 0 0 red, 9999px 0 0 0 white, 10014px 0 0 0 blue;
            animation: dot-typing 1.2s infinite linear;
        }
        @keyframes dot-typing {
            0% {
                box-shadow: 9984px 0 0 0 red, 9999px 0 0 0 white, 10014px 0 0 0 blue;
            }
            16.667% {
                box-shadow: 9984px -10px 0 0 red, 9999px 0 0 0 white, 10014px 0 0 0 blue;
            }
            33.333% {
                box-shadow: 9984px 0 0 0 red, 9999px 0 0 0 white, 10014px 0 0 0 blue;
            }
            50% {
                box-shadow: 9984px 0 0 0 red, 9999px -10px 0 0 white, 10014px 0 0 0 blue;
            }
            66.667% {
                box-shadow: 9984px 0 0 0 red, 9999px 0 0 0 white, 10014px 0 0 0 blue;
            }
            83.333% {
                box-shadow: 9984px 0 0 0 red, 9999px 0 0 0 white, 10014px -10px 0 0 blue;
            }
            100% {
                box-shadow: 9984px 0 0 0 red, 9999px 0 0 0 white, 10014px 0 0 0 blue;
            }
        }  
        .fixed-chatbox {
            position: fixed;
            right: 0.5rem;
            width: 250px;
            bottom: 1rem;
            border-radius: 0.5rem;
            background-color: black;
            cursor: pointer;
            transform: translateZ(0);
        } 
        .relative-chatbox {
            position: relative;
            padding: 0.75rem;
            width: 100%;
            display: flex;
            gap: 0.5rem;
            align-items: center;
            justify-content: space-between;
        } 
        .triangle {
            position: absolute;
            right: 0;
            top: -8px; 
            width: 0;
            height: 0; 
            border-left: 25px solid transparent; 
            border-bottom: 15px solid black;
            transform: rotate(3deg);
        } 
        .fixed-chat {
            position: fixed;
            right: 0.5rem;
            bottom: 0;
            width: 450px;
            height: 450px;
            border-top-left-radius: 0.5rem;
            border-top-right-radius: 0.5rem;
            background-color: white;
            display: flex;
            flex-direction: column;
            border-width: 1px;
            border-style: solid;
            border-color: #d1d5db;
        } 
        .sticky-header {
            position: sticky;
            left: 0;
            top: 0;
            width: 100%;
            border-top-left-radius: 0.5rem;
            border-top-right-radius: 0.5rem;
            background-color: black;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(209, 213, 219, 1);
        } 
        .flex-header {
            padding: 0.5rem;
            width: 100%;
            display: flex;
            gap: 0.5rem;
            align-items: center;
            justify-content: space-between;
        } 
        .chat-ui-container {
            margin-top: 1rem;
            flex: 1;
            height: 100%;
            overflow: hidden;
        } 
        .messages-container {
            padding: 0.5rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        } 
        .message-div { 
            padding: 0.5rem;
            width: fit-content;
            height: fit-content;
            max-width: 70%;
            border-radius: 0.5rem;
        } 
        .ai-message-div { 
            align-self: flex-start;
            background-color: black;
            color: white;
        } 
        .human-message-div { 
            align-self: flex-end;
            border-width: 1px;
            border-style: solid;
            border-color: black;
        } 
        .thinking-div { 
            position: relative;
            width: 10rem;
            height: 2.5rem;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 0.5rem;
            background-color: black;
        } 
        .form { 
            padding: 1rem;
            display: flex;
            gap: 0.5rem;
            background-color: white;
        } 
        .form-div {  
            width: 95%;
            display: flex;
            align-items: center;
        } 
        #chat-input { 
            resize: none;
            border: none;
            width: 100%;
            padding: 0.5rem;
            min-height: 2.5rem;
            max-height: 7rem;
            height: auto;
            outline: none;
            font-size: 0.875rem;
        }
        #chat-input:focus { 
            outline: none;
        }
      `;
      const styleSheet = document.createElement('style');
      styleSheet.type = 'text/css';
      styleSheet.innerText = styles;
      document.head.appendChild(styleSheet);

      // Render the widget
      ChatWidget.renderChat();
    },

    renderChat: function() {
      // Remove any existing widget container (using our new ID)
      const existing = document.getElementById("widget-container");
      if (existing) existing.remove();

      // Build the HTML based on whether the chat is open.
      let widgetHTML = '';
      if (!ChatWidget.openChat) {
        widgetHTML = `
          <div id="widget-container">
            <div class="fixed-chatbox" onclick="ChatWidget.toggleChat(true)">
              <div class="relative-chatbox">
                <div class="triangle"></div>
                <div style="width: 2.5rem; height: 2.5rem;">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg"
                       viewBox="0 0 113.4 113.4" xml:space="preserve">
                    <style type="text/css">
                      .occhiored { fill: #4562A6; }
                      .occhioblue { fill: #DA3C4C; }
                      .bocca { fill: white; }
                    </style>
                    <g>
                      <g>
                        <path class="occhiored" d="M92,55c-6.4,0-11.2-4.9-11.2-11.3c0-6.6,4.9-11.5,11.4-11.4
                          c6.3,0.1,11.2,5,11.2,11.3C103.5,50.1,98.5,55,92,55z"/>
                        <path class="occhioblue" d="M21.1,55c-6.4,0-11.2-4.9-11.2-11.3c0-6.5,5-11.5,11.5-11.4
                          c6.3,0.1,11.2,5,11.3,11.3C32.7,50,27.6,55,21.1,55z"/>
                        <path class="bocca" d="M56.8,81.8c-8.2-0.4-15-3.3-19.4-10.6c-1.3-2.2-1.6-4.4,0.9-5.8
                          c2.3-1.3,3.9,0,5.2,2c6.4,9.6,19.8,9.7,26.1,0.1c1.4-2.1,3-3.6,5.5-2c2.5,1.6,1.9,3.8,0.6,5.9
                          C71.4,78.5,64.7,81.3,56.8,81.8z"/>
                      </g>
                    </g>
                  </svg>
                </div>
                <p style="color:white">Come posso aiutarti?</p>
              </div>
            </div>
          </div>
        `;
      } else {
        widgetHTML = `
          <div id="widget-container">
            <div class="fixed-chat">
              <div class="sticky-header">
                <div class="flex-header">
                  <div style="width: 2.5rem; height: 2.5rem;">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg"
                         viewBox="0 0 113.4 113.4" xml:space="preserve">
                      <style type="text/css">
                        .occhiored { fill: #4562A6; }
                        .occhioblue { fill: #DA3C4C; }
                        .bocca { fill: white; }
                      </style>
                      <g>
                        <g>
                          <path class="occhiored" d="M92,55c-6.4,0-11.2-4.9-11.2-11.3c0-6.6,4.9-11.5,11.4-11.4
                            c6.3,0.1,11.2,5,11.2,11.3C103.5,50.1,98.5,55,92,55z"/>
                          <path class="occhioblue" d="M21.1,55c-6.4,0-11.2-4.9-11.2-11.3c0-6.5,5-11.5,11.5-11.4
                            c6.3,0.1,11.2,5,11.3,11.3C32.7,50,27.6,55,21.1,55z"/>
                          <path class="bocca" d="M56.8,81.8c-8.2-0.4-15-3.3-19.4-10.6c-1.3-2.2-1.6-4.4,0.9-5.8
                            c2.3-1.3,3.9,0,5.2,2c6.4,9.6,19.8,9.7,26.1,0.1c1.4-2.1,3-3.6,5.5-2c2.5,1.6,1.9,3.8,0.6,5.9
                            C71.4,78.5,64.7,81.3,56.8,81.8z"/>
                        </g>
                      </g>
                    </svg>
                  </div>
                  <button onclick="ChatWidget.toggleChat(false)">
                    <i class="fas fa-times text-white text-xl"></i>
                  </button>
                </div>
              </div>
              <div class="chat-ui-container">
                <div class="chat" id="chat-ui">
                  <div class="messages-container">
                    ${ChatWidget.messages.map(message => {
                      return `<div style="display:flex; flex-direction:column"> 
                                <div class="message-div ${message.role === "assistant" ? "ai-message-div" : "human-message-div"}">
                                  <div class="${message.role === "assistant" ? "ai-message" : "human-message"}">
                                    ${typeof marked !== "undefined" ? marked.parse(message.content) : message.content}
                                  </div>
                                </div>
                              </div>`;
                    }).join('')}
                    ${ChatWidget.thinking ? `
                      <div class="thinking-div">
                        <div class="dot-typing"></div>
                      </div>` : ''}
                  </div>
                </div>
              </div>
              <form class="form" onsubmit="ChatWidget.sendChat(event)">
                <div class="form-div">
                  <div class="textarea-container">
                    <textarea
                      id="chat-input"
                      onKeyup="ChatWidget.handleKeyUp(event)"
                      rows="1"
                      placeholder="Message chatbot..."
                      onInput="ChatWidget.onChange()"
                    ></textarea>
                  </div>
                </div>
                <button type="submit">
                  <i class="fas fa-paper-plane"></i>
                </button>
              </form>
            </div>
          </div>
        `;
      }
      // Insert widget HTML at the end of document.body
      document.body.insertAdjacentHTML("beforeend", widgetHTML);
      const chatUI = document.getElementById("chat-ui");
      if (chatUI) chatUI.scrollTop = chatUI.scrollHeight;
      // Append a dot to the last AI message if streaming
      const aiMessages = document.querySelectorAll(".ai-message");
      if (aiMessages) {
        aiMessages.forEach((m, i) => {
          if (i === aiMessages.length - 1 && ChatWidget.streaming) {
            const dot = document.createElement('span');
            dot.className = 'inline-block w-2 h-2 rounded bg-white mb-[1px]';
            m.lastElementChild.appendChild(dot);
          }
        });
      }
    },

    toggleChat: function(state) {
      ChatWidget.openChat = state;
      ChatWidget.messages = [];
      ChatWidget.chats = [];
      ChatWidget.renderChat();
    },

    onChange: function() {
      const input = document.getElementById("chat-input");
      input.style.height = 'auto';
      input.style.height = input.scrollHeight + 'px';
    },

    handleKeyUp: function(event) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        ChatWidget.sendChat(event);
      }
    },

    sendChat: async function(event) {
      event.preventDefault();
      const input = document.getElementById("chat-input");
      const question = input.value.trim();
      if (question) {
        ChatWidget.messages.push({ role: "user", content: question });
        ChatWidget.thinking = true;
        ChatWidget.renderChat();
        input.value = "";
        ChatWidget.get_response_stream(question, ChatWidget.chats)
          .then(data => ChatWidget.getResponseSummary(question, data))
          .catch(err => {
            console.error(err);
            ChatWidget.thinking = false;
            ChatWidget.renderChat();
          });
      }
    },

    get_response_stream: function(question, chats) {
      chats.push({ role: "user", content: question });
      return new Promise((resolve, reject) => {
        fetch('https://re2n-ai-bot-api.onrender.com/api/v1/annomynous_response_stream', {
          method: 'POST',
          body: JSON.stringify({ question, chats }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.body?.getReader();
        })
        .then(reader => {
          if (!reader) {
            throw new Error('ReadableStream reader not available');
          }
          const decoder = new TextDecoder();
          let chunks = "";
          const readStream = () => {
            reader.read().then(({ done, value }) => {
              if (done) {
                ChatWidget.streaming = false;
                ChatWidget.renderChat();
                resolve(chunks);
                return;
              }
              const chunk = decoder.decode(value, { stream: true });
              chunks += chunk;
              if (ChatWidget.messages[ChatWidget.messages.length - 1].role !== 'assistant') { 
                ChatWidget.thinking = false;
                ChatWidget.streaming = true;
                ChatWidget.messages.push({ role: 'assistant', content: chunk });
              } else {
                ChatWidget.messages[ChatWidget.messages.length - 1].content += chunk;
              }
              ChatWidget.renderChat();
              readStream();
            }).catch(error => {
              reject(error);
            });
          };
          readStream();
        })
        .catch(error => {
          reject(error);
        });
      });
    },

    getResponseSummary: async function(question, reply) {
      try {
        const response = await fetch('https://re2n-ai-bot-api.onrender.com/api/v1/annomynous_response_summary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ question, response: reply }),
        });
        const summary = await response.json();
        ChatWidget.chats.push({ role: "assistant", content: summary.summary });
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Expose the widget to the global scope
  window.ChatWidget = ChatWidget;

  // Auto initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ChatWidget.init);
  } else {
    ChatWidget.init();
  }
})(window, document);
