const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "database.json");

// Change this password before putting the site online.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "NSCJ@yed";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    settings: {
      tournamentName: "FREE FIRE TOURNAMENT",
      matchDate: "2026-09-01",
      matchTime: "08:00 PM",
      prizePool: "৳10,000",
      rules: "Be on time. No hacks or cheating. Follow the room rules.",
      bannerText: "Register your squad and join the battle!"
    },
    teams: []
  }, null, 2));
}

function readDB() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}
function writeDB(db) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

app.get("/api/settings", (req, res) => {
  res.json(readDB().settings);
});

app.get("/api/teams", (req, res) => {
  const db = readDB();
  res.json(db.teams.map(({id, teamName, players, createdAt}) => ({id, teamName, players, createdAt})));
});

app.post("/api/register", (req, res) => {
  const { teamName, players } = req.body;
  if (!teamName || !Array.isArray(players) || players.length !== 4 ||
      players.some(p => !String(p).trim())) {
    return res.status(400).json({ error: "Please provide a team name and all 4 player names." });
  }

  const db = readDB();
  const duplicate = db.teams.some(t => t.teamName.trim().toLowerCase() === teamName.trim().toLowerCase());
  if (duplicate) return res.status(409).json({ error: "This team name is already registered." });

  const id = String(Date.now()).slice(-8);
  db.teams.push({
    id,
    teamName: teamName.trim(),
    players: players.map(p => String(p).trim()),
    createdAt: new Date().toISOString()
  });
  writeDB(db);
  res.json({ success: true, registrationId: id });
});

function admin(req, res, next) {
  const password = req.headers["x-admin-password"];
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: "Wrong admin password." });
  next();
}

app.post("/api/admin/login", (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) return res.json({ success: true });
  res.status(401).json({ error: "Wrong password." });
});

app.get("/api/admin/teams", admin, (req, res) => {
  res.json(readDB().teams);
});

app.put("/api/admin/settings", admin, (req, res) => {
  const db = readDB();
  db.settings = {
    ...db.settings,
    tournamentName: String(req.body.tournamentName || ""),
    matchDate: String(req.body.matchDate || ""),
    matchTime: String(req.body.matchTime || ""),
    prizePool: String(req.body.prizePool || ""),
    rules: String(req.body.rules || ""),
    bannerText: String(req.body.bannerText || "")
  };
  writeDB(db);
  res.json({ success: true, settings: db.settings });
});

app.delete("/api/admin/teams/:id", admin, (req, res) => {
  const db = readDB();
  const before = db.teams.length;
  db.teams = db.teams.filter(t => t.id !== req.params.id);
  writeDB(db);
  res.json({ success: true, deleted: before !== db.teams.length });
});

app.get("/api/admin/export", admin, (req, res) => {
  const db = readDB();
  const header = "Registration ID,Team Name,Player 1,Player 2,Player 3,Player 4,Registered At\n";
  const rows = db.teams.map(t => [
    t.id, t.teamName, ...t.players, t.createdAt
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  res.type("text/csv").send(header + rows);
});

app.listen(PORT, () => console.log(`FF Tournament website running at http://localhost:${PORT}`));