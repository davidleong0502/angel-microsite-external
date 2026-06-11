

(function(){
  const nav=document.getElementById("nav");
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
    const landing=document.getElementById("landing");
    const pastLanding=scrollY>=(landing?landing.offsetHeight*0.8:0);
    nav.classList.toggle("solid",pastLanding);
    nav.classList.toggle("nav-hidden",!pastLanding);
    let cur=0;
    panels.forEach((id,i)=>{
      const el=document.getElementById(id);
      if(el&&scrollY>=el.offsetTop-window.innerHeight/2) cur=i;
    });
    setActive(cur);
  });
  // set initial nav state
  nav.classList.add("nav-hidden");
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
      { kicker: '03 — Get started', heading: 'FAQs & example use cases', blocks: [
        { p: 'If you are just starting to explore A&GEL, our Technology and Corporate IP lawyers — who led its development — have put together a set of resources:' },
        { list: ['A set of FAQs', 'A demo of use cases for A&GEL\'s features', 'A video walkthrough'] },
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
        { figure: { src: 'assets/i2/04_image005.png', caption: 'Case Summariser (Concise) v1.1 and Case Summariser (Detailed) v1.1 in the prompt library.', wide: false } },
        { p: 'In our experience the <strong>Detailed</strong> Case Summariser is generally superior, especially on more complex judgments. A&GEL is instructed to rely <em>exclusively</em> on the source decision — though note it can struggle to distinguish <em>ratio decidendi</em> from <em>obiter dicta</em>.' },
        { callout: { kind: 'note', title: 'Not a silver bullet', body: 'Outputs must still be reviewed and verified in the usual manner — checked thoroughly for accuracy and completeness. These prompts give you an efficient starting point, not a finished work product.' } },
        { p: 'Pair these with the <strong>Guided Summary</strong> function (under Apps), which summarises a single document guided by a prompt. Upload a Singapore court decision, pick the Case Summariser (Detailed) prompt, and add any specific points you are concerned with.' },
        { figure: { src: 'assets/i2/05_image006.png', caption: 'A detailed case summary generated by A&GEL via the Guided Summary function.', wide: true } },
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
    date: 'Issues 3, 4 & 5', readMins: 5, cover: 'assets/covers/issue-3.jpg',
    glance: [
      '<strong>Live editing</strong> — edit the transcript as Scribe records; edited portions are underlined.',
      '<strong>Audio playback</strong> — click any transcript segment to play back its recording from that point.',
      '<strong>Live Translation</strong> — translate in real time into the language of your choice.',
      '<strong>Timestamped downloads</strong> — exported Word transcripts carry timestamps for easy navigation.',
    ],
    sections: [
      { kicker: 'Issue 3 — Scribe', heading: 'Live editing & audio playback', blocks: [
        { p: '<strong>Live editing</strong> — the improved Scribe lets you edit the transcript; edited portions are underlined for ease of reference. <strong>Audio playback</strong> — after transcription is saved, open the raw transcript and click any segment to play the recording from that point.' },
        { gallery: [
          { src: 'assets/i3/05_image006.png', caption: 'Scribe recording in progress, with live transcription.' },
          { src: 'assets/i3/06_image007.png', caption: 'The raw transcript — click a segment to play back its audio.' },
        ]},
      ]},
      { kicker: 'Issue 4 — Scribe', heading: 'Live-translation, now in Scribe', blocks: [
        { p: 'Understand calls and meetings in the language of your choice. Tick the <strong>Live Translation</strong> box and pick a language — A&GEL renders the translation beneath the original transcription on the fly.' },
        { figure: { src: 'assets/i4/04_image005.png', caption: 'Enable Live Translation and select a language from the drop-down.', wide: true } },
        { p: 'As A&GEL transcribes and translates, you can type notes or amend the transcript directly — your edits appear in <strong>yellow</strong> to distinguish them from A&GEL\'s text. Saved transcripts retain both the translation and your edits.' },
        { gallery: [
          { src: 'assets/i4/05_image006.png', caption: 'Live translation beneath the original, with editable notes in yellow.' },
          { src: 'assets/i4/06_image007.png', caption: 'Timestamps run down the left of the raw transcription.' },
        ]},
      ]},
      { kicker: 'Issue 5 — Scribe', heading: 'Downloadable transcripts, now with timestamps', blocks: [
        { p: 'Scribe transcripts now include <strong>timestamps</strong> within the downloaded Word document — markers that make it simpler to navigate to specific moments in a recorded conversation or meeting.' },
        { figure: { src: 'assets/i5/05_image007.jpg', caption: 'A downloaded Scribe transcript with timestamps and translation retained.', wide: false } },
      ]},
    ],
    signoff: { line: 'Record, review, replay.', name: 'A&GEL Development Team' },
  },
  'feature-prompt-library': {
    issue: null, title: 'Prompt Library',
    subtitle: 'Find, clone and adapt community-built prompts — and sharpen them with built-in tools.',
    date: 'Issue 2', readMins: 2, cover: 'assets/covers/issue-2.png',
    glance: [
      'Browse, clone and adapt community-built prompts from the Prompt Library for your specific matter.',
      '<strong>Test your prompt</strong> — compare A&GEL\'s output against a model answer you have already prepared.',
      'Use <strong>Improve My Prompt v1.0</strong> in the prompt library to further refine any prompt that isn\'t performing as expected.',
    ],
    sections: [
      { kicker: 'Issue 2 — Craft', heading: 'Tips for prompting: test and improve', blocks: [
        { p: '<strong>Test your prompt.</strong> An effective way to gauge a prompt\'s effectiveness is to compare A&GEL\'s output against a "model answer" or reference output you have already prepared.' },
        { p: 'For instance, if you are developing a prompt to summarise a case, refer to a case summary you have previously prepared and are familiar with as your benchmark. Run your summary prompt and assess A&GEL\'s output against your prior work. If the output aligns closely with your benchmark, your prompt is likely well-developed. If it does not, identify the specific gaps and refine your prompt accordingly — for example, by adding further context.' },
        { p: '<strong>Improve your prompt.</strong> Consider using the <em>Improve My Prompt v1.0</em> tool available in your prompt library to further refine your prompt.' },
        { figure: { src: 'assets/i2/17_image018.png', caption: 'Improve My Prompt v1.0 — refine an existing prompt in the library.', wide: false } },
      ]},
    ],
    signoff: { line: 'Clone, adapt, and share what works.', name: 'A&GEL Development Team' },
  },
  'feature-guided-summary': {
    issue: null, title: 'Quick Info & Guided Summary',
    subtitle: 'A fast, sourced read of any single document — snapshot or steered.',
    date: 'Issue 2', readMins: 3, cover: 'assets/covers/issue-2.png',
    glance: [
      'Use <strong>Quick Info</strong> for an instant snapshot of any document.',
      '<strong>Guided Summary</strong> (under Apps) lets you steer the focus — pair it with a prompt from the library.',
      'Upload a document, pick a prompt, and add any specific points you want covered.',
      'Outputs are an efficient starting point — review and verify before use.',
    ],
    sections: [
      { kicker: '01 — Guided Summary', heading: 'A sourced summary of any document, steered by a prompt', blocks: [
        { p: 'The prompt library includes two prompts for summarising documents — one for a concise overview, one for a more detailed analysis. They were adapted from SAL\'s published prompts and refined with generative AI.' },
        { figure: { src: 'assets/i2/04_image005.png', caption: 'Case Summariser (Concise) v1.1 and Case Summariser (Detailed) v1.1 in the prompt library.', wide: false } },
        { p: 'In our experience the <strong>Detailed</strong> summariser is generally superior, especially on more complex documents. A&GEL is instructed to rely <em>exclusively</em> on the source — though it can struggle to distinguish <em>ratio decidendi</em> from <em>obiter dicta</em> in case law.' },
        { callout: { kind: 'note', title: 'Not a silver bullet', body: 'Outputs must still be reviewed and verified in the usual manner — checked thoroughly for accuracy and completeness. These prompts give you an efficient starting point, not a finished work product.' } },
        { p: 'Use the <strong>Guided Summary</strong> function (under Apps) to run any prompt against a single document. Upload the file, pick the prompt from the library, and add any specific points you are concerned with.' },
        { figure: { src: 'assets/i2/05_image006.png', caption: 'A detailed summary generated by A&GEL via the Guided Summary function.', wide: true } },
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
    date: 'Issue 2', readMins: 4, cover: 'assets/covers/issue-2.png',
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
    date: 'Issue 5', readMins: 3, cover: 'assets/covers/issue-5.png',
    glance: [
      '<strong>Side-by-Side</strong> works clause by clause, with full source-paragraph verification for every finding.',
      '<strong>Comparison</strong> generates a first-pass legal review of tracked changes or document amendments.',
      'Every finding links back to the exact source clause — no hunting through the document.',
      'Export results as a structured Word document.',
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
    ],
    signoff: { line: 'Clause by clause. Source verified.', name: 'A&GEL Development Team' },
  },

  'feature-multistep': {
    issue: null, title: 'Multi-Step Prompt',
    subtitle: 'Break complex legal tasks into sequential steps — each building on the last.',
    date: 'Issue 3', readMins: 4, cover: 'assets/covers/issue-3.jpg',
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
    date: 'Issue 3', readMins: 4, cover: 'assets/covers/issue-3.jpg',
    glance: [
      'Combines chronologies from <strong>up to 100 documents</strong> into one timeline.',
      '<strong>Source references</strong> — click any event to open the originating document with the line highlighted.',
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
        { p: '<strong>View the source.</strong> Click the reference at the end of any event to open the source document, with the originating line highlighted.' },
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
    date: 'Issue 4', readMins: 3, cover: 'assets/covers/issue-4.png',
    glance: [
      'Encode your team\'s negotiating positions into a Playbook once — reuse it on every contract.',
      'A&GEL applies the playbook and returns a <strong>Word document in tracked changes</strong>.',
      'Review amendments with accepted / rejected / pending states.',
      'More detail on building and using Playbooks coming in the next A&GEL Insider issue.',
    ],
    sections: [
      { kicker: '01 — Playbook', heading: 'Your house position, automated', blocks: [
        { p: 'Playbook lets you encode your team\'s negotiating and standard positions into a reusable review template. Once built, upload any contract and A&GEL applies the playbook — returning a Word document with proposed changes in tracked-changes format, ready for review and amendment.' },
        { figure: { src: 'assets/i4/07_image008.jpg', caption: 'Playbook in action — reviewing amendments and comments with accepted/rejected/pending states.', wide: true } },
        { callout: { kind: 'note', title: 'Full Playbook guide coming soon', body: 'The next A&GEL Insider issue will cover how to build a Playbook from scratch and how to put it to work on your team\'s matters.' } },
      ]},
    ],
    signoff: { line: 'Your positions. Applied automatically.', name: 'A&GEL Development Team' },
  },
};

function renderBlock(b) {
  if (b.p !== undefined) return `<p class="reader-p">${b.p}</p>`;
  if (b.h !== undefined) return `<h4 class="reader-h">${b.h}</h4>`;
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
  if (b.figure) return `<figure class="reader-figure"><img src="${b.figure.src}" alt="${b.figure.caption}" loading="lazy"/><figcaption>${b.figure.caption}</figcaption></figure>`;
  if (b.gallery) return `<div class="reader-gallery">${b.gallery.map(g=>`<figure><img src="${g.src}" alt="${g.caption}" loading="lazy"/><figcaption>${g.caption}</figcaption></figure>`).join('')}</div>`;
  return '';
}

function openIssue(id) {
  const issue = ISSUES[id];
  if (!issue) return;
  const reader = document.getElementById('reader');
  document.getElementById('reader-cover').src = issue.cover;
  document.getElementById('reader-issue-label').textContent = issue.issue != null ? 'Issue ' + issue.issue : 'Feature Guide';
  document.getElementById('reader-title').textContent = issue.title;
  document.getElementById('reader-subtitle').textContent = issue.subtitle;
  document.getElementById('reader-date').textContent = issue.date;
  document.getElementById('reader-mins').textContent = issue.readMins;
  const glanceEl = document.getElementById('reader-glance');
  glanceEl.innerHTML = `<div class="reader-glance-title">At a glance</div><ul>${issue.glance.map(g=>`<li>${g}</li>`).join('')}</ul>`;
  const contentEl = document.getElementById('reader-content');
  contentEl.innerHTML = issue.sections.map(s =>
    `<div class="reader-section">
      <div class="reader-section-kicker">${s.kicker}</div>
      <h3 class="reader-section-heading">${s.heading}</h3>
      ${s.blocks.map(renderBlock).join('')}
    </div>`
  ).join('');
  document.getElementById('reader-signoff').innerHTML =
    `<div class="reader-signoff-line">${issue.signoff.line}</div><div>${issue.signoff.name}</div>
     <a href="https://app.angellaw.ai" class="reader-angel-cta" target="_blank">Open A&amp;GEL &rarr;</a>`;
  reader.classList.remove('reader-hidden');
  reader.classList.add('reader-visible');
  reader.scrollTop = 0;
  document.body.style.overflow = 'hidden';
}

function closeReader() {
  const reader = document.getElementById('reader');
  reader.classList.remove('reader-visible');
  reader.classList.add('reader-hidden');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeReader(); });

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
      const card = document.getElementById(cardId);
      if (!card) return;

      card.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // wait for scroll to settle, then pulse the card
      setTimeout(() => {
        card.classList.remove('card-highlighted');
        void card.offsetWidth; // force reflow so animation restarts
        card.classList.add('card-highlighted');
        card.addEventListener('animationend', () => card.classList.remove('card-highlighted'), { once: true });
      }, 650);
    });
  });
})();
