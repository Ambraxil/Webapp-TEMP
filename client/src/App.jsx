// App.jsx
const TEAM = [
  { name: "Xander Mulligan", role: "Raspberry Pi Lead" },
  { name: "David Obi", role: "Website Manager" },
  { name: "Josh Angeles", role: "Database Manager" },
  { name: "Alex Hooks", role: "Raspberry Pi Developer" },
  { name: "Hamza Rasheed", role: "Raspberry Pi Developer" },
];

export default function App() {
  return (
    <>
      <header>
        <h1>Glyph</h1>
      </header>

      <main>
        <section className="team-intro">
          <h2>Meet the Team</h2>
          <p>The people behind Glyph.</p>
        </section>

        <section className="team-grid">
          {TEAM.map((member) => (
            <div className="team-card" key={member.name}>
              <div className="team-avatar">
                {member.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}