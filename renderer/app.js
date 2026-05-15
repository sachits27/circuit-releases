/**
 * CIRCUIT by Circle Pro Audio
 * Renderer app.js — runs inside the Electron window
 *
 * window.circuit is the bridge to the main process (preload.js)
 * All PDF saves, file I/O, and Claude API calls go through it.
 */

// ─── Constants ──────────────────────────────────────────────────────────────
const UH=44, RS=[8,10,12,14,16,20,24,32,42];
const CATS=["All","Patching","Wireless","Amplifier","Processing","Network","Power","Accessory","Custom"];
const CC={All:"#888",Patching:"#E85D00",Wireless:"#1a5fa8",Amplifier:"#dc2626",Processing:"#0052A5",Network:"#1BA0D7",Power:"#2a7a2a",Accessory:"#777",Custom:"#16a34a"};
const BC={Neutrik:"#FF6B00","LINK Audio":"#0066CC",Ten47:"#CC0000",Seetronic:"#009933",Shure:"#003087",Sennheiser:"#00A0E3",Crown:"#E31837","d&b audiotechnik":"#D40000","Lab.gruppen":"#005CA8",QSC:"#C8102E",dbx:"#FF6600","BSS Audio":"#0052A5",Lake:"#006633",Cisco:"#1BA0D7",Netgear:"#00428C",Furman:"#003366",APC:"#7aaa2a",Generic:"#666"};
const GC=["#2563eb","#dc2626","#16a34a","#d97706","#7c3aed","#db2777"];
const RW=222;

function hs(s){let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(31,h)+s.charCodeAt(i))|0;return Math.abs(h);}
function hRGB(h){h=(h||"#666").replace("#","");const n=parseInt(h,16)||0x666666;return[(n>>16)&255,(n>>8)&255,n&255];}

