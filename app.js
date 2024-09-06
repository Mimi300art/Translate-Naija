document.addEventListener('DOMContentLoaded', () => {
    const chatHistory = [];

    async function sendMessage(userMessage, language) {
        const systemInstruction = `
            You are a translating chatbot that is able to translate what it is given to ${language}
        `;

        const requestBody = {
            contents: [
                {
                    role: "user",
                    parts: [{ text: userMessage }]
                }
            ],
            systemInstruction: {
                role: "model",
                parts: [{ text: systemInstruction }]
            },
            generationConfig: {
                temperature: 1,
                topP: 0.95,
                topK: 64,
                maxOutputTokens: 100
            } // Adjusted to a more reasonable limit
        };

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyDRwCnAdxFzYfZ3pME6Hb2L3bd8appmeU0`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorDetails = await response.json();
                console.error('Request failed with status:', response.status);
                console.error('Error details:', errorDetails);
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            const modelResponse =  result.candidates[0].content.parts[0].text ?? 'No response from the model.';

            chatHistory.push({ role: 'user', parts: [{ text: userMessage }] });
            chatHistory.push({ role: 'model', parts: [{ text: modelResponse }] });

            return modelResponse;

        } catch (error) {
            console.error('Error:', error);
            return 'Sorry, there was an error processing your request.';
        }
    }

    // Handle submit button click event
    document.getElementById('submit-btn').addEventListener('click', async function () {
        const userInput = document.getElementById('user-message').value;
        const langInput = document.getElementById('language').value;
        const chatContainer = document.getElementById('chat-history');

        if (userInput.trim() !== '') {
            const modelResponse = await sendMessage(userInput, langInput); // Language parameter can be adjusted or removed as needed

            // Display the user input in the chat history
            const userMessage = document.createElement('div');
            userMessage.classList.add('message', 'user-message');
            userMessage.textContent = `You: ${userInput}`;
            chatContainer.appendChild(userMessage);

            // Display the model response in the chat history
            const modelMessage = document.createElement('div');
            modelMessage.classList.add('message', 'model-message');
            modelMessage.textContent = `T-N: ${modelResponse}`;
            chatContainer.appendChild(modelMessage);

            // Scroll the chat window to the bottom after new message
            chatContainer.scrollTop = chatContainer.scrollHeight;

            // Clear the input field
            document.getElementById('user-message').value = '';
        } else {
            alert('Please enter a message.');
        }
    });
});
