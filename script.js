let soundEnabled = true;
let pageFlip = null;
let activeModal = null;
let audioCtx = null;
let portfolioStarted = false;

function ensureAudio(){
  try{
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(audioCtx.state === 'suspended') audioCtx.resume();
  }catch(e){}
}

/* Natural-feeling paper/page flip sound made from filtered short noise + soft tone. */
function playPageFlipSound(){
  if(!soundEnabled) return;
  try{
    ensureAudio();
    if(!audioCtx) return;
    const now=audioCtx.currentTime;
    const duration=.24;
    const buffer=audioCtx.createBuffer(1,Math.floor(audioCtx.sampleRate*duration),audioCtx.sampleRate);
    const data=buffer.getChannelData(0);
    for(let i=0;i<data.length;i++){
      const t=i/data.length;
      const envelope=Math.pow(1-t,1.7);
      data[i]=(Math.random()*2-1)*envelope*(0.55+0.45*Math.sin(t*Math.PI));
    }
    const source=audioCtx.createBufferSource();
    const band=audioCtx.createBiquadFilter();
    const low=audioCtx.createBiquadFilter();
    const gain=audioCtx.createGain();
    band.type='bandpass'; band.frequency.setValueAtTime(1650,now); band.Q.setValueAtTime(.65,now);
    low.type='lowpass'; low.frequency.setValueAtTime(4200,now);
    gain.gain.setValueAtTime(.0001,now);
    gain.gain.linearRampToValueAtTime(.16,now+.018);
    gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
    source.buffer=buffer;
    source.connect(band).connect(low).connect(gain).connect(audioCtx.destination);
    source.start(now);
    source.stop(now+duration);

    const osc=audioCtx.createOscillator();
    const og=audioCtx.createGain();
    osc.type='sine';
    osc.frequency.setValueAtTime(155,now);
    osc.frequency.exponentialRampToValueAtTime(82,now+.18);
    og.gain.setValueAtTime(.0001,now);
    og.gain.linearRampToValueAtTime(.035,now+.025);
    og.gain.exponentialRampToValueAtTime(.0001,now+.2);
    osc.connect(og).connect(audioCtx.destination);
    osc.start(now); osc.stop(now+.21);
  }catch(e){}
}

function toggleSound(){
  soundEnabled=!soundEnabled;
  ensureAudio();
  const icon=document.getElementById('soundIcon');
  const text=document.getElementById('soundText');
  if(icon) icon.className=soundEnabled?'fa-solid fa-volume-high':'fa-solid fa-volume-xmark';
  if(text) text.textContent=soundEnabled?'Sound: ON':'Sound: OFF';
}

function toggleTheme(){
  document.body.classList.toggle('light-theme');
  const icon=document.getElementById('themeIcon');
  if(icon) icon.className=document.body.classList.contains('light-theme')?'fa-solid fa-moon':'fa-solid fa-sun';
}

function goToPage(pageNum){
  if(pageFlip) pageFlip.flip(Math.max(0,pageNum-1));
}

function isModalTrigger(target){return target&&target.closest?target.closest('.modal-trigger,.cv-trigger'):null;}
function protectModalTriggerEvent(event){if(isModalTrigger(event.target) || (event.target?.closest && event.target.closest('.no-flip'))) event.stopPropagation();}
document.addEventListener('pointerdown',protectModalTriggerEvent,true);
document.addEventListener('mousedown',protectModalTriggerEvent,true);
document.addEventListener('touchstart',protectModalTriggerEvent,true);