// ─── Panel renderer (line-art style) ────────────────────────────────────────
function mkPanel(eq,W,H,simple){
  const c=CC[eq.category]||"#888",fg="#222",mid="#777",lt="#ccc",s=hs(eq.id||eq.name);
  if(simple){
    return`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" style="display:block">
      <rect width="${W}" height="${H}" fill="#fff"/>
      <rect x="0" y="0" width="4" height="${H}" fill="${c}"/>
      <text x="10" y="${H*.38}" fill="#bbb" font-size="8" font-family="Arial">${eq.brand.toUpperCase()}</text>
      <text x="10" y="${H*.7}" fill="#1a1a1a" font-size="${H>30?12:9}" font-family="Arial" font-weight="bold">${eq.name}</text>
    </svg>`;
  }
  let g=`<rect width="${W}" height="${H}" fill="#f9f9f9"/>
    <rect x="0" y="0" width="4" height="${H}" fill="${c}"/>
    <rect x="4.5" y=".5" width="${W-5}" height="${H-1}" fill="none" stroke="#eee" stroke-width=".5"/>`;
  const cat=eq.category;

  if(cat==="Patching"){
    const isX=eq.desc&&eq.desc.includes("XLR"), cnt=isX?8:12, rows=eq.uSize>1?2:1;
    for(let row=0;row<rows;row++){
      const cy=rows===2?(row===0?H*.32:H*.72):H/2;
      const sp=(W-10)/cnt, sx=5+sp/2;
      for(let i=0;i<cnt;i++){
        const cx=sx+i*sp, r=Math.min(sp*.44,H*.3,9);
        if(isX){
          g+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="${fg}" stroke-width="1"/>`;
          g+=`<circle cx="${cx-r*.35}" cy="${cy-r*.22}" r="${r*.15}" fill="${fg}"/>`;
          g+=`<circle cx="${cx+r*.35}" cy="${cy-r*.22}" r="${r*.15}" fill="${fg}"/>`;
          g+=`<circle cx="${cx}" cy="${cy+r*.38}" r="${r*.15}" fill="${fg}"/>`;
        } else {
          const bw=Math.min(sp*.4,5),bh=Math.min(H*.3,12);
          g+=`<rect x="${cx-bw/2}" y="${cy-bh/2}" width="${bw}" height="${bh}" rx="${bw/2}" fill="#fff" stroke="${fg}" stroke-width=".8"/>`;
          g+=`<ellipse cx="${cx}" cy="${cy}" rx="${bw*.25}" ry="${bh*.15}" fill="${mid}"/>`;
        }
      }
    }
  }
  else if(cat==="Wireless"){
    const ch=(eq.name.includes("4")||eq.name.includes("Quad"))?4:2, cw=(W-10)/ch;
    for(let i=0;i<ch;i++){
      const x=5+i*cw;
      if(i>0)g+=`<line x1="${x}" y1="3" x2="${x}" y2="${H-3}" stroke="#eee" stroke-width=".8"/>`;
      const dW=cw-15, dx=x+3;
      if(dW>8){
        const fv=(480+s*(i+3)%320).toFixed(2);
        g+=`<rect x="${dx}" y="${H*.15}" width="${dW}" height="${H*.7}" rx="1.5" fill="#f8f8f8" stroke="${mid}" stroke-width=".7"/>`;
        g+=`<text x="${dx+dW/2}" y="${H*.44}" text-anchor="middle" fill="${fg}" font-size="${Math.min(9,dW*.3)}" font-family="monospace" font-weight="bold">${fv}</text>`;
        g+=`<text x="${dx+dW/2}" y="${H*.63}" text-anchor="middle" fill="${mid}" font-size="5.5" font-family="Arial">MHz CH${i+1}</text>`;
        [3,5,7,9,7,5].forEach((bh,j)=>g+=`<rect x="${dx+2+j*2.5}" y="${H*.82-bh}" width="2" height="${bh}" rx=".2" fill="${j<4?fg:lt}"/>`);
      }
      g+=`<circle cx="${x+cw-6}" cy="${H*.5}" r="4.5" fill="#fff" stroke="${fg}" stroke-width=".8"/>`;
      g+=`<circle cx="${x+cw-6}" cy="${H*.5}" r="1.5" fill="${fg}"/>`;
      g+=`<circle cx="${x+cw-6}" cy="${H*.2}" r="2" fill="${(s>>(i+2)&1)===1?"#16a34a":"#eee"}" stroke="${mid}" stroke-width=".5"/>`;
    }
  }
  else if(cat==="Amplifier"){
    g+=`<text x="7" y="${H*.3}" fill="${fg}" font-size="6.5" font-family="Arial" font-weight="bold">${eq.brand.substring(0,9).toUpperCase()}</text>`;
    g+=`<text x="7" y="${H*.46}" fill="${mid}" font-size="5.5" font-family="Arial">${eq.name.substring(0,14)}</text>`;
    const vx=W*.28, vs=(W*.42)/4;
    for(let i=0;i<4;i++){
      const x=vx+i*(vs+2), mh=H*.7, my=H*.14, lvl=.2+((s*(i+2)*13)%55)/100;
      g+=`<rect x="${x}" y="${my}" width="${vs}" height="${mh}" rx="1" fill="#fff" stroke="${fg}" stroke-width=".8"/>`;
      for(let j=0;j<5;j++)g+=`<line x1="${x}" y1="${my+j*(mh/5)}" x2="${x+vs}" y2="${my+j*(mh/5)}" stroke="#f0f0f0" stroke-width=".4"/>`;
      g+=`<rect x="${x+.7}" y="${my+mh-lvl*mh}" width="${vs-1.4}" height="${lvl*mh}" rx=".5" fill="${mid}" opacity=".4"/>`;
      g+=`<text x="${x+vs/2}" y="${my+mh+8}" text-anchor="middle" fill="${mid}" font-size="5" font-family="Arial">${i+1}</text>`;
    }
    const sx=W*.82;
    for(let i=0;i<4;i++){
      const px=sx+(i%2)*15, py=H*.18+Math.floor(i/2)*(H*.38);
      g+=`<rect x="${px-6}" y="${py-6}" width="12" height="12" rx="2" fill="#fff" stroke="${fg}" stroke-width=".8"/>`;
      g+=`<line x1="${px-3.5}" y1="${py}" x2="${px+3.5}" y2="${py}" stroke="${fg}" stroke-width="1.8"/>`;
      g+=`<line x1="${px}" y1="${py-3.5}" x2="${px}" y2="${py+3.5}" stroke="${fg}" stroke-width="1.8"/>`;
    }
    g+=`<circle cx="6" cy="${H*.88}" r="2.2" fill="#16a34a"/>`;
  }
  else if(cat==="Processing"){
    const dw=Math.min(W*.36,64), dx=7;
    g+=`<rect x="${dx}" y="${H*.1}" width="${dw}" height="${H*.8}" rx="2" fill="#fff" stroke="${fg}" stroke-width=".8"/>`;
    g+=`<rect x="${dx+3}" y="${H*.18}" width="${dw-6}" height="${H*.64}" rx="1" fill="#f0f0f0" stroke="${mid}" stroke-width=".5"/>`;
    g+=`<text x="${dx+dw/2}" y="${H*.46}" text-anchor="middle" fill="${fg}" font-size="6" font-family="Arial">${eq.brand.substring(0,7)}</text>`;
    g+=`<text x="${dx+dw/2}" y="${H*.63}" text-anchor="middle" fill="${mid}" font-size="5.5" font-family="Arial">${eq.name.substring(0,9)}</text>`;
    for(let i=0;i<3;i++){
      const ex=dx+dw+14+i*21, ey=H*.5, ang=((s*(i+1))%240-120)*Math.PI/180;
      g+=`<circle cx="${ex}" cy="${ey}" r="8" fill="#fff" stroke="${fg}" stroke-width=".8"/>`;
      g+=`<circle cx="${ex}" cy="${ey}" r="3.5" fill="#f0f0f0" stroke="${mid}" stroke-width=".5"/>`;
      g+=`<line x1="${ex}" y1="${ey}" x2="${ex+Math.sin(ang)*4}" y2="${ey-Math.cos(ang)*4}" stroke="${fg}" stroke-width="1.3" stroke-linecap="round"/>`;
    }
    g+=`<circle cx="${W*.94}" cy="${H*.5}" r="2.8" fill="#16a34a"/>`;
  }
  else if(cat==="Network"){
    const pc=eq.name.includes("28")?9:7, pw=Math.min(16,(W-10)/pc-2), tot=pc*(pw+2)-2, px=(W-tot)/2;
    for(let i=0;i<pc;i++){
      const x2=px+i*(pw+2), y2=(H-11)/2-1, lk=((s>>i)&1)===1;
      g+=`<rect x="${x2}" y="${y2}" width="${pw}" height="11" rx="1.5" fill="#fff" stroke="${fg}" stroke-width=".8"/>`;
      for(let p=0;p<8;p++)g+=`<rect x="${x2+1+(p*(pw-2)/8)}" y="${y2+2}" width="${(pw-2)/8-.3}" height="3" fill="#ddd"/>`;
      g+=`<circle cx="${x2+3.5}" cy="${y2+14}" r="1.6" fill="${lk?"#16a34a":"#eee"}" stroke="${mid}" stroke-width=".4"/>`;
      g+=`<circle cx="${x2+pw-3.5}" cy="${y2+14}" r="1.6" fill="${lk&&((s>>(i+8))&1)?"#d97706":"#eee"}" stroke="${mid}" stroke-width=".4"/>`;
    }
  }
  else if(cat==="Power"){
    const oc=eq.desc&&eq.desc.includes("8")?6:4;
    const ow=Math.min((W-12)/oc-3,18), oh=Math.min(H*.6,24);
    const tot=oc*(ow+3)-3, ox=(W-tot)/2;
    for(let i=0;i<oc;i++){
      const ox2=ox+i*(ow+3), oy=(H-oh)/2;
      g+=`<rect x="${ox2}" y="${oy}" width="${ow}" height="${oh}" rx="2" fill="#fff" stroke="${fg}" stroke-width=".8"/>`;
      const hw=ow*.16, hgap=ow*.18;
      g+=`<rect x="${ox2+ow/2-hgap-hw/2}" y="${oy+oh*.2}" width="${hw}" height="${oh*.27}" rx=".5" fill="#bbb"/>`;
      g+=`<rect x="${ox2+ow/2+hgap-hw/2}" y="${oy+oh*.2}" width="${hw}" height="${oh*.27}" rx=".5" fill="#bbb"/>`;
      g+=`<circle cx="${ox2+ow/2}" cy="${oy+oh*.73}" r="${ow*.12}" fill="#bbb"/>`;
    }
    g+=`<circle cx="${W-7}" cy="${H*.5}" r="3" fill="#16a34a"/>`;
  }
  else {
    g+=`<text x="${W/2}" y="${H/2-1}" text-anchor="middle" fill="${mid}" font-size="7.5" font-family="Arial">${eq.brand.toUpperCase()}</text>`;
    g+=`<text x="${W/2}" y="${H/2+11}" text-anchor="middle" fill="${fg}" font-size="10" font-family="Arial" font-weight="bold">${eq.name}</text>`;
  }
  return`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" style="display:block">${g}</svg>`;
}

// ─── Equipment database ──────────────────────────────────────────────────────
const BASE_EQ=[
  {id:"n-001",brand:"Neutrik",name:"NYS-SPP-L Patchbay",category:"Patching",uSize:1,desc:"48-pt 1/4\" TRS patchbay",kg:.9,w:0},
  {id:"la-001",brand:"LINK Audio",name:"48pt Balanced PB",category:"Patching",uSize:1,desc:"48-pt balanced patchbay",kg:.8,w:0},
  {id:"la-002",brand:"LINK Audio",name:"96pt Bantam PB",category:"Patching",uSize:2,desc:"96-pt bantam patchbay",kg:1.6,w:0},
  {id:"t-003",brand:"Ten47",name:"XLR Patchbay 16pt",category:"Patching",uSize:2,desc:"16-pt XLR3F/XLR3M patchbay",kg:2.1,w:0},
  {id:"sh-001",brand:"Shure",name:"ULXD4Q",category:"Wireless",uSize:1,desc:"4-ch digital wireless receiver",kg:1.6,w:22},
  {id:"sh-002",brand:"Shure",name:"ULXD4D",category:"Wireless",uSize:1,desc:"Dual-ch UHF wireless receiver",kg:1.2,w:18},
  {id:"sh-004",brand:"Shure",name:"AD4Q Axient Digital",category:"Wireless",uSize:1,desc:"4-ch Axient Digital receiver",kg:1.8,w:25},
  {id:"sh-005",brand:"Shure",name:"PSM1000 Dual IEM",category:"Wireless",uSize:1,desc:"Dual IEM transmitter",kg:1.1,w:15},
  {id:"se-001",brand:"Sennheiser",name:"EM 6000",category:"Wireless",uSize:1,desc:"Dual-ch rackmount receiver",kg:1.4,w:20},
  {id:"se-003",brand:"Sennheiser",name:"EW-DX EM 4 Dante",category:"Wireless",uSize:1,desc:"4-ch ew-DX + Dante",kg:1.6,w:22},
  {id:"cr-001",brand:"Crown",name:"DCi 4|300N",category:"Amplifier",uSize:2,desc:"4-ch 300W DSP amp",kg:9.5,w:1800},
  {id:"cr-002",brand:"Crown",name:"DCi 8|300N",category:"Amplifier",uSize:2,desc:"8-ch 300W DSP amp",kg:10.2,w:2400},
  {id:"db-001",brand:"d&b audiotechnik",name:"D80",category:"Amplifier",uSize:2,desc:"4-ch 2500W touring amplifier",kg:15.5,w:3200},
  {id:"db-002",brand:"d&b audiotechnik",name:"D20",category:"Amplifier",uSize:2,desc:"4-ch 600W install amplifier",kg:8.5,w:1400},
  {id:"lg-001",brand:"Lab.gruppen",name:"PLM 10000Q",category:"Amplifier",uSize:2,desc:"4-ch 2500W Lake amp",kg:14.8,w:2800},
  {id:"qsc-a01",brand:"QSC",name:"PLD4.5",category:"Amplifier",uSize:2,desc:"4-ch 1250W DSP amplifier",kg:8.2,w:1500},
  {id:"bss-001",brand:"BSS Audio",name:"BLU-806",category:"Processing",uSize:1,desc:"12x8 Soundweb processor",kg:2.8,w:35},
  {id:"lake-001",brand:"Lake",name:"LM44",category:"Processing",uSize:1,desc:"4-in 4-out speaker processor",kg:2.4,w:30},
  {id:"qsc-p01",brand:"QSC",name:"Core 110f",category:"Processing",uSize:1,desc:"Q-SYS DSP processor",kg:3.2,w:45},
  {id:"dbx-001",brand:"dbx",name:"DriveRack PA2",category:"Processing",uSize:2,desc:"2-in 6-out speaker mgmt",kg:3.5,w:25},
  {id:"ci-001",brand:"Cisco",name:"SG350-28",category:"Network",uSize:1,desc:"28-port gigabit switch",kg:3.6,w:62},
  {id:"ng-001",brand:"Netgear",name:"GS728TP",category:"Network",uSize:1,desc:"28-port PoE+ switch",kg:4.2,w:195},
  {id:"fu-001",brand:"Furman",name:"PL-Plus C",category:"Power",uSize:1,desc:"15A power conditioner",kg:2.9,w:0},
  {id:"fu-003",brand:"Furman",name:"P-2400 AR",category:"Power",uSize:2,desc:"20A voltage regulation",kg:7.3,w:0},
  {id:"apc-001",brand:"APC",name:"AP7900B",category:"Power",uSize:1,desc:"8-outlet Switched PDU",kg:2.2,w:0},
  {id:"acc-001",brand:"Generic",name:"Blanking Panel 1U",category:"Accessory",uSize:1,desc:"1U blank panel",kg:.2,w:0},
  {id:"acc-002",brand:"Generic",name:"Blanking Panel 2U",category:"Accessory",uSize:2,desc:"2U blank panel",kg:.4,w:0},
  {id:"la-lk19p",brand:"LINK Audio",name:"LK19 Panel 1U",category:"Patching",uSize:1,desc:"19-pin multipin panel",kg:.8,w:0},
  {id:"la-lk25p",brand:"LINK Audio",name:"LK25 Panel 1U",category:"Patching",uSize:1,desc:"25-pin D-sub panel",kg:.7,w:0},
  {id:"la-lk37p",brand:"LINK Audio",name:"LK37 Panel 1U",category:"Patching",uSize:1,desc:"37-pin multipin panel",kg:.9,w:0},
  {id:"la-lk54p",brand:"LINK Audio",name:"LK54 Panel 1U",category:"Patching",uSize:1,desc:"54-pin multipin panel",kg:1.0,w:0},
];

// ─── State ───────────────────────────────────────────────────────────────────
let racks=[{id:"r1",name:"Main Rack",uCount:24,items:[]}];
let aId="r1", selId=null, drag=null, dU=null, dOk=false;
let fCat="All", fBr="All Brands", fSr="";
let cEq=[], etab=null, idc=0, sim=false;
let groups=[
  {id:"g1",name:"UTILITIES",color:"#2563eb"},
  {id:"g2",name:"RF",color:"#dc2626"},
  {id:"g3",name:"AUDIO",color:"#16a34a"}
];
let ig={};
const uid=()=>`i${++idc}`;
const allEq=()=>[...BASE_EQ,...cEq].map(e=>({...e,brandColor:BC[e.brand]||"#666"}));
const rack=()=>racks.find(r=>r.id===aId);

// ─── Helpers ─────────────────────────────────────────────────────────────────
function canDrop(rk,u,sz,excl){
  if(u<1||u+sz-1>rk.uCount)return false;
  for(let i=u;i<u+sz;i++){
    if(rk.items.some(it=>{
      if(it.id===excl)return false;
      const eq=allEq().find(e=>e.id===it.eqId);
      return eq&&i>=it.startU&&i<it.startU+eq.uSize;
    }))return false;
  }
  return true;
}
function uUsed(rk){return rk.items.reduce((s,it)=>{const eq=allEq().find(e=>e.id===it.eqId);return s+(eq?eq.uSize:0);},0);}
function fEq(){
  return allEq().filter(eq=>{
    if(fCat!=="All"&&eq.category!==fCat)return false;
    if(fBr!=="All Brands"&&eq.brand!==fBr)return false;
    if(fSr){const q=fSr.toLowerCase();if(![eq.name,eq.brand,eq.desc||""].some(x=>x.toLowerCase().includes(q)))return false;}
    return true;
  });
}

// ─── Render functions ─────────────────────────────────────────────────────────
function toggleSim(){sim=!sim;document.getElementById("stog").className="tog"+(sim?" on":"");rRack();}

function rPills(){
  const el=document.getElementById("pls");el.innerHTML="";
  CATS.forEach(c=>{
    const b=document.createElement("button");b.className="pl"+(fCat===c?" on":"");b.textContent=c;
    if(fCat===c){b.style.background=CC[c]||"#16a34a";b.style.borderColor=CC[c]||"#16a34a";}
    b.onclick=()=>{fCat=c;rPills();rEqList();};
    el.appendChild(b);
  });
}

function rBrands(){
  const sel=document.getElementById("bsel");
  const brs=["All Brands",...new Set(allEq().map(e=>e.brand))].sort((a,b)=>a==="All Brands"?-1:a.localeCompare(b));
  const cur=sel.value||"All Brands";
  sel.innerHTML="";
  brs.forEach(b=>{const o=document.createElement("option");o.value=b;o.textContent=b;sel.appendChild(o);});
  sel.value=brs.includes(cur)?cur:"All Brands";
  sel.onchange=()=>{fBr=sel.value;rEqList();};
}

function rEqList(){
  const el=document.getElementById("eql"),eqs=fEq();
  document.getElementById("cnt").textContent=`${eqs.length} item${eqs.length!==1?"s":""}`;
  el.innerHTML="";
  if(!eqs.length){el.innerHTML=`<div style="text-align:center;color:var(--text3);font-size:10px;margin-top:14px">No items match</div>`;return;}
  eqs.forEach(eq=>{
    const d=document.createElement("div");d.className="ec";d.draggable=true;
    d.innerHTML=`<div style="width:3px;height:28px;border-radius:2px;flex-shrink:0;background:${eq.brandColor}"></div>
      <div style="flex:1;min-width:0">
        <div style="font-size:8px;color:var(--text3);font-weight:600;text-transform:uppercase">${eq.brand}</div>
        <div style="font-size:10px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${eq.name}</div>
        <div style="font-size:9px;color:var(--text3)">${eq.uSize}U · ${eq.kg}kg · ${eq.w}W</div>
      </div>`;
    d.ondragstart=e=>{drag={type:"lib",eqId:eq.id,uSize:eq.uSize};e.dataTransfer.effectAllowed="copy";};
    d.ondragend=()=>{drag=null;dU=null;rRack();};
    el.appendChild(d);
  });
}

function rTabs(){
  const bar=document.getElementById("tabs");bar.innerHTML="";
  racks.forEach(r=>{
    const w=document.createElement("div");w.style.cssText="display:flex;align-items:center;flex-shrink:0";
    if(etab===r.id){
      const i=document.createElement("input");i.value=r.name;i.style.cssText="font-size:10px;width:90px;padding:2px 6px;font-weight:600";
      i.onblur=()=>{r.name=i.value||r.name;etab=null;rTabs();rInfo();};
      i.onkeydown=e=>{if(e.key==="Enter"){r.name=i.value||r.name;etab=null;rTabs();rInfo();}};
      w.appendChild(i);setTimeout(()=>i.focus(),10);
    } else {
      const b=document.createElement("button");b.className="rtab"+(r.id===aId?" on":"");b.textContent=`${r.name} (${r.uCount}U)`;
      b.onclick=()=>{aId=r.id;selId=null;rAll();};b.ondblclick=()=>{etab=r.id;rTabs();};w.appendChild(b);
      if(racks.length>1){
        const x=document.createElement("button");x.textContent="×";x.style.cssText="font-size:11px;padding:1px 5px;color:var(--text3);border:none;background:transparent;cursor:pointer";
        x.onclick=()=>{racks=racks.filter(rk=>rk.id!==r.id);if(aId===r.id)aId=racks[0].id;selId=null;rAll();};w.appendChild(x);
      }
    }
    bar.appendChild(w);
  });
  const ab=document.createElement("button");ab.textContent="+ Rack";ab.style.cssText="font-size:10px;padding:3px 9px;flex-shrink:0;border-radius:5px;color:var(--green);border-color:var(--green);font-weight:600";
  ab.onclick=()=>{const id="r"+Date.now();racks.push({id,name:`Rack ${racks.length+1}`,uCount:24,items:[]});aId=id;selId=null;rAll();};
  bar.appendChild(ab);
}

function rSizeSel(){
  const sel=document.getElementById("szs"),rk=rack();if(!rk)return;
  if(!sel.dataset.i){
    RS.forEach(s=>{const o=document.createElement("option");o.value=s;o.textContent=`${s}U`;sel.appendChild(o);});
    sel.onchange=()=>{
      const rk2=rack();if(!rk2)return;
      const nu=Number(sel.value);
      rk2.items=rk2.items.filter(it=>{const eq=allEq().find(e=>e.id===it.eqId);return eq&&it.startU+eq.uSize-1<=nu;});
      rk2.uCount=nu;rRack();rInfo();
    };
    sel.dataset.i="1";
  }
  sel.value=rk.uCount;
}

function rRack(){
  const rk=rack(),body=document.getElementById("rb"),ll=document.getElementById("ul");
  if(!rk){body.innerHTML="";return;}
  body.style.height=(rk.uCount*UH)+"px";
  ll.innerHTML="";
  for(let i=0;i<rk.uCount;i++){
    const d=document.createElement("div");
    d.style.cssText=`height:${UH}px;display:flex;align-items:center;justify-content:flex-end;padding-right:4px;font-size:9px;color:var(--text3);min-width:20px;font-weight:500;font-family:monospace`;
    d.textContent=rk.uCount-i;ll.appendChild(d);
  }
  body.innerHTML="";
  for(let i=0;i<=rk.uCount;i++){
    const l=document.createElement("div");
    l.style.cssText=`position:absolute;top:${i*UH}px;left:18px;right:18px;height:1px;background:#f0f0f0;z-index:1`;
    body.appendChild(l);
  }
  ["left:0;border-right:1px solid #aaa","right:0;border-left:1px solid #aaa"].forEach((s,ri)=>{
    const r=document.createElement("div");r.style.cssText=`position:absolute;top:0;bottom:0;width:18px;background:#ccc;${s};z-index:3`;
    for(let i=0;i<rk.uCount;i++){
      const sc=document.createElement("div");sc.style.cssText=`position:absolute;top:${i*UH+15}px;${ri?"right":"left"}:4px;width:8px;height:8px;border-radius:50%;background:#fff;border:1px solid #999`;
      r.appendChild(sc);
    }
    body.appendChild(r);
  });
  if(dU!==null&&drag){
    const pv=document.createElement("div");
    pv.style.cssText=`position:absolute;left:18px;right:18px;top:${(dU-1)*UH}px;height:${drag.uSize*UH}px;background:${dOk?"rgba(22,163,74,.1)":"rgba(220,38,38,.1)"};border:2px dashed ${dOk?"#16a34a":"#dc2626"};z-index:8;border-radius:2px;pointer-events:none;display:flex;align-items:center;justify-content:center`;
    const lb=document.createElement("span");lb.style.cssText=`font-size:10px;color:${dOk?"#16a34a":"#dc2626"};font-weight:700`;lb.textContent=dOk?`U${dU}`:"No";pv.appendChild(lb);body.appendChild(pv);
  }
  rk.items.forEach(item=>{
    const eq=allEq().find(e=>e.id===item.eqId);if(!eq)return;
    const isSel=item.id===selId;
    const wrap=document.createElement("div");
    wrap.style.cssText=`position:absolute;left:18px;right:18px;top:${(item.startU-1)*UH}px;height:${eq.uSize*UH}px;z-index:10;cursor:grab;border-radius:1px;${isSel?"outline:2px solid #16a34a;outline-offset:-1px":""}`;
    wrap.draggable=true;
    try{wrap.innerHTML=mkPanel(eq,RW,eq.uSize*UH,sim);}catch(e){wrap.innerHTML=`<div style="width:100%;height:100%;background:#f5f5f5;display:flex;align-items:center;padding:0 8px;font-size:11px;font-weight:600">${eq.name}</div>`;}
    wrap.ondragstart=e=>{e.stopPropagation();drag={type:"rack",itemId:item.id,uSize:eq.uSize};};
    wrap.ondragend=()=>{drag=null;dU=null;rRack();};
    wrap.onclick=e=>{e.stopPropagation();selId=(isSel?null:item.id);rRack();rInfo();};
    body.appendChild(wrap);
    const igrps=ig[item.id]||[];
    if(igrps.length){
      const gd=document.createElement("div");gd.style.cssText=`position:absolute;right:22px;top:${(item.startU-1)*UH+4}px;display:flex;flex-direction:column;gap:3px;z-index:12;pointer-events:none`;
      igrps.forEach(gid=>{const grp=groups.find(g=>g.id===gid);if(grp){const dot=document.createElement("div");dot.className="gd";dot.style.background=grp.color;gd.appendChild(dot);}});
      body.appendChild(gd);
    }
  });
  body.ondragover=e=>{
    e.preventDefault();if(!drag)return;
    const rect=body.getBoundingClientRect(),y=e.clientY-rect.top;
    const ru=Math.floor(y/UH)+1,mx=rk.uCount-drag.uSize+1,cu=Math.max(1,Math.min(ru,mx));
    if(cu!==dU||dOk!==canDrop(rk,cu,drag.uSize,drag.itemId)){dU=cu;dOk=canDrop(rk,cu,drag.uSize,drag.itemId);rRack();}
  };
  body.ondragleave=()=>{dU=null;rRack();};
  body.ondrop=e=>{
    e.preventDefault();if(!drag||dU===null||!dOk)return;
    if(drag.type==="rack"){const it=rk.items.find(i=>i.id===drag.itemId);if(it)it.startU=dU;}
    else rk.items.push({id:uid(),eqId:drag.eqId,startU:dU});
    drag=null;dU=null;rRack();rInfo();
  };
  body.onclick=()=>{selId=null;rRack();rInfo();};
}

function rInfo(){
  const rk=rack();if(!rk)return;
  const u=uUsed(rk);
  const totW=rk.items.reduce((s,it)=>{const eq=allEq().find(e=>e.id===it.eqId);return s+(eq?eq.kg:0);},0);
  const totP=rk.items.reduce((s,it)=>{const eq=allEq().find(e=>e.id===it.eqId);return s+(eq?eq.w:0);},0);
  document.getElementById("sd").textContent=rk.items.length;
  document.getElementById("su").textContent=`${u}/${rk.uCount}U`;
  document.getElementById("sw").textContent=totW.toFixed(1)+" kg";
  document.getElementById("sp").textContent=totP+" W";
  document.getElementById("ul2").textContent=`${u} of ${rk.uCount}U used`;
  const bar=document.getElementById("ub");bar.style.width=Math.min(100,Math.round(u/rk.uCount*100))+"%";bar.style.background=u>rk.uCount*.85?"#dc2626":"#16a34a";
  document.getElementById("rname").value=rk.name;document.getElementById("szs").value=rk.uCount;
  const si=document.getElementById("sel"),ia=document.getElementById("iga");
  if(selId){
    const item=rk.items.find(it=>it.id===selId),eq=item?allEq().find(e=>e.id===item.eqId):null;
    if(eq&&item){
      si.style.display="";
      document.getElementById("selc").innerHTML=`<div style="border-left:3px solid ${eq.brandColor};padding-left:7px"><div style="font-size:11px;font-weight:600">${eq.name}</div><div style="font-size:9px;color:${eq.brandColor};font-weight:600;margin-top:1px">${eq.brand}</div><div style="font-size:9px;color:var(--text2);margin-top:2px">${eq.uSize}U · slot ${item.startU} · ${eq.kg}kg · ${eq.w}W</div></div>`;
      ia.style.display="";
      const ab2=document.getElementById("igab");ab2.innerHTML="";
      groups.forEach(grp=>{
        const igrps=ig[item.id]||[];const active=igrps.includes(grp.id);
        const b=document.createElement("button");b.style.cssText=`font-size:9px;padding:2px 7px;border-radius:10px;background:${active?grp.color:"transparent"};border-color:${grp.color};color:${active?"#fff":grp.color}`;
        b.textContent=grp.name;b.onclick=()=>{const cur=ig[item.id]||[];ig[item.id]=cur.includes(grp.id)?cur.filter(x=>x!==grp.id):[...cur,grp.id];rRack();rInfo();};
        ab2.appendChild(b);
      });
      return;
    }
  }
  si.style.display="none";ia.style.display="none";
}

function rGroups(){
  const el=document.getElementById("grpl");el.innerHTML="";
  groups.forEach((grp,i)=>{
    const row=document.createElement("div");row.style.cssText="display:flex;align-items:center;gap:5px;padding:3px 0;border-bottom:1px solid var(--border)";
    const dot=document.createElement("div");dot.className="gd";dot.style.background=grp.color;dot.onclick=()=>{grp.color=GC[(GC.indexOf(grp.color)+1)%GC.length];rGroups();rRack();};
    const nm=document.createElement("input");nm.value=grp.name;nm.style.cssText="flex:1;font-size:10px;font-weight:600;padding:2px 4px;background:transparent;border:none;color:var(--text);outline:none";nm.onchange=()=>{grp.name=nm.value;rRack();rInfo();};
    const del=document.createElement("button");del.textContent="×";del.style.cssText="font-size:11px;padding:0 4px;border:none;background:transparent;color:var(--text3);cursor:pointer";del.onclick=()=>{groups.splice(i,1);rGroups();rRack();rInfo();};
    row.append(dot,nm,del);el.appendChild(row);
  });
  if(!groups.length)el.innerHTML=`<div style="font-size:10px;color:var(--text3);padding:3px 0">No groups — click + Add</div>`;
}

function rAll(){rTabs();rSizeSel();rRack();rInfo();rEqList();rBrands();rGroups();}

// ─── PDF Export ──────────────────────────────────────────────────────────────
// In the desktop app: jsPDF generates the PDF, we send base64 to main.js,
// which shows a native Save dialog. The file lands wherever the user picks.
// No sandbox. No tricks. Just works.
async function exportPDF(){
  const btn=document.getElementById("bPDF"),orig=btn.textContent;
  const rk=rack();
  if(!rk||!rk.items.length){alert("Add equipment to the rack first.");return;}
  btn.textContent="Building…";btn.disabled=true;
  try{
    const {jsPDF}=window.jspdf;
    const doc=new jsPDF("p","mm","a4"),PW=210,M=14;
    const totW=rk.items.reduce((s,it)=>{const eq=allEq().find(e=>e.id===it.eqId);return s+(eq?eq.kg:0);},0);
    const totP=rk.items.reduce((s,it)=>{const eq=allEq().find(e=>e.id===it.eqId);return s+(eq?eq.w:0);},0);

    // Header
    doc.setFillColor(17,17,17);doc.rect(0,0,PW,22,"F");
    doc.setFontSize(12);doc.setTextColor(140,140,140);doc.text("CIRCUIT",M,14);
    doc.setTextColor(22,163,74);doc.text("by Circle Pro Audio",M+34,14);
    doc.setFontSize(6.5);doc.setTextColor(80,80,80);
    doc.text(`Rack layout — ${rk.name}`,M,20);
    doc.text(`${rk.uCount}U · ${rk.items.length} devices · ${totW.toFixed(1)}kg · ${totP}W`,PW-M,20,{align:"right"});
    doc.setTextColor(90,90,90);doc.text(new Date().toLocaleDateString("en-GB"),PW-M,14,{align:"right"});

    let y=30;const rX=M+8,rW=PW-M-rX-2,uH=7.8;
    doc.setFontSize(5.5);doc.setTextColor(140,140,140);
    doc.text("U",M+1,y-2);doc.text("Model",rX+4,y-2);doc.text("Brand",rX+rW*.48,y-2);doc.text("kg",rX+rW*.76,y-2);doc.text("W",rX+rW*.89,y-2);
    doc.setDrawColor(180,180,180);doc.line(rX,y-1,rX+rW,y-1);

    const sorted=[...rk.items].sort((a,b)=>a.startU-b.startU);
    const occ=new Set();sorted.forEach(it=>{const eq=allEq().find(e=>e.id===it.eqId);if(eq)for(let u=it.startU;u<it.startU+eq.uSize;u++)occ.add(u);});

    for(let u=1;u<=rk.uCount;u++){
      if(y+uH>285){doc.addPage();y=14;}
      const item=sorted.find(it=>it.startU===u);
      if(item){
        const eq=allEq().find(e=>e.id===item.eqId);if(!eq)continue;
        const ih=eq.uSize*uH,[r2,g2,b2]=hRGB(CC[eq.category]||"#888");
        doc.setFillColor(248,248,248);doc.rect(rX,y,rW,ih,"F");
        doc.setFillColor(r2,g2,b2);doc.rect(rX,y,2.5,ih,"F");
        doc.setFontSize(5);doc.setTextColor(120,120,120);doc.text(`${u}`,M+1,y+ih/2+1.5);
        doc.setFontSize(ih>10?7.5:5.5);doc.setTextColor(25,25,25);doc.text(eq.name.substring(0,30),rX+4,y+ih/2+2);
        doc.setFontSize(5.5);doc.setTextColor(80,80,80);doc.text(eq.brand.substring(0,14),rX+rW*.48,y+ih/2+2);
        doc.text(eq.kg.toFixed(1),rX+rW*.76,y+ih/2+2);doc.text(String(eq.w),rX+rW*.89,y+ih/2+2);
        doc.setDrawColor(220,220,220);doc.rect(rX,y,rW,ih,"S");
        y+=ih+0.4;
      } else if(!occ.has(u)){
        doc.setFillColor(252,252,252);doc.rect(rX,y,rW,uH,"F");
        doc.setFontSize(5);doc.setTextColor(180,180,180);doc.text(`${u}`,M+1,y+uH/2+1.5);
        y+=uH+0.4;
      }
    }

    // BOM page
    doc.addPage();
    doc.setFillColor(17,17,17);doc.rect(0,0,PW,22,"F");
    doc.setFontSize(12);doc.setTextColor(140,140,140);doc.text("CIRCUIT",M,14);
    doc.setTextColor(22,163,74);doc.text("by Circle Pro Audio",M+34,14);
    doc.setFontSize(6.5);doc.setTextColor(80,80,80);
    doc.text(`Bill of materials — ${rk.name}`,M,20);
    doc.text(`${sorted.length} items · ${totW.toFixed(1)}kg · ${totP}W`,PW-M,20,{align:"right"});
    doc.setTextColor(90,90,90);doc.text(new Date().toLocaleDateString("en-GB"),PW-M,14,{align:"right"});

    y=30;doc.setFillColor(240,240,240);doc.rect(M,y-5,PW-M*2,8,"F");
    doc.setFontSize(6.5);doc.setTextColor(80,80,80);
    const cols=[M+1,M+10,M+44,M+90,M+115,M+132,M+147];
    ["U","Brand","Model","Cat.","Description","kg","W"].forEach((h,i)=>doc.text(h,cols[i],y));
    y+=8;
    sorted.forEach((item,idx)=>{
      const eq=allEq().find(e=>e.id===item.eqId);if(!eq)return;
      if(y>280){doc.addPage();y=M;}
      if(idx%2===0){doc.setFillColor(250,250,250);doc.rect(M,y-4.5,PW-M*2,7,"F");}
      const[r2,g2,b2]=hRGB(CC[eq.category]||"#888");
      doc.setFillColor(r2,g2,b2);doc.rect(M,y-4.5,2,7,"F");
      doc.setFontSize(6.5);doc.setTextColor(25,25,25);
      [`U${item.startU}`,eq.brand.substring(0,12),eq.name.substring(0,22),eq.category.substring(0,9),(eq.desc||"").substring(0,18),eq.kg.toFixed(1),String(eq.w)].forEach((v,i)=>doc.text(v,cols[i]+1,y));
      y+=7;
    });
    y+=4;doc.setDrawColor(200,200,200);doc.line(M,y,PW-M,y);y+=4;
    doc.setFontSize(7);doc.setTextColor(100,100,100);doc.text(`${sorted.length} items · ${totW.toFixed(1)} kg · ${totP} W`,M,y);
    doc.setFontSize(6.5);doc.setTextColor(180,180,180);doc.text("CIRCUIT — Circle Pro Audio",PW-M,y,{align:"right"});

    // ── NATIVE SAVE DIALOG ────────────────────────────────────────────────
    // This is the desktop-app difference. We send base64 to main.js
    // which opens a proper macOS/Windows Save dialog. File goes wherever user picks.
    const base64=doc.output("datauristring").split(",")[1];
    const defaultName=`${rk.name.replace(/[^a-z0-9]/gi,"_")}_CIRCUIT.pdf`;
    const result=await window.circuit.savePDF(base64,defaultName);
    if(result.success){
      btn.textContent="✓ Saved!";setTimeout(()=>{btn.textContent=orig;},2500);
    } else if(result.reason!=="cancelled"){
      alert("Save error: "+result.reason);
    }
  }catch(e){
    alert("PDF error: "+e.message);
  } finally {
    btn.disabled=false;
    setTimeout(()=>{if(btn.textContent==="Building…")btn.textContent=orig;},3000);
  }
}

// ─── Claude AI integration ────────────────────────────────────────────────────
// User types in the AI bar at the bottom of the sidebar.
// Claude returns structured JSON → we add it to the equipment library instantly.
async function claudeAsk(){
  const input=document.getElementById("ai-input");
  const status=document.getElementById("ai-status");
  const q=input.value.trim();
  if(!q)return;

  status.textContent="Asking Claude…";status.style.color="var(--text3)";
  document.getElementById("ai-btn").disabled=true;

  const systemPrompt=`You are the CIRCUIT equipment assistant for Circle Pro Audio. You have expert knowledge of professional audio/video rack equipment dimensions and specifications.

When asked to add or look up equipment, return ONLY a valid JSON array of device objects — no markdown, no explanation, no code fences.

Each object must have exactly these fields:
- id: lowercase-hyphenated unique string (e.g. "shure-ad4d", "lab-fp6400")
- brand: exact manufacturer name (e.g. "Shure", "Sennheiser", "Lab.gruppen", "d&b audiotechnik")
- name: exact product model name
- category: one of exactly: Patching | Wireless | Amplifier | Processing | Network | Power | Accessory
- uSize: rack units as an integer — use the REAL published spec:
    • Most signal processors, preamps, interfaces = 1U
    • Power amplifiers (small/medium) = 2U; large touring amps = 3U or 4U
    • Wireless receiver 2-ch = 1U; 4-ch = 1U; 8-ch = 2U
    • Patch bays, DI boxes, power conditioners = 1U
    • Large format routers/matrices = 2U–4U
- desc: concise spec string (e.g. "4-ch UHF true diversity, 470–636 MHz")
- kg: real published weight in kg (decimal, e.g. 2.4) — do NOT guess; use actual spec
- w: real published power consumption in watts (0 if passive/unpowered)

IMPORTANT — dimension accuracy:
- Never invent or approximate uSize; always use the manufacturer's published rack unit height
- For wireless systems: a dual receiver like Shure AD4D is 1U; an 8-ch system like Shure Axient AD4Q is 1U
- For amplifiers: Lab.gruppen FP6400 is 2U; Crown IT4x3500HD is 2U; d&b D80 is 2U
- For processing: BSS BLU-800 is 1U; Lake LM44 is 1U; dbx DriveRack PA2 is 1U

If the user asks a question (not adding equipment), return: {"message": "your helpful response here"}`;

  try{
    const result=await window.circuit.claudeQuery(q,systemPrompt);
    if(result.error){
      if(result.error.includes("No API key")){
        status.textContent="⚠ Set your API key in ⚙ Settings";
        status.style.color="#dc2626";
      } else {
        status.textContent="Error: "+result.error;
        status.style.color="#dc2626";
      }
      return;
    }

    // Try to parse as JSON (strip markdown code fences if present)
    try{
      const clean=result.text.replace(/^```(?:json)?\s*/i,'').replace(/```\s*$/,'').trim();
      const parsed=JSON.parse(clean);
      // Check if it's a message (not a device array)
      if(parsed.message){
        status.textContent="Claude: "+parsed.message.substring(0,120);
        status.style.color="var(--text2)";
        return;
      }
      // It's a device array
      const devices=Array.isArray(parsed)?parsed:[parsed];
      let added=0;
      devices.forEach(dev=>{
        if(!dev.name||!dev.category)return;
        const id=dev.id||"claude-"+Date.now()+"-"+Math.random().toString(36).slice(2,6);
        // Don't duplicate
        if(cEq.some(e=>e.id===id)||BASE_EQ.some(e=>e.name===dev.name&&e.brand===dev.brand))return;
        cEq.push({...dev,id,brandColor:BC[dev.brand]||"#888"});
        added++;
      });
      if(added>0){
        status.textContent=`✓ Added ${added} device${added>1?"s":""} to library`;
        status.style.color="var(--green)";
        rEqList();rBrands();
        input.value="";
      } else {
        status.textContent="Device already in library";
        status.style.color="var(--text3)";
      }
    } catch(parseErr){
      // Not JSON — show as a message
      status.textContent="Claude: "+result.text.substring(0,120);
      status.style.color="var(--text2)";
    }
  } catch(e){
    status.textContent="Error: "+e.message;
    status.style.color="#dc2626";
  } finally {
    document.getElementById("ai-btn").disabled=false;
    setTimeout(()=>{if(status.style.color!=="var(--red)")status.textContent="";},8000);
  }
}

// ─── Connector Panel Builder ──────────────────────────────────────────────────
// w = connector width in mm on a standard panel (usable row width = 400mm)
const CONNECTOR_DATA={
  'Neutrik':{color:'#FF6B00',connectors:[
    // XLR — D-series 24mm panel cutout, ~30mm panel pitch
    {id:'n-xlr3f', name:'XLR 3F',     desc:'NC3FD-L-B-1 · 24mm ∅',  w:30, color:'#E85D00', category:'Patching', kg:0.05},
    {id:'n-xlr3m', name:'XLR 3M',     desc:'NC3MD-LX · 24mm ∅',      w:30, color:'#C84000', category:'Patching', kg:0.05},
    {id:'n-xlr5f', name:'XLR 5F',     desc:'NC5FD-L-B · 24mm ∅',     w:30, color:'#D95000', category:'Patching', kg:0.05},
    {id:'n-xlr5m', name:'XLR 5M',     desc:'NC5MD-LX · 24mm ∅',      w:30, color:'#B83800', category:'Patching', kg:0.05},
    // Jacks
    {id:'n-trs',   name:'TRS Jack',   desc:'NJ3FP6C · M12 bushing',   w:16, color:'#FF8833', category:'Patching', kg:0.04},
    {id:'n-ts',    name:'TS Jack',    desc:'NJ2FP6C · M12 bushing',   w:16, color:'#FF9955', category:'Patching', kg:0.04},
    // speakON — D-size flange, 24mm cutout
    {id:'n-spk2',  name:'speakON 2',  desc:'NL2MPXX · 2-pole',        w:32, color:'#EF4444', category:'Patching', kg:0.08},
    {id:'n-spk4',  name:'speakON 4',  desc:'NL4MPXX · 4-pole',        w:32, color:'#DC2626', category:'Patching', kg:0.09},
    {id:'n-spk8',  name:'speakON 8',  desc:'NL8MPXX · 8-pole',        w:44, color:'#B91C1C', category:'Patching', kg:0.13},
    // etherCON — D-type rectangular body
    {id:'n-eth',   name:'etherCON',   desc:'NE8FDP · D-type CAT5e',   w:36, color:'#1BA0D7', category:'Network',  kg:0.06},
    // powerCON TRUE1 — keyed oval twist-lock, ~48mm wide
    {id:'n-pwr-f', name:'pCON TRUE1 ↓',desc:'NAC3FPX-TRUE1 · inlet',  w:48, color:'#1B5E20', category:'Power',    kg:0.12},
    {id:'n-pwr-m', name:'pCON TRUE1 ↑',desc:'NAC3MPX-TRUE1 · outlet', w:48, color:'#2E7D32', category:'Power',    kg:0.12},
    // Fibre
    {id:'n-opt',   name:'opticalCON', desc:'NO2D · dual fibre',        w:34, color:'#8B5CF6', category:'Patching', kg:0.08},
    {id:'n-tru',   name:'TruCON',     desc:'Fibre + power hybrid',     w:34, color:'#7C3AED', category:'Patching', kg:0.10},
  ]},
  'LINK Audio':{color:'#0066CC',connectors:[
    {id:'la-lk13', name:'LK13',        desc:'13-pin · Shell 20 · ∅38mm',  w:44, color:'#0066CC', category:'Patching', kg:0.15},
    {id:'la-lk19', name:'LK19',        desc:'19-pin · Shell 22 · ∅52mm',  w:58, color:'#0052A5', category:'Patching', kg:0.20},
    {id:'la-lk25', name:'LK25',        desc:'25-pin · Shell 24 · ∅57mm',  w:63, color:'#004080', category:'Patching', kg:0.22},
    {id:'la-lk37', name:'LK37',        desc:'37-pin · Shell 28 · ∅65mm',  w:72, color:'#003D7A', category:'Patching', kg:0.28},
    {id:'la-lk54', name:'LK54',        desc:'54-pin · Shell 32 · ∅76mm',  w:82, color:'#002952', category:'Patching', kg:0.35},
    {id:'la-pl-b', name:'PowerLink B', desc:'Single-pole Blue 16A',w:32, color:'#1565C0', category:'Power',    kg:0.10},
    {id:'la-pl-r', name:'PowerLink R', desc:'Single-pole Red 16A', w:32, color:'#B71C1C', category:'Power',    kg:0.10},
    {id:'la-pl-bk',name:'PowerLink Bk',desc:'Single-pole Black 16A',w:32,color:'#222222', category:'Power',    kg:0.10},
  ]},
  'BALS':{color:'#E65100',connectors:[
    // Schuko (domestic) — 50×50mm flange, 16A 250V 2P+PE IP54
    {id:'bals-schuko',   name:'Schuko',        desc:'71102 · 16A 250V · IP54',            w:55,  color:'#757575', category:'Power', kg:0.18},
    // CEE industrial blue (2P+PE) — 75×75mm flange
    {id:'bals-cee16-3',  name:'CEE 16A 3-pin', desc:'136861 · 16A 230V 2P+PE · IP54',    w:80,  color:'#1565C0', category:'Power', kg:0.25},
    {id:'bals-cee32-3',  name:'CEE 32A 3-pin', desc:'137031 · 32A 230V 2P+PE · IP54',    w:80,  color:'#0D47A1', category:'Power', kg:0.28},
    // CEE industrial blue (3p+N+PE 5-pin) — 75×75mm flange
    {id:'bals-cee16-5',  name:'CEE 16A 5-pin', desc:'1320011 · 16A 400V 3p+N+PE · IP54', w:80,  color:'#1976D2', category:'Power', kg:0.28},
    {id:'bals-cee32-5',  name:'CEE 32A 5-pin', desc:'1320021 · 32A 400V 3p+N+PE · IP54', w:80,  color:'#1565C0', category:'Power', kg:0.30},
    {id:'bals-cee63-5',  name:'CEE 63A 5-pin', desc:'136 · 63A 400V 3p+N+PE · IP44',     w:112, color:'#0D47A1', category:'Power', kg:0.55},
    // CEE industrial red (3P+PE 4-pin) — 75×75mm flange
    {id:'bals-cee16-4r', name:'CEE 16A 4-pin', desc:'13693 · 16A 415V 3P+PE · IP44',     w:80,  color:'#C62828', category:'Power', kg:0.26},
    {id:'bals-cee32-4r', name:'CEE 32A 4-pin', desc:'13710 · 32A 415V 3P+PE · IP44',     w:80,  color:'#B71C1C', category:'Power', kg:0.30},
    {id:'bals-cee63-4r', name:'CEE 63A 4-pin', desc:'134 · 63A 415V 3P+PE · IP44',       w:112, color:'#7F0000', category:'Power', kg:0.55},
    // Event sockets (blue, 3p+N+PE) — same ~75mm footprint
    {id:'bals-ev16-5',   name:'Event 16A',      desc:'28314 · 16A 400V 3p+N+PE · IP44',  w:80,  color:'#1E88E5', category:'Power', kg:0.30},
    {id:'bals-ev32-5',   name:'Event 32A',      desc:'28298 · 32A 400V 3p+N+PE · IP44',  w:80,  color:'#1565C0', category:'Power', kg:0.35},
    // Event inlets (panel-mount appliance inlet)
    {id:'bals-evi16-5',  name:'Event Inlet 16A',desc:'120436 · 16A 400V inlet · IP44',   w:80,  color:'#0277BD', category:'Power', kg:0.28},
    {id:'bals-evi32-5',  name:'Event Inlet 32A',desc:'120441 · 32A 400V inlet · IP44',   w:80,  color:'#01579B', category:'Power', kg:0.32},
  ]},
  'Ten47':{color:'#CC0000',connectors:[
    {id:'t47-pc8m',   name:'PA-COM 8M',   desc:'8-pin male · Shell 22 · ∅52mm',  w:58, color:'#AA0000', category:'Patching', kg:0.18},
    {id:'t47-pc8f',   name:'PA-COM 8F',   desc:'8-pin female · Shell 22 · ∅52mm', w:58, color:'#880000', category:'Patching', kg:0.18},
    {id:'t47-pc19m',  name:'PA-COM 19M',  desc:'19-pin male · Shell 20 · ∅44mm',  w:50, color:'#AA0000', category:'Patching', kg:0.16},
    {id:'t47-pc19f',  name:'PA-COM 19F',  desc:'19-pin female · Shell 20 · ∅44mm',w:50, color:'#880000', category:'Patching', kg:0.16},
    {id:'t47-tl25m',  name:'TourLine 25M',desc:'25-pin male · Shell 32 · ∅76mm',  w:82, color:'#CC3300', category:'Patching', kg:0.30},
    {id:'t47-tl25f',  name:'TourLine 25F',desc:'25-pin female · Shell 32 · ∅76mm', w:82, color:'#991100', category:'Patching', kg:0.30},
    {id:'t47-tl37m',  name:'TourLine 37M',desc:'37-pin male · Shell 32 · ∅76mm',  w:82, color:'#CC3300', category:'Patching', kg:0.32},
    {id:'t47-tl37f',  name:'TourLine 37F',desc:'37-pin female · Shell 32 · ∅76mm', w:82, color:'#991100', category:'Patching', kg:0.32},
  ]},
};
// flat lookup
const CP_ALL={};
Object.values(CONNECTOR_DATA).forEach(b=>b.connectors.forEach(c=>CP_ALL[c.id]=c));

const CP_ROW_MM=400; // usable panel width per row in mm
let cpMix={}; // connectorId -> count

function cpSetTab(tab){
  document.getElementById('cpPane').style.display=tab==='panel'?'flex':'none';
  document.getElementById('cgPane').style.display=tab==='generic'?'':'none';
  const on='border:none;border-bottom:2px solid var(--green);border-radius:0;padding:10px 14px;font-weight:600;color:var(--green);font-size:11px;background:transparent';
  const off='border:none;border-bottom:2px solid transparent;border-radius:0;padding:10px 14px;font-weight:600;color:var(--text3);font-size:11px;background:transparent';
  document.getElementById('cpTab').style.cssText=tab==='panel'?on:off;
  document.getElementById('cgTab').style.cssText=tab==='generic'?on:off;
}

function openCEM(){
  cpMix={};
  cpRenderPalette();
  cpRenderPanel();
  document.getElementById('cpName').value='';
  document.getElementById('cpStatus').textContent='';
  cpSetTab('panel');
  document.getElementById('cem').style.display='flex';
}

function cpRenderPalette(){
  const el=document.getElementById('cpPalette'); el.innerHTML='';
  Object.entries(CONNECTOR_DATA).forEach(([brand,bd])=>{
    const sec=document.createElement('div');
    sec.style.cssText='margin-bottom:10px';
    sec.innerHTML=`<div style="font-size:9px;font-weight:700;color:${bd.color};text-transform:uppercase;letter-spacing:.8px;padding:5px 4px 4px;border-bottom:1px solid var(--border);margin-bottom:4px">${brand}</div>`;
    bd.connectors.forEach(c=>{
      const row=document.createElement('div');
      row.style.cssText='display:flex;align-items:center;gap:5px;padding:3px 2px;border-radius:4px';
      row.innerHTML=`
        <div style="width:10px;height:28px;border-radius:2px;flex-shrink:0;background:${c.color}"></div>
        <div style="flex:1;min-width:0">
          <div style="font-size:10px;font-weight:600">${c.name}</div>
          <div style="font-size:8px;color:var(--text3)">${c.desc} · ${c.w}mm</div>
        </div>
        <button data-id="${c.id}" data-op="minus" style="width:22px;height:22px;padding:0;font-size:14px;line-height:1;flex-shrink:0">−</button>
        <span id="cpq-${c.id}" style="font-size:11px;font-weight:700;width:18px;text-align:center;flex-shrink:0">${cpMix[c.id]||0}</span>
        <button data-id="${c.id}" data-op="plus"  style="width:22px;height:22px;padding:0;font-size:14px;line-height:1;flex-shrink:0">+</button>`;
      row.querySelectorAll('button').forEach(b=>b.onclick=()=>{
        const id=b.dataset.id;
        if(b.dataset.op==='plus') cpMix[id]=(cpMix[id]||0)+1;
        else cpMix[id]=Math.max(0,(cpMix[id]||0)-1);
        if(!cpMix[id])delete cpMix[id];
        const qEl=document.getElementById('cpq-'+id);
        if(qEl)qEl.textContent=cpMix[id]||0;
        cpRenderPanel();
      });
      sec.appendChild(row);
    });
    el.appendChild(sec);
  });
}

function cpCalcRows(){
  // Expand mix into flat list of connector objects
  const flat=[];
  Object.entries(cpMix).forEach(([id,count])=>{
    const c=CP_ALL[id]; if(!c)return;
    for(let i=0;i<count;i++)flat.push(c);
  });
  // Pack into rows
  const rows=[[]]; let rowW=0;
  flat.forEach(c=>{
    if(rowW+c.w>CP_ROW_MM&&rows[rows.length-1].length>0){rows.push([]);rowW=0;}
    rows[rows.length-1].push(c); rowW+=c.w;
  });
  return rows.filter(r=>r.length>0);
}

function cpSVGConnector(c,x,y,pw,ph){
  const cx=x+pw/2, cy=y+ph/2;
  const sz=Math.min(pw,ph);
  // panel plate background
  let s=`<rect x="${x+.5}" y="${y+2}" width="${pw-1}" height="${ph-4}" rx="2" fill="#e4e4e4" stroke="#bbb" stroke-width=".6"/>`;

  if(['n-xlr3f','n-xlr5f'].includes(c.id)){
    // Female XLR: see socket holes (dark) in delta/penta arrangement
    const pins=c.id==='n-xlr5f'?5:3;
    const r=Math.min(sz*.38,ph*.38);
    s+=`<circle cx="${cx}" cy="${cy}" r="${r+2}" fill="#9a9a9a" stroke="#777" stroke-width=".8"/>`;
    s+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#d0d0d0"/>`;
    // key notch (female has slot at top)
    s+=`<rect x="${cx-r*.12}" y="${cy-r-1.5}" width="${r*.24}" height="${r*.28}" rx="${r*.05}" fill="#555"/>`;
    const pr=Math.max(1.5,r*.12);
    if(pins===3){
      [[0,-r*.38],[-r*.33,r*.22],[r*.33,r*.22]].forEach(([dx,dy])=>{
        s+=`<circle cx="${cx+dx}" cy="${cy+dy}" r="${pr+.8}" fill="#444"/><circle cx="${cx+dx}" cy="${cy+dy}" r="${pr}" fill="#111"/>`;
      });
    } else {
      for(let i=0;i<5;i++){const a=(i/5)*Math.PI*2-Math.PI/2;s+=`<circle cx="${cx+r*.40*Math.cos(a)}" cy="${cy+r*.40*Math.sin(a)}" r="${pr+.6}" fill="#444"/><circle cx="${cx+r*.40*Math.cos(a)}" cy="${cy+r*.40*Math.sin(a)}" r="${pr}" fill="#111"/>`;}
    }
    s+=`<circle cx="${cx}" cy="${cy}" r="${r*.16}" fill="none" stroke="#bbb" stroke-width=".4"/>`;
  }
  else if(['n-xlr3m','n-xlr5m'].includes(c.id)){
    // Male XLR: see pins (silver cylinders) projecting, key at top
    const pins=c.id==='n-xlr5m'?5:3;
    const r=Math.min(sz*.38,ph*.38);
    s+=`<circle cx="${cx}" cy="${cy}" r="${r+2}" fill="#888" stroke="#666" stroke-width=".8"/>`;
    s+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#b8b8b8"/>`;
    // key at top (male has raised key)
    s+=`<rect x="${cx-r*.12}" y="${cy-r-1.5}" width="${r*.24}" height="${r*.30}" rx="${r*.05}" fill="#777"/>`;
    s+=`<rect x="${cx-r*.08}" y="${cy-r-1}" width="${r*.16}" height="${r*.22}" rx="${r*.04}" fill="#999"/>`;
    const pr=Math.max(1.4,r*.11);
    if(pins===3){
      [[0,-r*.38],[-r*.33,r*.22],[r*.33,r*.22]].forEach(([dx,dy])=>{
        s+=`<circle cx="${cx+dx}" cy="${cy+dy}" r="${pr+.8}" fill="#666"/><circle cx="${cx+dx}" cy="${cy+dy}" r="${pr}" fill="#ccc"/>`;
        s+=`<circle cx="${cx+dx}" cy="${cy+dy}" r="${pr*.4}" fill="#e8e8e8"/>`;
      });
    } else {
      for(let i=0;i<5;i++){const a=(i/5)*Math.PI*2-Math.PI/2;s+=`<circle cx="${cx+r*.40*Math.cos(a)}" cy="${cy+r*.40*Math.sin(a)}" r="${pr+.7}" fill="#666"/><circle cx="${cx+r*.40*Math.cos(a)}" cy="${cy+r*.40*Math.sin(a)}" r="${pr}" fill="#ccc"/><circle cx="${cx+r*.40*Math.cos(a)}" cy="${cy+r*.40*Math.sin(a)}" r="${pr*.38}" fill="#e8e8e8"/>`;}
    }
  }
  else if(c.id==='n-ts'){
    // TS mono jack — same bushing as TRS but single-contact bore
    const r=Math.min(sz*.34,ph*.34);
    s+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#b0b0b0" stroke="#888" stroke-width=".7"/>`;
    for(let a=0;a<6;a++){const ang=a*60*Math.PI/180;s+=`<line x1="${cx+(r-1.5)*Math.cos(ang)}" y1="${cy+(r-1.5)*Math.sin(ang)}" x2="${cx+r*Math.cos(ang)}" y2="${cy+r*Math.sin(ang)}" stroke="#ccc" stroke-width=".6"/>`;}
    s+=`<circle cx="${cx}" cy="${cy}" r="${r*.65}" fill="#c0c0c0"/>`;
    s+=`<circle cx="${cx}" cy="${cy}" r="${r*.40}" fill="#1a1a1a" stroke="#444" stroke-width=".5"/>`;
    // single contact (no ring band unlike TRS)
    s+=`<circle cx="${cx}" cy="${cy}" r="${r*.14}" fill="#555"/>`;
  }
  else if(c.id==='n-trs'){
    const r=sz*.34;
    // hex nut outer ring
    s+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#b0b0b0" stroke="#888" stroke-width=".7"/>`;
    // thread marks (hexagonal)
    for(let a=0;a<6;a++){
      const ang=a*60*Math.PI/180;
      s+=`<line x1="${cx+(r-1.5)*Math.cos(ang)}" y1="${cy+(r-1.5)*Math.sin(ang)}" x2="${cx+r*Math.cos(ang)}" y2="${cy+r*Math.sin(ang)}" stroke="#ccc" stroke-width=".6"/>`;
    }
    s+=`<circle cx="${cx}" cy="${cy}" r="${r*.65}" fill="#c8c8c8"/>`;
    // jack bore
    s+=`<circle cx="${cx}" cy="${cy}" r="${r*.42}" fill="#1a1a1a" stroke="#444" stroke-width=".5"/>`;
    s+=`<circle cx="${cx}" cy="${cy}" r="${r*.18}" fill="#333"/>`;
  }
  else if(c.id==='n-eth'){
    const bw=pw*.72, bh=ph*.58, bx=cx-bw/2, by=cy-bh/2;
    s+=`<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="2.5" fill="#777" stroke="#555" stroke-width=".7"/>`;
    const pw2=bw*.78, ph2=bh*.68, px2=cx-pw2/2, py2=by+bh*.1;
    s+=`<rect x="${px2}" y="${py2}" width="${pw2}" height="${ph2}" rx="1" fill="#1a1a1a"/>`;
    // 8 gold pins
    const pinW=Math.max(.8,pw2/12), gap=pw2/9;
    for(let i=0;i<8;i++)s+=`<rect x="${px2+pw2*.06+i*gap}" y="${py2+1}" width="${pinW}" height="${ph2*.42}" rx=".3" fill="#c8a020"/>`;
    // latch tab
    s+=`<rect x="${cx-pw2/2}" y="${by+bh*.82}" width="${pw2}" height="${bh*.12}" rx="1" fill="#999"/>`;
    // LED dots
    s+=`<circle cx="${bx+bw*.12}" cy="${cy+bh*.22}" r="1.2" fill="#22c55e"/>`;
    s+=`<circle cx="${bx+bw*.88}" cy="${cy+bh*.22}" r="1.2" fill="#f59e0b"/>`;
  }
  else if(['n-spk2','n-spk4','n-spk8'].includes(c.id)){
    // speakON: round bayonet body, contacts in cross/ring layout
    const poles={'n-spk2':2,'n-spk4':4,'n-spk8':8}[c.id];
    const r=Math.min(sz*.40,ph*.40);
    s+=`<circle cx="${cx}" cy="${cy}" r="${r+1.5}" fill="#1a1a1a" stroke="#444" stroke-width="1.2"/>`;
    s+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#222"/>`;
    s+=`<circle cx="${cx}" cy="${cy}" r="${r*.84}" fill="#2d2d2d"/>`;
    // twist-lock ridges (3 bayonet tabs on outer ring)
    for(let i=0;i<3;i++){const a=(i/3)*Math.PI*2+Math.PI/6;s+=`<path d="M${cx+r*Math.cos(a)} ${cy+r*Math.sin(a)} A${r+1.5} ${r+1.5} 0 0 1 ${cx+(r+1.5)*Math.cos(a+.4)} ${cy+(r+1.5)*Math.sin(a+.4)}" stroke="#555" stroke-width="2" fill="none"/>`;}
    const cr=Math.max(1.3,Math.min(2.5,r*.15));
    if(poles===2){
      [[0,-r*.46],[0,r*.46]].forEach(([dx,dy])=>{
        s+=`<circle cx="${cx+dx}" cy="${cy+dy}" r="${cr+.7}" fill="#777"/><circle cx="${cx+dx}" cy="${cy+dy}" r="${cr}" fill="#c8a020"/>`;
      });
      // centre key slot
      s+=`<rect x="${cx-r*.07}" y="${cy-r*.52}" width="${r*.14}" height="${r*.20}" rx="${r*.03}" fill="#555"/>`;
      s+=`<rect x="${cx-r*.07}" y="${cy+r*.32}" width="${r*.14}" height="${r*.20}" rx="${r*.03}" fill="#555"/>`;
    } else if(poles===4){
      [[0,-r*.46],[r*.46,0],[0,r*.46],[-r*.46,0]].forEach(([dx,dy])=>{
        s+=`<circle cx="${cx+dx}" cy="${cy+dy}" r="${cr+.7}" fill="#777"/><circle cx="${cx+dx}" cy="${cy+dy}" r="${cr}" fill="#c8a020"/>`;
      });
      s+=`<rect x="${cx-r*.08}" y="${cy-r*.52}" width="${r*.16}" height="${r*1.04}" rx="${r*.04}" fill="#3a3a3a"/>`;
      s+=`<rect x="${cx-r*.52}" y="${cy-r*.08}" width="${r*1.04}" height="${r*.16}" rx="${r*.04}" fill="#3a3a3a"/>`;
      s+=`<circle cx="${cx}" cy="${cy}" r="${r*.18}" fill="#333" stroke="#555" stroke-width=".4"/>`;
    } else {
      // 8-pole: 8 contacts in a circle
      for(let i=0;i<8;i++){const a=(i/8)*Math.PI*2-Math.PI/2;s+=`<circle cx="${cx+r*.56*Math.cos(a)}" cy="${cy+r*.56*Math.sin(a)}" r="${cr*.85+.5}" fill="#777"/><circle cx="${cx+r*.56*Math.cos(a)}" cy="${cy+r*.56*Math.sin(a)}" r="${cr*.85}" fill="#c8a020"/>`;}
      s+=`<circle cx="${cx}" cy="${cy}" r="${r*.22}" fill="#333" stroke="#555" stroke-width=".5"/>`;
    }
  }
  else if(['n-pwr-f','n-pwr-m'].includes(c.id)){
    // powerCON TRUE1: keyed rectangular/oval twist-lock housing
    const isFemale=c.id==='n-pwr-f';
    const bodyColor=isFemale?'#1B5E20':'#2E7D32';
    const bw=pw*.84, bh=ph*.72, bx=cx-bw/2, by=cy-bh/2;
    // outer housing with rounded rect
    s+=`<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="5" fill="${bodyColor}" stroke="#1a3a1a" stroke-width="1"/>`;
    s+=`<rect x="${bx+2}" y="${by+2}" width="${bw-4}" height="${bh-4}" rx="4" fill="none" stroke="rgba(255,255,255,.12)" stroke-width=".7"/>`;
    // key cut at top (flat notch)
    s+=`<rect x="${cx-bw*.25}" y="${by-1}" width="${bw*.5}" height="${bh*.18}" rx="2" fill="#e4e4e4"/>`;
    // TRUE1 label (small)
    if(bw>30)s+=`<text x="${cx}" y="${by+bh*.25}" text-anchor="middle" fill="rgba(255,255,255,.45)" font-size="${Math.min(5,bw*.11)}" font-family="Arial" font-weight="bold">TRUE1</text>`;
    // 3 contacts in triangle (L, N, PE)
    const pr=Math.max(1.8,Math.min(bw/8,bh*.13));
    [[-bw*.24,bh*.10],[bw*.24,bh*.10],[0,bh*.30]].forEach(([dx,dy])=>{
      if(isFemale){
        s+=`<circle cx="${cx+dx}" cy="${cy+dy}" r="${pr+.7}" fill="#0a1a0a"/><circle cx="${cx+dx}" cy="${cy+dy}" r="${pr}" fill="#061006"/>`;
      } else {
        s+=`<circle cx="${cx+dx}" cy="${cy+dy}" r="${pr+.7}" fill="#1a1a1a"/><circle cx="${cx+dx}" cy="${cy+dy}" r="${pr}" fill="#c8c8c8"/><circle cx="${cx+dx}" cy="${cy+dy}" r="${pr*.35}" fill="#e8e8e8"/>`;
      }
    });
    // direction arrow
    const arrow=isFemale?'▼':'▲';
    if(bw>32)s+=`<text x="${cx}" y="${by+bh*.94}" text-anchor="middle" fill="rgba(255,255,255,.5)" font-size="6" font-family="Arial">${arrow}</text>`;
  }
  else if(c.id==='n-opt'){
    const bw=pw*.84, bh=ph*.74, bx=cx-bw/2, by=cy-bh/2;
    s+=`<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="2" fill="#111" stroke="#333" stroke-width=".8"/>`;
    const pr=Math.max(2,Math.min(bw/6,bh*.28));
    [[-bw*.22,0],[bw*.22,0]].forEach(([dx,dy])=>{
      s+=`<circle cx="${cx+dx}" cy="${cy+dy}" r="${pr+1}" fill="#222" stroke="#444" stroke-width=".5"/>`;
      s+=`<circle cx="${cx+dx}" cy="${cy+dy}" r="${pr}" fill="#1a0a2e"/>`;
      s+=`<circle cx="${cx+dx}" cy="${cy+dy}" r="${pr*.55}" fill="#7C3AED"/>`;
      s+=`<circle cx="${cx+dx}" cy="${cy+dy}" r="${pr*.22}" fill="#ddd6fe"/>`;
    });
    // dust shutters
    s+=`<rect x="${cx-bw*.35}" y="${by+bh*.78}" width="${bw*.7}" height="${bh*.14}" rx="1" fill="#333"/>`;
  }
  else if(c.id==='n-tru'){
    const bw=pw*.84, bh=ph*.74, bx=cx-bw/2, by=cy-bh/2;
    s+=`<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="2" fill="#2d1b69" stroke="#4c1d95" stroke-width=".8"/>`;
    const pr=Math.max(2,Math.min(bw/6,bh*.26));
    // centre fibre port
    s+=`<circle cx="${cx}" cy="${cy}" r="${pr+1}" fill="#1a0a3a" stroke="#4c1d95" stroke-width=".5"/>`;
    s+=`<circle cx="${cx}" cy="${cy}" r="${pr}" fill="#1a0a3a"/>`;
    s+=`<circle cx="${cx}" cy="${cy}" r="${pr*.55}" fill="#7C3AED"/>`;
    s+=`<circle cx="${cx}" cy="${cy}" r="${pr*.22}" fill="#ddd6fe"/>`;
    // 2 electrical contacts
    const er=pr*.7;
    [[-bw*.3,0],[bw*.3,0]].forEach(([dx,dy])=>{
      s+=`<circle cx="${cx+dx}" cy="${cy+dy}" r="${er+.6}" fill="#1a0a3a" stroke="#4c1d95" stroke-width=".4"/>`;
      s+=`<circle cx="${cx+dx}" cy="${cy+dy}" r="${er}" fill="#0f0620"/>`;
      s+=`<circle cx="${cx+dx}" cy="${cy+dy}" r="${er*.38}" fill="#c8a020"/>`;
    });
  }
  else if(['la-lk13','la-lk19','la-lk25','la-lk37','la-lk54'].includes(c.id)){
    const pinMap={'la-lk13':13,'la-lk19':19,'la-lk25':25,'la-lk37':37,'la-lk54':54};
    const total=pinMap[c.id]||19;
    const r=Math.min(sz*.42,ph*.4);
    s+=`<circle cx="${cx}" cy="${cy}" r="${r+2}" fill="#1a3a5c" stroke="#0066CC" stroke-width="1.2"/>`;
    s+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#0d2744"/>`;
    s+=`<circle cx="${cx}" cy="${cy}" r="${r*.88}" fill="#091d38"/>`;
    const pr=Math.max(.8,Math.min(2.0,r*.10));
    // distribute pins across up to 3 rings
    const ring3=total>30?Math.ceil(total*.18):0;
    const ring2=total>13?Math.ceil((total-ring3)*.38):0;
    const ring1=total-ring2-ring3;
    [[ring1,r*.70],[ring2,r*.46],[ring3,r*.24]].forEach(([cnt,rr])=>{
      if(cnt<=0)return;
      for(let i=0;i<cnt;i++){
        const a=(i/cnt)*Math.PI*2-Math.PI/2;
        s+=`<circle cx="${cx+rr*Math.cos(a)}" cy="${cy+rr*Math.sin(a)}" r="${pr}" fill="#c8c8c8"/>`;
      }
    });
    if(total===13||total===19)s+=`<circle cx="${cx}" cy="${cy}" r="${pr}" fill="#c8c8c8"/>`;
    // keyway notch at top
    s+=`<rect x="${cx-r*.09}" y="${cy-r+1}" width="${r*.18}" height="${r*.22}" rx="${r*.04}" fill="#0066CC"/>`;
  }
  else if(['la-pl-b','la-pl-r','la-pl-bk'].includes(c.id)){
    // PowerLink single-pole: round body with central contact pin
    const bodyColor={'la-pl-b':'#1565C0','la-pl-r':'#B71C1C','la-pl-bk':'#2a2a2a'}[c.id];
    const r=Math.min(sz*.42,ph*.4);
    s+=`<circle cx="${cx}" cy="${cy}" r="${r+2}" fill="${bodyColor}" stroke="#111" stroke-width="1"/>`;
    s+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${bodyColor}"/>`;
    // polarising key (flat cut at top)
    s+=`<rect x="${cx-r*.6}" y="${cy-r-2}" width="${r*1.2}" height="${r*.35}" rx="1" fill="#e4e4e4"/>`;
    // central pin housing
    s+=`<circle cx="${cx}" cy="${cy}" r="${r*.52}" fill="#333" stroke="#555" stroke-width=".6"/>`;
    s+=`<circle cx="${cx}" cy="${cy}" r="${r*.32}" fill="#c8a020"/>`;
    s+=`<circle cx="${cx}" cy="${cy}" r="${r*.14}" fill="#e8c040"/>`;
    // colour band label
    const lbl={'la-pl-b':'BLUE','la-pl-r':'RED','la-pl-bk':'BLK'}[c.id];
    if(pw>26)s+=`<text x="${cx}" y="${cy+r+10}" text-anchor="middle" fill="${bodyColor}" font-size="5" font-family="Arial" font-weight="bold">${lbl}</text>`;
  }
  else if(['t47-pc8m','t47-pc8f','t47-pc19m','t47-pc19f'].includes(c.id)){
    // Ten47 PA-COM: MIL-C-5015 circular, red body, male=pins female=sockets
    const isMale=c.id.endsWith('m');
    const pinCount={'t47-pc8m':8,'t47-pc8f':8,'t47-pc19m':19,'t47-pc19f':19}[c.id];
    const r=Math.min(sz*.42,ph*.4);
    s+=`<circle cx="${cx}" cy="${cy}" r="${r+2}" fill="#7a0000" stroke="#550000" stroke-width="1.2"/>`;
    s+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#8B0000"/>`;
    s+=`<circle cx="${cx}" cy="${cy}" r="${r*.86}" fill="#6d0000"/>`;
    // keyway at top
    s+=`<rect x="${cx-r*.10}" y="${cy-r+1}" width="${r*.20}" height="${r*.24}" rx="${r*.05}" fill="#CC0000"/>`;
    const pr=Math.max(.9,Math.min(2.0,r*.12));
    if(pinCount===8){
      // 8: 6 outer + 2 inner
      for(let i=0;i<6;i++){
        const a=(i/6)*Math.PI*2-Math.PI/2;
        s+=`<circle cx="${cx+r*.66*Math.cos(a)}" cy="${cy+r*.66*Math.sin(a)}" r="${pr}" fill="${isMale?'#c8a020':'#888'}"/>`;
      }
      for(let i=0;i<2;i++){
        const a=(i/2)*Math.PI*2;
        s+=`<circle cx="${cx+r*.32*Math.cos(a)}" cy="${cy+r*.32*Math.sin(a)}" r="${pr}" fill="${isMale?'#c8a020':'#888'}"/>`;
      }
    } else {
      // 19: 12 outer + 6 middle + 1 centre
      for(let i=0;i<12;i++){const a=(i/12)*Math.PI*2-Math.PI/2;s+=`<circle cx="${cx+r*.70*Math.cos(a)}" cy="${cy+r*.70*Math.sin(a)}" r="${pr*.85}" fill="${isMale?'#c8a020':'#888'}"  />`;}
      for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2-Math.PI/2;s+=`<circle cx="${cx+r*.43*Math.cos(a)}" cy="${cy+r*.43*Math.sin(a)}" r="${pr*.85}" fill="${isMale?'#c8a020':'#888'}"/>`;}
      s+=`<circle cx="${cx}" cy="${cy}" r="${pr*.85}" fill="${isMale?'#c8a020':'#888'}"/>`;
    }
    if(pw>30)s+=`<text x="${cx}" y="${cy+r+10}" text-anchor="middle" fill="#CC0000" font-size="5" font-family="Arial" font-weight="bold">PA-COM ${isMale?'M':'F'}</text>`;
  }
  else if(['t47-tl25m','t47-tl25f','t47-tl37m','t47-tl37f'].includes(c.id)){
    // Ten47 TourLine: large Shell 32 circular, heavy-duty flange
    const isMale=c.id.endsWith('m');
    const pinCount={'t47-tl25m':25,'t47-tl25f':25,'t47-tl37m':37,'t47-tl37f':37}[c.id];
    const r=Math.min(sz*.43,ph*.42);
    // outer flange (locking ring)
    s+=`<circle cx="${cx}" cy="${cy}" r="${r+3}" fill="#5a0000" stroke="#3d0000" stroke-width="1.5"/>`;
    // locking lugs (3 tabs)
    for(let i=0;i<3;i++){
      const a=(i/3)*Math.PI*2+Math.PI/6;
      s+=`<circle cx="${cx+(r+3)*Math.cos(a)}" cy="${cy+(r+3)*Math.sin(a)}" r="${r*.14}" fill="#3d0000" stroke="#2a0000" stroke-width=".6"/>`;
    }
    s+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#7a0000"/>`;
    s+=`<circle cx="${cx}" cy="${cy}" r="${r*.84}" fill="#5d0000"/>`;
    // keyway
    s+=`<rect x="${cx-r*.10}" y="${cy-r+1}" width="${r*.20}" height="${r*.26}" rx="${r*.05}" fill="#CC3300"/>`;
    const pr=Math.max(.7,Math.min(1.7,r*.085));
    if(pinCount===25){
      // 25: 15 outer + 9 inner + 1 centre
      for(let i=0;i<15;i++){const a=(i/15)*Math.PI*2-Math.PI/2;s+=`<circle cx="${cx+r*.70*Math.cos(a)}" cy="${cy+r*.70*Math.sin(a)}" r="${pr}" fill="${isMale?'#e0b830':'#9a9a9a'}"/>`;}
      for(let i=0;i<9;i++){const a=(i/9)*Math.PI*2-Math.PI/2;s+=`<circle cx="${cx+r*.44*Math.cos(a)}" cy="${cy+r*.44*Math.sin(a)}" r="${pr}" fill="${isMale?'#e0b830':'#9a9a9a'}"/>`;}
      s+=`<circle cx="${cx}" cy="${cy}" r="${pr}" fill="${isMale?'#e0b830':'#9a9a9a'}"/>`;
    } else {
      // 37: 18 outer + 12 middle + 6 inner + 1 centre
      for(let i=0;i<18;i++){const a=(i/18)*Math.PI*2-Math.PI/2;s+=`<circle cx="${cx+r*.72*Math.cos(a)}" cy="${cy+r*.72*Math.sin(a)}" r="${pr*.9}" fill="${isMale?'#e0b830':'#9a9a9a'}"/>`;}
      for(let i=0;i<12;i++){const a=(i/12)*Math.PI*2-Math.PI/2;s+=`<circle cx="${cx+r*.50*Math.cos(a)}" cy="${cy+r*.50*Math.sin(a)}" r="${pr*.9}" fill="${isMale?'#e0b830':'#9a9a9a'}"/>`;}
      for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2-Math.PI/2;s+=`<circle cx="${cx+r*.28*Math.cos(a)}" cy="${cy+r*.28*Math.sin(a)}" r="${pr*.9}" fill="${isMale?'#e0b830':'#9a9a9a'}"/>`;}
      s+=`<circle cx="${cx}" cy="${cy}" r="${pr*.9}" fill="${isMale?'#e0b830':'#9a9a9a'}"/>`;
    }
    if(pw>44)s+=`<text x="${cx}" y="${cy+r+11}" text-anchor="middle" fill="#CC3300" font-size="5" font-family="Arial" font-weight="bold">TourLine ${isMale?'M':'F'}</text>`;
  }
  else if(c.id==='bals-schuko'){
    // Schuko: round socket, 2 round holes + PE clip contacts top/bottom
    const bw=pw*.82, bh=ph*.82, bx=cx-bw/2, by=cy-bh/2;
    s+=`<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="4" fill="#616161" stroke="#424242" stroke-width=".8"/>`;
    s+=`<rect x="${bx+2}" y="${by+2}" width="${bw-4}" height="${bh-4}" rx="3" fill="none" stroke="rgba(255,255,255,.1)" stroke-width=".5"/>`;
    // round socket face
    const sr=Math.min(bw,bh)*.38;
    s+=`<circle cx="${cx}" cy="${cy}" r="${sr}" fill="#424242" stroke="#333" stroke-width=".7"/>`;
    // 2 pin holes (line + neutral)
    const pr=Math.max(1.6,sr*.14);
    [[-sr*.38,0],[sr*.38,0]].forEach(([dx,dy])=>{
      s+=`<circle cx="${cx+dx}" cy="${cy+dy}" r="${pr+.6}" fill="#222"/><circle cx="${cx+dx}" cy="${cy+dy}" r="${pr}" fill="#111"/>`;
    });
    // PE grounding clips (top + bottom of socket ring)
    s+=`<rect x="${cx-sr*.1}" y="${cy-sr-.5}" width="${sr*.2}" height="${sr*.22}" rx="1" fill="#555"/>`;
    s+=`<rect x="${cx-sr*.1}" y="${cy+sr*.78}" width="${sr*.2}" height="${sr*.22}" rx="1" fill="#555"/>`;
    if(pw>38)s+=`<text x="${cx}" y="${by+bh+8}" text-anchor="middle" fill="#757575" font-size="5" font-family="Arial" font-weight="bold">SCHUKO</text>`;
  }
  else if(c.id.startsWith('bals-cee')||c.id.startsWith('bals-ev')){
    // CEE / Event: coloured round body with contact pins in circular arrangement
    const isCEE=c.id.startsWith('bals-cee');
    const isRed=c.color.startsWith('#C')||c.color.startsWith('#B')||c.color.startsWith('#7F');
    const poles=c.id.includes('-3')?3:c.id.includes('-4')?4:5;
    const is63A=c.id.includes('63');
    const bodyColor=isRed?'#C62828':(c.id.includes('ev')?'#1565C0':c.color);
    const r=Math.min(pw*.44,ph*.42);
    // outer protective ring / shroud
    s+=`<circle cx="${cx}" cy="${cy}" r="${r+2}" fill="${bodyColor}" stroke="${isRed?'#7F0000':'#0D47A1'}" stroke-width="1"/>`;
    // inner face
    s+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${bodyColor}"/>`;
    s+=`<circle cx="${cx}" cy="${cy}" r="${r*.86}" fill="${isRed?'#b71c1c':isCEE?'#1565C0':'#1976D2'}"/>`;
    // keyway notch at top
    s+=`<rect x="${cx-r*.11}" y="${cy-r+.5}" width="${r*.22}" height="${r*.26}" rx="${r*.05}" fill="${isRed?'#7F0000':'#0D47A1'}"/>`;
    // contacts arranged in circle
    const cr=Math.max(1.4,Math.min(2.8,r*.13));
    const contactR=r*.58;
    const startAngle=-Math.PI/2; // top = PE/ground
    for(let i=0;i<poles;i++){
      const a=startAngle+(i/poles)*Math.PI*2;
      s+=`<circle cx="${cx+contactR*Math.cos(a)}" cy="${cy+contactR*Math.sin(a)}" r="${cr+.6}" fill="${isRed?'#5a0000':'#003070'}"/>`;
      s+=`<circle cx="${cx+contactR*Math.cos(a)}" cy="${cy+contactR*Math.sin(a)}" r="${cr}" fill="#e0e0e0"/>`;
    }
    // current + voltage label
    const amp=c.desc.match(/(\d+)A/)?.[1]||'';
    const volt=c.desc.match(/(\d{3})V/)?.[1]||'';
    if(pw>50){
      s+=`<text x="${cx}" y="${cy-r*.18}" text-anchor="middle" fill="rgba(255,255,255,.7)" font-size="${Math.min(6,r*.22)}" font-family="Arial" font-weight="bold">${amp}A</text>`;
      s+=`<text x="${cx}" y="${cy+r*.25}" text-anchor="middle" fill="rgba(255,255,255,.5)" font-size="${Math.min(5,r*.18)}" font-family="Arial">${volt}V</text>`;
    }
    // IEC reference mark (coloured wedge) for 63A
    if(is63A)s+=`<circle cx="${cx}" cy="${cy}" r="${r*.18}" fill="${isRed?'#7F0000':'#0D47A1'}" stroke="rgba(255,255,255,.2)" stroke-width=".5"/>`;
  }
  else{
    // fallback
    s+=`<rect x="${x+2}" y="${y+3}" width="${pw-4}" height="${ph-6}" rx="2" fill="${c.color}" opacity=".8"/>`;
    if(pw>16)s+=`<text x="${cx}" y="${cy+3}" text-anchor="middle" fill="#fff" font-size="${Math.min(7,pw/4)}" font-family="Arial" font-weight="bold">${c.name.substring(0,4)}</text>`;
  }
  return s;
}

