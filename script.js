
(function(){
  const nav=document.getElementById("nav");
  const panels=["panel1","panel2","panel3"];
  const dots=document.querySelectorAll(".nav-dot");
  const labels=document.querySelectorAll(".nav-label");

  function setActive(i){
    dots.forEach((d,j)=>d.classList.toggle("on",j===i));
    labels.forEach((l,j)=>l.classList.toggle("on",j===i));
  }

  dots.forEach(d=>{
    d.addEventListener("click",()=>{
      document.getElementById(panels[parseInt(d.dataset.panel)]).scrollIntoView({behavior:"smooth"});
    });
  });

  window.addEventListener("scroll",()=>{
    nav.classList.toggle("solid",scrollY>30);
    let cur=0;
    panels.forEach((id,i)=>{
      const el=document.getElementById(id);
      if(el&&scrollY>=el.offsetTop-window.innerHeight/2) cur=i;
    });
    setActive(cur);
  });
})();

(function(){
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("in")});
  },{threshold:0.1});
  document.querySelectorAll(".rv").forEach(el=>io.observe(el));
})();

/* ── KNOWLEDGE GRAPH ── */
(function(){
  const cv=document.getElementById("graph-canvas");
  if(!cv) return;
  const cx=cv.getContext("2d");
  function resize(){
    cv.width=cv.offsetWidth;
    cv.height=cv.offsetHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const LABELS=["Contract","Clause","Party","Defined Term","Precedent",
                "Schedule","Warranty","Covenant","Obligation","Notice",
                "Termination","Indemnity","Representation","Amendment","Default"];
  const N=52, DIST=155;
  const nodes=Array.from({length:N},()=>({
    x:Math.random()*window.innerWidth,
    y:Math.random()*window.innerHeight,
    vx:(Math.random()-.5)*.38,
    vy:(Math.random()-.5)*.38,
    r:Math.random()*2+1.4,
    label:Math.random()<.27?LABELS[Math.floor(Math.random()*LABELS.length)]:null,
    phase:Math.random()*Math.PI*2
  }));

  function tick(){
    cv.width=cv.offsetWidth;
    cv.height=cv.offsetHeight;
    cx.clearRect(0,0,cv.width,cv.height);
    nodes.forEach(n=>{
      n.x+=n.vx; n.y+=n.vy; n.phase+=.016;
      if(n.x<0||n.x>cv.width) n.vx*=-1;
      if(n.y<0||n.y>cv.height) n.vy*=-1;
    });
    /* edges */
    for(let i=0;i<nodes.length;i++){
      for(let j=i+1;j<nodes.length;j++){
        const a=nodes[i],b=nodes[j];
        const dx=a.x-b.x,dy=a.y-b.y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<DIST){
          cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);
          cx.strokeStyle=`rgba(0,154,197,${(1-d/DIST)*.22})`;
          cx.lineWidth=.7;cx.stroke();
        }
      }
    }
    /* nodes */
    nodes.forEach(n=>{
      const g=.6+.4*Math.sin(n.phase);
      const gr=cx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r*5);
      gr.addColorStop(0,`rgba(0,154,197,${.15*g})`);
      gr.addColorStop(1,"rgba(0,154,197,0)");
      cx.beginPath();cx.arc(n.x,n.y,n.r*5,0,Math.PI*2);
      cx.fillStyle=gr;cx.fill();
      cx.beginPath();cx.arc(n.x,n.y,n.r,0,Math.PI*2);
      cx.fillStyle=`rgba(0,154,197,${.7*g})`;cx.fill();
      if(n.label){
        cx.font="500 9px Inter,sans-serif";
        cx.fillStyle=`rgba(235,235,223,${.28*g})`;
        cx.fillText(n.label,n.x+n.r+5,n.y+4);
      }
    });
    requestAnimationFrame(tick);
  }
  tick();
})();
/* ── LANDING GRAPH ── */
(function(){
  const cv=document.getElementById("landing-canvas");
  if(!cv) return;
  const cx=cv.getContext("2d");
  function resize(){cv.width=cv.offsetWidth;cv.height=cv.offsetHeight}
  resize();window.addEventListener("resize",resize);

  const LABELS=["Contract","Clause","Party","Defined Term","Precedent",
                "Schedule","Warranty","Covenant","Obligation","Notice",
                "Termination","Indemnity","Representation","Amendment",
                "Default","Signature","Governing Law","Confidentiality",
                "Force Majeure","Warranty","Liability","IP Rights"];

  const N=80, DIST=175;
  // Mix of normal and "hub" nodes that are bigger and brighter
  const nodes=Array.from({length:N},(_, i)=>{
    const isHub = i < 8;
    return {
      x:Math.random()*window.innerWidth,
      y:Math.random()*window.innerHeight,
      vx:(Math.random()-.5)*(isHub ? .55 : .42),
      vy:(Math.random()-.5)*(isHub ? .55 : .42),
      r: isHub ? Math.random()*3+3 : Math.random()*2+1.2,
      label: isHub ? LABELS[i] : (Math.random()<.22?LABELS[Math.floor(Math.random()*LABELS.length)]:null),
      phase:Math.random()*Math.PI*2,
      phaseSpeed: isHub ? .028 : .018,
      isHub
    };
  });

  let running=true;
  let mx=-999,my=-999;
  cv.addEventListener("mousemove",e=>{
    const r=cv.getBoundingClientRect();
    mx=e.clientX-r.left; my=e.clientY-r.top;
  });

  function tick(){
    if(!running) return;
    cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;
    cx.clearRect(0,0,cv.width,cv.height);

    nodes.forEach(n=>{
      n.x+=n.vx; n.y+=n.vy; n.phase+=n.phaseSpeed;
      if(n.x<0||n.x>cv.width) n.vx*=-1;
      if(n.y<0||n.y>cv.height) n.vy*=-1;
      // Mouse repulsion
      const dx=n.x-mx, dy=n.y-my, d=Math.sqrt(dx*dx+dy*dy);
      if(d<140){ n.vx+=dx/d*.06; n.vy+=dy/d*.06; }
      // Speed cap
      const spd=Math.sqrt(n.vx*n.vx+n.vy*n.vy);
      if(spd>1.2){ n.vx=n.vx/spd*1.2; n.vy=n.vy/spd*1.2; }
    });

    // Edges
    for(let i=0;i<nodes.length;i++){
      for(let j=i+1;j<nodes.length;j++){
        const a=nodes[i],b=nodes[j];
        const dx=a.x-b.x,dy=a.y-b.y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<DIST){
          const alpha=(1-d/DIST)*(a.isHub||b.isHub?.35:.2);
          cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);
          cx.strokeStyle=`rgba(0,154,197,${alpha})`;
          cx.lineWidth=a.isHub||b.isHub?1:.6;
          cx.stroke();
        }
      }
    }

    // Nodes
    nodes.forEach(n=>{
      const g=.55+.45*Math.sin(n.phase);
      const glowR=n.r*(n.isHub?7:5);
      const gr=cx.createRadialGradient(n.x,n.y,0,n.x,n.y,glowR);
      gr.addColorStop(0,`rgba(0,154,197,${(n.isHub?.22:.13)*g})`);
      gr.addColorStop(1,"rgba(0,154,197,0)");
      cx.beginPath();cx.arc(n.x,n.y,glowR,0,Math.PI*2);cx.fillStyle=gr;cx.fill();

      cx.beginPath();cx.arc(n.x,n.y,n.r,0,Math.PI*2);
      cx.fillStyle=`rgba(0,154,197,${(n.isHub?.9:.7)*g})`;cx.fill();

      if(n.label){
        cx.font=`${n.isHub?"600":"500"} ${n.isHub?"10.5":"9"}px Inter,sans-serif`;
        cx.fillStyle=`rgba(235,235,223,${(n.isHub?.38:.22)*g})`;
        cx.fillText(n.label,n.x+n.r+5,n.y+4);
      }
    });

    requestAnimationFrame(tick);
  }
  tick();

  document.querySelectorAll(".landing-tile").forEach(t=>{
    t.addEventListener("click",()=>{ setTimeout(()=>{running=false},600); });
  });
})();

