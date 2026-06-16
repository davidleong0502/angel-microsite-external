

(function(){
  const panels=["panel1","panel2","panel3","panel4"];
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


/* ── INSIDER READER ───────────────────────────────────────────── */
const ISSUES = {
  'basics-intro': {
    issue: null, title: 'Welcome to A&GEL',
    subtitle: 'A few thoughts to get you started on a good footing.',
    date: '', readMins: 3, cover: 'assets/Frame 2718.svg',
    glance: [
      'Learning new tools takes time — we\'re here to support you every step.',
      'A&GEL tools <strong>amplify your capabilities</strong> far beyond what was possible alone.',
      'The best way to learn is to <strong>start using A&GEL</strong> — explore freely, make mistakes.',
      'When teams embrace A&GEL together, the benefits compound for everyone.',
    ],
    sections: [
      { kicker: '01 — Getting started', heading: 'Learning New Tools Takes Time – And That\'s Okay', blocks: [
        { p: 'We\'re thrilled to have you here. As you begin exploring A&GEL, we want to share a few thoughts to get you started on a good footing.' },
        { p: 'We know that getting comfortable with new technology can feel challenging at first. Please remember: we\'re here to support you every step of the way. Don\'t hesitate to reach out if you have questions or if you are ever stuck or would like us to walk you through something.' },
        { figure: { src: 'assets/Frame%202718.svg', caption: '', wide: false } },
        { p: 'AI tools like A&GEL <strong>are different</strong> from the ones before — they empower <strong>you directly</strong>. Think of it like having an army of assistants at your fingertips: they may not replace human judgment, but in many ways, they amplify your capabilities far beyond what was possible alone.' },
        { p: '<strong>The best way to start learning is to start using A&GEL —</strong> we encourage you to explore freely. Try things out, make mistakes (the same safe kind), and discover what works best for you.' },
      ]},
      { kicker: '02 — Skill building', heading: 'Progress at Your Own Pace', blocks: [
        { p: 'Think of skill-building like climbing a staircase. Start with the basics, and as you grow more confident, moving to the next level will feel much more natural. There\'s no rush — this isn\'t a race. Take the time you need to build a strong foundation.' },
        { figure: { src: 'assets/Frame%202717%20(1).svg', caption: '', wide: false } },
      ]},
      { kicker: '03 — Community', heading: 'Together, We Can Go Further', blocks: [
        { p: 'When teams and firms embrace A&GEL together, the benefits compound for everyone. Sharing knowledge and collaborating across your community of users creates a ripple effect that lifts all.' },
      ]},
    ],
    signoff: { line: 'Welcome aboard — we\'re excited to see what we can accomplish with A&GEL.', name: 'Kok Leong<br>A&GEL Development Team' },
  },
  'issue-1': {
    issue: 1, title: 'Context is (almost) Everything',
    subtitle: 'Prompting essentials — how context selection shapes everything A&GEL returns.',
    date: '15 Jan 2026', readMins: 5, cover: 'assets/covers/issue-1.png',
    glance: [
      'Chat now has a dedicated <strong>Context</strong> button and a <strong>"% Context"</strong> indicator.',
      'The default search parameter is now <strong>zero context</strong> — faster, ideal for proofreading and light edits.',
      'Build a <strong>default context preset</strong> from your Vault for everyday work.',
      'A prompt without context is just a guess — always supply the background only you hold.',
    ],
    sections: [
      { kicker: '01 — Chat', heading: 'Context in Chat: a dedicated button and a "% Context" indicator', blocks: [
        { p: 'A&GEL\'s Chat function uses a customised <strong>Retrieval-Augmented Generation (RAG)</strong> pipeline. It draws on the know-how and reference materials in your Vault and passes that to the model to generate output. The single most important factor in RAG quality is <em>context selection</em> — how much of your Vault the answer is drawn from.' },
        { p: 'To make that visible, we have added a <strong>"% Context"</strong> indicator — a rough but useful at-a-glance signifier of how much of your Vault is in scope for the current chat session. Click the Context button to choose exactly which folders or files to chat with.' },
        { callout: { kind: 'note', title: 'New default: zero context', body: 'The default search parameter is now zero context (top-right of the Chat window). Chat is faster this way, generating from pre-trained public knowledge alone — ideal for simple queries like proofreading or editorial amendments. In the zero-context setting, A&GEL should respond within seconds.' } },
        { h: 'Set a default context for daily use' },
        { p: 'So A&GEL answers from <em>your</em> know-how, create a default context preset: click the Context button, select your folders, then the plus (+) button. Name the preset, optionally check <strong>"Set as default"</strong>, and click OK.' },
        { p: 'Selecting <strong>every</strong> folder (100% context) makes A&GEL slower, as it searches every document — a broad parameter is not always optimal. Tailor the context to the specific query. Responses can take up to a minute depending on how many files you can access and the complexity of the query.' },
      ]},
      { kicker: '02 — Prompts', heading: 'Always add your context when prompting', blocks: [
        { quote: 'A prompt without context is just a guess — "prompt roulette".' },
        { p: 'To be effective, prompts must be fed the right information — especially in fields of deep specialisation. Think of A&GEL as a capable assistant that needs the full picture: provide the background only you know — your key goals, success metrics, even examples of what a "good" or "bad" answer looks like.' },
        { h: 'A simple framework for richer prompts' },
        { p: 'Keep asking yourself whether you have given enough context. This is where you exercise your subject-matter mastery — and where the quality of results can be night-and-day versus basic prompting.' },
        { callout: { kind: 'tip', title: 'Litigation example', body: 'Litigators get far sharper output by cloning a prompt and editing the square-bracketed parts to suit their matter. The more legal context (a short summary of the applicable law) and commercial context (the surrounding facts) you supply, the better the prompt performs as an analyser.' } },
        { p: 'You know your context best — so always add the particular type of context that brings out the effectiveness of your prompts, question lists and custom instructions.' },
      ]},
      { kicker: '03 — Get started', heading: 'Need help?', blocks: [
        { callout: { kind: 'report', title: 'Hit an issue? Tell us three things', body: 'Message or e-mail the A&GEL Developer. It is enough to include:', list: ['<strong>Timestamp</strong> — e.g. "a chat I started at 4:31pm today"', '<strong>Feature in issue</strong> — e.g. "tried uploading a file in Analysis → Deep Research, it did not load"', '<strong>Brief description</strong> or screenshots'] } },
      ]},
    ],
    signoff: { line: 'Cheers, and remember — context first.', name: 'A&GEL Development Team' },
  },
  'issue-2': {
    issue: 2, title: 'Dispute Resolution Use Cases',
    subtitle: 'Generate summaries and first drafts, analyse and track pleadings — plus tips for prompting.',
    date: '12 Feb 2026', readMins: 9, cover: 'assets/covers/issue-2.png',
    glance: [
      'Two <strong>Case Summariser</strong> prompts (Concise & Detailed) — the Detailed version shines on complex judgments.',
      'Prompts to draft a <strong>Defence</strong> and client-facing <strong>legal updates</strong>.',
      'A suite of prompts to <strong>analyse pleadings</strong> — Statement of Claim, Defence, and sufficiency.',
      'Use <strong>Review mode</strong> as a pleadings tracker across multiple documents.',
    ],
    sections: [
      { kicker: '01 — Summaries', heading: 'Generate case summaries', blocks: [
        { p: 'We have developed two prompts for summarising cases — one for a concise overview, one for a more detailed analysis. They were adapted from SAL\'s published prompts and refined with generative AI (including by asking A&GEL to critique its own output).' },
        { p: 'In our experience the <strong>Detailed</strong> Case Summariser is generally superior, especially on more complex judgments. A&GEL is instructed to rely <em>exclusively</em> on the source decision — though note it can struggle to distinguish <em>ratio decidendi</em> from <em>obiter dicta</em>.' },
        { callout: { kind: 'note', title: 'Not a silver bullet', body: 'Outputs must still be reviewed and verified in the usual manner — checked thoroughly for accuracy and completeness. These prompts give you an efficient starting point, not a finished work product.' } },
        { p: 'Pair these with the <strong>Guided Summary</strong> function (under Apps), which summarises a single document guided by a prompt. Upload a Singapore court decision, pick the Case Summariser (Detailed) prompt, and add any specific points you are concerned with.' },
        { figure: { src: 'assets/i2/05_image006.png', caption: 'Case Summariser (Concise) v1.1 and Case Summariser (Detailed) v1.1 in the Prompt Library.', wide: true } },
      ]},
      { kicker: '02 — Drafting', heading: 'Generate initial drafts', blocks: [
        { p: 'A prompt (based on SAL\'s published prompts) generates a first-draft <strong>Defence</strong> in response to a Statement of Claim. Clone and adapt it, and be sure to incorporate sufficient context.' },
        { p: 'A second prompt produces client-facing <strong>legal updates</strong> from a case summary, with a short Knowledge Management sample article guiding style, structure and tone.' },
        { gallery: [
          { src: 'assets/i2/07_image008.png', caption: 'Draft a Defence to a Statement of Claim.' },
          { src: 'assets/i2/08_image009.png', caption: 'Draft to the style and tone of a reference article v1.2.' },
        ]},
      ]},
      { kicker: '03 — Pleadings', heading: 'Analyse pleadings', blocks: [
        { p: 'We have prepared a number of pleadings-analysis prompts. These are lightly tested — try them, clone and improve them, and share with other users.' },
        { list: [
          '<strong>Analyse a Statement of Claim</strong> — executive summary, chronology, sufficiency against the Rules of Court 2021, key issues and preliminary objections, immediate action items and next steps.',
          '<strong>Analyse a Defence</strong> — extract the defence strategy and any gaps where allegations in the Statement of Claim are not specifically addressed.',
          '<strong>Sufficiency of pleadings</strong> — originally built to assess a Defence; clone and adapt for the pleading you are reviewing.',
        ]},
        { gallery: [
          { src: 'assets/i2/09_image010.png', caption: 'Statement of Claim Analysis & Chronology v1.5.' },
          { src: 'assets/i2/10_image011.png', caption: 'Analyse a Defence to a SOC v1.0.' },
          { src: 'assets/i2/11_image012.png', caption: 'Sufficiency of Pleadings for Defence v1.0.' },
        ]},
      ]},
      { kicker: '04 — Review mode', heading: 'Using Review as a pleadings tracker', blocks: [
        { p: 'See each party\'s position across the dispute\'s lifetime at a glance. In <strong>Review mode</strong>, treat every cause of action in the Statement of Claim as a guiding question to systematically examine and challenge the positions advanced in the pleadings and affidavits.' },
        { h: 'Step 1 — Generate the question list in Chat' },
        { p: 'Upload the Statement of Claim to your files or directly into Chat, then run a prompt to extract the causes of action:' },
        { prompt: { label: 'Question-list generator', text: 'You are a litigation lawyer with 20 years of experience. Take a deep breath and focus.\n\nThe document uploaded is a Statement of Claim. Your task is to produce a point-form summary. Each bullet should cover (a) one cause of action, (b) the defendant it is against, (c) the factual assertions relied upon, and (d) the remedies sought. Present every sub-point within the same bullet — avoid sub-level bullets. Extract all content from the document. If there are multiple defendants, cover all causes of action against the 1st defendant before the 2nd, and so on.\n\nBe comprehensive but concise: summarise and reference all content directly relevant to each cause of action. Be precise: avoid vague wording and use the phrasing of the document.' } },
        { h: 'Step 2 — Run the list against the pleadings in Review' },
        { p: 'Copy the generated list, switch to <strong>Review</strong>, and click <strong>Quick Questions</strong>. Paste the list into <em>Add Questions</em>, click <em>Add +</em>, attach your Statement of Claim, and press submit.' },
        { gallery: [
          { src: 'assets/i2/13_image014.png', caption: 'Review mode — add a question list as a quick-questions matrix.' },
        ]},
        { callout: { kind: 'tip', title: 'Beyond pleadings', body: 'Review\'s ability to pose many questions to many documents suits other document-intensive work too — discovery, document review, and reviewing voluminous affidavits.' } },
      ]},
      { kicker: '05 — Craft', heading: 'Tips for prompting: test and improve', blocks: [
        { p: '<strong>Test your prompt.</strong> Gauge a prompt by comparing A&GEL\'s output against a model answer you have already prepared. If it aligns closely, your prompt is likely well-developed; if not, identify the gaps and add context.' },
        { p: '<strong>Improve your prompt.</strong> Use the <em>Improve My Prompt v1.0</em> tool in your prompt library to refine it further.' },
      ]},
    ],
    signoff: { line: 'Clone, adapt, and share what works.', name: 'A&GEL Development Team' },
  },
  'feature-scribe': {
    issue: null, title: 'Scribe',
    subtitle: 'Record, transcribe, live-translate and edit meetings — all in one place.',
    date: '', readMins: 5, cover: 'assets/covers/issue-3.jpg',
    glance: [
      '<strong>Live editing</strong> — edit the transcript as Scribe records; edited portions are underlined.',
      '<strong>Audio playback</strong> — click any transcript segment to play back its recording from that point.',
      '<strong>Live Translation</strong> — translate in real time into the language of your choice.',
      '<strong>Timestamped downloads</strong> — exported Word transcripts carry timestamps for easy navigation.',
    ],
    sections: [
      { kicker: 'Scribe', heading: 'Live editing & audio playback', blocks: [
        { p: '<strong>Live editing</strong> — the improved Scribe lets you edit the transcript; edited portions are underlined for ease of reference. <strong>Audio playback</strong> — after transcription is saved, open the raw transcript and click any segment to play the recording from that point.' },
        { gallery: [
          { src: 'assets/i3/05_image006.png', caption: 'Scribe recording in progress, with live transcription.' },
          { src: 'assets/i3/06_image007.png', caption: 'The raw transcript — click a segment to play back its audio.' },
        ]},
      ]},
      { kicker: 'Scribe', heading: 'Live-translation, now in Scribe', blocks: [
        { p: 'Understand calls and meetings in the language of your choice. Tick the <strong>Live Translation</strong> box and pick a language — A&GEL renders the translation beneath the original transcription on the fly.' },
        { figure: { src: 'assets/i4/04_image005.png', caption: 'Enable Live Translation and select a language from the drop-down.', wide: true } },
        { p: 'As A&GEL transcribes and translates, you can type notes or amend the transcript directly — your edits appear in <strong>yellow</strong> to distinguish them from A&GEL\'s text. Saved transcripts retain both the translation and your edits.' },
        { gallery: [
          { src: 'assets/i4/05_image006.png', caption: 'Live translation beneath the original, with editable notes in yellow.' },
          { src: 'assets/i4/06_image007.png', caption: 'Timestamps run down the left of the raw transcription.' },
        ]},
      ]},
      { kicker: 'Scribe', heading: 'Downloadable transcripts, now with timestamps', blocks: [
        { p: 'Scribe transcripts now include <strong>timestamps</strong> within the downloaded Word document — markers that make it simpler to navigate to specific moments in a recorded conversation or meeting.' },
        { figure: { src: 'assets/i5/05_image007.jpg', caption: 'A downloaded Scribe transcript with timestamps and translation retained.', wide: false } },
      ]},
    ],
    signoff: { line: 'Record, review, replay.', name: 'A&GEL Development Team' },
  },
  'feature-prompt-library': {
    issue: null, title: 'Prompt Library',
    subtitle: 'Find, clone and adapt community-built prompts — and sharpen them with built-in tools.',
    date: '', readMins: 2, cover: 'assets/covers/issue-2.png',
    glance: [
      'Browse, clone and adapt community-built prompts from the Prompt Library for your specific matter.',
      '<strong>Test your prompt</strong> — compare A&GEL\'s output against a model answer you have already prepared.',
      'Use <strong>Improve My Prompt v1.0</strong> in the prompt library to further refine any prompt that isn\'t performing as expected.',
    ],
    sections: [
      { kicker: 'Craft', heading: 'Tips for prompting: test and improve', blocks: [
        { p: '<strong>Test your prompt.</strong> An effective way to gauge a prompt\'s effectiveness is to compare A&GEL\'s output against a "model answer" or reference output you have already prepared.' },
        { p: 'For instance, if you are developing a prompt to summarise a case, refer to a case summary you have previously prepared and are familiar with as your benchmark. Run your summary prompt and assess A&GEL\'s output against your prior work. If the output aligns closely with your benchmark, your prompt is likely well-developed. If it does not, identify the specific gaps and refine your prompt accordingly — for example, by adding further context.' },
        { p: '<strong>Improve your prompt.</strong> Consider using the <em>Improve My Prompt v1.0</em> tool available in your prompt library to further refine your prompt.' },
        { figure: { src: 'assets/i2/17_image018.png', caption: 'Improve My Prompt v1.0 — refine an existing prompt in the library.', wide: false } },
      ]},
    ],
    signoff: { line: 'Clone, adapt, and share what works.', name: 'A&GEL Development Team' },
  },
  'feature-prompting': {
    issue: null, title: 'Prompting',
    subtitle: 'A prompt without context is a guess. Here\'s the framework that changes that.',
    date: '', readMins: 3, cover: 'assets/covers/issue-1.png',
    glance: [
      'Every effective prompt has four parts: <strong>Persona, Task, Context, and Format</strong>.',
      'Context is the part only <em>you</em> can supply — it\'s where your expertise makes the difference.',
      'A prompt without context is "prompt roulette" — technically valid, but unlikely to produce useful output.',
      'Clone a prompt from the library, then adapt it with your matter\'s specific facts and legal framework.',
    ],
    sections: [
      { kicker: '01 — The Framework', heading: 'Persona, Task, Context, Format', blocks: [
        { p: 'Every effective prompt has four parts. Think of it as a checklist:' },
        { p: '<strong>Persona</strong> — tell A&GEL what role to adopt. <em>"You are a litigation lawyer with 20 years of experience."</em> This shapes the tone, depth, and specificity of the output.' },
        { p: '<strong>Task</strong> — describe what you want done, clearly and specifically.' },
        { p: '<strong>Context</strong> — this is the part only you can supply. The specific legal framework, the commercial facts, the surrounding circumstances of the matter. A prompt without context is just a guess — what the team calls "prompt roulette". The quality of A&GEL\'s output is directly proportional to the quality of context you provide.' },
        { p: '<strong>Format</strong> — specify how you want the output structured. A numbered list? A table? A draft clause? A concise paragraph? If you don\'t specify, A&GEL will default to a generic format that may not suit your workflow.' },
      ]},
      { kicker: '02 — Context in Practice', heading: 'The difference context makes', blocks: [
        { p: 'Think of A&GEL as a capable assistant that needs the full picture to do its best work. Instead of asking simple questions, provide the specific background details that only you know — your key goals, the facts of the matter, what a "good" or "bad" answer looks like.' },
        { p: 'The more legal content (e.g. a short summary of the applicable areas of law) and commercial context (e.g. the surrounding facts of the transaction or dispute) you supply, the more useful the output. When such context is provided, the quality of results can be night and day compared to basic prompting.' },
        { callout: { kind: 'tip', title: 'Case summary example', body: 'When using a case summary prompt, add brief details of the legal issues you care about — e.g. the distinction between ratio decidendi and obiter dicta. Clone the prompt from the library, edit it to reflect your specific focus, and you will find the output far more targeted than using the prompt as-is.' } },
      ]},
      { kicker: '03 — Test & Improve', heading: 'Benchmark, then refine', blocks: [
        { p: 'Test any prompt against a "model answer" you already have — a case summary you\'ve prepared, a clause you\'ve drafted previously. Run the prompt and compare the output against your benchmark. If it aligns, the prompt is well-developed. If not, identify the specific gaps and add context accordingly.' },
        { p: 'Use the <strong>Improve My Prompt v1.0</strong> tool in the Prompt Library to further refine any prompt that isn\'t performing as expected.' },
      ]},
    ],
    signoff: { line: 'You know your context best — put it in the prompt.', name: 'A&GEL Development Team' },
  },
  'feature-guided-summary': {
    issue: null, title: 'Quick Info & Guided Summary',
    subtitle: 'A fast, sourced read of any single document — snapshot or steered.',
    date: '', readMins: 4, cover: 'assets/covers/issue-2.png',
    glance: [
      'Use <strong>Quick Info</strong> for an instant snapshot of any document.',
      '<strong>Guided Summary</strong> (under Apps) lets you steer the focus — pair it with a prompt from the library.',
      'Upload a document, pick a prompt, and add any specific points you want covered.',
      'Now faster — with <strong>interim updates and inline references</strong> during generation.',
    ],
    sections: [
      { kicker: '01 — Guided Summary', heading: 'A sourced summary of any document, steered by a prompt', blocks: [
        { p: 'The prompt library includes two prompts for summarising documents — one for a concise overview, one for a more detailed analysis. They were adapted from SAL\'s published prompts and refined with generative AI.' },
        { p: 'In our experience the <strong>Detailed</strong> summariser is generally superior, especially on more complex documents. A&GEL is instructed to rely <em>exclusively</em> on the source — though it can struggle to distinguish <em>ratio decidendi</em> from <em>obiter dicta</em> in case law.' },
        { callout: { kind: 'note', title: 'Not a silver bullet', body: 'Outputs must still be reviewed and verified in the usual manner — checked thoroughly for accuracy and completeness. These prompts give you an efficient starting point, not a finished work product.' } },
        { p: 'Use the <strong>Guided Summary</strong> function (under Apps) to run any prompt against a single document. Upload the file, pick the prompt from the library, and add any specific points you are concerned with.' },
        { figure: { src: 'assets/i2/05_image006.png', caption: 'Case Summariser (Concise) v1.1 and Case Summariser (Detailed) v1.1 in the Prompt Library.', wide: true } },
      ]},
      { kicker: '02 — Speed & Updates', heading: 'Faster generation with interim updates', blocks: [
        { p: 'Guided Summary now provides <strong>interim updates with inline references</strong> during generation — you can see sections arrive progressively and begin cross-checking citations before the full output is complete.' },
        { p: 'Overall output speed is also increased. Note: for simpler documents, the summary may load fast enough that the interim updates are skipped entirely.' },
      ]},
    ],
    signoff: { line: 'Quick Info for a snapshot; Guided Summary when you want to steer the focus.', name: 'A&GEL Development Team' },
  },
  'issue-3': {
    issue: 3, title: 'New Timeline & Multi-Step Prompt Apps',
    subtitle: '.msg uploads, a smarter Scribe, structured multi-step prompting, and a substantially revamped Timeline.',
    date: '18 Mar 2026', readMins: 8, cover: 'assets/covers/issue-3.jpg',
    glance: [
      '<strong>Email files (.msg)</strong> can now be uploaded and read in full — including attachments.',
      '<strong>Scribe</strong> now supports live editing, audio playback, and one-minute autosave.',
      'New <strong>Multi-Step Prompt</strong> mode breaks complex legal workflows into targeted steps.',
      '<strong>Timeline</strong> revamped to combine chronologies across multiple documents.',
    ],
    sections: [
      { kicker: '01 — Files', heading: 'Upload email files (.msg)', blocks: [
        { p: 'A&GEL users can now upload entire <strong>.msg</strong> email files into Files, for use with Chat or any specialised mode. A&GEL reads all contents — including attachments — except attachments carrying <em>Internal Only</em> sensitivity labels or that are password-protected.' },
        { p: 'Once uploaded, ask A&GEL to summarise the email, summarise the attached documents, or run any prompt from the library against it.' },
      ]},
      { kicker: '02 — Scribe', heading: 'Scribe: live editing & audio playback', blocks: [
        { p: '<strong>Live editing</strong> — the improved Scribe lets you edit the transcript; edited portions are underlined for ease of reference. <strong>Audio playback</strong> — after transcription is saved, open the raw transcript and click any segment to play the recording from that point.' },
        { gallery: [
          { src: 'assets/i3/05_image006.png', caption: 'Scribe recording in progress, with live transcription.' },
          { src: 'assets/i3/06_image007.png', caption: 'The raw transcript — click a segment to play back its audio.' },
        ]},
      ]},
      { kicker: '03 — New mode', heading: 'Multi-Step Prompt', blocks: [
        { p: 'Found under <strong>Specialised Apps</strong>. While single-shot prompts are efficient for simple queries, complex legal tasks benefit from a structured, iterative approach. Multi-Step Prompt lets you deconstruct a problem into a sequence of targeted interactions — our favourite mode for moderate-to-complex work on documents.' },
        { h: 'Break workflows into logical phases' },
        { steps: [
          { n: 'Corporate · Step 1', text: 'Summarise what each party is obligated to do.' },
          { n: 'Step 2', text: 'With that summary in mind, flag any one-sided or unusual clauses.' },
          { n: 'Step 3', text: 'For the flagged clauses, redline the top five changes I should push for if I represent [party].' },
        ]},
        { steps: [
          { n: 'Litigation · Step 1', text: 'Based on the Statement of Claim [attached], draft a first set of interrogatories.' },
          { n: 'Step 2', text: 'Having completed Step 1, draft corresponding document requests.' },
          { n: 'Step 3', text: 'As a final step, identify the top five custodians likely to have responsive documents, and explain why.' },
        ]},
        { callout: { kind: 'tip', title: 'Only one prompt? Still use it', body: 'Even with a single step, this app is excellent for complex single prompts you need carried out on a document — often better than Chat mode.' } },
        { figure: { src: 'assets/i3/08_image009.jpg', caption: 'Multi-Step Prompt output — references open an inline document viewer with highlights.', wide: false } },
      ]},
      { kicker: '04 — Timeline', heading: 'A substantially revamped Timeline', blocks: [
        { p: '<strong>Combine timelines across documents.</strong> The updated Timeline extracts a chronology from each selected document and merges them into one — invaluable when you have multiple large affidavits, pleadings or submissions, each with its own timeline.' },
        { gallery: [
          { src: 'assets/i3/09_image010.png', caption: 'A combined Statement of Claim & Defence timeline across five files.' },
          { src: 'assets/i3/12_image013.png', caption: 'Drill into a single document\'s timeline with source references.' },
        ]},
        { p: '<strong>View the source.</strong> Click the reference at the end of any event to open the source document, with the originating line highlighted.' },
        { h: 'Smart timelines, tuned to your matter' },
        { p: 'After choosing documents, click <strong>Extend Prompt</strong> to focus extraction on topics of interest. The <em>Basic Litigation (shared)</em> configuration extracts Event Description, Source Document, Entities / Individuals and Supporting Paragraph — add your own fields too.' },
        { callout: { kind: 'note', title: 'Works on messages too', body: 'Point Timeline at chat logs or screenshots of messages (WhatsApp, WeChat) to build a chronology.' } },
      ]},
    ],
    signoff: { line: 'Smaller steps, sharper chronologies.', name: 'A&GEL Development Team' },
  },

  'feature-dispute': {
    issue: null, title: 'Dispute Resolution',
    subtitle: 'Case summaries, SOC analysis, Defence drafting, and pleadings tracking — all within A&GEL.',
    date: '', readMins: 4, cover: 'assets/covers/issue-2.png',
    glance: [
      '<strong>Case summaries</strong> — the Detailed version generally outperforms Concise for complex judgments.',
      '<strong>SOC Analysis</strong> — upload the Statement of Claim and run the analysis prompt directly.',
      '<strong>Defence drafting</strong> — generate a first-draft defence from the SOC.',
      '<strong>Pleadings tracker</strong> — REVIEW mode maps each cause of action against every party\'s position across the full document set.',
    ],
    sections: [
      { kicker: '01 — Case Summaries', heading: 'Summarising judgments and pleadings', blocks: [
        { p: 'The Prompt Library includes two case summariser prompts — Concise and Detailed. In our experience, the <strong>Detailed</strong> version is generally superior, especially for complex judgments. A&GEL is instructed to rely exclusively on the source document.' },
        { figure: { src: 'assets/i2/05_image006.png', caption: 'Case Summariser (Concise) v1.1 and Case Summariser (Detailed) v1.1 in the Prompt Library.', wide: false } },
      ]},
      { kicker: '02 — SOC & Defence', heading: 'Statement of Claim analysis and Defence drafting', blocks: [
        { p: 'Use the <strong>Statement of Claim Analysis and Chronology</strong> prompt for early case assessment. Upload the SOC and run the prompt — A&GEL extracts the key facts, causes of action, and a chronology.' },
        { p: 'To draft a first Defence, use the <strong>Draft a defence to a Statement of Claim</strong> prompt from the library. Clone it and adapt the context to your matter.' },
        { callout: { kind: 'tip', title: 'Detailed over Concise', body: 'For complex judgments or lengthy SOCs, the Detailed summariser consistently produces more accurate and complete outputs.' } },
      ]},
      { kicker: '03 — Pleadings Tracker', heading: 'REVIEW mode as a pleadings tracker', blocks: [
        { p: 'REVIEW mode runs a question list across multiple documents simultaneously. For dispute resolution, load the Statement of Claim, defences, and replies, define your questions (one per cause of action), and A&GEL maps each party\'s position in a single table.' },
        { figure: { src: 'assets/i2/12_image013.png', caption: 'Lim Group: REVIEW mode tracking fraud and misconduct claims across 5 files.', wide: true } },
      ]},
    ],
    signoff: { line: 'Faster case assessment, better preparation.', name: 'A&GEL Development Team' },
  },

  'feature-sidebyside': {
    issue: null, title: 'Side-by-Side & Comparison',
    subtitle: 'The most granular review modes — clause by clause, with full source-paragraph verification.',
    date: '', readMins: 4, cover: 'assets/covers/issue-5.png',
    glance: [
      '<strong>Side-by-Side</strong> works clause by clause, with full source-paragraph verification for every finding.',
      '<strong>Comparison</strong> generates a first-pass legal review of tracked changes or document amendments.',
      'Every finding links back to the exact source clause — no hunting through the document.',
      'The <strong>mini-chat window</strong> is now moveable and resizable — drag it clear of your workspace.',
    ],
    sections: [
      { kicker: '01 — Side-by-Side', heading: 'Clause-by-clause analysis with source verification', blocks: [
        { p: 'Side-by-Side is A&GEL\'s most granular review mode. It works through a document clause by clause, and for every finding it surfaces the exact source paragraph — so you can verify the output directly against the original.' },
        { figure: { src: 'assets/i5/03_image005.jpg', caption: 'Side-by-Side analysis of an SPA — each finding links back to the source clause.', wide: true } },
        { figure: { src: 'assets/i5/04_image006.jpg', caption: 'The explanation panel — A&GEL\'s reasoning shown inline alongside the source.', wide: false } },
      ]},
      { kicker: '02 — Comparison', heading: 'First-pass review of tracked changes', blocks: [
        { p: '<strong>Comparison</strong> generates a first-pass legal review of tracked changes or document amendments. Upload the amended document and A&GEL produces a structured analysis of what has changed and what the implications are.' },
        { callout: { kind: 'note', title: 'A starting point, not a finished product', body: 'Side-by-Side and Comparison outputs are efficient starting points — always verify against the source before finalising.' } },
      ]},
      { kicker: '03 — Mini-Chat', heading: 'Moveable mini-chat interface', blocks: [
        { p: 'Review, Comparison, and Side by Side all feature a <strong>mini-chat window</strong> that lets you ask questions about the documents and A&GEL outputs simultaneously. The window is now <strong>moveable and resizable</strong> — drag it anywhere on screen so it doesn\'t obstruct the output you are reviewing.' },
      ]},
    ],
    signoff: { line: 'Clause by clause. Source verified.', name: 'A&GEL Development Team' },
  },

  'feature-multistep': {
    issue: null, title: 'Multi-Step Prompt',
    subtitle: 'Break complex legal tasks into sequential steps — each building on the last.',
    date: '', readMins: 4, cover: 'assets/covers/issue-3.jpg',
    glance: [
      'Found under <strong>Specialised Apps</strong>.',
      'Each step builds on the output of the previous — ideal for complex workflows.',
      'Works for both multi-step workflows <em>and</em> single complex prompts on a document.',
      'Outputs include inline source references — click to open the source with highlights.',
    ],
    sections: [
      { kicker: '01 — Getting started', heading: 'A structured mode for complex legal work', blocks: [
        { p: 'Found under <strong>Specialised Apps</strong>. Multi-Step Prompt lets you deconstruct a legal problem into a sequence of targeted steps — each builds on the last. Well suited to both multi-step workflows and single complex prompts that need document-level precision.' },
        { figure: { src: 'assets/i3/07_image008.png', caption: 'Multi-Step Prompt in the Specialised Apps grid.', wide: false } },
      ]},
      { kicker: '02 — Examples', heading: 'Breaking workflows into logical phases', blocks: [
        { steps: [
          { n: 'Corporate · Step 1', text: 'Summarise what each party is obligated to do.' },
          { n: 'Step 2', text: 'With that summary in mind, flag any one-sided or unusual clauses.' },
          { n: 'Step 3', text: 'For the flagged clauses, redline the top five changes I should push for if I represent [party].' },
        ]},
        { steps: [
          { n: 'Litigation · Step 1', text: 'Based on the Statement of Claim [attached], draft a first set of interrogatories.' },
          { n: 'Step 2', text: 'Having completed Step 1, draft corresponding document requests.' },
          { n: 'Step 3', text: 'Identify the top five custodians likely to have responsive documents, and explain why.' },
        ]},
        { callout: { kind: 'tip', title: 'Only one prompt? Still use it', body: 'Even with a single step, this app is excellent for complex prompts on a document — often better than Chat mode.' } },
        { figure: { src: 'assets/i3/08_image009.jpg', caption: 'Multi-Step Prompt output — references open an inline document viewer with highlights.', wide: false } },
      ]},
    ],
    signoff: { line: 'Smaller steps, sharper outputs.', name: 'A&GEL Development Team' },
  },

  'feature-timeline': {
    issue: null, title: 'Timeline',
    subtitle: 'Combine chronologies across up to 100 documents into a single, source-verified timeline.',
    date: '', readMins: 4, cover: 'assets/covers/issue-3.jpg',
    glance: [
      'Combines chronologies from <strong>up to 100 documents</strong> into one timeline.',
      '<strong>Clickable inline citations</strong> — click any reference to open the source with the passage highlighted.',
      '<strong>Smart Timeline</strong> lets you extract custom fields: entities, supporting paragraphs, and more.',
      'Works on chat logs and message screenshots (WhatsApp, WeChat) too.',
    ],
    sections: [
      { kicker: '01 — Combined timelines', heading: 'Chronologies across multiple documents', blocks: [
        { p: 'The updated Timeline extracts a chronology from each selected document and merges them into one — invaluable when you have multiple large affidavits, pleadings or submissions, each with its own timeline.' },
        { gallery: [
          { src: 'assets/i3/09_image010.png', caption: 'A combined Statement of Claim & Defence timeline across five files.' },
          { src: 'assets/i3/12_image013.png', caption: 'Drill into a single event — source document, entities, and supporting paragraph all shown.' },
        ]},
        { p: '<strong>View the source.</strong> Click the inline citation at the end of any event to open the source document with the originating line highlighted.' },
      ]},
      { kicker: '02 — Smart Timeline', heading: 'Extract custom fields for your matter', blocks: [
        { p: 'Click <strong>Extend Prompt</strong> to focus extraction on topics of interest. The <em>Basic Litigation (shared)</em> configuration extracts Event Description, Source Document, Entities / Individuals, and Supporting Paragraph — add your own fields too.' },
        { figure: { src: 'assets/i3/11_image012.png', caption: 'Smart Timeline: add custom extraction fields under Extend Prompt.', wide: false } },
        { callout: { kind: 'note', title: 'Works on messages too', body: 'Point Timeline at chat logs or screenshots of messages (WhatsApp, WeChat) to build a chronology.' } },
      ]},
    ],
    signoff: { line: 'One timeline. Every document.', name: 'A&GEL Development Team' },
  },

  'feature-playbook': {
    issue: null, title: 'Playbook',
    subtitle: 'Codify your team\'s house position into a standardised review — returns a Word document in tracked changes.',
    date: '', readMins: 3, cover: 'assets/covers/issue-4.png',
    glance: [
      'Encode your team\'s negotiating positions into a Playbook once — reuse it on every contract.',
      'A&GEL applies the playbook and returns a <strong>Word document in tracked changes</strong>.',
      'Review amendments with accepted / rejected / pending states.',
      'More detail on building and using Playbooks coming in the next A&GEL Insider issue.',
    ],
    sections: [
      { kicker: '01 — Playbook', heading: 'Your house position, automated', blocks: [
        { p: 'Playbook lets you encode your team\'s negotiating and standard positions into a reusable review template. Once built, upload any contract and A&GEL applies the playbook — returning a Word document with proposed changes in tracked-changes format, ready for review and amendment.' },
        { figure: { src: 'assets/Playbook_VIMA.png', caption: 'Playbook in action — reviewing amendments and comments with accepted/rejected/pending states.', wide: true } },
        { callout: { kind: 'note', title: 'Full Playbook guide coming soon', body: 'The next A&GEL Insider issue will cover how to build a Playbook from scratch and how to put it to work on your team\'s matters.' } },
      ]},
    ],
    signoff: { line: 'Your positions. Applied automatically.', name: 'A&GEL Development Team' },
  },

  'feature-msg': {
    issue: null, title: '.msg Email Upload',
    subtitle: 'Upload entire email files into A&GEL — including attachments — and work with them like any other document.',
    date: '', readMins: 2, cover: 'assets/covers/issue-3.jpg',
    glance: [
      'Upload <strong>.msg</strong> email files directly into Files.',
      'A&GEL reads all contents — including attachments.',
      'Use with Chat or any specialised mode (Guided Summary, Timeline, etc.).',
      'Exception: attachments with <em>Internal Only</em> labels or password protection are skipped.',
    ],
    sections: [
      { kicker: '.msg Upload', heading: 'Upload email files (.msg)', blocks: [
        { p: 'A&GEL users can now upload entire <strong>.msg</strong> email files into Files, for use with Chat or any specialised mode. A&GEL reads all contents — including attachments — except attachments carrying <em>Internal Only</em> sensitivity labels or that are password-protected.' },
        { p: 'Once uploaded, ask A&GEL to summarise the email, summarise the attached documents, or run any prompt from the library against it.' },
      ]},
    ],
    signoff: { line: 'Emails, attachments and all.', name: 'A&GEL Development Team' },
  },

  'feature-inline-ref': {
    issue: null, title: 'Inline Referencing',
    subtitle: 'Clickable pin-cite citations in Deep Research, Timeline, Scope Summary, and Review — verify every output against its source without leaving the page.',
    date: '', readMins: 2, cover: 'assets/covers/issue-5.png',
    glance: [
      'Deep Research, Timeline, and Scope Summary outputs now carry <strong>clickable inline citations</strong>.',
      'Click any citation to open the source document with the exact passage highlighted.',
      'Review\'s <strong>Explanation panel</strong> also has structured inline references for each AI-generated finding.',
      'No tab-switching — all verification happens on a single page.',
    ],
    sections: [
      { kicker: 'Inline Referencing', heading: 'Verify every output against its source', blocks: [
        { p: 'All major A&GEL output apps — <strong>Deep Research, Timeline, Scope Summary</strong> — now feature clickable inline citations. Each reference is numbered and linked: click it to open the source document with the exact passage highlighted.' },
        { figure: { src: 'assets/i5/01_image002.png', caption: 'Inline citations in a Deep Research output — click any reference to jump to the source.', wide: true } },
        { p: 'This eliminates the need to switch tabs or manually search source documents to verify a specific point. Cross-referencing is available on a single page.' },
      ]},
      { kicker: 'Inline Referencing in Review', heading: 'Structured citations in the Explanation panel', blocks: [
        { p: 'The Review page\'s <strong>Explanation</strong> section — expanded by clicking any cell — now features structured inline references. Each explanatory point is linked to its source clause or paragraph, making verification of AI-generated findings against the ground truth straightforward.' },
        { figure: { src: 'assets/i5/02_image004.jpg', caption: 'The Explanation panel in Review, with structured inline references linked to source documents.', wide: false } },
      ]},
    ],
    signoff: { line: 'Every output. Source verified.', name: 'A&GEL Development Team' },
  },

  'issue-5': {
    issue: 5, title: 'Inline Referencing, Mini-Chat & More',
    subtitle: 'Pin-cite citations across all apps, a moveable mini-chat, Scribe timestamps, and a string of quality-of-life updates.',
    date: '10 Apr 2026', readMins: 5, cover: 'assets/covers/issue-5.png',
    glance: [
      'Deep Research, Timeline, Scope Summary & Review now feature <strong>clickable inline citations</strong>.',
      'The mini-chat window in Review, Comparison & Side by Side is now <strong>moveable and resizable</strong>.',
      'Scribe transcripts now include <strong>timestamps</strong> in the downloaded Word document.',
      'Sessions can now be <strong>terminated via the History tab</strong> in addition to the Stop button.',
      'Search improvements: better keyword matching and in-document search.',
    ],
    sections: [
      { kicker: '01 — Inline Referencing', heading: 'Pin-cite citations across all apps', blocks: [
        { p: 'Deep Research, Timeline, and Scope Summary now feature <strong>clickable inline citations</strong>. These references allow you to cross-check outputs against source documents instantly — click any citation to open the source with the relevant passage highlighted, all without leaving the page.' },
        { figure: { src: 'assets/i5/01_image002.png', caption: 'Inline citations in a Deep Research / Review output — click any reference number to jump to the source.', wide: true } },
        { p: 'The Review page\'s expanded <strong>Explanation</strong> section also receives structured inline references linked to source documents, making it easier to verify AI-generated analysis against the ground truth.' },
        { figure: { src: 'assets/i5/02_image004.jpg', caption: 'The Explanation panel in Review — structured inline references linked to source documents.', wide: false } },
      ]},
      { kicker: '02 — Mini-Chat', heading: 'Moveable mini-chat interface', blocks: [
        { p: 'The mini-chat window available in <strong>Review, Comparison, and Side by Side</strong> is now moveable and resizable. Drag it out of the way while you work through outputs — it no longer obstructs your primary workspace.' },
      ]},
      { kicker: '03 — Scribe', heading: 'Timestamps in downloaded transcripts', blocks: [
        { p: 'Downloaded Scribe transcripts (Word documents) now include <strong>timestamps</strong> — markers that allow you to navigate to a specific moment in the recording directly from the document.' },
        { figure: { src: 'assets/i5/05_image007.jpg', caption: 'A downloaded Scribe transcript showing timestamps alongside translation.', wide: false } },
      ]},
      { kicker: '04 — Other Updates', heading: 'Quality-of-life improvements', blocks: [
        { h: 'Easier session termination' },
        { p: 'Ongoing sessions can now be terminated by <strong>deleting them from the History tab</strong>, in addition to the existing Stop button — useful when you need to amend a prompt and rerun, or when a session is unresponsive.' },
        { h: 'Enhanced Search' },
        { p: 'Search now benefits from <strong>inline referencing</strong>, better keyword matching, and in-document search — making it easier to locate specific content across your Vault.' },
        { h: 'Faster Guided Summary' },
        { p: 'Guided Summary now provides <strong>interim updates with inline references</strong> during generation, and overall output speed is increased. For simpler documents, the summary may load fast enough that interim updates are skipped.' },
        { h: 'Optimised Files UI' },
        { p: 'The Files page now has improved pagination — you can see more files and folders at a glance, with the page filling your screen dynamically.' },
      ]},
    ],
    signoff: { line: 'Faster verification. Cleaner workspace.', name: 'A&GEL Development Team' },
  },

  'feature-faq': {
    issue: null, title: 'Frequently Asked Questions',
    subtitle: 'Getting started with A&GEL — from file management and prompting to checking your outputs.',
    date: '10 Feb 2026', readMins: 10, cover: 'assets/covers/issue-1.png',
    glance: [
      'How A&GEL supports — but does not replace — your subject matter expertise.',
      'File management best practices: what to upload and how to organise it.',
      'How to write effective prompts using the Persona–Task–Context–Format framework.',
      'How to check the accuracy and reliability of A&GEL\'s outputs.',
      'Glossary of technical terms used in A&GEL.',
    ],
    sections: [
      { kicker: '1 — General Principles', heading: 'Always let subject matter experts be subject matter experts', blocks: [
        { h: 'Q: Part of A&GEL\'s design philosophy is that we should "always let subject matter experts be subject matter experts". What does that mean?' },
        { p: '"Always let subject matter experts be subject matter experts" refers to how your judgment, insight, and integrity as a professional / expert in your domain should remain at the heart of your work.' },
        { p: 'A&GEL does not replace that expertise or act as a subject matter expert. Instead, it is designed to help you as a knowledge worker / lawyer do more with more.' },
        { h: 'Q: What if I am completely unfamiliar with the subject matter I am asking A&GEL about? Should I not use A&GEL in that case?' },
        { p: 'If you are still developing your expertise — this does not mean you should avoid using A&GEL. It means being more mindful of how you use A&GEL. You should take extra care and conduct more checks on A&GEL\'s output.' },
        { p: 'Furthermore, consider using A&GEL as a gateway and guide to the existing knowhow which your team or company has uploaded. Used as a new way to access such know-how and gain on-demand insights and teachings from such know-how, A&GEL will become a powerful tool to support your training and development.' },
      ]},
      { kicker: '2 — File Management', heading: 'What to upload, and how to organise it', blocks: [
        { h: 'Q: What kind of reference material should I upload to A&GEL?' },
        { p: 'As a general rule, upload only trusted, reliable, and accurate material. Examples include primary legal sources (such as statutes, case law, etc.) and trusted internal materials (such as company knowhow or your own tried and tested documents).' },
        { p: 'As A&GEL\'s output heavily relies on the document / folder you specify, make sure to select and upload the correct ones to A&GEL and have a clear naming convention for such trusted documents.' },
        { callout: { kind: 'note', title: 'Word document settings', body: 'Word documents must have their security settings set to \'External\' (or its equivalent) prior to uploading them to A&GEL.' } },
        { h: 'Q: What about third-party documents? Can I upload them to A&GEL?' },
        { p: 'Certainly! You are encouraged to use A&GEL to analyse, interrogate or review third-party documents — in fact, it\'s one of the core strengths of many of the specialised modes of A&GEL (like Review). This includes documents from your opposing counsel / counterparty.' },
        { p: 'Just be sure to upload it to a folder that clearly demarcates that it is a third-party document so that you can tell from the file path whether it is a trusted precedent or in fact a "foreign" document that you are working on.' },
        { p: 'Keep in mind any company policies (such as policies which cover the usage of Generative AI) and acceptable use policies relevant to your use of A&GEL as well, including the use of third party content with the appropriate permissions, where required.' },
        { h: 'Q: Why does A&GEL take a long time to "process" files which I upload to the Files tab or in a Chat?' },
        { p: 'Documents have to be converted into a form that A&GEL can work with (the form is called "embeddings") and thus may take some time when being uploaded — but this occurs one-time only upon uploading to your Files in Vault. Documents uploaded to the Files tab may be reused in new sessions by selecting the file as the context in Chat or in any of the Specialised Modes.' },
        { p: 'In Chat, once you have uploaded a document, you can re-chat with the same document in a fresh Chat session by clicking on the "Context" button and then "New Chat with Documents" button.' },
        { h: 'Q: How should I upload my documents to the Files tab in bulk?' },
        { p: 'In the File mode, click the upload button at the top right of the screen. Select whichever and however many files you wish to upload, and press "open". You may continue to use A&GEL\'s other functionalities while your reference materials are uploading.' },
        { h: 'Q: How should I sort and manage the reference materials I\'ve uploaded to A&GEL? Why shouldn\'t I just upload everything into one folder?' },
        { p: '<strong>Why is file management important?</strong> Appropriate file management is crucial for ensuring that you can effectively: (a) select relevant reference materials for A&GEL to contextualise its responses to; and (b) check which reference materials A&GEL has used to ensure the accuracy and reliability of the output generated.' },
        { p: '<strong>How should I manage the reference materials uploaded?</strong> When uploading reference materials to A&GEL, we strongly recommend that you do not upload everything into one folder. Instead, we recommend that you curate and group your documents by: (i) subject matter; and (ii) workflow.' },
        { p: 'To do so in the File tab, before uploading your documents, create a new folder by clicking on the "Create Folder" button at the top right corner and label it with your subject matter. In the newly created folder, create a sub folder and label it with the workflow of the documents you are uploading.' },
        { p: 'When you then upload your documents, there will be an appropriate file path which displays both the subject matter and workflow of the document. For example: <code>Home / IP Licensing Agreements / Licensor</code>' },
      ]},
      { kicker: '3 — Prompting A&GEL', heading: 'Writing effective prompts', blocks: [
        { h: 'Q: What types of prompts may I use?' },
        { p: 'You may prompt A&GEL in many ways. Here are some suggestions of various types of prompts (including some that you might not have thought of):' },
        { h: 'Information seeking and retrieval' },
        { list: [
          '<strong>Question-Based Prompts:</strong> Direct questions seeking factual information, explanations, or clarifications.',
          '<strong>Explanation Prompts:</strong> Requests for detailed explanations of concepts, processes, or phenomena. These often use phrases like "explain," "describe," or "break down".',
          '<strong>Research Prompts:</strong> More complex information-gathering requests that may require synthesising information from multiple sources.',
        ]},
        { h: 'Task-oriented and instructional' },
        { list: [
          '<strong>Instruction Prompts:</strong> Clear, direct commands using action verbs like "write," "create," "analyse," or "summarize".',
          '<strong>Multi-Step Task Prompts:</strong> Complex instructions that break down larger tasks into sequential steps.',
          '<strong>Template-Based Prompts:</strong> Structured prompts that provide a specific format or framework for the AI to follow.',
        ]},
        { h: 'Analytical and problem-solving' },
        { list: [
          '<strong>Data Analysis Prompts:</strong> Instructions for analysing datasets, identifying patterns, or extracting insights.',
          '<strong>Problem-Solving Prompts:</strong> Requests that present a challenge and ask the AI to provide solutions, strategies, or recommendations.',
          '<strong>Comparative Analysis Prompts:</strong> Instructions to compare and contrast different options, evaluate alternatives, or assess pros and cons.',
        ]},
        { h: 'Classification and organisation' },
        { list: [
          '<strong>Classification Prompts:</strong> Instructions to categorise text, data, or information into predefined classes or labels.',
          '<strong>Sorting and Ranking Prompts:</strong> Requests to organise information according to specific criteria, such as importance, priority, or preference.',
          '<strong>Tagging and Labelling Prompts:</strong> Instructions to assign tags, labels, or metadata to content for organisation or search purposes.',
        ]},
        { h: 'Transformation and formatting' },
        { list: [
          '<strong>Translation Prompts:</strong> Instructions to convert text from one language to another or adapt content for different cultural contexts.',
          '<strong>Format Conversion Prompts:</strong> Requests to change the structure or presentation of information, such as converting prose to bullet points.',
          '<strong>Style Transformation Prompts:</strong> Instructions to rewrite content in different tones, styles, or for different audiences.',
        ]},
        { h: 'Other types of prompts' },
        { list: ['Role-Playing and Persona Prompts', 'Conversational and Interactive Prompts', 'System and Behavioural Prompts', 'Reasoning and Logic Prompts', 'Code and Technical Prompts', 'Educational and Training Prompts'] },
        { h: 'Q: How do I write effective prompts?' },
        { p: 'Generally, the most effective prompts consist of 4 parts: <strong>(a) Persona; (b) Task; (c) Context; and (d) Format.</strong>' },
        { h: '(a) Persona' },
        { p: 'Persona refers to the information you provide about yourself or what A&GEL is to emulate when writing an AI prompt. This helps channel A&GEL to write in a certain style and tone. Adding a persona would help you get a response that suits you better.' },
        { prompt: { label: 'Example', text: 'You are an experienced lawyer with 30 years\' experience.' } },
        { h: '(b) Task' },
        { p: 'This is the instruction you give the model. You should be specific about your task instructions to get the best results. However, it\'s also important to be clear and concise when assigning AI tasks.' },
        { prompt: { label: 'Example', text: 'Summarise this document in no more than 100 words.' } },
        { h: '(c) Context' },
        { p: 'The context (i.e. information) you feed A&GEL can make all the difference. Context is the best way to get targeted results from your A&GEL prompts. Such context may also be stated in the form of expert "Knowledge" that you want A&GEL to specifically take into account when generating its output.' },
        { prompt: { label: 'Example', text: 'This summary is for the client, the buyer in this transaction. Include details of the transaction from the perspective of the buyer in your summary.\n\nKnowledge: Assignment, novation or transfer clauses are not examples of change of control, ownership or interest provisions or clauses.' } },
        { h: '(d) Format' },
        { p: 'This is the form of the output. Options include lists, tables, and Markdown format.' },
        { prompt: { label: 'Example', text: 'Present the summary in the form of a table.' } },
        { callout: { kind: 'tip', title: 'Start from the Prompt Library', body: 'One way to write effective prompts is by taking an existing prompt that has been proven to be effective and adapting it for your purposes. Go to the Prompt Library tab, "Clone" the relevant prompt, and adapt it for your matter.' } },
        { h: 'Full example — Persona + Task + Context + Format' },
        { prompt: { label: 'Full prompt example', text: 'You are an experienced lawyer. Generate a concise (in no more than 100 words each) summary of this document. Instructions: focus on pointing out (1) key benefits and positive points covered. In a separate bullet point, give at least one example of facts cited to illustrate this and (b) key risks and downsides covered. In a separate bullet point, give at least one example of facts cited to illustrate this. Ensure coherence and clarity in the summary. Where more than one example or supporting argument is found, state which is the best or worst, as described in the article. Use formal language and maintain a neutral tone. Avoid including personal opinions or interpretations. Present all output in markdown format, using bullet points for each key point and bold text for particularly important findings. Your work must be precise, accurate, and professional, as it will be reviewed by senior legal professionals and used in high-stakes financial transactions.' } },
        { h: 'Q: What is RAG and when does A&GEL use it?' },
        { p: 'By default, A&GEL\'s chat function uses Retrieval-Augmented Generation (RAG). This draws information from the reference materials you uploaded to the File tab before passing the information on to the generative component (i.e. the LLM) along with the prompt you made to A&GEL. A&GEL then generates an output based on the data it has — with added context from the RAG.' },
        { p: 'The combination of RAG and LLM technology gives context and relevant information for A&GEL to produce an "augmented response", enhancing the precision of A&GEL\'s output and in turn, creates a higher probability that the answer would be reliable.' },
        { h: 'Q: Why shouldn\'t I simply allow A&GEL to consider all my uploaded materials for all prompts?' },
        { p: 'We strongly recommend that you do not have A&GEL consider uploaded materials that are not relevant to your prompt.' },
        { p: 'Gen AI tools like A&GEL do not understand the meaning of words, clauses, agreements etc. They operate through a probabilistic method, rather than true comprehension. In chat mode, A&GEL will, if all Files are selected as Context, draw references from all documents uploaded to your Files in Vault. However, the relevant contextual materials for your prompt may only be those of a specific subject matter, or furthermore, a specific workflow. Providing A&GEL with additional context not relevant to your purposes will likely reduce the speed, accuracy, precision, and reliability of A&GEL\'s output.' },
        { h: 'Q: How do I select the relevant reference materials for each prompt?' },
        { p: 'In Chat mode, to restrict A&GEL to only use strictly relevant reference materials as context for your prompt, navigate to "Context", click the selection symbol, and only select the relevant documents / folders.' },
      ]},
      { kicker: '4 — Using Outputs', heading: 'Checking accuracy and reliability', blocks: [
        { h: 'Q: I have prompted A&GEL and gotten my output. May I use the output as-is?' },
        { p: 'Generally speaking, you should always check A&GEL\'s output before it is used for your work product. You are recommended to only use output from A&GEL as a starting point or as a point of reference, and should always cross-check against trusted/reliable knowledge sources (such as your uploaded reference materials or verified legal materials).' },
        { h: 'Q: How should I check the accuracy and reliability of the output?' },
        { p: 'In Chat mode, A&GEL\'s outputs have been optimised to include references whenever available. These references are links to trusted information (e.g. your uploaded materials in the Files tab).' },
        { p: '<strong>A&GEL should be a gateway to your know-how, not the source of your know-how.</strong> By clicking on each reference link, you will be able to see the reference material from which A&GEL took context from. You should always check A&GEL\'s output against these reference materials to ensure its accuracy and reliability.' },
        { p: 'If appropriate A&GEL file management practices were implemented, the reference links — which show the file path of the documents referenced — would also give you a good snapshot of whether A&GEL had augmented its output using the correct subject matter (and workflow) materials. For example, if you are prompting from the position of a "Leasehold Assignor" but notice that A&GEL has referenced a document contained in the "Leasehold Assignee" folder, you can immediately tell that the output is not fully contextualised to your purposes.' },
        { callout: { kind: 'warn', title: 'What if the output does not have any references?', body: 'Outputs without references are prone to hallucinations as they are not grounded in any trusted reference material. If you don\'t see any references, it is almost certainly the case that the information presented in the output comes only from the model\'s pre-training. You should not use the output unless you are sure that it was given in response to a general writing or text editing-related prompt (e.g. simplify this document or proof-reading) or summarisation, where the model has been given sufficient context.' } },
      ]},
      { kicker: '5 — Glossary', heading: 'Technical terms used in A&GEL', blocks: [
        { p: '<strong>Favourite File Weight:</strong> Adjusts how heavily A&GEL prioritises documents you have flagged as "favourites" (within Vault) when generating responses. A higher weight ensures these preferred sources influence the output more significantly than general files in your Vault.' },
        { p: '<strong>Re-Ranking:</strong> A secondary sorting process where A&GEL reviews initial search results to prioritise the most relevant clauses or text segments. This ensures the most pertinent information appears at the top before the response is generated.' },
        { p: '<strong>Search Ratio:</strong> Controls the volume of internal data the AI retrieves to answer a query. A higher ratio broadens the search to capture more context (useful for broad exploration), while a lower ratio focuses strictly on exact matches (loosely similar to CTRL+F).' },
        { p: '<strong>System Prompt:</strong> The base set of instructions that establishes A&GEL\'s specific role, tone, and operational boundaries (e.g., "You are a Senior Partner with 20 years of experience"). These settings serve as the primary framework that guides how A&GEL handles every subsequent request.' },
        { p: '<strong>\'Thinking\' or \'Reasoning\':</strong> A process where A&GEL logically breaks down complex queries step-by-step before generating a final response. This internal deliberation mimics human reasoning and is intended to help reduce errors in complicated analysis.' },
      ]},
    ],
    signoff: { line: 'Every new tool takes a bit of getting used to — and A&GEL is no different. The more you use it, the more useful it becomes.', name: 'A&GEL Development Team' },
  },
};

function renderBlock(b, hId) {
  if (b.p !== undefined) return `<p class="reader-p">${b.p}</p>`;
  if (b.h !== undefined) return `<h4 class="reader-h"${hId ? ` id="${hId}"` : ''}>${b.h}</h4>`;
  if (b.quote !== undefined) return `<blockquote class="reader-quote">${b.quote}</blockquote>`;
  if (b.list) return `<ul class="reader-list">${b.list.map(i=>`<li>${i}</li>`).join('')}</ul>`;
  if (b.callout) {
    const c = b.callout;
    const bodyHtml = c.body ? `<div class="reader-callout-body">${c.body}</div>` : '';
    const listHtml = c.list ? `<ul class="reader-callout-list">${c.list.map(i=>`<li>${i}</li>`).join('')}</ul>` : '';
    return `<div class="reader-callout ${c.kind}"><div class="reader-callout-title">${c.title}</div>${bodyHtml}${listHtml}</div>`;
  }
  if (b.prompt) return `<div class="reader-prompt"><div class="reader-prompt-label">${b.prompt.label}</div><pre class="reader-prompt-text">${b.prompt.text}</pre></div>`;
  if (b.steps) return `<div class="reader-steps">${b.steps.map(s=>`<div class="reader-step"><span class="reader-step-n">${s.n}</span><span class="reader-step-text">${s.text}</span></div>`).join('')}</div>`;
  if (b.figure) return `<figure class="reader-figure${b.figure.wide ? '' : ' reader-figure-sm'}"><img src="${b.figure.src}" alt="${b.figure.caption}" loading="lazy"/><figcaption>${b.figure.caption}</figcaption></figure>`;
  if (b.gallery) return `<div class="reader-gallery">${b.gallery.map(g=>`<figure><img src="${g.src}" alt="${g.caption}" loading="lazy"/><figcaption>${g.caption}</figcaption></figure>`).join('')}</div>`;
  return '';
}

let _tocSpyCleanup = null;

function openIssue(id) {
  const issue = ISSUES[id];
  if (!issue) return;
  const reader = document.getElementById('reader');
  document.getElementById('reader-cover').src = issue.cover;
  document.getElementById('reader-issue-label').textContent = issue.issue != null ? 'Issue ' + issue.issue : 'Feature Guide';
  document.getElementById('reader-title').textContent = issue.title;
  document.getElementById('reader-subtitle').textContent = issue.subtitle;
  const dateEl = document.getElementById('reader-date');
  const dotEl = document.querySelector('.reader-dot');
  dateEl.textContent = issue.date || '';
  if (dotEl) dotEl.style.display = issue.date ? '' : 'none';
  document.getElementById('reader-mins').textContent = issue.readMins;
  const glanceEl = document.getElementById('reader-glance');
  glanceEl.innerHTML = `<div class="reader-glance-title">At a glance</div><ul>${issue.glance.map(g=>`<li>${g}</li>`).join('')}</ul>`;

  // Build content with anchored IDs for h blocks
  const contentEl = document.getElementById('reader-content');
  let hCounter = 0;
  contentEl.innerHTML = issue.sections.map((s, si) => {
    const secId = `toc-s${si}`;
    const blocksHtml = s.blocks.map(b => {
      if (b.h !== undefined) {
        const hId = `toc-h${hCounter++}`;
        return renderBlock(b, hId);
      }
      return renderBlock(b);
    }).join('');
    return `<div class="reader-section" id="${secId}">
      <div class="reader-section-kicker">${s.kicker}</div>
      <h3 class="reader-section-heading">${s.heading}</h3>
      ${blocksHtml}
    </div>`;
  }).join('');

  document.getElementById('reader-signoff').innerHTML =
    `<div class="reader-signoff-line">${issue.signoff.line}</div><div>${issue.signoff.name}</div>
     <a href="https://app.angellaw.ai" class="reader-angel-cta" target="_blank">Open A&amp;GEL &rarr;</a>`;

  // Build TOC
  if (_tocSpyCleanup) { _tocSpyCleanup(); _tocSpyCleanup = null; }
  const tocEl = document.getElementById('reader-toc');
  if (issue.toc) {
    let hIdx = 0;
    const tocHtml = `<div class="reader-toc-title">Contents</div>` +
      issue.sections.map((s, si) => {
        const secId = `toc-s${si}`;
        const subItems = s.blocks.filter(b => b.h !== undefined).map(b => {
          const hId = `toc-h${hIdx++}`;
          return `<button class="reader-toc-item" data-target="${hId}">${b.h}</button>`;
        }).join('');
        return `<div class="reader-toc-section">
          <button class="reader-toc-section-link" data-target="${secId}">${s.kicker}</button>
          ${subItems ? `<div class="reader-toc-items">${subItems}</div>` : ''}
        </div>`;
      }).join('');
    tocEl.innerHTML = tocHtml;
    tocEl.classList.remove('reader-toc-hidden');

    tocEl.onclick = function(e) {
      const btn = e.target.closest('[data-target]');
      if (!btn) return;
      const target = document.getElementById(btn.dataset.target);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Scroll spy
    const allTargets = [...tocEl.querySelectorAll('[data-target]')].map(b => b.dataset.target);
    function updateSpy() {
      const scrollTop = reader.scrollTop + 120;
      let active = null;
      for (const tid of allTargets) {
        const el = document.getElementById(tid);
        if (el && el.offsetTop <= scrollTop) active = tid;
      }
      tocEl.querySelectorAll('[data-target]').forEach(btn => {
        btn.classList.toggle('toc-active', btn.dataset.target === active);
      });
    }
    reader.addEventListener('scroll', updateSpy);
    _tocSpyCleanup = () => reader.removeEventListener('scroll', updateSpy);
  } else {
    tocEl.innerHTML = '';
    tocEl.classList.add('reader-toc-hidden');
  }

  reader.classList.remove('reader-hidden');
  reader.classList.add('reader-visible');
  reader.scrollTop = 0;
  document.body.style.overflow = 'hidden';
}

function closeReader() {
  if (_tocSpyCleanup) { _tocSpyCleanup(); _tocSpyCleanup = null; }
  const reader = document.getElementById('reader');
  reader.classList.remove('reader-visible');
  reader.classList.add('reader-hidden');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeReader(); });

/* ── KEYBOARD SCROLL ── */
(function(){
  const SECTIONS = ['landing','panel1','panel2','panel3','panel4','misc'];
  let scrolling = false;

  document.addEventListener('keydown', function(e) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    // Don't intercept if reader is open or user is in a text input
    if (document.getElementById('reader').classList.contains('reader-visible')) return;
    if (['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) return;

    e.preventDefault();
    if (scrolling) return;

    const els = SECTIONS.map(id => document.getElementById(id)).filter(Boolean);

    let currentIdx = 0;
    for (let i = 0; i < els.length; i++) {
      if (els[i].getBoundingClientRect().top <= 10) currentIdx = i;
    }

    const targetIdx = e.key === 'ArrowDown'
      ? Math.min(currentIdx + 1, els.length - 1)
      : Math.max(currentIdx - 1, 0);

    if (targetIdx === currentIdx) return;

    scrolling = true;
    els[targetIdx].scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => { scrolling = false; }, 800);
  });
})();

/* ── PILL STRIP ── */
(function(){
  const pills = document.querySelectorAll('.strip-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', function(e) {
      const cardId = this.dataset.card;

      // update active pill
      pills.forEach(p => p.classList.remove('strip-pill-active'));
      this.classList.add('strip-pill-active');

      if (!cardId) return; // no card target — let href scroll to panel normally

      e.preventDefault();

      // if the card has a reader article, open it directly
      const issueId = this.dataset.issue;
      if (issueId) {
        openIssue(issueId);
        return;
      }

      // otherwise scroll to the card and pulse it
      const card = document.getElementById(cardId);
      if (!card) return;

      card.scrollIntoView({ behavior: 'smooth', block: 'center' });

      setTimeout(() => {
        card.classList.remove('card-highlighted');
        void card.offsetWidth;
        card.classList.add('card-highlighted');
        card.addEventListener('animationend', () => card.classList.remove('card-highlighted'), { once: true });
      }, 650);
    });
  });
})();

/* ── STRIP SCROLL AFFORDANCE ── */
(function(){
  const strip = document.querySelector('.landing-strip');
  const outer = document.querySelector('.landing-strip-outer');
  if (!strip || !outer) return;
  function check(){
    const atEnd = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 1;
    outer.classList.toggle('strip-end', atEnd);
  }
  strip.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check);
  check();
})();