function cpRenderPanel(){
  const rows=cpCalcRows();
  const totalCount=Object.values(cpMix).reduce((s,v)=>s+v,0);
  const uSize=Math.max(1,rows.length);
  const totalKg=Object.entries(cpMix).reduce((s,[id,n])=>{const c=CP_ALL[id];return s+(c?c.kg*n:0);},0);
  const rk=rack(), available=rk?rk.uCount-uUsed(rk):0;
  const prev=document.getElementById('cpPreview');

  if(!totalCount){
    prev.innerHTML='<div style="font-size:10px;color:var(--text3);padding:20px 0">Add connectors from the left →</div>';
    document.getElementById('cpStats').innerHTML='';
    document.getElementById('cpAdd').disabled=true;
    document.getElementById('cpStatus').textContent='';
    return;
  }

  // SVG panel
  const SVG_W=440, ROW_H=44, MARGIN=4;
  let svg=`<svg width="${SVG_W}" height="${uSize*ROW_H+MARGIN*2}" xmlns="http://www.w3.org/2000/svg" style="display:block;border-radius:4px;border:1.5px solid #aaa;background:#f9f9f9">`;
  // Rack ears
  svg+=`<rect x="0" y="${MARGIN}" width="14" height="${uSize*ROW_H}" fill="#ccc" stroke="#aaa" stroke-width="1"/>`;
  svg+=`<rect x="${SVG_W-14}" y="${MARGIN}" width="14" height="${uSize*ROW_H}" fill="#ccc" stroke="#aaa" stroke-width="1"/>`;
  for(let r=0;r<uSize;r++){
    const ry=MARGIN+r*ROW_H;
    svg+=`<line x1="14" y1="${ry}" x2="${SVG_W-14}" y2="${ry}" stroke="#e8e8e8" stroke-width="1"/>`;
    // screw holes
    [7,SVG_W-7].forEach(sx=>{svg+=`<circle cx="${sx}" cy="${ry+ROW_H/2}" r="4" fill="#fff" stroke="#999" stroke-width=".8"/>`;});
  }
  // Connectors
  const scale=(SVG_W-28)/CP_ROW_MM;
  rows.forEach((row,ri)=>{
    let x=14;
    const ry=MARGIN+ri*ROW_H;
    row.forEach(c=>{
      const cw=c.w*scale;
      svg+=cpSVGConnector(c,x,ry,cw,ROW_H);
      x+=cw;
    });
    const remW=(SVG_W-14)-x;
    if(remW>2)svg+=`<rect x="${x}" y="${ry+3}" width="${remW}" height="${ROW_H-6}" rx="2" fill="#ececec" stroke="#ddd" stroke-width=".5"/>`;
  });
  svg+=`</svg>`;
  prev.innerHTML=svg;

  // Stats
  const overLimit=uSize>available;
  document.getElementById('cpStats').innerHTML=
    `<span><b>${totalCount}</b> connectors</span>`+
    `<span><b>${uSize}U</b> panel</span>`+
    `<span><b>~${totalKg.toFixed(1)}kg</b></span>`+
    `<span style="color:${overLimit?'var(--red)':'var(--green)'}">${overLimit?`⚠ needs ${uSize}U, only ${available}U free`:`✓ ${available}U free in rack`}</span>`;

  // Auto name
  const parts=Object.entries(cpMix).map(([id,n])=>`${n}×${CP_ALL[id]?.name||id}`);
  if(!document.getElementById('cpName').value||document.getElementById('cpName').dataset.auto==='1'){
    document.getElementById('cpName').value=parts.join(' + ');
    document.getElementById('cpName').dataset.auto='1';
  }
  document.getElementById('cpAdd').disabled=overLimit;
  document.getElementById('cpStatus').textContent='';
}

