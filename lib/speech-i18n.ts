import type {Locale} from './i18n';
const keys=['say','placeholder','send','remove','hide','show','hint','waiting','error','slow','dismiss'] as const;
const rows:Record<Locale,string>={
 en:'Speak|Say something quietly…|Send|Remove my message|Hide speech bubbles|Show speech bubbles|Same hall · 120 characters · 12 seconds|Connecting…|Could not send. Try again.|Please wait 3 seconds between messages.|Dismiss this message',
 ko:'대화하기|짧은 인사를 건네세요…|보내기|내 말 지우기|말풍선 숨기기|말풍선 보이기|같은 법당 · 120자 · 12초 동안 표시|연결 중…|보내지 못했어요. 다시 시도해 주세요.|다음 말은 3초 후에 보내 주세요.|이 말풍선 닫기',
 ja:'話す|ひとこと伝えましょう…|送信|自分の言葉を消す|吹き出しを隠す|吹き出しを表示|同じ本堂 · 120文字 · 12秒間|接続中…|送信できませんでした。再試行してください。|3秒待ってから送信してください。|この吹き出しを閉じる',
 'zh-CN':'说话|轻声打个招呼…|发送|删除我的消息|隐藏气泡|显示气泡|同一大殿 · 120字 · 显示12秒|正在连接…|发送失败，请重试。|请间隔3秒再发送。|关闭此气泡',
 'zh-TW':'說話|輕聲打個招呼…|傳送|刪除我的訊息|隱藏對話泡泡|顯示對話泡泡|同一大殿 · 120字 · 顯示12秒|正在連線…|傳送失敗，請重試。|請間隔3秒再傳送。|關閉此泡泡',
 th:'พูดคุย|ทักทายเบา ๆ…|ส่ง|ลบข้อความของฉัน|ซ่อนข้อความ|แสดงข้อความ|ศาลาเดียวกัน · 120 ตัวอักษร · 12 วินาที|กำลังเชื่อมต่อ…|ส่งไม่ได้ โปรดลองอีกครั้ง|กรุณาเว้น 3 วินาทีก่อนส่งอีกครั้ง|ปิดข้อความนี้',
 vi:'Trò chuyện|Gửi một lời chào nhẹ nhàng…|Gửi|Xóa lời của tôi|Ẩn lời thoại|Hiện lời thoại|Cùng điện · 120 ký tự · 12 giây|Đang kết nối…|Không gửi được. Vui lòng thử lại.|Vui lòng đợi 3 giây giữa các tin nhắn.|Ẩn lời thoại này',
 my:'စကားပြောရန်|နှုတ်ဆက်စကား ပြောပါ…|ပို့ရန်|မိမိစာကို ဖျက်ရန်|စကားများ ဖျောက်ရန်|စကားများ ပြရန်|ခန်းမတစ်ခုတည်း · စာလုံး ၁၂၀ · ၁၂ စက္ကန့်|ချိတ်ဆက်နေသည်…|မပို့နိုင်ပါ။ ထပ်ကြိုးစားပါ။|နောက်စာမပို့မီ ၃ စက္ကန့် စောင့်ပါ။|ဤစာကို ပိတ်ရန်',
 km:'និយាយ|ផ្ញើពាក្យស្វាគមន៍…|ផ្ញើ|លុបសាររបស់ខ្ញុំ|លាក់សារ|បង្ហាញសារ|សាលាតែមួយ · ១២០ តួអក្សរ · ១២ វិនាទី|កំពុងភ្ជាប់…|មិនអាចផ្ញើបាន។ សូមព្យាយាមម្តងទៀត។|សូមរង់ចាំ ៣ វិនាទីមុនផ្ញើម្តងទៀត។|បិទសារនេះ',
 si:'කතා කරන්න|කෙටි සුබපැතුමක් කියන්න…|යවන්න|මගේ පණිවිඩය මකන්න|පණිවිඩ සඟවන්න|පණිවිඩ පෙන්වන්න|එකම ශාලාව · අක්ෂර 120 · තත්පර 12|සම්බන්ධ වෙමින්…|යැවිය නොහැක. නැවත උත්සාහ කරන්න.|පණිවිඩ අතර තත්පර 3ක් රැඳී සිටින්න.|මෙම පණිවිඩය වසන්න',
 lo:'ສົນທະນາ|ທັກທາຍສັ້ນໆ…|ສົ່ງ|ລຶບຂໍ້ຄວາມຂອງຂ້ອຍ|ເຊື່ອງຂໍ້ຄວາມ|ສະແດງຂໍ້ຄວາມ|ສາລາດຽວກັນ · 120 ຕົວອັກສອນ · 12 ວິນາທີ|ກຳລັງເຊື່ອມຕໍ່…|ສົ່ງບໍ່ໄດ້ ກະລຸນາລອງໃໝ່|ກະລຸນາລໍຖ້າ 3 ວິນາທີກ່ອນສົ່ງອີກ|ປິດຂໍ້ຄວາມນີ້',
 mn:'Ярих|Богино мэндчилгээ бичээрэй…|Илгээх|Миний үгийг арилгах|Яриаг нуух|Яриаг харуулах|Нэг дуган · 120 тэмдэгт · 12 секунд|Холбогдож байна…|Илгээж чадсангүй. Дахин оролдоно уу.|Дараагийн зурвасыг 3 секундын дараа илгээнэ үү.|Энэ зурвасыг хаах',
 bo:'གཏམ་བཤད།|འཚམས་འདྲི་ཐུང་ངུ་ཞིག་བྲིས།|གཏོང་།|རང་གི་སྐད་ཆ་སུབ།|སྐད་ཆ་སྦེད།|སྐད་ཆ་སྟོན།|འདུ་ཁང་གཅིག · ཡིག་འབྲུ་༡༢༠ · སྐར་ཆ་༡༢|སྦྲེལ་བཞིན་པ།|གཏོང་མ་ཐུབ། ཡང་བསྐྱར་བྱེད།|སྐར་ཆ་༣ སྒུག་རོགས།|སྐད་ཆ་འདི་སྦེད།',
 ne:'कुरा गर्नुहोस्|छोटो अभिवादन लेख्नुहोस्…|पठाउनुहोस्|मेरो सन्देश मेटाउनुहोस्|सन्देश लुकाउनुहोस्|सन्देश देखाउनुहोस्|एउटै हल · १२० अक्षर · १२ सेकेन्ड|जोडिँदै…|पठाउन सकिएन। फेरि प्रयास गर्नुहोस्।|अर्को सन्देश पठाउन ३ सेकेन्ड पर्खनुहोस्।|यो सन्देश बन्द गर्नुहोस्',
 es:'Hablar|Di algo en voz baja…|Enviar|Borrar mi mensaje|Ocultar mensajes|Mostrar mensajes|Misma sala · 120 caracteres · 12 segundos|Conectando…|No se pudo enviar. Inténtalo de nuevo.|Espera 3 segundos entre mensajes.|Ocultar este mensaje',
 fr:'Parler|Un petit mot…|Envoyer|Effacer mon message|Masquer les bulles|Afficher les bulles|Même salle · 120 caractères · 12 secondes|Connexion…|Échec de l’envoi. Réessayez.|Attendez 3 secondes entre les messages.|Fermer cette bulle',
 de:'Sprechen|Sag leise etwas…|Senden|Meine Nachricht löschen|Sprechblasen ausblenden|Sprechblasen anzeigen|Gleicher Saal · 120 Zeichen · 12 Sekunden|Verbinden…|Senden fehlgeschlagen. Bitte erneut versuchen.|Bitte 3 Sekunden zwischen Nachrichten warten.|Diese Nachricht ausblenden',
 pt:'Conversar|Deixe uma breve saudação…|Enviar|Apagar minha mensagem|Ocultar mensagens|Mostrar mensagens|Mesmo salão · 120 caracteres · 12 segundos|Conectando…|Não foi possível enviar. Tente novamente.|Aguarde 3 segundos entre mensagens.|Fechar esta mensagem',
};
export function speechText(locale:Locale){const values=rows[locale].split('|');return Object.fromEntries(keys.map((k,i)=>[k,values[i]])) as Record<typeof keys[number],string>;}
