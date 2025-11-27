import React, { useState } from "react";
import axios from "axios";

export default function AIChatPanel({ context }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const askAI = async () => {
    if (!question) return;

    try {
      const response = await axios.post("http://127.0.0.1:8000/chat", {
        question: question,
        context: context
      });
      setAnswer(response.data.answer);
    } catch (error) {
      setAnswer("AI failed to respond.");
    }
  };

  return (
    <div className="mt-8 bg-gray-50 p-6 rounded-2xl shadow-inner">
      <h2 className="text-xl font-semibold mb-3">Ask AI About Your Results</h2>

      <div className="flex gap-2">
        <input
          className="flex-1 border p-3 rounded-xl"
          placeholder="Ask your sustainability question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          onClick={askAI}
          className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700"
        >
          Ask
        </button>
      </div>

      {answer && (
        <div className="mt-4 p-4 bg-white rounded-xl shadow">
          <b>AI Response:</b>
          <p className="mt-2">{answer}</p>
        </div>
      )}
    </div>
  );
}