function cpClear(){
  cpMix={};
  document.querySelectorAll('[id^="cpq-"]').forEach(el=>el.textContent='0');
  cpRenderPanel();
  document.getElementById('cpName').value='';
}

function cpAddPanel(){
  if(!Object.keys(cpMix).length)return;
  const rows=cpCalcRows();
  const uSize=Math.max(1,rows.length);
  const totalKg=parseFloat(Object.entries(cpMix).reduce((s,[id,n])=>{const c=CP_ALL[id];return s+(c?c.kg*n:0);},0).toFixed(1));
  const name=document.getElementById('cpName').value.trim()||'Custom Panel';
  const desc=Object.entries(cpMix).map(([id,n])=>`${n}× ${CP_ALL[id]?.name||id}`).join(', ');
  // category: use most common category in mix
  const cats={}; Object.entries(cpMix).forEach(([id,n])=>{const cat=CP_ALL[id]?.category||'Patching';cats[cat]=(cats[cat]||0)+n;});
  const category=Object.entries(cats).sort((a,b)=>b[1]-a[1])[0][0];
  cEq.push({id:'cp'+Date.now(),brand:'Custom',name,category,uSize,desc,kg:totalKg,w:0,brandColor:'#16a34a'});
  document.getElementById('cem').style.display='none';
  document.getElementById('cpName').dataset.auto='';
  rEqList(); rBrands();
}

