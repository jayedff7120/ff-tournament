let adminPassword = "";
async function login() {
  const p = document.getElementById("password").value;
  const r = await fetch("/api/admin/login", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:p})});
  const d = await r.json();
  if (!r.ok) return document.getElementById("loginMsg").innerHTML = `<p class="error">❌ ${d.error}</p>`;
  adminPassword = p;
  sessionStorage.setItem("ffAdmin", p);
  showDashboard();
}
function authHeaders() { return {"x-admin-password": adminPassword}; }
async function showDashboard() {
  document.getElementById("loginBox").style.display="none";
  document.getElementById("dashboard").style.display="block";
  const s = await fetch("/api/settings").then(r=>r.json());
  sName.value=s.tournamentName; sDate.value=s.matchDate; sTime.value=s.matchTime; sPrize.value=s.prizePool; sBanner.value=s.bannerText; sRules.value=s.rules;
  loadAdminTeams();
}
async function loadAdminTeams() {
  const r = await fetch("/api/admin/teams",{headers:authHeaders()});
  if (!r.ok) return logout();
  const teams = await r.json();
  adminTeams.innerHTML = teams.length ? teams.map(t=>`
    <div class="admin-team">
      <div><h3>${esc(t.teamName)}</h3><p>ID: #${esc(t.id)}</p><div class="player-chips">${t.players.map((p,i)=>`<span>${i+1}. ${esc(p)}</span>`).join("")}</div></div>
      <button class="danger" onclick="deleteTeam('${t.id}')">🗑️ Delete</button>
    </div>`).join("") : '<div class="empty">No registrations yet.</div>';
}
async function saveSettings() {
  const body={tournamentName:sName.value,matchDate:sDate.value,matchTime:sTime.value,prizePool:sPrize.value,bannerText:sBanner.value,rules:sRules.value};
  const r=await fetch("/api/admin/settings",{method:"PUT",headers:{"Content-Type":"application/json",...authHeaders()},body:JSON.stringify(body)});
  saveMsg.textContent=r.ok?" ✅ Saved!":" ❌ Failed";
}
async function deleteTeam(id) {
  if (!confirm("Delete this team registration?")) return;
  await fetch("/api/admin/teams/"+id,{method:"DELETE",headers:authHeaders()});
  loadAdminTeams();
}
function downloadCSV() {
  fetch("/api/admin/export",{headers:authHeaders()}).then(r=>r.text()).then(text=>{
    const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([text],{type:"text/csv"})); a.download="ff-registrations.csv"; a.click();
  });
}
function logout(){ sessionStorage.removeItem("ffAdmin"); adminPassword=""; location.reload(); }
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
const saved=sessionStorage.getItem("ffAdmin"); if(saved){adminPassword=saved; showDashboard();}