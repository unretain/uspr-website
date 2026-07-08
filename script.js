/* ===== USPR · United States Power Reserve ===== */

/* --- Optional AI background video: fade it in only if bg.mp4 actually loads --- */
const heroVideo = document.getElementById("heroVideo");
if(heroVideo){
  heroVideo.addEventListener("loadeddata", () => {
    if(heroVideo.readyState >= 2){
      heroVideo.classList.add("ready");
      // real video is playing — hide the canvas fallback so it doesn't cover it
      const cv = document.getElementById("powerCanvas");
      if(cv) cv.style.display = "none";
    }
  });
  heroVideo.addEventListener("error", () => heroVideo.remove());
}

/* --- Animated "power grid" background (canvas) --- */
(function powerBG(){
  const c = document.getElementById("powerCanvas");
  if(!c) return;
  const ctx = c.getContext("2d");
  let W, H, DPR;
  function resize(){
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = c.clientWidth; H = c.clientHeight;
    c.width = W * DPR; c.height = H * DPR;
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  window.addEventListener("resize", resize);

  // rising energy embers
  const N = 70, embers = [];
  function seed(){
    embers.length = 0;
    for(let i=0;i<N;i++){
      embers.push({
        x: Math.random()*W, y: Math.random()*H,
        r: Math.random()*1.8+0.4,
        s: Math.random()*0.5+0.15,
        a: Math.random()*0.5+0.2,
        drift: (Math.random()-0.5)*0.3
      });
    }
  }

  // lightning arcs
  let bolts = [];
  let frame = 0;
  function makeBolt(){
    const x0 = Math.random()*W;
    const pts = [{x:x0, y:0}];
    let x = x0, y = 0;
    const step = H / (8 + Math.random()*5);
    while(y < H){
      y += step;
      x += (Math.random()-0.5) * 90;
      pts.push({x, y});
    }
    bolts.push({pts, life: 14 + Math.random()*8, age:0});
  }

  function gridLines(t){
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(246,197,68,0.05)";
    const gap = 64;
    const off = (t*0.015) % gap;
    for(let x=-gap; x<W+gap; x+=gap){
      ctx.beginPath(); ctx.moveTo(x+off,0); ctx.lineTo(x+off - 40, H); ctx.stroke();
    }
    for(let y=0; y<H; y+=gap){
      const a = 0.03 + 0.025*Math.sin((y+t*0.05)/40);
      ctx.strokeStyle = `rgba(78,168,255,${a.toFixed(3)})`;
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y+10); ctx.stroke();
    }
  }

  function draw(){
    frame++;
    // base wash
    const g = ctx.createRadialGradient(W*0.5,H*0.32,40, W*0.5,H*0.32, Math.max(W,H)*0.8);
    g.addColorStop(0,"#0a0f1c"); g.addColorStop(1,"#05070c");
    ctx.fillStyle = g; ctx.fillRect(0,0,W,H);

    gridLines(frame);

    // embers
    for(const e of embers){
      e.y -= e.s; e.x += e.drift;
      if(e.y < -5){ e.y = H+5; e.x = Math.random()*W; }
      ctx.beginPath();
      ctx.fillStyle = `rgba(246,197,68,${e.a})`;
      ctx.shadowBlur = 8; ctx.shadowColor = "rgba(246,197,68,0.6)";
      ctx.arc(e.x, e.y, e.r, 0, Math.PI*2); ctx.fill();
    }
    ctx.shadowBlur = 0;

    // occasionally spawn a bolt
    if(frame % 90 === 0 && Math.random() < 0.85) makeBolt();
    bolts = bolts.filter(b => b.age < b.life);
    for(const b of bolts){
      b.age++;
      const fade = 1 - b.age/b.life;
      ctx.strokeStyle = `rgba(120,190,255,${(fade*0.85).toFixed(3)})`;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 16; ctx.shadowColor = "rgba(120,190,255,0.9)";
      ctx.beginPath();
      ctx.moveTo(b.pts[0].x, b.pts[0].y);
      for(let i=1;i<b.pts.length;i++) ctx.lineTo(b.pts[i].x, b.pts[i].y);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    requestAnimationFrame(draw);
  }

  resize(); seed(); draw();
  window.addEventListener("resize", () => { resize(); seed(); });
})();

/* --- Breaking-news ticker --- */
const headlines = [
  "RESERVE STATUS: <b>ENERGIZED</b> — strategic power deployment underway",
  "$USPR liquidity <b>BURNED</b> · contract <b>RENOUNCED</b> · tax <b>0%</b>",
  "Analysts: \"AI is the hungriest machine ever built — and it runs on the grid\"",
  "Gigawatt campuses booked. The Diamond Grid does not brown out.",
  "PHASE II of the power mandate <b>LOADING</b>…",
  "Power is the new oil — one ticker, one reserve"
];
const track = document.getElementById("tickerTrack");
if(track) track.innerHTML = headlines.map(h => `<span>⚡ ${h}</span>`).join("").repeat(2);

/* --- Animated counters --- */
function animate(el){
  const target = parseFloat(el.dataset.count);
  const dur = 1500, t0 = performance.now();
  function tick(t){
    const p = Math.min((t - t0)/dur, 1);
    const eased = 1 - Math.pow(1-p, 3);
    const v = target * eased;
    el.textContent = target >= 1000 ? Math.floor(v).toLocaleString() : Math.floor(v);
    if(p < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString();
  }
  requestAnimationFrame(tick);
}
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ animate(e.target); io.unobserve(e.target);} });
}, {threshold:.5});
document.querySelectorAll("[data-count]").forEach(el=>io.observe(el));