// ─── Settings ─────────────────────────────────────────────────────────────────
async function openSettings(){
  const settings=await window.circuit.getSettings();
  document.getElementById("api-key-input").value=settings.hasApiKey?"••••••••••••":"";
  document.getElementById("stov").style.display="flex";
}
async function saveSettings(){
  const apiKey=document.getElementById("api-key-input").value.trim();
  await window.circuit.saveSettings({anthropicApiKey:apiKey});
  document.getElementById("stov").style.display="none";
}
function checkUpdates(){
  document.getElementById("upd-status").textContent="Checking for updates…";
}
function installUpdate(){window.circuit.installUpdate();}

// ─── Projects (native file system) ────────────────────────────────────────────
async function rProjList(){
  const result=await window.circuit.listProjects();
  const sel=document.getElementById("psel");
  const cur=sel.value;
  sel.innerHTML=`<option value="">— New project —</option>`;
  (result.projects||[]).forEach(n=>{const o=document.createElement("option");o.value=n;o.textContent=n;sel.appendChild(o);});
  if(cur&&result.projects.includes(cur))sel.value=cur;
}
async function saveProject(){
  const rk=rack();if(!rk)return;
  let name=document.getElementById("psel").value;
  if(!name){
    name=prompt("Project name:");
    if(!name)return;
  }
  const data={racks,cEq,groups,ig,v:3};
  const result=await window.circuit.saveProject(name,data);
  if(result.success){
    await rProjList();
    document.getElementById("psel").value=name;
    // Brief feedback
    const btn=document.getElementById("bSv");
    const orig=btn.textContent;btn.textContent="✓ Saved!";setTimeout(()=>btn.textContent=orig,2000);
  }
}
async function loadProject(name){
  const result=await window.circuit.loadProject(name);
  if(result.success){
    racks=result.data.racks||racks;cEq=result.data.cEq||[];groups=result.data.groups||groups;ig=result.data.ig||{};
    if(racks.length)aId=racks[0].id;selId=null;rAll();rBrands();
  }
}

