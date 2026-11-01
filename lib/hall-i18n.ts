import type {Locale} from './i18n';
const names:Record<Locale,string>={
 en:'Original temple|Amber sanctuary|Cherry blossom temple|Moonlit lantern courtyard|Forest wheel sanctuary|Golden lantern temple|Lotus water garden',
 ko:'기존 법당|호박빛 목조 사원|벚꽃 사원|달빛 연등 마당|숲속 법륜 선원|황금 연등 사원|연꽃 수원',
 ja:'元の本堂|琥珀色の木造寺院|桜の寺院|月明かりの提灯庭|森の法輪寺院|黄金の提灯寺院|蓮の水庭',
 'zh-CN':'原有寺院|琥珀木寺|樱花寺院|月下灯笼庭院|森林法轮寺|金灯寺院|莲花水庭',
 'zh-TW':'原有寺院|琥珀木寺|櫻花寺院|月下燈籠庭院|森林法輪寺|金燈寺院|蓮花水庭',
 th:'วัดเดิม|วิหารไม้สีอำพัน|วัดซากุระ|ลานโคมใต้แสงจันทร์|วิหารธรรมจักรในป่า|วัดโคมทอง|สวนสระบัว',
 vi:'Ngôi chùa ban đầu|Chùa gỗ ánh hổ phách|Chùa hoa anh đào|Sân đèn dưới trăng|Chùa pháp luân trong rừng|Chùa đèn vàng|Vườn hồ sen',
 my:'မူလဘုရားကျောင်း|ပယင်းရောင်သစ်သားကျောင်း|ချယ်ရီပန်းကျောင်း|လရောင်မီးပုံးရင်ပြင်|တောတွင်းဓမ္မစကြာကျောင်း|ရွှေရောင်မီးပုံးကျောင်း|ကြာကန်ဥယျာဉ်',
 km:'វត្តដើម|វិហារឈើពណ៌លឿងទុំ|វត្តផ្កាសាគូរ៉ា|ទីធ្លាចង្កៀងក្រោមពន្លឺព្រះចន្ទ|វិហារធម្មចក្រក្នុងព្រៃ|វត្តចង្កៀងមាស|សួនស្រះឈូក',
 si:'මුල් විහාරය|ඇම්බර් ලී විහාරය|චෙරි මල් විහාරය|සඳ එළියේ පහන් මළුව|වන ධර්මචක්‍ර විහාරය|රන් පහන් විහාරය|නෙළුම් දිය උයන',
 lo:'ວັດເດີມ|ວິຫານໄມ້ສີອຳພັນ|ວັດດອກຊາກຸຣະ|ລານໂຄມໃຕ້ແສງເດືອນ|ວິຫານທຳມະຈັກໃນປ່າ|ວັດໂຄມຄຳ|ສວນສະບົວ',
 mn:'Анхны дуган|Хув өнгийн модон сүм|Интоорын цэцэгт сүм|Сарны гэрэлт дэнлүүний талбай|Ойн номын хүрдэт сүм|Алтан дэнлүүний сүм|Бадамлянхуат усан цэцэрлэг',
 bo:'ཐོག་མའི་ལྷ་ཁང་།|སྤོས་ཤེལ་འོད་ཀྱི་ཤིང་ཁང་།|ས་ཀུ་རའི་མེ་ཏོག་ལྷ་ཁང་།|ཟླ་འོད་སྒྲོན་མེའི་ར་བ།|ནགས་ཀྱི་ཆོས་འཁོར་ལྷ་ཁང་།|གསེར་གྱི་སྒྲོན་མེའི་ལྷ་ཁང་།|པདྨའི་ཆུ་སྐྱེད་ཚལ།',
 ne:'मूल मन्दिर|अम्बर काष्ठ मन्दिर|चेरी फूल मन्दिर|जुनेली लालटिन आँगन|वन धर्मचक्र मन्दिर|सुनौलो लालटिन मन्दिर|कमल जल उद्यान',
 es:'Templo original|Santuario de ámbar|Templo de los cerezos|Patio de faroles a la luz de la luna|Santuario del bosque y la rueda|Templo de los faroles dorados|Jardín de agua y lotos',
 fr:'Temple d’origine|Sanctuaire ambré|Temple des cerisiers|Cour des lanternes au clair de lune|Sanctuaire de la roue en forêt|Temple des lanternes dorées|Jardin d’eau aux lotus',
 de:'Ursprünglicher Tempel|Bernsteinheiligtum|Kirschblütentempel|Laternenhof im Mondlicht|Waldheiligtum mit Dharmarad|Tempel der goldenen Laternen|Lotuswassergarten',
 pt:'Templo original|Santuário âmbar|Templo das cerejeiras|Pátio de lanternas ao luar|Santuário da roda na floresta|Templo das lanternas douradas|Jardim de água e lótus',
};
export const hallName=(number:number,locale:Locale)=>(names[locale]||names.en).split('|')[number-1]||'';
const descriptions:Record<Locale,string>={"en":"Seven halls. Up to 100 visitors in each hall.","ko":"7개의 법당. 각 법당은 최대 100명까지 입장할 수 있어요.","ja":"7つの本堂。各本堂の定員は100人です。","zh-CN":"七座大殿，每殿最多容纳100人。","zh-TW":"七座大殿，每殿最多容納100人。","th":"ศาลา 7 แห่ง แต่ละแห่งรองรับผู้เข้าชมได้สูงสุด 100 คน","vi":"Bảy điện thờ. Mỗi điện tối đa 100 người.","my":"ဘုရားခန်း ၇ ခန်း။ တစ်ခန်းလျှင် လူ ၁၀၀ အထိ။","km":"សាលា ៧។ សាលានីមួយៗចូលបាន ១០០ នាក់។","si":"ශාලා 7ක්. ශාලාවකට 100 දෙනෙකු දක්වා.","lo":"ສາລາ 7 ແຫ່ງ ສາລາລະບໍ່ເກີນ 100 ຄົນ","mn":"Долоон дуган. Дуган бүрд 100 хүртэл хүн орно.","bo":"ལྷ་ཁང་༧ དང་རེ་ལ་མི་༡༠༠ བར་འཇུག་ཆོག","ne":"सात हल। प्रत्येक हलमा बढीमा १०० जना।","es":"Siete salas. Hasta 100 visitantes por sala.","fr":"Sept salles. Jusqu’à 100 visiteurs par salle.","de":"Sieben Säle. Bis zu 100 Besucher pro Saal.","pt":"Sete salões. Até 100 visitantes por salão."};
export const hallDescription=(locale:Locale)=>descriptions[locale]||descriptions.en;
