import { useState } from "react";
import "./upload-page.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [status, setStatus] = useState("idle"); 
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleFileSelect = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setStatus("idle");
    setError("");
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus("uploading");
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Upload failed (${res.status})`);
      }

      const data = await res.json();
      setResult(data);
      setStatus("done");
    } catch (err) {
      console.error(err);
      setError(err.message || "Upload failed");
      setStatus("error");
    }
  };

  return (
    <main className="upload-page">
      <h2>Upload an image</h2>
      <p className="upload-page-subtitle">
        The image is sent to RapidOCR for text extraction, then to
        LibreTranslate for a Spanish translation, then stored in blob
        storage.
      </p>

      <label className="upload-page-dropzone">
        {previewUrl ? (
          <img src={previewUrl} alt="Selected preview" />
        ) : (
          <span>Click to choose an image</span>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          hidden
        />
      </label>

      <button
        className="upload-page-submit"
        onClick={handleUpload}
        disabled={!file || status === "uploading"}
      >
        {status === "uploading" ? "Uploading…" : "Upload"}
      </button>

      {status === "error" && (
        <p className="upload-page-message error">{error}</p>
      )}

      {status === "done" && result && (
        <section className="upload-page-result">
          <h3>Done</h3>
          <div className="upload-page-result-box">
            <h4>Extracted Text</h4>
            <p>{result.extracted_text || "(none found)"}</p>
          </div>
          <div className="upload-page-result-box">
            <h4>Spanish Translation</h4>
            <p>{result.translation_to_spanish || "(none)"}</p>
          </div>
        </section>
      )}
    </main>
  );
}