/* --- Animate footprint bars on scroll --- */
const barIO = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("go"); barIO.unobserve(e.target);} });
}, {threshold:.4});
document.querySelectorAll(".bt").forEach(el=>barIO.observe(el));

/* --- Countdown --- */
const target = Date.now() + 1000*60*60*24*12 + 1000*60*60*7;
const pad = n => String(n).padStart(2,"0");
function tickCountdown(){
  let diff = Math.max(0, target - Date.now());
  const d = Math.floor(diff/86400000); diff -= d*86400000;
  const h = Math.floor(diff/3600000);  diff -= h*3600000;
  const m = Math.floor(diff/60000);    diff -= m*60000;
  const s = Math.floor(diff/1000);
  const set = (id,v)=>{const el=document.getElementById(id); if(el) el.textContent=pad(v);};
  set("cd-d",d); set("cd-h",h); set("cd-m",m); set("cd-s",s);
}
tickCountdown(); setInterval(tickCountdown,1000);

/* --- Live-ish price flicker --- */
const priceEl = document.getElementById("mPrice");
const base = 0.00061;
setInterval(()=>{
  if(priceEl){ const p = base*(1+Math.sin(Date.now()/3000)*0.05); priceEl.textContent = "$"+p.toFixed(5); }
},1500);

/* --- Copy contract address --- */
const copyBtn = document.getElementById("copyCa");
if(copyBtn){
  copyBtn.addEventListener("click", async ()=>{
    const ca = document.getElementById("ca").textContent.trim();
    try{ await navigator.clipboard.writeText(ca); }
    catch{ const t=document.createElement("textarea"); t.value=ca; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove(); }
    const old = copyBtn.textContent; copyBtn.textContent="COPIED ✔";
    setTimeout(()=>copyBtn.textContent=old,1400);
  });
}

/* --- Mobile nav --- */
const burger = document.getElementById("burger");
const navLinks = document.getElementById("navLinks");
if(burger && navLinks){
  burger.addEventListener("click", ()=>navLinks.classList.toggle("open"));
  navLinks.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>navLinks.classList.remove("open")));
}
