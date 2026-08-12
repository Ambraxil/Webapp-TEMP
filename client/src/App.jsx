import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function formatTimestamp(ts) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

export default function App() {
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState("loading"); // loading | ready | error | empty

  useEffect(() => {
    fetch(`${API_URL}/api/items`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setItems(data);
        setStatus(data.length ? "ready" : "empty");
      })
      .catch((err) => {
        console.error(err);
        setStatus("error");
      });
  }, []);

  const current = items[index];

  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => setIndex((i) => Math.min(items.length - 1, i + 1));

  return (
    <>
      <header>
        <h1>Glyph</h1>
      </header>

      <main>
        {status === "loading" && (
          <p className="status-message">Loading translations…</p>
        )}

        {status === "error" && (
          <p className="status-message error">
            Couldn't reach the server. Is it running on {API_URL}?
          </p>
        )}

        {status === "empty" && (
          <p className="status-message">No items found in the container yet.</p>
        )}

        {status === "ready" && current && (
          <>
            <section className="viewer-container">
              <button
                className="nav-arrow prev"
                aria-label="Previous image"
                onClick={goPrev}
                disabled={index === 0}
              >
                &#10094;
              </button>

              <div className="image-wrapper">
                {current.image ? (
                  <img
                    src={`data:image/png;base64,${current.image}`}
                    alt={current.extracted_text || "translated image"}
                  />
                ) : (
                  <div className="image-placeholder">
                    <p>[ Image Preview ]</p>
                  </div>
                )}
              </div>

              <button
                className="nav-arrow next"
                aria-label="Next image"
                onClick={goNext}
                disabled={index === items.length - 1}
              >
                &#10095;
              </button>
            </section>

            <div className="meta-row">
              <span>
                {index + 1} of {items.length}
              </span>
              <span>{formatTimestamp(current.timestamp_utc)}</span>
            </div>

            <section className="text-panel">
              <div className="text-box">
                <h3>Extracted Text</h3>
                <p>{current.extracted_text}</p>
              </div>

              <div className="text-box">
                <h3>Spanish Translation</h3>
                <p>{current.translation_to_spanish}</p>
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}
