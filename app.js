async function loadPage() {
  const settings = await fetch("/api/settings").then(r => r.json());
  document.getElementById("tournamentName").textContent = settings.tournamentName;
  document.getElementById("bannerText").textContent = settings.bannerText;
  document.getElementById("matchDate").textContent = settings.matchDate;
  document.getElementById("matchTime").textContent = settings.matchTime;
  document.getElementById("prizePool").textContent = settings.prizePool;
  document.getElementById("rules").textContent = settings.rules;
  loadTeams();
}
async function loadTeams() {
  const teams = await fetch("/api/teams").then(r => r.json());
  document.getElementById("teamCount").textContent = `${teams.length} Team${teams.length === 1 ? "" : "s"}`;
  const box = document.getElementById("teams");
  if (!teams.length) {
    box.innerHTML = '<div class="empty">No teams registered yet. Be the first!</div>';
    return;
  }
  box.innerHTML = teams.map((t, i) => `
    <div class="team">
      <div class="team-number">#${i + 1}</div>
      <div class="team-body">
        <h3>${escapeHTML(t.teamName)}</h3>
        <div class="player-chips">${t.players.map((p, j) => `<span>${j+1}. ${escapeHTML(p)}</span>`).join("")}</div>
      </div>
    </div>`).join("");
}
document.getElementById("registrationForm").addEventListener("submit", async e => {
  e.preventDefault();
  const msg = document.getElementById("formMessage");
  const teamName = document.getElementById("teamName").value.trim();
  const players = [...document.querySelectorAll(".player")].map(x => x.value.trim());
  const r = await fetch("/api/register", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({teamName, players})
  });
  const data = await r.json();
  if (r.ok) {
    msg.className = "success";
    msg.textContent = `✅ Registration successful! Your Registration ID is #${data.registrationId}`;
    e.target.reset();
    loadTeams();
  } else {
    msg.className = "error";
    msg.textContent = `❌ ${data.error || "Registration failed."}`;
  }
});
function escapeHTML(s) {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
loadPage();