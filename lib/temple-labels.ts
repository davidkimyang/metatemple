import type {Locale} from './i18n';
const raw:Record<Locale,string>={
en:'Listen to chanting|Chanting|About metatemple|Temple Hall|This hall is full. Please choose another.|Refresh visitors|Automatically choose a hall|Credits & sources|Return to the temple|Drag the beads up or down|Round|Loading the temple',
ko:'염불 듣기|염불|metatemple 소개|법당|이 법당은 가득 찼어요. 다른 법당을 선택해 주세요.|인원 새로고침|자동으로 법당 선택|출처와 음원 정보|법당으로 돌아가기|염주를 위아래로 쓸어 넘기세요|바퀴|법당을 여는 중',
ja:'お経を聴く|読経|metatempleについて|本堂|満員です。別の本堂を選んでください。|人数を更新|本堂を自動選択|出典と音源情報|本堂へ戻る|数珠を上下にスワイプ|周目|本堂を開いています',
'zh-CN':'听诵经|诵经|关于metatemple|佛堂|此佛堂已满，请选择其他佛堂。|刷新人数|自动选择佛堂|来源与音频信息|返回佛堂|上下滑动念珠|轮|正在打开佛堂',
'zh-TW':'聽誦經|誦經|關於metatemple|佛堂|此佛堂已滿，請選擇其他佛堂。|重新整理人數|自動選擇佛堂|來源與音訊資訊|返回佛堂|上下滑動念珠|輪|正在開啟佛堂',
th:'ฟังบทสวด|บทสวด|เกี่ยวกับ metatemple|ศาลา|ศาลานี้เต็มแล้ว กรุณาเลือกศาลาอื่น|อัปเดตจำนวนคน|เลือกศาลาอัตโนมัติ|ที่มาและข้อมูลเสียง|กลับสู่ศาลา|ปัดลูกประคำขึ้นหรือลง|รอบ|กำลังเปิดศาลา',
vi:'Nghe tụng kinh|Tụng kinh|Về metatemple|Phật đường|Phật đường đã đầy. Hãy chọn nơi khác.|Cập nhật số người|Tự động chọn phật đường|Nguồn và âm thanh|Trở về phật đường|Vuốt tràng hạt lên hoặc xuống|Vòng|Đang mở phật đường',
my:'ရွတ်ဖတ်သံ နားထောင်ရန်|ရွတ်ဖတ်သံ|metatemple အကြောင်း|ဘုရားဆောင်|လူပြည့်နေပါသည်။ အခြားဆောင် ရွေးပါ။|လူဦးရေ ပြန်ကြည့်ရန်|ဆောင် အလိုအလျောက်ရွေးရန်|ရင်းမြစ်နှင့် အသံအချက်အလက်|ဘုရားဆောင်သို့ ပြန်ရန်|ပုတီးကို အပေါ်အောက် ပွတ်ဆွဲပါ|အပတ်|ဘုရားဆောင် ဖွင့်နေသည်',
km:'ស្តាប់សូត្រមន្ត|សូត្រមន្ត|អំពី metatemple|ព្រះវិហារ|ព្រះវិហារនេះពេញហើយ សូមជ្រើសរើសកន្លែងផ្សេង។|ធ្វើបច្ចុប្បន្នភាពចំនួនមនុស្ស|ជ្រើសរើសដោយស្វ័យប្រវត្តិ|ប្រភព និងព័ត៌មានសំឡេង|ត្រឡប់ទៅព្រះវិហារ|អូសអង្កាំឡើងឬចុះ|ជុំ|កំពុងបើកព្រះវិហារ',
si:'සජ්ඣායනා අසන්න|සජ්ඣායනා|metatemple ගැන|විහාර ශාලාව|මෙම ශාලාව පිරී ඇත. වෙනත් ශාලාවක් තෝරන්න.|ගණන යාවත්කාලීන කරන්න|ශාලාව ස්වයංක්‍රීයව තෝරන්න|මූලාශ්‍ර සහ ශ්‍රව්‍ය තොරතුරු|විහාරයට ආපසු|ජපමාලය ඉහළට හෝ පහළට අදින්න|වටය|විහාරය විවෘත කරමින්',
lo:'ຟັງບົດສວດ|ບົດສວດ|ກ່ຽວກັບ metatemple|ສາລາ|ສາລານີ້ເຕັມແລ້ວ ກະລຸນາເລືອກບ່ອນອື່ນ|ອັບເດດຈຳນວນຄົນ|ເລືອກສາລາອັດຕະໂນມັດ|ແຫຼ່ງທີ່ມາ ແລະຂໍ້ມູນສຽງ|ກັບສູ່ສາລາ|ປັດລູກປະຄຳຂຶ້ນຫຼືລົງ|ຮອບ|ກຳລັງເປີດສາລາ',
mn:'Ном уншихыг сонсох|Уншлага|metatemple-ийн тухай|Дуган|Энэ дуган дүүрсэн. Өөр дуган сонгоно уу.|Хүний тоог шинэчлэх|Дуган автоматаар сонгох|Эх сурвалж ба дуу|Дуган руу буцах|Эрхийг дээш доош гулсуулна уу|Тойрог|Дуган нээж байна',
bo:'འདོན་པའི་སྒྲ་ཉན།|འདོན་པ།|metatemple སྐོར།|འདུ་ཁང་།|འདུ་ཁང་འདི་ཁེངས་འདུག གཞན་ཞིག་འདེམས་རོགས།|མི་གྲངས་གསར་སྒྱུར།|འདུ་ཁང་རང་འགུལ་འདེམས།|ཁུངས་དང་སྒྲའི་ཆ་འཕྲིན།|འདུ་ཁང་དུ་ལོག|ཕྲེང་བ་ཡར་མར་འདྲུད།|སྐོར།|འདུ་ཁང་ཁ་ཕྱེ་བཞིན།',
ne:'पाठ सुन्नुहोस्|पाठ|metatemple बारे|प्रार्थना हल|यो हल भरिएको छ। अर्को हल छान्नुहोस्।|संख्या ताजा गर्नुहोस्|हल स्वतः छान्नुहोस्|स्रोत र ध्वनि विवरण|हलमा फर्कनुहोस्|माला माथि वा तल सार्नुहोस्|फन्को|हल खोलिँदैछ',
es:'Escuchar cánticos|Cánticos|Acerca de metatemple|Sala|Esta sala está llena. Elige otra.|Actualizar visitantes|Elegir sala automáticamente|Créditos y fuentes|Volver al templo|Desliza las cuentas arriba o abajo|Vuelta|Abriendo el templo',
fr:'Écouter les chants|Chants|À propos de metatemple|Salle|Cette salle est pleine. Choisissez-en une autre.|Actualiser les visiteurs|Choisir une salle automatiquement|Crédits et sources|Retour au temple|Glissez les perles vers le haut ou le bas|Tour|Ouverture du temple',
de:'Rezitation hören|Rezitation|Über metatemple|Tempelhalle|Diese Halle ist voll. Bitte wähle eine andere.|Besucher aktualisieren|Halle automatisch wählen|Quellen und Hinweise|Zurück zum Tempel|Perlen nach oben oder unten ziehen|Runde|Tempel wird geöffnet',
pt:'Ouvir cânticos|Cânticos|Sobre metatemple|Salão|Este salão está cheio. Escolha outro.|Atualizar visitantes|Escolher salão automaticamente|Créditos e fontes|Voltar ao templo|Deslize as contas para cima ou para baixo|Volta|Abrindo o templo',
};
export function templeLabels(locale:Locale){const v=raw[locale].split('|');return {chant:v[0],chantName:v[1],about:v[2],hall:v[3],full:v[4],refresh:v[5],auto:v[6],credits:v[7],back:v[8],beadsHelp:v[9],round:v[10],loading:v[11]};}