function openModal(modalId){
  const modal=document.getElementById(modalId); if(!modal)return;
  if(activeModal&&activeModal!==modal)closeModalElement(activeModal);
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
  activeModal=modal;
}
function closeModalElement(modal){if(!modal)return;modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');}
function closeActiveModal(){if(!activeModal)return;closeModalElement(activeModal);activeModal=null;document.body.classList.remove('modal-open');}
function closeProjectModal(){closeModalElement(document.getElementById('projectModal'));if(activeModal?.id==='projectModal')activeModal=null;document.body.classList.remove('modal-open');}
function closeCvModal(){closeModalElement(document.getElementById('cvModal'));if(activeModal?.id==='cvModal')activeModal=null;document.body.classList.remove('modal-open');}
function closeCertModal(){closeModalElement(document.getElementById('certModal'));if(activeModal?.id==='certModal')activeModal=null;document.body.classList.remove('modal-open');}

function openProjectModal(title,tech,desc,extra,images){
  const titleElem=document.getElementById('modalProjTitle');
  const techElem=document.getElementById('modalProjTech');
  const descElem=document.getElementById('modalProjDesc');
  const galleryElem=document.getElementById('modalProjGallery');
  if(titleElem)titleElem.textContent=title||'Project Title';
  if(techElem)techElem.textContent='Technologies: '+(tech||'');
  if(descElem)descElem.textContent=((desc||'')+' '+(extra||'')).trim();
  if(galleryElem){
    galleryElem.innerHTML='';
    (Array.isArray(images)?images:[]).forEach(src=>{
      const img=document.createElement('img');
      img.src=src; img.alt=(title||'Project')+' Screenshot'; img.loading='lazy';
      img.className='w-full h-32 object-cover rounded border border-ink/10 shadow';
      galleryElem.appendChild(img);
    });
  }
  openModal('projectModal');
}
function openCvModal(){openModal('cvModal');}
function openCertModal(title,issuer,desc,imgPath){
  const titleElem=document.getElementById('certModalTitle'), issuerElem=document.getElementById('certModalIssuer'), descElem=document.getElementById('certModalDesc'), imgElem=document.getElementById('certModalImg');
  if(titleElem)titleElem.textContent=title||'Certificate Title';
  if(issuerElem)issuerElem.textContent=issuer||'Issuer Name';
  if(descElem)descElem.textContent=desc||'Certificate details description...';
  if(imgElem){imgElem.src=imgPath||'';imgElem.alt=title?(title+' certificate'):'Certificate Image';}
  openModal('certModal');
}

function initPageFlip(){
  if(pageFlip)return;
  const bookElem=document.getElementById('book');
  if(!bookElem||typeof St==='undefined')return;
  const bookWidth=window.innerWidth<768?320:480;
  const bookHeight=window.innerWidth<768?450:620;
  pageFlip=new St.PageFlip(bookElem,{width:bookWidth,height:bookHeight,size:'stretch',minWidth:280,maxWidth:900,minHeight:350,maxHeight:1100,maxShadowOpacity:.5,showCover:true,mobileScrollSupport:true});
  pageFlip.loadFromHTML(document.querySelectorAll('.page'));
  const prevBtn=document.getElementById('prevBtn'), nextBtn=document.getElementById('nextBtn'), pageInfo=document.getElementById('pageInfo');
  prevBtn?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(!activeModal)pageFlip.flipPrev();});
  nextBtn?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(!activeModal)pageFlip.flipNext();});
  pageFlip.on('flip',e=>{if(pageInfo)pageInfo.textContent=`Page ${e.data+1} of ${pageFlip.getPageCount()}`;if(!activeModal)playPageFlipSound();});

  document.querySelectorAll('.project-card').forEach(card=>card.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();let images=[];try{images=JSON.parse(card.dataset.images||'[]')}catch(_){images=[]}openProjectModal(card.dataset.title,card.dataset.tech,card.dataset.desc,card.dataset.extra,images)},true));
  document.querySelectorAll('.cert-card').forEach(card=>card.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openCertModal(card.dataset.title,card.dataset.issuer,card.dataset.desc,card.dataset.img)},true));
  document.querySelectorAll('.cv-trigger').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openCvModal()},true));
  document.querySelectorAll('.overlay-modal').forEach(modal=>modal.addEventListener('click',e=>{if(e.target===modal){if(modal.id==='projectModal')closeProjectModal();if(modal.id==='cvModal')closeCvModal();if(modal.id==='certModal')closeCertModal();}}));
}

const assistantKnowledge={
  projects:`01. AI-Driven Question Parser\nTechnologies: Python | Laravel | AI | MySQL\nAn intelligent question parser designed to extract and organize examination or quiz questions automatically. The system uses Python backend logic with Laravel frontend integration, custom text tokenization, smart parsing algorithms and database storage. Status: Final Year.\n\n02. Fresh Slice 65 Bakery System\nTechnologies: Java | Java Swing | NetBeans | MySQL\nA desktop application for bakery inventory, stock operations, user roles and daily billing. Developed with MVC pattern, database connectivity and reporting features. Status: Completed.\n\n03. Mobile Shop Management System\nTechnologies: PHP | MySQL | JavaScript\nA web-based system for mobile inventory, customer transactions and secure administrative logins, with responsive UI and session handling. Status: In Progress.`,
  skills:`Programming & Development: Java, PHP, C#, Python, Laravel, HTML/CSS, JavaScript.\nQuality Assurance: Manual Testing, Test Planning, Bug Tracking, Automation Testing Basics.\nDatabases & Tools: MySQL, Git & GitHub, NetBeans.`,
  education:`Higher National Diploma in Information Technology (HNDIT)\nSLIATE - ATI Kandy\n2024 - Present\nCurrent status: Second Year Student.`,
  certifications:`Completed Certifications:\n• Foundations of Project Management — University of Moratuwa (CODL)\n• Python for Beginners — University of Moratuwa (CODL)\n• CS302: Software Engineering — Saylor Academy\n• Free Automation - Testing for Beginners — Simplilearn SkillUP\n• Front-End Web Development — University of Moratuwa (CODL)`,
  contact:`Email: dayanikamendis2@gmail.com\nGitHub: github.com/dayanikamendis2-commits\nLinkedIn: gothmi-ld-mendis-37214b39b`,
  about:`G.L.D. Mendis is an HNDIT student at SLIATE (ATI Kandy) focusing on Software Quality Assurance and Full-Stack Development, with an interest in building reliable software solutions and practical development projects.`,
  cv:`You can view and download my CV from the “View & Download My CV” button inside the Biography page of the portfolio.`,
  help:`Try commands such as:\n• Projects\n• Skills\n• Education\n• Certifications\n• Contact\n• About\n• CV\n• Help`
};

