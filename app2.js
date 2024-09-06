async function startChatSession() {
    const chatHistory = [];

    return {
        sendMessage: async function (inputText, language) {
            const systemInstruction = `
                You are a helpful and accurate translation assistant specializing in translating text between English and Nigerian languages (Hausa, Igbo, Yoruba). 
                You provide translations that are contextually appropriate, easy to understand, and error-free. 
                You respond in a friendly and supportive tone, and you maintain a history of the conversation for reference.
                Translate the provided text to ${language}.
            `;

            const requestBody = {
                model: "gemini-1.5-pro",
                systemInstruction: systemInstruction,
                history: chatHistory,
                userMessage: inputText,
                generationConfig: {
                    temperature: 1,
                    topP: 0.95,
                    topK: 64,
                    maxOutputTokens: 8192,
                    responseMimeType: "text/plain"
                }
            };

            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyDRwCnAdxFzYfZ3pME6Hb2L3bd8appmeU0`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                });

                console.log('API Response:', response);

                if (!response.ok) {
                    const errorDetails = await response.json();
                    console.error('Request failed with status:', response.status);
                    console.error('Error details:', errorDetails);
                    throw new Error('Network response was not ok');
                }

                const result = await response.json();

                if (result.choices && result.choices.length > 0) {
                    const modelResponse = result.choices[0].text.trim();

                    // Push user and model messages into chat history
                    chatHistory.push({ role: 'user', parts: [{ text: inputText }] });
                    chatHistory.push({ role: 'model', parts: [{ text: modelResponse }] });

                    return modelResponse;
                } else {
                    return 'No response from the model.';
                }
            } catch (error) {
                console.error('Error:', error);
                return 'Sorry, there was an error processing your request.';
            }
        }
    };
}

// Handle submit button click event
document.getElementById('submit-btn').addEventListener('click', async function () {
    const userInput = document.getElementById('user-message').value;
    const language = document.getElementById('language').value;
    const chatContainer = document.getElementById('chat-history');

    if (userInput.trim() !== '') {
        const chatSession = await startChatSession();
        const modelResponse = await chatSession.sendMessage(userInput, language);

        // Display the user input in the chat history
        const userMessage = document.createElement('div');
        userMessage.classList.add('message', 'user-message');
        userMessage.textContent = `You: ${userInput}`;
        chatContainer.appendChild(userMessage);

        // Display the model response in the chat history
        const modelMessage = document.createElement('div');
        modelMessage.classList.add('message', 'model-message');
        modelMessage.textContent = `Translate Naija: ${modelResponse}`;
        chatContainer.appendChild(modelMessage);

        // Scroll the chat window to the bottom after new message
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // Clear the input field
        document.getElementById('user-message').value = '';
    } else {
        alert('Please enter a message.');
    }
});