// ─── Auto-update events ───────────────────────────────────────────────────────
if(window.circuit){
  window.circuit.onUpdateDownloaded(info=>{
    document.getElementById("update-banner").style.display="flex";
    document.getElementById("update-banner").querySelector("span")||null;
  });
  // macOS: hide the left spacer if not on mac
  if(window.circuit.platform!=="darwin"){
    document.getElementById("mac-spacer").style.display="none";
  }
}

// ─── Wire up events ────────────────────────────────────────────────────────────
document.getElementById("srch").oninput=e=>{fSr=e.target.value;rEqList();};
document.getElementById("cpName").oninput=()=>document.getElementById("cpName").dataset.auto='';
document.getElementById("bPDF").onclick=exportPDF;
document.getElementById("oCE").onclick=openCEM;
document.getElementById("cce").onclick=()=>document.getElementById("cem").style.display="none";
document.getElementById("bSt").onclick=openSettings;
document.getElementById("bSv").onclick=saveProject;
document.getElementById("bOF").onclick=()=>window.circuit.openProjectFolder();
document.getElementById("ai-input").onkeydown=e=>{if(e.key==="Enter")claudeAsk();};

CATS.filter(c=>c!=="All").forEach(c=>{const o=document.createElement("option");o.value=c;o.textContent=c;document.getElementById("fc").appendChild(o);});
document.getElementById("fc").value="Custom";