function assistantAddMessage(textValue,type='bot'){
  const box=document.getElementById('assistantMessages');if(!box)return;
  const msg=document.createElement('div');msg.className=`assistant-msg ${type}`;msg.textContent=textValue;box.appendChild(msg);box.scrollTop=box.scrollHeight;
}
function assistantAnswer(raw){
  const q=raw.trim().toLowerCase();
  if(!q)return 'Please type a command. Try “Projects” or “Skills”.';
  if(q.includes('project'))return assistantKnowledge.projects;
  if(q.includes('skill')||q.includes('technology')||q.includes('tech'))return assistantKnowledge.skills;
  if(q.includes('education')||q.includes('study')||q.includes('hndit'))return assistantKnowledge.education;
  if(q.includes('cert')||q.includes('certificate'))return assistantKnowledge.certifications;
  if(q.includes('contact')||q.includes('email')||q.includes('github')||q.includes('linkedin'))return assistantKnowledge.contact;
  if(q.includes('about')||q.includes('who are')||q.includes('g.l.d'))return assistantKnowledge.about;
  if(q==='cv'||q.includes('resume'))return assistantKnowledge.cv;
  if(q.includes('help')||q.includes('command'))return assistantKnowledge.help;
  return `I can help with portfolio information. Try “Projects”, “Skills”, “Education”, “Certifications”, “Contact”, “About”, or “CV”.`;
}
function setupAssistant(){
  const toggle=document.getElementById('assistantToggle'), panel=document.getElementById('assistantPanel'), close=document.getElementById('assistantClose'), form=document.getElementById('assistantForm'), input=document.getElementById('assistantInput');
  if(!toggle||!panel)return;
  const open=()=>{panel.classList.add('is-open');panel.setAttribute('aria-hidden','false');input?.focus();};
  const shut=()=>{panel.classList.remove('is-open');panel.setAttribute('aria-hidden','true');};
  toggle.addEventListener('click',e=>{e.stopPropagation();panel.classList.contains('is-open')?shut():open();});
  close?.addEventListener('click',shut);
  document.querySelectorAll('.assistant-suggestions button').forEach(btn=>btn.addEventListener('click',()=>{const c=btn.dataset.command;assistantAddMessage(c,'user');setTimeout(()=>assistantAddMessage(assistantAnswer(c),'bot'),100);}));
  form?.addEventListener('submit',e=>{e.preventDefault();const q=input.value.trim();if(!q)return;assistantAddMessage(q,'user');input.value='';setTimeout(()=>assistantAddMessage(assistantAnswer(q),'bot'),120);});
  assistantAddMessage('Hello! I am your portfolio assistant. Type “Projects” to see all project details, or ask about Skills, Certifications, Education, Contact or CV.','bot');
}

function startPortfolio(){
  if(portfolioStarted)return;
  portfolioStarted=true;
  ensureAudio();
  const pre=document.getElementById('portfolioPreloader');
  const app=document.getElementById('portfolioApp');
  if(app)app.classList.add('is-started');
  initPageFlip();
  setupAssistant();
  if(pre){pre.classList.add('fade-out');setTimeout(()=>pre.remove(),600);}
}

document.addEventListener('DOMContentLoaded',()=>{
  const loadingText=document.getElementById('loadingText');
  const startBtn=document.getElementById('startPortfolioBtn');
  const pre=document.getElementById('portfolioPreloader');
  setTimeout(()=>{
    if(loadingText)loadingText.textContent='Archive Ready';
    if(startBtn){startBtn.hidden=false;startBtn.style.display='flex';startBtn.addEventListener('click',startPortfolio,{once:true});}
  },900);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeActiveModal();});
});
