import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreatePoll() {
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const createPoll = async () => {
    const res = await fetch(
      "https://1zbqqtpwi1.execute-api.us-east-1.amazonaws.com/polls",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, options }),
      }
    );

    const data = await res.json();

    
    navigate(`/results/${data.pollId}`);
  };

  return (
    <div>
      <h1>Create Poll</h1>

      <input value={question} onChange={(e) => setQuestion(e.target.value)} />

      <button onClick={createPoll}>Create</button>
    </div>
  );
}

export default CreatePoll;