document.getElementById("sce").onclick=()=>{
  const name=document.getElementById("fn").value.trim();if(!name)return;
  const brand=document.getElementById("fb").value.trim()||"Custom";
  cEq.push({id:"cu"+Date.now(),brand,name,category:document.getElementById("fc").value,uSize:Number(document.getElementById("fu").value),desc:document.getElementById("fd").value.trim(),brandColor:BC[brand]||"#888",kg:parseFloat(document.getElementById("fwt").value)||1,w:parseInt(document.getElementById("fpw").value)||0});
  document.getElementById("cem").style.display="none";
  ["fn","fb","fd"].forEach(id=>document.getElementById(id).value="");
  rBrands();rEqList();
};

document.getElementById("rname").oninput=()=>{const rk=rack();if(rk){rk.name=document.getElementById("rname").value||rk.name;rTabs();}};
document.getElementById("aGrp").onclick=()=>{groups.push({id:"g"+Date.now(),name:"GROUP "+(groups.length+1),color:GC[groups.length%GC.length]});rGroups();};
document.getElementById("rmv").onclick=()=>{const rk=rack();if(!rk)return;rk.items=rk.items.filter(it=>it.id!==selId);delete ig[selId];selId=null;rRack();rInfo();};
document.getElementById("psel").onchange=async()=>{const name=document.getElementById("psel").value;if(name)await loadProject(name);};

// ─── Init ──────────────────────────────────────────────────────────────────────
rPills();rBrands();rProjList();rAll();
