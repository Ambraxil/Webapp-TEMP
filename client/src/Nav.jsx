import "./nav.css";

export default function Nav({ page }) {
  return (
    <nav className="app-nav">
      <a href="#/" className={page === "viewer" ? "active" : ""}>
        Viewer
      </a>
      <a href="#/upload" className={page === "upload" ? "active" : ""}>
        Upload
      </a>
    </nav>
  );
}
