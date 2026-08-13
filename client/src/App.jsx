// App.jsx
import { useEffect, useState } from "react";
import Nav from "./Nav.jsx";
import ViewerPage from "./ViewerPage.jsx";
import UploadPage from "./UploadPage.jsx";

function getPage() {
  return window.location.hash === "#/upload" ? "upload" : "viewer";
}

export default function App() {
  const [page, setPage] = useState(getPage());

  useEffect(() => {
    const onHashChange = () => setPage(getPage());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <>
      <header>
        <h1>Glyph</h1>
      </header>
      <Nav page={page} />
      {page === "viewer" ? <ViewerPage /> : <UploadPage />}
    </>
  );
}