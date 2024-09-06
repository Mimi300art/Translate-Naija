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
                console.log("Sending request to API...");
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=YOUR_API_KEY_HERE`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!response.ok) {
                    console.error('Network response was not ok', response.status, response.statusText);
                    throw new Error('Network response was not ok');
                }

                const result = await response.json();
                console.log("Response from API:", result);

                if (result.choices && result.choices.length > 0) {
                    const modelResponse = result.choices[0].text.trim();
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
        try {
            const chatSession = await startChatSession();
            const modelResponse = await chatSession.sendMessage(userInput, language);

            // Display the user input in the chat history
            const userMessage = document.createElement('p');
            userMessage.textContent = `You: ${userInput}`;
            chatContainer.appendChild(userMessage);

            // Display the model response in the chat history
            const modelMessage = document.createElement('p');
            modelMessage.textContent = `Translate 2 Naija: ${modelResponse}`;
            chatContainer.appendChild(modelMessage);

            // Clear the input field
            document.getElementById('user-message').value = '';
        } catch (error) {
            console.error('Error during message sending:', error);
            alert('There was an issue sending your message. Check the console for more details.');
        }
    } else {
        alert('Please enter a message.');
    }
});
