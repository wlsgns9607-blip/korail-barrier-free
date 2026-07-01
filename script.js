document.addEventListener('DOMContentLoaded', function(){

  /* ---------- scroll-triggered count-up for metric bars ---------- */
  const bars = document.querySelectorAll('.metric-fill');
  const labelMap = { 0:'62%', 1:'47초', 2:'회당 5.8건' };
  const barObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const el = entry.target;
        const target = parseFloat(el.dataset.target);
        el.style.width = target + '%';
        barObserver.unobserve(el);
      }
    });
  }, {threshold:0.4});
  bars.forEach(b=>barObserver.observe(b));
  // set initial label text (before value) once, after slight delay so it's visible pre-fill
  document.querySelectorAll('.metric-fill').forEach((el,i)=>{
    const labels = ['62%','47초','5.8건'];
    setTimeout(()=>{ el.textContent = labels[i]; }, 50);
  });

  /* ---------- count-up numbers in impact board ---------- */
  const counts = document.querySelectorAll('.count');
  const countObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const el = entry.target;
        const target = parseInt(el.dataset.target,10);
        let current = 0;
        const step = Math.max(1, Math.round(target/30));
        const timer = setInterval(()=>{
          current += step;
          if(current >= target){ current = target; clearInterval(timer); }
          el.textContent = current;
        }, 30);
        countObserver.unobserve(el);
      }
    });
  }, {threshold:0.4});
  counts.forEach(c=>countObserver.observe(c));

  /* ---------- demo tabs ---------- */
  const tabs = document.querySelectorAll('.demo-tab');
  const panels = document.querySelectorAll('.demo-panel');
  tabs.forEach(tab=>{
    tab.addEventListener('click', ()=>{
      tabs.forEach(t=>t.classList.remove('active'));
      panels.forEach(p=>p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('panel-'+tab.dataset.tab).classList.add('active');
    });
  });

  /* ---------- DEMO A: silver mode ---------- */
  const silverSwitch = document.getElementById('silverSwitch');
  const toggleSilverBtn = document.getElementById('toggleSilverBtn');
  const modeBadge = document.getElementById('modeBadge');
  const appBtns = [document.getElementById('btn1'), document.getElementById('btn2'), document.getElementById('btn3')];
  let silverOn = false;

  function setSilverMode(on){
    silverOn = on;
    silverSwitch.classList.toggle('on', on);
    modeBadge.classList.toggle('on', on);
    modeBadge.textContent = on ? '실버 모드 ON' : '일반 모드';
    toggleSilverBtn.textContent = on ? '실버 모드 끄기' : '실버 모드 켜기';
    appBtns.forEach(btn=>{
      btn.classList.toggle('big', on);
    });
    if(appBtns[2]){
      // hide the third (less critical) button in silver mode to emphasize the two primary actions, matching real UX priority
      appBtns[2].style.display = on ? 'none' : 'block';
    }
  }
  silverSwitch.addEventListener('click', ()=> setSilverMode(!silverOn));
  toggleSilverBtn.addEventListener('click', ()=> setSilverMode(!silverOn));

  /* ---------- DEMO B: seat map ---------- */
  const carGrid = document.getElementById('carGrid');
  const ROWS = 8;
  const COLS = ['A','B','C','D'];
  const COL_POSITION = { A:1, B:2, C:4, D:5 }; // column 3 is reserved for the aisle

  function buildSeats(highlightRow, highlightCol){
    carGrid.innerHTML = '';

    const aisle = document.createElement('div');
    aisle.className = 'aisle-col';
    aisle.innerHTML = '<span>통로 · AISLE</span>';
    carGrid.appendChild(aisle);

    for(let row=1; row<=ROWS; row++){
      COLS.forEach(col=>{
        const seat = document.createElement('div');
        seat.className = 'seat';
        seat.style.gridColumn = COL_POSITION[col];
        seat.style.gridRow = row;
        seat.textContent = row + col;
        if(row === highlightRow && col === highlightCol){
          seat.classList.add('mine');
        }
        carGrid.appendChild(seat);
      });
    }
  }
  buildSeats(-1, null);

  const findSeatBtn = document.getElementById('findSeatBtn');
  const replayVoiceBtn = document.getElementById('replayVoiceBtn');
  const voiceSupportNote = document.getElementById('voiceSupportNote');
  const voiceBubble = document.getElementById('voiceBubble');

  const MY_SEAT_ROW = 5;
  const MY_SEAT_COL = 'C';
  const myPhrase = `${MY_SEAT_ROW}${MY_SEAT_COL}번 좌석입니다. 통로 기준 오른쪽으로 3미터만 가시면 창가 쪽입니다.`;
  const speechSupported = 'speechSynthesis' in window;

  if(!speechSupported && voiceSupportNote){
    voiceSupportNote.textContent = '* 이 브라우저는 음성 안내를 지원하지 않습니다. 텍스트 안내로 대체됩니다.';
  }

  function playSeatVoice(){
    if(!speechSupported) return;
    try{
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(myPhrase);
      utter.lang = 'ko-KR';
      utter.rate = 0.95;
      window.speechSynthesis.speak(utter);
    }catch(e){ /* speech synthesis unavailable, silently ignore */ }
  }

  function typeSeatVoice(){
    voiceBubble.innerHTML = '';
    let i = 0;
    const typing = setInterval(()=>{
      voiceBubble.textContent = myPhrase.slice(0, i+1);
      i++;
      if(i >= myPhrase.length) clearInterval(typing);
    }, 32);
  }

  findSeatBtn.addEventListener('click', ()=>{
    buildSeats(MY_SEAT_ROW, MY_SEAT_COL);
    typeSeatVoice();
    playSeatVoice();
    replayVoiceBtn.style.display = 'inline-flex';
  });

  replayVoiceBtn.addEventListener('click', ()=>{
    typeSeatVoice();
    playSeatVoice();
  });

  /* ---------- DEMO C: AI tablet chat ---------- */
  const chatLog = document.getElementById('chatLog');
  const qButtons = document.querySelectorAll('.q-btn');
  const resetChatBtn = document.getElementById('resetChatBtn');

  const responses = {
    toilet: {
      user: '화장실 어디예요?',
      ai: '바로 뒤 칸, <b>4호차와 5호차 사이 통로</b> 왼쪽에 있습니다. 지금 계신 자리에서 약 6미터입니다.'
    },
    wrong: {
      user: '표 잘못 샀는데 어떡해요?',
      ai: '괜찮습니다. 화면 하단 <b>"좌석 변경"</b> 버튼을 눌러주시면 빈 좌석으로 바로 옮겨드릴게요. 추가 요금은 발생하지 않습니다.'
    },
    refund: {
      user: '환불 절차가 복잡해서요',
      escalate: true
    }
  };

  function addMsg(role, html){
    const div = document.createElement('div');
    div.className = 'chat-msg ' + role;
    div.innerHTML = html;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
    return div;
  }
  function addTyping(){
    const div = document.createElement('div');
    div.className = 'typing-dots';
    div.innerHTML = '<span></span><span></span><span></span>';
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
    return div;
  }

  qButtons.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const key = btn.dataset.q;
      const r = responses[key];
      addMsg('user', r.user);
      const typingEl = addTyping();

      setTimeout(()=>{
        typingEl.remove();
        if(r.escalate){
          addMsg('escalate', '이 문의는 AI가 처리하기 어려운 사안입니다. <b>승무원 화상 연결 중...</b>');
          setTimeout(()=>{
            addMsg('ai', '<b>AI 승무원</b><br>3호차 담당 승무원과 화상 연결이 완료되었습니다. 잠시만 기다려주세요.');
          }, 1300);
        } else {
          addMsg('ai', '<b>AI 승무원</b><br>' + r.ai);
        }
      }, 1100);
    });
  });

  resetChatBtn.addEventListener('click', ()=>{
    chatLog.innerHTML = '<div class="chat-msg ai"><b>AI 승무원</b><br>무엇을 도와드릴까요? 옆에 있는 질문을 눌러보세요.</div>';
  });

});
