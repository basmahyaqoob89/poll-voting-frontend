import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

function Vote() {
  const { pollId } = useParams();

  const [poll, setPoll] = useState(null);
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");
  const [showQR, setShowQR] = useState(false);

  const voteUrl = `${window.location.origin}/vote/${pollId}`;

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

  const vote = async () => {
    if (!selected) return;

    await fetch(
      `https://1zbqqtpwi1.execute-api.us-east-1.amazonaws.com/polls/${pollId}/vote`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option: selected }),
      }
    );

    setMessage("Vote submitted 🎉");
    fetchPoll();
  };

  if (!poll) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>

      <h2>{poll.question}</h2>

      {poll.options.map((opt, i) => (
        <div key={i}>
          <label>
            <input
              type="radio"
              name="vote"
              value={opt.text}
              onChange={(e) => setSelected(e.target.value)}
            />
            {opt.text}
          </label>
        </div>
      ))}

      <button onClick={vote} disabled={!selected}>
        Vote
      </button>

      <button
        onClick={() => setShowQR(!showQR)}
        style={{ marginLeft: 10 }}
      >
        Share QR
      </button>

      {message && <p style={{ color: "green" }}>{message}</p>}

      {showQR && (
        <div style={{ marginTop: 20 }}>
          <h3>📱 Scan to vote</h3>

          <QRCodeCanvas value={voteUrl} size={180} />

          <p>{voteUrl}</p>
        </div>
      )}

      
      <div style={{ marginTop: 20 }}>
        <h3>Live Results</h3>

        {poll.options.map((o, i) => (
          <p key={i}>
            {o.text} — {o.votes}
          </p>
        ))}
      </div>
    </div>
  );
}

export default Vote;