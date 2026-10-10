const KEY="keuangan_v1";
const DEF={income:500000,period:"Oktober 2026",
 cats:[["Kebutuhan",60],["Dana Darurat",20],["Tabungan Tujuan",10],["Investasi",5],["Hiburan",5]],
 pay:{n:1,items:[{l:"Pemasukan 1",a:500000},{l:"Pemasukan 2",a:0}]},
 out:[{d:"2026-10-04",ds:"Isi Kuota Smartfren",k:"Kebutuhan",n:30000,m:"Qris",c:"Sampai Hari Minggu"}]};
let S;
try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){S=null}
if(!S||!S.cats)S=JSON.parse(JSON.stringify(DEF));
if(!S.pay)S.pay={n:1,items:[{l:"Pemasukan 1",a:S.income||0},{l:"Pemasukan 2",a:0}]};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const rp=n=>"Rp"+Math.round(n).toLocaleString("id-ID");
const $=id=>document.getElementById(id);
const tgl=d=>new Date(d+"T00:00").toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"});
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

const pages=[["dash","Dashboard"],["out","Pengeluaran"],["alo","Alokasi"],["set","Pengaturan"]];
function show(id){pages.forEach(([p])=>$("p-"+p).classList.toggle("hide",p!==id));
 [...$("nav").children].forEach((b,i)=>b.classList.toggle("on",pages[i][0]===id))}
pages.forEach(([id,l])=>{const b=document.createElement("button");b.textContent=l;b.onclick=()=>show(id);$("nav").append(b)});

function render(){
 $("per").textContent="· "+S.period;
 S.income=S.pay.items.slice(0,S.pay.n).reduce((a,x)=>a+x.a,0);
 const total=S.out.reduce((a,o)=>a+o.n,0),sisa=S.income-total;
 $("stats").innerHTML=[["Uang Masuk ("+S.pay.n+"x)",rp(S.income),""],["Total Pengeluaran",rp(total),""],["Sisa Uang",rp(sisa),sisa<0?"neg":"pos"]]
  .map(([a,b,c])=>`<div class="stat"><small>${a}</small><b class="${c}">${b}</b></div>`).join("");
 $("cats").innerHTML=S.cats.map(([nm,pc])=>{
  const plan=S.income*pc/100,used=S.out.filter(o=>o.k===nm).reduce((a,o)=>a+o.n,0),left=plan-used,pct=plan?Math.min(100,used/plan*100):0;
  return `<div class="row"><div class="t"><b>${esc(nm)} <small>${pc}%</small></b><span>${rp(used)} / ${rp(plan)}</span></div>
  <div class="bar"><i style="width:${pct}%;${used>plan?'background:var(--bad)':''}"></i></div>
  <small>Sisa alokasi: <span class="${left<0?'neg':''}">${rp(left)}</span></small></div>`}).join("");
 $("k").innerHTML=S.cats.map(([n])=>`<option>${esc(n)}</option>`).join("");
 $("tb").innerHTML=[...S.out].map((o,i)=>[o,i]).sort((a,b)=>b[0].d.localeCompare(a[0].d)).map(([o,i])=>
  `<tr><td>${tgl(o.d)}</td><td>${esc(o.ds)}</td><td>${esc(o.k)}</td><td>${rp(o.n)}</td><td>${esc(o.m||"")}</td><td>${esc(o.c||"")}</td><td><button class="del" data-i="${i}" title="Hapus">✕</button></td></tr>`).join("")
  ||'<tr><td colspan="7" style="color:var(--mu)">Belum ada pengeluaran.</td></tr>';
 const sum=S.cats.reduce((a,c)=>a+c[1],0);
 $("al").innerHTML=S.cats.map(([n,p],i)=>`<tr><td>${esc(n)}</td><td><input type="number" min="0" max="100" value="${p}" data-c="${i}" style="width:90px"> %</td><td>${rp(S.income*p/100)}</td></tr>`).join("");
 $("alf").innerHTML=`<tr><th>Total</th><th class="${sum===100?'pos':'neg'}">${sum}%${sum===100?'':' (harus 100%)'}</th><th>${rp(S.income*sum/100)}</th></tr>`;
 $("prd").value=S.period;renderPay();
}
$("f").onsubmit=e=>{e.preventDefault();
 S.out.push({d:$("d").value,ds:$("ds").value.trim(),k:$("k").value,n:+$("n").value,m:$("m").value.trim(),c:$("c").value.trim()});
 save();$("f").reset();$("d").valueAsDate=new Date();render()};
$("tb").onclick=e=>{const i=e.target.dataset.i;if(i!==undefined&&confirm("Hapus pengeluaran ini?")){S.out.splice(+i,1);save();render()}};
$("al").oninput=e=>{const i=e.target.dataset.c;if(i===undefined)return;S.cats[i][1]=+e.target.value||0;save();
 const sum=S.cats.reduce((a,c)=>a+c[1],0);$("alf").innerHTML=`<tr><th>Total</th><th class="${sum===100?'pos':'neg'}">${sum}%${sum===100?'':' (harus 100%)'}</th><th>${rp(S.income*sum/100)}</th></tr>`;
 [...$("al").rows].forEach((r,j)=>r.cells[2].textContent=rp(S.income*S.cats[j][1]/100));
 $("cats").innerHTML="";const k=document.activeElement;render();k.focus&&0};
$("al").onchange=()=>render();
function renderPay(){
 $("frq").value=S.pay.n;const box=$("pay");
 if(!box.contains(document.activeElement)||box.children.length!==S.pay.n){
  box.innerHTML=S.pay.items.slice(0,S.pay.n).map((x,i)=>`<div><label>Pemasukan ${i+1} (nama & nominal Rp)</label><input data-l="${i}" value="${esc(x.l)}" placeholder="mis. Gajian tgl 1"><input type="number" min="0" data-a="${i}" value="${x.a}" style="margin-top:4px"></div>`).join("");}
 $("paytot").textContent="Total pemasukan per bulan: "+rp(S.income);
}
$("frq").onchange=e=>{S.pay.n=+e.target.value;save();render()};
$("pay").oninput=e=>{const t=e.target;if(t.dataset.a!==undefined)S.pay.items[+t.dataset.a].a=+t.value||0;else if(t.dataset.l!==undefined)S.pay.items[+t.dataset.l].l=t.value;save();render()};
$("prd").oninput=e=>{S.period=e.target.value;save();$("per").textContent="· "+S.period};
$("reset").onclick=()=>{if(confirm("Kembalikan semua data ke awal?")){S=JSON.parse(JSON.stringify(DEF));save();render()}};
$("d").valueAsDate=new Date();show("dash");render();
