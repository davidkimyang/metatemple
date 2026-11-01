import type {Locale} from './i18n';
const keys=['edit','nickname','save','reset','hint','error','invalid','waiting'] as const;
const rows:Record<Locale,string>={
 en:'Change name|Your name|Save|Use automatic name|Up to 20 characters. Visible to others; remembered in this browser.|Could not save. Please try again.|Please use 20 characters or fewer.|Connecting…',
 ko:'이름 변경|내 이름|저장|자동 이름 사용|최대 20자. 다른 사람에게도 보이며 이 브라우저에 기억해요.|저장하지 못했어요. 다시 시도해 주세요.|20자 이내로 입력해 주세요.|연결 중…',
 ja:'名前を変更|あなたの名前|保存|自動の名前を使う|20文字まで。他の人にも表示され、このブラウザに保存されます。|保存できませんでした。再試行してください。|20文字以内で入力してください。|接続中…',
 'zh-CN':'修改名字|你的名字|保存|使用自动名字|最多20字。其他人也可见，并在此浏览器中记住。|保存失败，请重试。|请输入20字以内的名字。|正在连接…',
 'zh-TW':'修改名字|你的名字|儲存|使用自動名字|最多20字。其他人也可見，並在此瀏覽器中記住。|儲存失敗，請重試。|請輸入20字以內的名字。|正在連線…',
 th:'เปลี่ยนชื่อ|ชื่อของคุณ|บันทึก|ใช้ชื่ออัตโนมัติ|ไม่เกิน 20 ตัวอักษร ผู้อื่นมองเห็นได้และจำไว้ในเบราว์เซอร์นี้|บันทึกไม่ได้ โปรดลองอีกครั้ง|กรุณาใช้ชื่อไม่เกิน 20 ตัวอักษร|กำลังเชื่อมต่อ…',
 vi:'Đổi tên|Tên của bạn|Lưu|Dùng tên tự động|Tối đa 20 ký tự. Người khác nhìn thấy; ghi nhớ trong trình duyệt này.|Không lưu được. Vui lòng thử lại.|Vui lòng dùng tối đa 20 ký tự.|Đang kết nối…',
 my:'အမည်ပြောင်းရန်|သင့်အမည်|သိမ်းရန်|အလိုအလျောက်အမည် သုံးရန်|စာလုံး ၂၀ အထိ။ အခြားသူများ မြင်နိုင်ပြီး ဤဘရောက်ဇာတွင် မှတ်ထားမည်။|မသိမ်းနိုင်ပါ။ ထပ်ကြိုးစားပါ။|စာလုံး ၂၀ ထက် မပိုစေရပါ။|ချိတ်ဆက်နေသည်…',
 km:'ប្តូរឈ្មោះ|ឈ្មោះរបស់អ្នក|រក្សាទុក|ប្រើឈ្មោះស្វ័យប្រវត្តិ|រហូតដល់ ២០ តួអក្សរ។ អ្នកដទៃឃើញ និងចងចាំក្នុងកម្មវិធីរុករកនេះ។|មិនអាចរក្សាទុកបាន។ សូមព្យាយាមម្តងទៀត។|សូមប្រើមិនលើស ២០ តួអក្សរ។|កំពុងភ្ជាប់…',
 si:'නම වෙනස් කරන්න|ඔබේ නම|සුරකින්න|ස්වයංක්‍රීය නම භාවිත කරන්න|අක්ෂර 20ක් දක්වා. අන් අයට පෙනෙන අතර මෙම බ්‍රවුසරයේ මතක තබා ගනී.|සුරැකිය නොහැක. නැවත උත්සාහ කරන්න.|අක්ෂර 20ක් හෝ ඊට අඩුවෙන් භාවිත කරන්න.|සම්බන්ධ වෙමින්…',
 lo:'ປ່ຽນຊື່|ຊື່ຂອງທ່ານ|ບັນທຶກ|ໃຊ້ຊື່ອັດຕະໂນມັດ|ບໍ່ເກີນ 20 ຕົວອັກສອນ. ຄົນອື່ນເຫັນໄດ້ ແລະຈື່ໃນບຣາວເຊີນີ້.|ບັນທຶກບໍ່ໄດ້ ກະລຸນາລອງໃໝ່|ກະລຸນາໃຊ້ບໍ່ເກີນ 20 ຕົວອັກສອນ|ກຳລັງເຊື່ອມຕໍ່…',
 mn:'Нэр солих|Таны нэр|Хадгалах|Автомат нэр ашиглах|20 хүртэл тэмдэгт. Бусдад харагдаж, энэ хөтөчид хадгалагдана.|Хадгалж чадсангүй. Дахин оролдоно уу.|20-оос ихгүй тэмдэгт ашиглана уу.|Холбогдож байна…',
 bo:'མིང་བསྒྱུར།|ཁྱེད་ཀྱི་མིང་།|ཉར་ཚགས།|རང་འགུལ་མིང་སྤྱོད།|ཡིག་འབྲུ་༢༠ བར། གཞན་གྱིས་མཐོང་ཐུབ་ཅིང་བཤར་ཆས་འདིར་ཉར་བ།|ཉར་མ་ཐུབ། ཡང་བསྐྱར་བྱེད།|ཡིག་འབྲུ་༢༠ ལས་མ་མང་བ།|སྦྲེལ་བཞིན་པ།',
 ne:'नाम परिवर्तन|तपाईंको नाम|सुरक्षित गर्नुहोस्|स्वचालित नाम प्रयोग गर्नुहोस्|२० अक्षरसम्म। अरूलाई देखिन्छ र यस ब्राउजरमा सम्झिन्छ।|सुरक्षित गर्न सकिएन। फेरि प्रयास गर्नुहोस्।|२० वा कम अक्षर प्रयोग गर्नुहोस्।|जोडिँदै…',
 es:'Cambiar nombre|Tu nombre|Guardar|Usar nombre automático|Hasta 20 caracteres. Visible para los demás; se recuerda en este navegador.|No se pudo guardar. Inténtalo de nuevo.|Usa un máximo de 20 caracteres.|Conectando…',
 fr:'Changer de nom|Votre nom|Enregistrer|Utiliser le nom automatique|20 caractères maximum. Visible par les autres et mémorisé dans ce navigateur.|Échec de l’enregistrement. Réessayez.|Utilisez 20 caractères au maximum.|Connexion…',
 de:'Namen ändern|Dein Name|Speichern|Automatischen Namen nutzen|Bis zu 20 Zeichen. Für andere sichtbar; in diesem Browser gespeichert.|Speichern fehlgeschlagen. Bitte erneut versuchen.|Bitte höchstens 20 Zeichen verwenden.|Verbinden…',
 pt:'Alterar nome|Seu nome|Salvar|Usar nome automático|Até 20 caracteres. Visível para os outros; lembrado neste navegador.|Não foi possível salvar. Tente novamente.|Use no máximo 20 caracteres.|Conectando…',
};
export function profileText(locale:Locale){const values=rows[locale].split('|');return Object.fromEntries(keys.map((k,i)=>[k,values[i]])) as Record<typeof keys[number],string>;}
