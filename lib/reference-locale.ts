import {dictionaries,localizedName,type Locale,type Key} from './i18n';
import {templeLabels} from './temple-labels';
const core:Record<string,Key>={
'설정':'settings','설정 닫기':'close','환경음':'ambience','바람과 새소리':'ambience','바람 소리':'ambience','효과음':'chimes','내 종소리와 염주 소리':'chimes','염주':'beads','염주 돌리기':'beads','절하기':'bow','합장':'greet','합장 인사':'greet','멈추기':'stop','멈춤':'stop','멈추는 중':'stop','듣기':'sound','기본 소리':'sound','소리 켜기':'sound','소리 끄기':'sound','내가 듣는 소리':'sound','함께 있는 사람':'visitors','방문객 보기':'visitors','방문객':'visitors','방문객 창 닫기':'close','서버 선택':'rooms','서버 선택 닫기':'close','조작 방법':'help','나':'you','산사 나가기':'leave','다시 머무르기':'return','다시 쉬고 싶을 때 들러주세요.':'exitText','바닥 클릭 · WASD · 방향키로 이동':'moveHelp','바닥 클릭 · 드래그로 둘러보기 · 휠로 확대/축소':'moveHelp','눌러 이동 · 쓸어 둘러보기 · 두 손가락 확대/축소':'moveHelp','드래그로 둘러보기 · 휠로 확대/축소':'moveHelp','바닥을 누르면 그곳까지 걸어요.':'moveHelp','화면을 드래그해 둘러보세요':'moveHelp','법당을 여는 중':'welcome','편안히 쉬어 가셨나요':'welcome','이동 멈추기':'stop','걷는 중':'going','방석으로 가는 중':'going','둘러보며 기다리거나 멈출 수 있어요':'going','합장을 누르면 두 손을 모아 인사해요.':'ritualHelp','동자승을 누르면 이름이 잠깐 보여요.':'ritualHelp','하단의 합장으로 함께 있는 사람들에게 인사해요.':'ritualHelp','절하기를 누르면 계속 절하고, 멈추기를 누르면 일어나요.':'ritualHelp','연결이 지연되고 있어요. 다시 연결하고 있어요.':'offline','청연당에 연결하고 있어요.':'offline','여기서 계속 쉬기':'return','다시 들어가기':'return','다시 입장하기':'return','법당으로 돌아가기':'return','법당 준비 화면으로 돌아가기':'return','연결을 확인하고 다시 들어와주세요':'error','풍경을 불러오지 못했어요':'error','소리와 연결을 모두 마쳤어요.':'exitText',
};
const english:Record<string,string>={
'세 가지 소리를 내 취향대로':'Three sounds, your way','기본 소리가 꺼져 있어요':'Sound is off','선택한 소리가 나에게만 들려요':'Only you hear the sounds you choose','소리를 켜고 편안히 머물러요':'Turn on sound and settle in','소리 버튼을 다시 눌러주세요':'Tap the sound button again','소리 버튼을 다시 눌러주세요.':'Tap the sound button again','다른 탭에서는 잠시 쉬고 있어요':'Paused while another tab is active','다른 탭에서도 선택한 소리가 이어져요.':'Keep your selected sounds playing in other tabs.','다른 탭으로 가면 모든 소리가 함께 멈춰요.':'All sounds pause when you switch tabs.','백그라운드 재생':'Background playback','백그라운드에서 잠시 멈췄어요.':'Paused in the background.','개인 염불 듣기':'Listen privately','개인 염불 멈추기':'Stop private chanting','나에게만 들리는 개인 듣기':'Listen privately, just for you','나에게만 들리는 염불이에요.':'Only you can hear this chanting.','듣고 싶을 때 나에게만 들려요.':'Listen privately whenever you like.','소리를 켜면 이어서 들을 수 있어요.':'Turn on sound to keep listening.','염불 크기':'Chant volume','염불 크기가 0이에요.':'Chant volume is set to zero.','염불을 불러오는 중':'Loading chanting…','염불을 불러오지 못했어요. 다시 눌러주세요.':'Unable to load chanting. Please try again.','잠시 쉬고 다시 들려드려요.':'A short pause, then the chanting resumes.','공동 예불':'Shared chanting','공동 예불 듣기':'Join the chanting','공동 예불 소리 끄기':'Mute shared chanting','공동 예불 시간 · 소리를 켜면 함께 들어요.':'Shared chanting · turn on sound to join.','예불 소리 끄기':'Mute chanting','예불이 시작되면 개인 듣기는 끝나고 함께 들어요.':'When shared chanting begins, private playback ends and everyone listens together.','매일 05:00 · 18:00, 한국 시간':'Every day at 05:00 and 18:00, Korea time','새벽 예불':'Morning chanting','저녁 예불':'Evening chanting','함께 듣기':'Listen together','함께 듣는 중':'Listening together','음원 정보':'Audio credits','가공 내역':'Processing notes','이용조건':'License','사찰 염불 · 검토용':'Temple chanting · field recording','사찰 현장 녹음 · 반야심경 완독 음원 미선정':'Temple field recording · not verified as a complete Heart Sutra recitation','염불소리1 · 김용배 · 공유마당 · CC BY 4.0':'Chanting Sound 1 · Kim Yong-bae · Gongu Madang · CC BY 4.0','불상 자료 ·':'Buddha scan ·','국립중앙박물관, 금동불좌상·금동보살입상(덕수2116)':'National Museum of Korea · Gilt-bronze Buddha and Bodhisattva, Deoksu 2116','공공누리 제1유형. 원본 3D 스캔 중 좌불만 분리하고 웹용 크기·텍스처·압축을 조정했습니다.':'KOGL Type 1. The seated Buddha was extracted from the original scan and optimized for the web.','어느 서버에서도 같은 법당을 이용할 수 있어요.':'Every hall has the same temple.','표시된 인원은 실제 방문객 수예요.':'Counts show actual visitors.','접속 인원을 확인하고 있어요':'Checking visitor counts…','확인 중':'Checking…','입장할 서버를 찾고 있어요':'Finding an available hall…','연결을 준비하고 있어요. 잠시 후 다시 확인해주세요.':'Preparing your connection. Please check again shortly.','인원을 확인하지 못했어요. 잠시 후 다시 눌러주세요.':'Unable to check visitor counts. Please try again.','다른 청연당으로 연결하고 있어요':'Connecting to another hall…','이동하지 못했어요. 인원을 새로 확인한 뒤 다른 서버를 골라주세요.':'Unable to change halls. Refresh the counts and choose another hall.','빈 방석을 찾지 못했어요. 둘러보다 다시 눌러주세요.':'No cushion is available. Please explore and try again.','연결되면 방석을 찾을 수 있어요.':'A cushion can be reserved once connected.','가까운 빈 바닥을 눌러주세요':'Choose a clear spot nearby.','절을 마치고 합장해요':'Finishing the bow before greeting.','절을 마치고 합장 인사':'Finish bowing, then greet','합장 인사 중':'Greeting','합장 중':'Greeting','인사 대기':'Waiting to greet','합장으로 인사했어요':'You greeted everyone.','염주 먼저 굴리기':'Use the beads while you wait','염주를 열지 못했어요. 법당을 준비하고 있어요.':'The temple is still loading. Please try the beads again.','염주를 열지 못했어요. 새로고침한 뒤 다시 열어주세요.':'Unable to open the beads. Refresh and try again.','입장 대기 중 · 염주는 바로 쓸 수 있어요':'Waiting to enter · prayer beads are available now','법당 준비가 늦어지고 있어요':'The temple is taking a little longer to load.','이동을 멈췄어요':'Stopped walking','넘긴 염주':'Beads counted','첫 번째 바퀴':'Round 1','앞뒤로 이어지는 큰 나무 염주. 위아래로 쓸거나 화살표 키와 휠로 돌려 보세요.':'A strand of wooden prayer beads. Swipe vertically or use arrow keys and the scroll wheel.','염주는 알을 잡고 위아래로 넘겨요.':'Drag the beads up or down to count.','달빛 마당에서는 절하기 대신 춤을 춰요.':'In the moonlight courtyard, you can dance instead of bowing.','달빛 마당':'Moonlight courtyard','달빛 마당 음악':'Moonlight courtyard music','달빛 마당 입장':'Enter the moonlight courtyard','음악 켜기':'Play music','음악 끄기':'Mute music','음악 제공':'Music by','DJ 스님':'DJ monk','금강경':'Diamond Sutra','손을 펴는 자리':'An Open Hand','법화경 관세음보살보문품':'Lotus Sutra · Universal Gate Chapter','〈목소리가 닿는 곳〉':'Where Voices Reach','천수경':'Thousand Hands Sutra','천 개의 손끝':'A Thousand Fingertips','오늘은 잠시, 속세':'A little time away from the everyday','잠깐 쉬고 있어요':'Taking a quiet moment','정원으로 나가기':'Go to the garden','산책 정원':'Walking garden','산책길':'Garden path','청연당 들어가기':'Enter the main hall','켜짐':'On','꺼짐':'Off','소리가 멈춰 있어요.':'Audio is paused.','소리가 종료됐어요.':'Playback has ended.','소리가 중단됐어요. 소리 버튼을 다시 눌러주세요.':'Audio was interrupted. Tap sound to resume.','소리를 시작하지 못했어요.':'Unable to start audio.','소리를 시작하지 못했어요. 소리 버튼을 다시 눌러주세요.':'Unable to start audio. Please tap the sound button again.','한 손가락으로 쓸어 둘러보고, 두 손가락을 벌리거나 모아 확대/축소해요.':'Drag with one finger to look around. Pinch with two fingers to zoom.','1 · E · Space 절하기/멈추기 · 2 염주 · 3 합장':'1 · E · Space: bow / stop · 2: beads · 3: greet',
};
export function translateReference(input:string,locale:Locale){
 const match=input.match(/^(\s*)([\s\S]*?)(\s*)$/);if(!match)return input;const[,before,text,after]=match,t=dictionaries[locale],label=templeLabels(locale);let out=text;
 if(text==='산사'||text==='산사 · 山寺'||text==='산사 — 온라인 절')out='metatemple';
 else if(locale==='ko')return input.replaceAll('청연당','연화당');
 else if(text==='법당을 여는 중')out=label.loading;
 else if(text==='듣기')out=label.chant;
 else if(text==='합장 인사 · 3')out=t.greet+' · 3';
 else if(text.endsWith(' 크기'))out=translateReference(text.slice(0,-3),locale)+' · '+t.sound;
 else if(text==='법당으로 돌아가기'||text==='법당 준비 화면으로 돌아가기')out=label.back;
 else if(core[text])out=t[core[text]];
 else if(['염불 듣기','개인 염불 듣기','공동 예불 듣기'].includes(text))out=label.chant;
 else if(['염불 멈추기','개인 염불 멈추기'].includes(text))out=t.stop;
 else if(text==='염불')out=label.chantName;
 else if(text==='청연당'||text==='청연당 서버')out=label.hall;
 else if(text==='공양미 보태기'||text==='공양미 창 닫기')out=label.about;
 else if(text==='보시해 주신 마음, 감사히 받겠습니다. 🙇🏻‍♂️')out='metatemple.net';
 else if(text==='인원 새로고침')out=label.refresh;
 else if(text==='돌아가기'||text==='법당으로 돌아가기'||text==='법당 준비 화면으로 돌아가기')out=label.back;
 else if(text==='잡고 쓸어 넘기기')out=label.beadsHelp;
 else if(/^(현재 · )?청연당 서버 \d+/.test(text))out=text.replace(/^(현재 · )?청연당 서버 /,`${label.hall} `).replace('. 서버 선택',` · ${t.rooms}`).replace(/(\d+) \/ (\d+)명/g,'$1 / $2').replace(' · 이용 중',` · ${t.you}`).replace(' · 만석',' · Full');
 else if(text==='청연당 서버 선택'||text==='청연당 서버 목록')out=t.rooms;
 else if(text.startsWith('이 서버가 가득 찼어요.'))out=label.full;
 else if(/^\d+ \/ \d+명/.test(text))out=text.replace('명','').replace(' · 이용 중',` · ${t.you}`).replace(' · 만석',' · Full');
 else if(/^\d+명/.test(text))out=text.replace(/명.*$/,` · ${t.visitors}`);
 else if(text==='연결 중. 방문객 보기')out=t.offline;
 else if(text.startsWith('다음 '))out=`${t.next} ${text.match(/\d{2}:\d{2}/)?.[0]||''} KST`;
 else if(text.includes('님이 합장으로 인사했어요'))out=text.replace('님이 합장으로 인사했어요',` · ${t.greet}`);
 else if(['고요한 산새','느긋한 솔잎','따스한 물결','은은한 바람'].includes(text))out=localizedName('resident:'+text,locale);
 else if(text==='첫 번째 바퀴')out=`${label.round} 1`;
 else if(text.startsWith('이번 바퀴'))out=`${label.round} ${text.replace(/[^0-9 /]/g,'').trim()}`;
 else if(text.endsWith('번째 바퀴'))out=`${label.round} ${text.replace(/[^0-9]/g,'')}`;
 else if(text.includes('알, 모두'))out=text.replace('알, 모두',' / ');
 else if(text==='알')out='';
 else if(english[text])out=english[text];
 else if(text==='산사에서 할 일')out=t.ritualHelp;
 else if(text==='산사 도구')out=t.settings;
 else if(text.startsWith('청연당과 연등'))out=`${t.temple} · ${t.guide}`;
 return before+out+after;
}
