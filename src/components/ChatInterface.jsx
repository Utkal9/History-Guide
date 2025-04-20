import { useState } from "react";

function ChatInterface() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [image, setImage] = useState(null);

    const handleSend = async () => {
        if (!input.trim() && !image) return;

        if (input.trim()) {
            const userMessage = { sender: "user", text: input };
            setMessages((prev) => [...prev, userMessage]);

            const response = await fetch("http://localhost:3000/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: input }),
            });

            const data = await response.json();
            const botMessage = { sender: "bot", text: data.answer };
            setMessages((prev) => [...prev, botMessage]);
            setInput("");
        }

        if (image) {
            const formData = new FormData();
            formData.append("image", image);

            const res = await fetch("http://localhost:3000/image-upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (data.answer) {
                setMessages((prev) => [
                    ...prev,
                    {
                        sender: "user",
                        text: data.detectedText || "Uploaded image",
                    },
                    { sender: "bot", text: data.answer },
                ]);
            }
            setImage(null);
        }
    };

    const startVoiceRecognition = () => {
        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = "en-US";
        recognition.start();

        recognition.onresult = (event) => {
            const voiceText = event.results[0][0].transcript;
            setInput(voiceText);
        };
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
        }
    };

    return (
        <div className="chat-container">
            <h1>HistoricAI</h1>
            <div className="chat-box">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.sender}`}>
                        {msg.text}
                    </div>
                ))}
            </div>
            <div className="input-box">
                <input
                    type="text"
                    placeholder="Ask about any historical place or topic..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                />
                <button onClick={startVoiceRecognition}>🎤 Voice</button>
                <button onClick={handleSend}>Send</button>
            </div>
        </div>
    );
}

export default ChatInterface;
