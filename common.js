const T={box:{i:"🎁",n:"BOX",l:"Rương thường"},tele:{i:"🟡",n:"BOX",l:"Dịch chuyển"},clover:{i:"🍀",n:"BOX",l:"Rương cỏ"},bag:{i:"🟪",n:"BAG",l:"Bag"}};
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pad=n=>String(n).padStart(2,"0"),hm=d=>`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const safeUrl=u=>{try{const x=new URL(u);return /^https?:$/.test(x.protocol)?x.href:""}catch(e){return ""}};
function deviceId(){
  let id=null;try{id=localStorage.getItem("shoplink_device")}catch(e){}
  if(!id||!/^device_[0-9a-f-]{36}$/.test(id)){
    id="device_"+crypto.randomUUID();try{localStorage.setItem("shoplink_device",id)}catch(e){}
  }
  return id;
}
function copyText(t,btn){
  const done=()=>{btn.textContent="Đã chép ✓";setTimeout(()=>btn.textContent="Sao chép",1500)};
  if(navigator.clipboard)navigator.clipboard.writeText(t).then(done,fb);else fb();
  function fb(){const a=document.createElement("textarea");a.value=t;document.body.appendChild(a);a.select();try{document.execCommand("copy")}catch(e){}a.remove();done()}
}
function beep(){try{const c=new (window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=880;g.gain.value=.1;o.start();o.stop(c.currentTime+.15)}catch(e){}}
function chestCard(o,isNew){
  const t=T[o.type]||T.box,tm=new Date(o.created_at||Date.now());
  let h=`<div class="hd">## ${esc(o.code)} › ***</div>⏳ TIME: <b>00:${pad(o.sec||47)}s - ${hm(tm)}</b><br>${t.i} ${t.n}: <b>${esc(o.cur)}/${esc(o.max)}</b> ${esc(o.flag||"")}${o.type==="tele"?" 💎":""}`;
  h+=`<br>📈 Rate: <b>${esc(o.rate??"-")}</b> &nbsp;👀 <b>${esc(o.views??0)}</b>`;
  if(o.level!=null)h+=`<br>🎯 Level: <b>${esc(o.level)}</b> &nbsp;👤 0`;
  if(o.note)h+=`<br>💬 ${esc(o.note)}`;
  const u=safeUrl(o.link);if(u)h+=`<br><a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(u)}</a>`;
  h+=`<div class="ft">🕐 ${hm(tm)} (${t.l})</div>`;
  const c=document.createElement("div");c.className="card"+(isNew?" new":"");c.innerHTML=h;return c;
}
