import { useState, useEffect } from "react";

const API_BASE = "https://qptplbl5ne.execute-api.eu-north-1.amazonaws.com";


const EMAIL_API = "https://qptplbl5ne.execute-api.eu-north-1.amazonaws.com/send-email";

function App() {
  const params = new URLSearchParams(window.location.search);

  const [page, setPage] = useState(params.get("page") || "create");
  const [pollId, setPollId] = useState(params.get("pollId") || "");
  const [poll, setPoll] = useState(null);
  const [result, setResult] = useState(null);
  const [qr, setQr] = useState(null);
  const [email, setEmail] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);

  const createPoll = async (question, options) => {
    try {
      const res = await fetch(`${API_BASE}/polls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, options }),
      });
      const data = await res.json();
      if (data.pollId) {
        setPollId(data.pollId);
        window.history.pushState({}, "", `/?pollId=${data.pollId}&page=vote`);
        setPage("vote");
      }
    } catch (err) {
      console.log("Create Error:", err);
    }
  };

  const fetchPoll = async () => {
    if (!pollId) return;
    try {
      const res = await fetch(`${API_BASE}/polls/${pollId}`);
      const data = await res.json();
      setPoll(data);
    } catch (err) {
      console.log("Poll Error:", err);
    }
  };

  /* ================= (Path: /polls/{id}/results) ================= */
  const fetchResults = async () => {
    if (!pollId) return;
    try {
      const res = await fetch(`${API_BASE}/polls/${pollId}/results`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.log("Results Error:", err);
    }
  };

  /* ================= (Path: /polls/{id}/qr) ================= */
  const getQR = async () => {
    if (!pollId) return;
    try {
      const res = await fetch(`${API_BASE}/polls/${pollId}/qr`);
      const data = await res.json();
      setQr(data.qr);
    } catch (err) {
      console.log("QR Error:", err);
    }
  };

  /* ================= (Path: /send-email) ================= */
  const sendEmail = async () => {
    if (!email) return alert("Please enter an email");
    setLoadingEmail(true);
    try {
      const res = await fetch(EMAIL_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pollId }),
      });
      if (res.ok) {
        alert("Email Sent ✅");
      } else {
        alert("Failed to send email ❌");
      }
    } catch (err) {
      console.log("Email Error:", err);
      alert("Error sending email");
    } finally {
      setLoadingEmail(false);
    }
  };

  /* =================(Path: /polls/{id}/vote) ================= */
  const vote = async (optionText) => {
    try {
      await fetch(`${API_BASE}/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option: optionText }),
      });
      setPage("results");
    } catch (err) {
      console.log("Vote Error:", err);
    }
  };

  useEffect(() => {
    if (page === "vote") fetchPoll();
    if (page === "results") fetchResults();
  }, [page, pollId]);

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
      
      {page === "create" && <CreateForm onCreate={createPoll} />}

      {page === "vote" && poll && (
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: "#333" }}>{poll.question}</h2>
          {poll.options && poll.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => vote(opt.text)}
              style={{
                display: "block",
                width: "100%",
                padding: "12px",
                margin: "10px 0",
                fontSize: "16px",
                cursor: "pointer",
                backgroundColor: "#f9f9f9",
                border: "1px solid #ccc",
                borderRadius: "8px"
              }}
            >
              {opt.text}
            </button>
          ))}

          <button onClick={getQR} style={{ marginTop: 20, background: "none", border: "1px solid blue", color: "blue", padding: "5px 10px", borderRadius: "5px", cursor: "pointer" }}>
            Generate QR to Share
          </button>

          {qr && (
            <div style={{ marginTop: 20 }}>
              <h3>Scan To Vote</h3>
              <img src={qr} width="180" alt="QR Code" />
            </div>
          )}
        </div>
      )}

      {page === "results" && result && (
        <div style={{ border: "1px solid #eee", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
          <h2 style={{ textAlign: "center" }}>📊 Final Results</h2>
          {result.results && result.results.map((r, i) => (
            <div key={i} style={{ marginBottom: "15px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{r.text}</span>
                <span style={{ fontWeight: "bold" }}>{r.votes} votes</span>
              </div>
              <div style={{ height: "10px", width: "100%", backgroundColor: "#eee", borderRadius: "5px", marginTop: "5px" }}>
                <div style={{ height: "100%", width: `${(r.votes / (result.totalVotes || 1)) * 100}%`, backgroundColor: "#4CAF50", borderRadius: "5px" }}></div>
              </div>
            </div>
          ))}
          <p style={{ textAlign: "right", fontWeight: "bold" }}>Total: {result.totalVotes}</p>

          <hr style={{ margin: "25px 0", border: "0", borderTop: "1px solid #eee" }} />

          
          <div style={{ backgroundColor: "#f9f9f9", padding: "15px", borderRadius: "8px", textAlign: "center" }}>
            <h4>📧 Send Results to your Email</h4>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: "10px", width: "80%", borderRadius: "5px", border: "1px solid #ccc", marginBottom: "10px" }}
            />
            <button
              onClick={sendEmail}
              disabled={loadingEmail}
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                backgroundColor: "#333",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              {loadingEmail ? "Sending..." : "Send Results"}
            </button>
          </div>

          <button onClick={() => { setPage("create"); setPollId(""); }} style={{ marginTop: "20px", width: "100%", padding: "10px", background: "none", border: "1px dashed #999", cursor: "pointer" }}>
            Create New Poll
          </button>
        </div>
      )}
    </div>
  );
}

function CreateForm({ onCreate }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const handleCreate = () => {
    if (!question || options.some(opt => !opt)) return alert("Please fill all fields");
    onCreate(question, options);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>🚀 Create a New Poll</h1>
      <input
        placeholder="What is your question?"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        style={{ width: "100%", padding: "12px", marginBottom: "20px", fontSize: "16px", borderRadius: "8px", border: "1px solid #ddd" }}
      />
      {options.map((opt, i) => (
        <input
          key={i}
          placeholder={`Option ${i + 1}`}
          value={opt}
          onChange={(e) => {
            const copy = [...options];
            copy[i] = e.target.value;
            setOptions(copy);
          }}
          style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #eee" }}
        />
      ))}
      <button onClick={() => setOptions([...options, ""])} style={{ padding: "5px 15px", marginBottom: "20px", cursor: "pointer", background: "none", border: "1px solid #ccc", borderRadius: "5px" }}>
        + Add Option
      </button>
      <button
        onClick={handleCreate}
        style={{ width: "100%", padding: "15px", backgroundColor: "#4CAF50", color: "white", border: "none", fontSize: "18px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
      >
        Create & Launch
      </button>
    </div>
  );
}

export default App;