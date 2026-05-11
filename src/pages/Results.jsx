import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function Results() {
  const { pollId } = useParams();
  const [poll, setPoll] = useState(null);

  const fetchPoll = async () => {
    const res = await fetch(
      `https://1zbqqtpwi1.execute-api.us-east-1.amazonaws.com/polls/${pollId}`
    );
    const data = await res.json();
    setPoll(data);
  };

  useEffect(() => {
    if (pollId) fetchPoll();
  }, [pollId]);

  if (!poll) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>📊 Results</h1>

      <h2>{poll.question}</h2>

      <p>Total Votes: {poll.totalVotes}</p>

      {poll.options.map((opt, i) => (
        <div key={i} style={{ marginBottom: "10px" }}>
          <strong>{opt.text}</strong> — {opt.votes} votes
        </div>
      ))}
    </div>
  );
}

export default Results;