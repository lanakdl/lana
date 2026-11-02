/* Lana API · Cloudflare Worker (built file: engine + shop) */
/* ===== LANA CORE (shared by staff app demo + Google Apps Script backend) ===== */
var LANA = {
  OPEN: 600, CLOSE: 1260, BUFFER: 10, NOSHOW_MIN: 15, EXT_MIN: 30, EXT_PRICE: 290, TZ: 'Asia/Bangkok',
  RES: { wash: ['เตียงสระ', 'Wash bed', 'W'], dry: ['เก้าอี้ได', 'Dryer', 'D'], thai: ['เตียงนวดไทย', 'Thai massage bed', 'T'], chair: ['เก้าอี้นวดเท้า', 'Foot chair', 'C'], oil: ['เตียงนวดออยล์', 'Oil massage bed', 'O'] },
  /* staff pay: baht per minute by kind of work */
  RATE: { head: 120 / 45, thai: 170 / 60, foot: 170 / 60, neck: 170 / 60, oil: 190 / 60 },
  DRY_FEE: 0, FT_SHARE: 0.10, HAIR_SHARE: 0.10, PARTNER_FEE: 20, EXTRA_SHARE: 0.10, DAILY_MIN: 400, DRY_SPLIT: 30
};
LANA.BRANCHES = [
  /* lat/lng are EXAMPLES — replace with each branch's real Google Maps pin. radiusM = how far staff may be when clocking in */
  { id: 'NIM', name_th: 'สาขานิมมาน', name_en: 'Nimman', wash: 2, dry: 2, thai: 2, chair: 2, oil: 1, active: 'TRUE', lat: 18.7965, lng: 98.9681, radiusM: 1000, addr: '', map: '' },
  { id: 'MCH', name_th: 'สาขามหาโชค', name_en: 'Mahachok', wash: 3, dry: 3, thai: 0, chair: 0, oil: 0, active: 'TRUE', lat: 18.7995, lng: 98.9870, radiusM: 1000, addr: '', map: '' },
  { id: 'CBP', name_th: 'สาขา CBP', name_en: 'CBP', wash: 0, dry: 0, thai: 0, chair: 0, oil: 0, active: 'SOON', lat: '', lng: '', radiusM: 1000, addr: '', map: '' }
];
/* segs: seat:minutes; pay: kind:minutes (+ dry fee when the program has blow-dry) */
/* steps: "ชื่อไทย|English|นาที; ..." shown to customers. pack5 / pack11 empty = automatic (5 sessions save 9%, 10+1 free) */
LANA.PROGRAMS = [
  { id: 'HEAD60', cat: 'hair', name_th: 'สปาศีรษะ สระไดร์', name_en: 'Head Spa, Wash & Blow-dry', price: 399, segs: 'wash:45,dry:15', pay: 'head:60', dry: 'TRUE', hair: 'TRUE', active: 'TRUE', pack5: '', pack11: '',
    steps: "บำบัดด้วยเสียง น้ำมันหอมระเหย นวดผ่อนคลาย|Sound & aroma therapy, relaxing massage|15;นวดศีรษะ สระ ทรีตเมนต์|Head massage, wash & treatment|30;เซรั่ม ไดร์จัดทรง|Serum & blow-dry|15", desc_th: "สปาศีรษะ 40–45 นาที ต่อด้วยไดร์จัดทรง 15–20 นาที บำบัดด้วยเสียงและน้ำมันหอม นวดศีรษะทั้งแบบแห้งและแบบเปียก ปิดท้ายด้วยเซรั่มบำรุงเส้นผม", desc_en: "A 40–45 minute head spa, then a 15–20 minute blow-dry. Sound and aroma therapy, dry and wet head massage, finished with a nourishing serum." },
  { id: 'COCO120', cat: 'hair', name_th: 'Coconut Hot Oil + กัวซาศีรษะ + สปานาโนมิส', name_en: 'Coconut Hot-Oil Head Spa, Gua Sha & Nano Mist', price: 899, segs: 'wash:100,dry:20', pay: 'head:120', dry: 'TRUE', hair: 'TRUE', active: 'TRUE', pack3: 2499, pack5: '', pack11: '', pass30: 5999,
    steps: "บำบัดด้วยเสียง น้ำมันหอม นวดผ่อนคลาย|Sound & aroma, relaxing massage|20;ชโลมน้ำมันมะพร้าวอุ่น นวดศีรษะ 12 ท่า กัวซาศีรษะ|Warm coconut oil, 12-move head massage, scalp gua sha|35;สระ 2 ครั้ง ทรีตเมนต์ สปานาโนมิส|Double wash, treatment & nano mist spa|45;เซรั่ม ไดร์จัดทรง นวดคอบ่าไหล่|Serum, blow-dry & neck massage|20", desc_th: "ตัวเต็มของสปาศีรษะ ชโลมน้ำมันมะพร้าวอุ่น นวด 12 ท่า กัวซาศีรษะ แล้วสปาไอน้ำนาโนมิส หนังศีรษะโล่ง ผมนุ่มมีน้ำหนัก", desc_en: "Our full head spa: warm coconut oil, a 12-move head massage, scalp gua sha and a nano mist spa. A clear scalp and soft, heavy hair." },
  { id: 'FACE80', cat: 'hair', name_th: 'สปาศีรษะ + นวดหน้า + คอบ่าไหล่', name_en: 'Head Spa, Facial Massage & Neck', price: 699, segs: 'wash:65,dry:15', pay: 'head:80', dry: 'TRUE', hair: 'TRUE', active: 'TRUE', pack5: '', pack11: '',
    steps: "คลีนหน้า นวดหน้า 16 จุด Cooling มาร์คหน้า|Cleanse, 16-point face massage, cooling & mask|25;คลายเส้นคอบ่าไหล่ นวดศีรษะ|Neck, shoulder & head massage|10;สปาศีรษะ สระ นวด ทรีตเมนต์|Head spa: wash, massage & treatment|30;เซรั่ม ไดร์ นวดคอบ่าไหล่|Serum, blow-dry & neck massage|15", desc_th: "นวดหน้า 16 จุด มาร์คหน้าเย็นๆ คลายคอบ่าไหล่ แล้วต่อด้วยสปาศีรษะ ออกจากร้านหน้าใสผมสวยในรอบเดียว", desc_en: "A 16-point face massage with a cooling mask, neck and shoulder release, then a head spa. Fresh face and hair in one visit." },
  { id: 'FACE120', cat: 'hair', name_th: 'Hot Oil + กัวซาศีรษะ + นาโนมิส + นวดหน้า', name_en: 'Hot-Oil Head Spa, Gua Sha, Nano Mist & Facial', price: 1199, segs: 'wash:100,dry:20', pay: 'head:120', dry: 'TRUE', hair: 'TRUE', active: 'TRUE', pack5: '', pack11: '',
    steps: "คลีนหน้า นวดหน้า 16 จุด Cooling มาร์คหน้า|Cleanse, 16-point face massage, cooling & mask|25;ชโลมน้ำมันมะพร้าวอุ่น นวดศีรษะ 12 ท่า กัวซาศีรษะ|Warm coconut oil, 12-move head massage, scalp gua sha|30;สระ ทรีตเมนต์ สปานาโนมิส|Wash, treatment & nano mist spa|45;เซรั่ม ไดร์ นวดคอบ่าไหล่|Serum, blow-dry & neck massage|20", desc_th: "สปาศีรษะน้ำมันมะพร้าวอุ่นครบสูตร บวกนวดหน้าและมาร์คหน้า 120 นาทีเต็ม", desc_en: "The full coconut-oil head spa plus a facial massage and mask. A full 120 minutes." },
  { id: 'FULL150', cat: 'hair', name_th: 'Full Option สปาศีรษะ + นวดหน้า + กัวซาหน้า', name_en: 'Full Option: Head Spa, Facial & Face Gua Sha', price: 1599, segs: 'wash:130,dry:20', pay: 'head:150', dry: 'TRUE', hair: 'TRUE', active: 'TRUE', pack5: '', pack11: '',
    steps: "คลีนหน้า กัวซาหน้า นวดหน้า 16 จุด Cooling มาร์คหน้า|Cleanse, face gua sha, 16-point face massage, cooling & mask|40;ชโลมน้ำมันมะพร้าวอุ่น นวดศีรษะ 12 ท่า กัวซาศีรษะ|Warm coconut oil, 12-move head massage, scalp gua sha|35;สระ ทรีตเมนต์ สปานาโนมิส|Wash, treatment & nano mist spa|55;เซรั่ม ไดร์ นวดคอบ่าไหล่|Serum, blow-dry & neck massage|20", desc_th: "ครบทุกอย่างที่เรามี กัวซาหน้า นวดหน้า สปาศีรษะน้ำมันมะพร้าว และนาโนมิส 150 นาที", desc_en: "Everything we do: face gua sha, facial massage, coconut-oil head spa and nano mist. 150 minutes." },
  { id: 'EXPRESS', cat: 'hair', name_th: 'Express สระไดร์ Dyson', name_en: 'Express Wash & Dyson Blow-dry', price: 129, segs: 'wash:15,dry:10', pay: 'pct:10', dry: 'FALSE', hair: 'TRUE', active: 'TRUE', pack5: '', pack11: '',
    steps: 'สระด่วน|Quick wash|15;ไดร์ด้วย Dyson|Dyson blow-dry|10',
    desc_th: 'สระสะอาด ไดร์ด้วย Dyson ไม่มีนวด เหมาะกับวันที่รีบ ใช้เวลาประมาณ 25 นาทีก็พร้อมไปต่อ', desc_en: 'A quick, clean wash and blow-dry, no massage. Ready to go in about 25 minutes.' },
  { id: 'SNECK90H', pair: 999, cat: 'set', group: 'นวดคอ บ่า ไหล่ 30 นาที + สปาศีรษะ สระไดร์ 60 นาที|Neck & Shoulders Massage 30 min + Head Spa 60 min', vlabel: 'ต่อด้วยสปาศีรษะ สระไดร์ 60 นาที|then Head Spa, Wash & Blow-dry 60 min', name_th: 'นวดคอ บ่า ไหล่ 30 นาที + สปาศีรษะ สระไดร์ 60 นาที', name_en: 'Neck & Shoulders Massage 30 min + Head Spa 60 min', price: 599, segs: 'wash:75,dry:15', pay: 'neck:30,head:60', dry: 'TRUE', hair: 'TRUE', active: 'TRUE', pack5: '', pack11: '',
    steps: "คอ บ่า ไหล่|Neck & shoulders|30;นวดศีรษะ สระ ทรีตเมนต์|Head massage, wash & treatment|45;เซรั่ม ไดร์จัดทรง|Serum & blow-dry|15", desc_th: "คลายคอบ่าไหล่ที่ตึงจากการนั่งทำงาน แล้วต่อด้วยสปาศีรษะ สระไดร์ 60 นาที รวม 90 นาที", desc_en: "Starts with neck & shoulders 30 min, then a 60-minute head spa, wash and blow-dry. 90 minutes in all." },
  { id: 'SNECK90T', cat: 'set', group: 'นวดคอ บ่า ไหล่ 30 นาที + สปาศีรษะ หรือ นวดไทย 60 นาที|Neck & Shoulders 30 min + Head Spa or Thai Massage 60 min', vlabel: 'ต่อด้วยนวดไทย 60 นาที|then Thai Massage 60 min', stretch: 'TRUE', name_th: 'นวดคอ บ่า ไหล่ 30 นาที + นวดไทย 60 นาที', name_en: 'Neck & Shoulders 30 min + Thai Massage 60 min', price: 599, segs: 'thai:90', pay: 'neck:30,thai:60', dry: 'FALSE', hair: 'FALSE', active: 'FALSE', pack5: '', pack11: '',
    steps: "คอ บ่า ไหล่|Neck & shoulders|30;นวดไทยทั้งตัว|Full-body Thai massage|60", desc_th: "คลายคอบ่าไหล่ที่ตึงจากการนั่งทำงาน แล้วต่อด้วยนวดไทย 60 นาที รวม 90 นาที", desc_en: "Starts with neck & shoulders 30 min, then a 60-minute Thai massage. 90 minutes in all." },
  { id: 'SHEAD90H', cat: 'set', group: 'นวดศีรษะผ่อนคลาย + กัวซาศีรษะ 30 นาที + สปาศีรษะ สระไดร์ 60 นาที|Relaxing Head Massage + Scalp Gua Sha 30 min + Head Spa 60 min', vlabel: 'ต่อด้วยสปาศีรษะ สระไดร์ 60 นาที|then Head Spa, Wash & Blow-dry 60 min', name_th: 'นวดศีรษะผ่อนคลาย + กัวซาศีรษะ 30 นาที + สปาศีรษะ สระไดร์ 60 นาที', name_en: 'Relaxing Head Massage + Scalp Gua Sha 30 min + Head Spa 60 min', price: 599, segs: 'wash:75,dry:15', pay: 'head:30,head:60', dry: 'TRUE', hair: 'TRUE', active: 'TRUE', pack5: '', pack11: '',
    steps: "นวดศีรษะผ่อนคลาย กัวซาศีรษะ|Relaxing head massage & scalp gua sha|30;นวดศีรษะ สระ ทรีตเมนต์|Head massage, wash & treatment|45;เซรั่ม ไดร์จัดทรง|Serum & blow-dry|15", desc_th: "นวดศีรษะผ่อนคลายและกัวซาศีรษะ แล้วต่อด้วยสปาศีรษะ สระไดร์ 60 นาที รวม 90 นาที", desc_en: "Starts with relaxing head massage + scalp gua sha 30 min, then a 60-minute head spa, wash and blow-dry. 90 minutes in all." },
  { id: 'SHEAD90T', cat: 'set', group: 'นวดศีรษะผ่อนคลาย + กัวซาศีรษะ 30 นาที + สปาศีรษะ หรือ นวดไทย 60 นาที|Relaxing Head Massage + Scalp Gua Sha 30 min + Head Spa or Thai Massage 60 min', vlabel: 'ต่อด้วยนวดไทย 60 นาที|then Thai Massage 60 min', stretch: 'TRUE', name_th: 'นวดศีรษะผ่อนคลาย + กัวซาศีรษะ 30 นาที + นวดไทย 60 นาที', name_en: 'Relaxing Head Massage + Scalp Gua Sha 30 min + Thai Massage 60 min', price: 599, segs: 'thai:90', pay: 'head:30,thai:60', dry: 'FALSE', hair: 'FALSE', active: 'FALSE', pack5: '', pack11: '',
    steps: "นวดศีรษะผ่อนคลาย กัวซาศีรษะ|Relaxing head massage & scalp gua sha|30;นวดไทยทั้งตัว|Full-body Thai massage|60", desc_th: "นวดศีรษะผ่อนคลายและกัวซาศีรษะ แล้วต่อด้วยนวดไทย 60 นาที รวม 90 นาที", desc_en: "Starts with relaxing head massage + scalp gua sha 30 min, then a 60-minute Thai massage. 90 minutes in all." },
  { id: 'SFOOT90H', pair: 999, stretch: 'TRUE', cat: 'set', group: 'นวดเท้า 30 นาที + สปาศีรษะ สระไดร์ 60 นาที|Foot Massage 30 min + Head Spa 60 min', vlabel: 'ต่อด้วยสปาศีรษะ สระไดร์ 60 นาที|then Head Spa, Wash & Blow-dry 60 min', name_th: 'นวดเท้า 30 นาที + สปาศีรษะ สระไดร์ 60 นาที', name_en: 'Foot Massage 30 min + Head Spa 60 min', price: 599, segs: 'chair:30,wash:45,dry:15', pay: 'foot:30,head:60', dry: 'TRUE', hair: 'TRUE', active: 'TRUE', pack5: '', pack11: '',
    steps: "นวดเท้า|Foot massage|30;นวดศีรษะ สระ ทรีตเมนต์|Head massage, wash & treatment|45;เซรั่ม ไดร์จัดทรง|Serum & blow-dry|15", desc_th: "นวดเท้าให้เบาสบาย แล้วต่อด้วยสปาศีรษะ สระไดร์ 60 นาที รวม 90 นาที", desc_en: "Starts with foot massage 30 min, then a 60-minute head spa, wash and blow-dry. 90 minutes in all." },
  { id: 'SFOOT90T', cat: 'set', group: 'นวดเท้า 30 นาที + สปาศีรษะ หรือ นวดไทย 60 นาที|Foot Massage 30 min + Head Spa or Thai Massage 60 min', vlabel: 'ต่อด้วยนวดไทย 60 นาที|then Thai Massage 60 min', stretch: 'TRUE', name_th: 'นวดเท้า 30 นาที + นวดไทย 60 นาที', name_en: 'Foot Massage 30 min + Thai Massage 60 min', price: 599, segs: 'thai:90', pay: 'foot:30,thai:60', dry: 'FALSE', hair: 'FALSE', active: 'FALSE', pack5: '', pack11: '',
    steps: "นวดเท้า|Foot massage|30;นวดไทยทั้งตัว|Full-body Thai massage|60", desc_th: "นวดเท้าให้เบาสบาย แล้วต่อด้วยนวดไทย 60 นาที รวม 90 นาที", desc_en: "Starts with foot massage 30 min, then a 60-minute Thai massage. 90 minutes in all." },
  { id: 'SFGS90H', cat: 'set', group: 'กัวซาหน้า 30 นาที + สปาศีรษะ สระไดร์ 60 นาที|Face Gua Sha 30 min + Head Spa 60 min', vlabel: 'ต่อด้วยสปาศีรษะ สระไดร์ 60 นาที|then Head Spa, Wash & Blow-dry 60 min', name_th: 'กัวซาหน้า 30 นาที + สปาศีรษะ สระไดร์ 60 นาที', name_en: 'Face Gua Sha 30 min + Head Spa 60 min', price: 599, segs: 'wash:75,dry:15', pay: 'head:30,head:60', dry: 'TRUE', hair: 'TRUE', active: 'TRUE', pack5: '', pack11: '',
    steps: "กัวซาหน้า|Face gua sha|30;นวดศีรษะ สระ ทรีตเมนต์|Head massage, wash & treatment|45;เซรั่ม ไดร์จัดทรง|Serum & blow-dry|15", desc_th: "กัวซาหน้าให้หน้ากระชับสดใส แล้วต่อด้วยสปาศีรษะ สระไดร์ 60 นาที รวม 90 นาที", desc_en: "Starts with face gua sha 30 min, then a 60-minute head spa, wash and blow-dry. 90 minutes in all." },
  { id: 'SFGS90T', cat: 'set', group: 'กัวซาหน้า 30 นาที + สปาศีรษะ หรือ นวดไทย 60 นาที|Face Gua Sha 30 min + Head Spa or Thai Massage 60 min', vlabel: 'ต่อด้วยนวดไทย 60 นาที|then Thai Massage 60 min', stretch: 'TRUE', name_th: 'กัวซาหน้า 30 นาที + นวดไทย 60 นาที', name_en: 'Face Gua Sha 30 min + Thai Massage 60 min', price: 599, segs: 'thai:90', pay: 'head:30,thai:60', dry: 'FALSE', hair: 'FALSE', active: 'FALSE', pack5: '', pack11: '',
    steps: "กัวซาหน้า|Face gua sha|30;นวดไทยทั้งตัว|Full-body Thai massage|60", desc_th: "กัวซาหน้าให้หน้ากระชับสดใส แล้วต่อด้วยนวดไทย 60 นาที รวม 90 นาที", desc_en: "Starts with face gua sha 30 min, then a 60-minute Thai massage. 90 minutes in all." },
  { id: 'SFACE90', cat: 'set', name_th: 'นวดหน้า + กัวซา 30 นาที + สปาศีรษะ สระไดร์ 60 นาที', name_en: 'Facial Massage & Gua Sha 30 min + Head Spa 60 min', price: 699, segs: 'wash:75,dry:15', pay: 'head:90', dry: 'TRUE', hair: 'TRUE', active: 'TRUE', pack5: '', pack11: '',
    steps: "นวดหน้า กัวซาหน้า มาร์คหน้า (ฟรี)|Facial massage, gua sha & free mask|30;นวดศีรษะ สระ ทรีตเมนต์|Head massage, wash & treatment|45;เซรั่ม ไดร์จัดทรง|Serum & blow-dry|15", desc_th: "นวดหน้าและกัวซาหน้า 30 นาที ฟรีมาร์คหน้าระหว่างสระผม ต่อด้วยสปาศีรษะ สระไดร์ 60 นาที", desc_en: "30 minutes of facial massage and gua sha, a free face mask while your hair is washed, then a 60-minute head spa." },
  { id: 'COMBO120', cat: 'set', group: 'นวดไทย หรือ นวดเท้า 60 นาที + สปาศีรษะ สระไดร์ 60 นาที|Thai or Foot Massage 60 min + Head Spa 60 min', vlabel: 'นวดไทย 60 นาที|Thai massage 60 min', stretch: 'TRUE', name_th: 'นวดไทย 60 นาที + สปาศีรษะ สระไดร์ 60 นาที', name_en: 'Thai Massage 60 min + Head Spa 60 min', price: 699, segs: 'thai:60,wash:45,dry:15', pay: 'thai:60,head:60', dry: 'TRUE', hair: 'TRUE', active: 'FALSE', pack5: '', pack11: '',
    steps: "นวดไทยทั้งตัว|Full-body Thai massage|60;นวดศีรษะ สระ ทรีตเมนต์|Head massage, wash & treatment|45;เซรั่ม ไดร์จัดทรง|Serum & blow-dry|15", desc_th: "เริ่มที่ตัว จบที่หัว นวดไทยให้ตัวเบา แล้วปิดท้ายด้วยสปาศีรษะ ออกจากร้านผมสวย ไม่ยุ่งจากการนอนนวด", desc_en: "Body first, head last. Thai massage, then a head spa, so you leave with fresh hair." },
  { id: 'SNECK120', cat: 'set', group: 'นวดคอ บ่า ไหล่ หรือ นวดเท้า 60 นาที + สปาศีรษะ สระไดร์ 60 นาที|Neck & Shoulders or Foot Massage 60 min + Head Spa 60 min', vlabel: 'นวดคอ บ่า ไหล่ 60 นาที|Neck & shoulder massage 60 min', stretch: 'TRUE', name_th: 'นวดคอ บ่า ไหล่ 60 นาที + สปาศีรษะ สระไดร์ 60 นาที', name_en: 'Neck & Shoulder Massage 60 min + Head Spa 60 min', price: 699, segs: 'chair/oil:60,wash:45,dry:15', pay: 'neck:60,head:60', dry: 'TRUE', hair: 'TRUE', active: 'TRUE', pack5: '', pack11: '',
    steps: "นวดคอ บ่า ไหล่|Neck & shoulders|60;นวดศีรษะ สระ ทรีตเมนต์|Head massage, wash & treatment|45;เซรั่ม ไดร์จัดทรง|Serum & blow-dry|15", desc_th: "คลายคอ บ่า ไหล่ที่ตึงจากการนั่งทำงาน 60 นาที แล้วต่อด้วยสปาศีรษะ สระไดร์ 60 นาที", desc_en: "60 minutes on tight neck and shoulders, then a 60-minute head spa." },
  { id: 'SFOOT120', stretch: 'TRUE', cat: 'set', group: 'นวดคอ บ่า ไหล่ หรือ นวดเท้า 60 นาที + สปาศีรษะ สระไดร์ 60 นาที|Neck & Shoulders or Foot Massage 60 min + Head Spa 60 min', vlabel: 'นวดเท้า 60 นาที|Foot massage 60 min', name_th: 'นวดเท้า 60 นาที + สปาศีรษะ สระไดร์ 60 นาที', name_en: 'Foot Massage 60 min + Head Spa 60 min', price: 699, segs: 'chair:60,wash:45,dry:15', pay: 'foot:60,head:60', dry: 'TRUE', hair: 'TRUE', active: 'TRUE', pack5: '', pack11: '',
    steps: "นวดเท้าและน่อง|Feet & calves|60;นวดศีรษะ สระ ทรีตเมนต์|Head massage, wash & treatment|45;เซรั่ม ไดร์จัดทรง|Serum & blow-dry|15", desc_th: "นวดเท้าและน่อง 60 นาที แล้วย้ายไปสปาศีรษะ สระไดร์ 60 นาที", desc_en: "60 minutes on feet and calves, then a 60-minute head spa." },
  { id: 'SOIL120', stretch: 'TRUE', cat: 'set', name_th: 'นวดออยล์ อโรม่า 60 นาที + สปาศีรษะ สระไดร์ 60 นาที', name_en: 'Aroma Oil Massage 60 min + Head Spa 60 min', price: 899, segs: 'oil/thai:60,wash:45,dry:15', pay: 'oil:60,head:60', dry: 'TRUE', hair: 'TRUE', active: 'FALSE', pack5: '', pack11: '',
    steps: "นวดน้ำมันทั้งตัว|Full-body oil massage|60;นวดศีรษะ สระ ทรีตเมนต์|Head massage, wash & treatment|45;เซรั่ม ไดร์จัดทรง|Serum & blow-dry|15", desc_th: "นวดน้ำมันทั้งตัว 60 นาที แล้วปิดท้ายด้วยสปาศีรษะ สระไดร์ 60 นาที", desc_en: "A 60-minute full-body oil massage, then a 60-minute head spa." },
  { id: 'THAI60', cat: 'massage', group: 'นวดไทย|Thai Massage', vlabel: '60 นาที|60 min', stretch: 'TRUE', name_th: 'นวดไทย 60 นาที', name_en: 'Thai Massage 60 min', price: 300, segs: 'thai:60', pay: 'thai:60', dry: 'FALSE', hair: 'FALSE', active: 'FALSE', pack5: '', pack11: '',
    steps: "เท้าและขา|Feet & legs|20;หลังและไหล่|Back & shoulders|25;แขน คอ ศีรษะ|Arms, neck & head|15", desc_th: "กดจุดและยืดเส้นแบบไทย ไม่ใช้น้ำมัน คลายกล้ามเนื้อที่ตึงจากการนั่งทำงานหรือเดินเที่ยวทั้งวัน", desc_en: "Pressure points and stretches, no oil. Loosens muscles tight from desk work or a long day of walking." },
  { id: 'THAI90', cat: 'massage', group: 'นวดไทย|Thai Massage', vlabel: '90 นาที|90 min', stretch: 'TRUE', name_th: 'นวดไทย 90 นาที', name_en: 'Thai Massage 90 min', price: 435, segs: 'thai:90', pay: 'thai:90', dry: 'FALSE', hair: 'FALSE', active: 'FALSE', pack5: '', pack11: '',
    steps: "เท้าและขา|Feet & legs|30;หลังและไหล่|Back & shoulders|38;แขน คอ ศีรษะ|Arms, neck & head|22", desc_th: "กดจุดและยืดเส้นแบบไทย ไม่ใช้น้ำมัน คลายกล้ามเนื้อที่ตึงจากการนั่งทำงานหรือเดินเที่ยวทั้งวัน", desc_en: "Pressure points and stretches, no oil. Loosens muscles tight from desk work or a long day of walking." },
  { id: 'THAI120', cat: 'massage', group: 'นวดไทย|Thai Massage', vlabel: '120 นาที|120 min', stretch: 'TRUE', name_th: 'นวดไทย 120 นาที', name_en: 'Thai Massage 120 min', price: 550, segs: 'thai:120', pay: 'thai:120', dry: 'FALSE', hair: 'FALSE', active: 'FALSE', pack5: '', pack11: '',
    steps: "เท้าและขา|Feet & legs|40;หลังและไหล่|Back & shoulders|50;แขน คอ ศีรษะ|Arms, neck & head|30", desc_th: "กดจุดและยืดเส้นแบบไทย ไม่ใช้น้ำมัน คลายกล้ามเนื้อที่ตึงจากการนั่งทำงานหรือเดินเที่ยวทั้งวัน", desc_en: "Pressure points and stretches, no oil. Loosens muscles tight from desk work or a long day of walking." },
  { id: 'FOOT60', stretch: 'TRUE', cat: 'massage', group: 'นวดเท้า|Foot Massage', vlabel: '60 นาที|60 min', name_th: 'นวดเท้า 60 นาที', name_en: 'Foot Massage 60 min', price: 300, segs: 'chair:60', pay: 'foot:60', dry: 'FALSE', hair: 'FALSE', active: 'TRUE', pack5: '', pack11: '',
    steps: "แช่และขัดเท้า|Foot soak & scrub|10;นวดเท้าและน่อง|Feet & calves|40;คอ บ่า|Neck & shoulders|10", desc_th: "นวดเท้าและน่องด้วยครีม เท้าเบาตั้งแต่ลุกจากเก้าอี้ เหมาะหลังเดินมาทั้งวัน", desc_en: "Feet and calves with cream. Your feet feel light the moment you stand up." },
  { id: 'FOOT90', stretch: 'TRUE', cat: 'massage', group: 'นวดเท้า|Foot Massage', vlabel: '90 นาที|90 min', name_th: 'นวดเท้า 90 นาที', name_en: 'Foot Massage 90 min', price: 435, segs: 'chair:90', pay: 'foot:90', dry: 'FALSE', hair: 'FALSE', active: 'TRUE', pack5: '', pack11: '',
    steps: "แช่และขัดเท้า|Foot soak & scrub|10;นวดเท้าและน่อง|Feet & calves|70;คอ บ่า|Neck & shoulders|10", desc_th: "นวดเท้าและน่องด้วยครีม เท้าเบาตั้งแต่ลุกจากเก้าอี้ เหมาะหลังเดินมาทั้งวัน", desc_en: "Feet and calves with cream. Your feet feel light the moment you stand up." },
  { id: 'FOOT120', stretch: 'TRUE', cat: 'massage', group: 'นวดเท้า|Foot Massage', vlabel: '120 นาที|120 min', name_th: 'นวดเท้า 120 นาที', name_en: 'Foot Massage 120 min', price: 550, segs: 'chair:120', pay: 'foot:120', dry: 'FALSE', hair: 'FALSE', active: 'FALSE', pack5: '', pack11: '',
    steps: "แช่และขัดเท้า|Foot soak & scrub|10;นวดเท้าและน่อง|Feet & calves|95;คอ บ่า|Neck & shoulders|15", desc_th: "นวดเท้าและน่องด้วยครีม เท้าเบาตั้งแต่ลุกจากเก้าอี้ เหมาะหลังเดินมาทั้งวัน", desc_en: "Feet and calves with cream. Your feet feel light the moment you stand up." },
  { id: 'NECK60', cat: 'massage', group: 'นวดคอ บ่า ไหล่|Neck & Shoulder Massage', vlabel: '60 นาที|60 min', stretch: 'TRUE', name_th: 'นวดคอ บ่า ไหล่ 60 นาที', name_en: 'Neck & Shoulder Massage 60 min', price: 399, segs: 'chair/oil:60', pay: 'neck:60', dry: 'FALSE', hair: 'FALSE', active: 'TRUE', pack5: '', pack11: '',
    steps: "คอและบ่า|Neck & shoulders|33;หลังส่วนบน|Upper back|17;ศีรษะ|Head|10", desc_th: "ตัวช่วยของคนก้มหน้าจอทั้งวัน คลายจุดที่ตึงจนปวดหัว", desc_en: "For screen-heavy days. Works the knots that cause headaches." },
  { id: 'NECK90', cat: 'massage', group: 'นวดคอ บ่า ไหล่|Neck & Shoulder Massage', vlabel: '90 นาที|90 min', stretch: 'TRUE', name_th: 'นวดคอ บ่า ไหล่ 90 นาที', name_en: 'Neck & Shoulder Massage 90 min', price: 595, segs: 'chair/oil:90', pay: 'neck:90', dry: 'FALSE', hair: 'FALSE', active: 'TRUE', pack5: '', pack11: '',
    steps: "คอและบ่า|Neck & shoulders|50;หลังส่วนบน|Upper back|25;ศีรษะ|Head|15", desc_th: "ตัวช่วยของคนก้มหน้าจอทั้งวัน คลายจุดที่ตึงจนปวดหัว", desc_en: "For screen-heavy days. Works the knots that cause headaches." },
  { id: 'NECK120', cat: 'massage', group: 'นวดคอ บ่า ไหล่|Neck & Shoulder Massage', vlabel: '120 นาที|120 min', stretch: 'TRUE', name_th: 'นวดคอ บ่า ไหล่ 120 นาที', name_en: 'Neck & Shoulder Massage 120 min', price: 699, segs: 'chair/oil:120', pay: 'neck:120', dry: 'FALSE', hair: 'FALSE', active: 'FALSE', pack5: '', pack11: '',
    steps: "คอและบ่า|Neck & shoulders|66;หลังส่วนบน|Upper back|34;ศีรษะ|Head|20", desc_th: "ตัวช่วยของคนก้มหน้าจอทั้งวัน คลายจุดที่ตึงจนปวดหัว", desc_en: "For screen-heavy days. Works the knots that cause headaches." },
  { id: 'OIL60', stretch: 'TRUE', cat: 'massage', group: 'นวดออยล์ อโรม่า|Aroma Oil Massage', vlabel: '60 นาที|60 min', name_th: 'นวดออยล์ อโรม่า 60 นาที', name_en: 'Aroma Oil Massage 60 min', price: 399, segs: 'oil/thai:60', pay: 'oil:60', dry: 'FALSE', hair: 'FALSE', active: 'FALSE', pack5: '', pack11: '',
    steps: "หลังและไหล่|Back & shoulders|24;ขาและเท้า|Legs & feet|21;แขน คอ ศีรษะ|Arms, neck & head|15", desc_th: "นวดน้ำมันลื่นๆ ทั้งตัว น้ำหนักมือนุ่มลึก เหมาะกับคนที่อยากผ่อนคลายจนหลับ", desc_en: "A smooth full-body oil massage with slow, deep pressure. Easy to fall asleep to." },
  { id: 'OIL90', stretch: 'TRUE', cat: 'massage', group: 'นวดออยล์ อโรม่า|Aroma Oil Massage', vlabel: '90 นาที|90 min', name_th: 'นวดออยล์ อโรม่า 90 นาที', name_en: 'Aroma Oil Massage 90 min', price: 595, segs: 'oil/thai:90', pay: 'oil:90', dry: 'FALSE', hair: 'FALSE', active: 'FALSE', pack5: '', pack11: '',
    steps: "หลังและไหล่|Back & shoulders|36;ขาและเท้า|Legs & feet|31;แขน คอ ศีรษะ|Arms, neck & head|23", desc_th: "นวดน้ำมันลื่นๆ ทั้งตัว น้ำหนักมือนุ่มลึก เหมาะกับคนที่อยากผ่อนคลายจนหลับ", desc_en: "A smooth full-body oil massage with slow, deep pressure. Easy to fall asleep to." },
  { id: 'OIL120', stretch: 'TRUE', cat: 'massage', group: 'นวดออยล์ อโรม่า|Aroma Oil Massage', vlabel: '120 นาที|120 min', name_th: 'นวดออยล์ อโรม่า 120 นาที', name_en: 'Aroma Oil Massage 120 min', price: 699, segs: 'oil/thai:120', pay: 'oil:120', dry: 'FALSE', hair: 'FALSE', active: 'FALSE', pack5: '', pack11: '',
    steps: "หลังและไหล่|Back & shoulders|48;ขาและเท้า|Legs & feet|42;แขน คอ ศีรษะ|Arms, neck & head|30", desc_th: "นวดน้ำมันลื่นๆ ทั้งตัว น้ำหนักมือนุ่มลึก เหมาะกับคนที่อยากผ่อนคลายจนหลับ", desc_en: "A smooth full-body oil massage with slow, deep pressure. Easy to fall asleep to." },
  { id: 'BALM60', cat: 'massage', group: 'นวดไทยรีดเส้น ออย / ยาหม่อง|Thai Deep-Tissue with Oil or Balm', vlabel: '60 นาที|60 min', stretch: 'TRUE', name_th: 'นวดไทยรีดเส้น ออย / ยาหม่อง 60 นาที', name_en: 'Thai Deep-Tissue with Oil or Balm 60 min', price: 459, segs: 'thai:60', pay: 'oil:60', dry: 'FALSE', hair: 'FALSE', active: 'FALSE', pack5: '', pack11: '',
    steps: "รีดเส้นหลังและไหล่|Deep work on back & shoulders|24;ขาและเท้า|Legs & feet|21;แขน คอ ศีรษะ|Arms, neck & head|15", desc_th: "นวดไทยรีดเส้นลงน้ำหนัก ใช้ออยหรือยาหม่องตามชอบ (บอกหมอนวดได้) เหมาะกับคนปวดเมื่อยหนักๆ", desc_en: "Firm Thai deep-tissue work with oil or herbal balm, your choice (tell your therapist). For really tired muscles." },
  { id: 'BALM90', cat: 'massage', group: 'นวดไทยรีดเส้น ออย / ยาหม่อง|Thai Deep-Tissue with Oil or Balm', vlabel: '90 นาที|90 min', stretch: 'TRUE', name_th: 'นวดไทยรีดเส้น ออย / ยาหม่อง 90 นาที', name_en: 'Thai Deep-Tissue with Oil or Balm 90 min', price: 688, segs: 'thai:90', pay: 'oil:90', dry: 'FALSE', hair: 'FALSE', active: 'FALSE', pack5: '', pack11: '',
    steps: "รีดเส้นหลังและไหล่|Deep work on back & shoulders|36;ขาและเท้า|Legs & feet|31;แขน คอ ศีรษะ|Arms, neck & head|23", desc_th: "นวดไทยรีดเส้นลงน้ำหนัก ใช้ออยหรือยาหม่องตามชอบ (บอกหมอนวดได้) เหมาะกับคนปวดเมื่อยหนักๆ", desc_en: "Firm Thai deep-tissue work with oil or herbal balm, your choice (tell your therapist). For really tired muscles." },
  { id: 'BALM120', cat: 'massage', group: 'นวดไทยรีดเส้น ออย / ยาหม่อง|Thai Deep-Tissue with Oil or Balm', vlabel: '120 นาที|120 min', stretch: 'TRUE', name_th: 'นวดไทยรีดเส้น ออย / ยาหม่อง 120 นาที', name_en: 'Thai Deep-Tissue with Oil or Balm 120 min', price: 799, segs: 'thai:120', pay: 'oil:120', dry: 'FALSE', hair: 'FALSE', active: 'FALSE', pack5: '', pack11: '',
    steps: "รีดเส้นหลังและไหล่|Deep work on back & shoulders|48;ขาและเท้า|Legs & feet|42;แขน คอ ศีรษะ|Arms, neck & head|30", desc_th: "นวดไทยรีดเส้นลงน้ำหนัก ใช้ออยหรือยาหม่องตามชอบ (บอกหมอนวดได้) เหมาะกับคนปวดเมื่อยหนักๆ", desc_en: "Firm Thai deep-tissue work with oil or herbal balm, your choice (tell your therapist). For really tired muscles." },
  /* free ticket from partner clinics only (not sold): 45 min, wash 30 + dry 15 */
  { id: 'PART45', cat: 'hair', name_th: 'สปาศีรษะ สระไดร์ 45 นาที (ตั๋วพาร์ทเนอร์)', name_en: 'Head Spa, Wash & Blow-dry 45 min (partner ticket)', price: 399, segs: 'wash:30,dry:15', pay: 'head:45', dry: 'TRUE', hair: 'TRUE', active: 'FALSE', pack5: '', pack11: '',
    steps: 'นวดศีรษะ สระ ทรีตเมนต์|Head massage, wash & treatment|30;ไดร์จัดทรง|Blow-dry|15', desc_th: 'ตั๋วฟรีจากคลินิกพาร์ทเนอร์ สปาศีรษะ สระ 30 นาที และไดร์ 15 นาที', desc_en: 'Free partner-clinic ticket: 30-minute head spa and wash, 15-minute blow-dry.' },
  { id: 'SPA45', name_th: 'แฮร์สปา ซิกเนเจอร์', name_en: 'Signature Hair Spa', price: 590, segs: 'wash:35,dry:10', pay: 'head:45', dry: 'TRUE', hair: 'TRUE', active: 'FALSE', pack5: '', pack11: '',
    steps: 'นวดศีรษะ คอ บ่า|Head, neck & shoulder massage|20;สระและดูแลหนังศีรษะ|Wash & scalp care|15;เป่าและจัดทรง|Blow-dry|10',
    desc_th: 'นวดศีรษะให้หายตึง สระสะอาดถึงหนังศีรษะ ออกจากร้านผมเบาสบาย เหมาะกับวันที่ปวดหัวหรือนอนไม่ค่อยหลับ', desc_en: 'A head massage that melts tension, a deep scalp wash, and light, fresh hair. Good for headache days and poor sleep.' },
  { id: 'SPA90', name_th: 'LANA แฮร์สปา & ทรีตเมนต์', name_en: 'LANA Hair Spa & Treatment', price: 990, segs: 'wash:75,dry:15', pay: 'head:90', dry: 'TRUE', hair: 'TRUE', active: 'FALSE', pack5: '', pack11: '',
    steps: 'นวดศีรษะ คอ บ่า|Head, neck & shoulder massage|45;สระ ทรีตเมนต์บำรุงผม|Wash & hair treatment|30;เป่าและจัดทรง|Blow-dry|15',
    desc_th: 'เวอร์ชันเต็มของเรา นวดนานเกือบเท่าตัว และบำรุงให้ผมแห้งเสียกลับมานุ่มลื่น หลายคนหลับไปตั้งแต่ครึ่งทาง', desc_en: 'Our full version: nearly twice the massage, plus a treatment that brings dry hair back to soft. Many guests fall asleep halfway.' }
];
LANA.HAIR = [
  { id: 'short', name_th: 'ไม่เกินหน้าอก', name_en: 'Up to the chest', price: 0, min: 0 },
  { id: 'blade', name_th: 'ใต้หน้าอก ถึงกลางหลัง', name_en: 'Below the chest to mid-back', price: 20, min: 5 },
  { id: 'mid', name_th: 'กลางหลัง ถึงเอว', name_en: 'Mid-back to waist', price: 40, min: 10 },
  { id: 'waist', name_th: 'ยาวกว่าเอว', name_en: 'Below waist', price: 60, min: 15 }
];
/* things guests often need to tell the therapist: picked as buttons so the job slip is always printed in Thai */
LANA.ALERTS = [
  ['PREG', 'ตั้งครรภ์', 'Pregnant'], ['BP', 'ความดันสูง', 'High blood pressure'], ['OIL', 'แพ้น้ำมัน/ครีม', 'Allergic to oil or cream'],
  ['SCALP', 'หนังศีรษะแพ้ง่าย', 'Sensitive scalp'], ['SURG', 'เพิ่งผ่าตัด', 'Recent surgery'], ['NECK', 'ห้ามกดแรงที่คอ', 'No strong pressure on the neck'],
  ['BACKP', 'ปวดหลัง/หมอนรองกระดูก', 'Back pain / disc problem'], ['TICK', 'จั๊กจี้ง่าย', 'Very ticklish'],
  ['HEART', 'โรคหัวใจ', 'Heart condition'], ['DIAB', 'เบาหวาน', 'Diabetes'], ['EPI', 'ลมชัก', 'Epilepsy'], ['MIGR', 'ไมเกรน/ปวดหัวบ่อย', 'Migraine'],
  ['BLOOD', 'ทานยาละลายลิ่มเลือด', 'On blood thinners'], ['VEIN', 'เส้นเลือดขอด', 'Varicose veins'], ['BONE', 'กระดูกพรุน', 'Osteoporosis'],
  ['SKIN', 'มีแผล/ผื่น/โรคผิวหนัง', 'Wound, rash or skin condition'], ['FEVER', 'มีไข้/ไม่สบาย', 'Fever or unwell']
];
LANA.STYLES = [
  { id: 'normal', name_th: 'เป่าแห้งธรรมดา', name_en: 'Simple blow-dry', price: 0, min: 0 },
  { id: 'dstraight', name_th: 'ไดร์หนีบตรง ด้วย Dyson', name_en: 'Straight blow-dry with Dyson', price: 59, fee: 10, min: 5 },
  { id: 'dcurls', name_th: 'ไดร์ผมลอนสั้น ด้วย Dyson (ประบ่า)', name_en: 'Short curls with Dyson (shoulder length)', price: 69, fee: 10, min: 10 },
  { id: 'dcurll', name_th: 'ไดร์ผมลอนยาว ด้วย Dyson', name_en: 'Long curls with Dyson', price: 89, fee: 15, min: 15 },
  { id: 'dvolume', name_th: 'ไดร์เพิ่มโวลุ่ม', name_en: 'Volume blow-dry', price: 59, fee: 10, min: 5 }
];
/* for: programs that can take this add-on. seat: where the extra minutes go (wash / first seat / none) */
LANA.ADDONS = [
  /* partner free ticket (45 min) -> the full 60-min head spa for 200 more; the technician gets 20 (10%) on top of the partner fee */
  { id: 'UP60', name_th: 'อัปเกรดเป็นสปาศีรษะ 60 นาทีเต็ม (โปร 399)', name_en: 'Upgrade to the full 60-min head spa', price: 200, fee: 20, min: 15, seat: 'wash', for: 'PART45', rec: 'TRUE',
    desc_th: 'จาก 45 นาที เป็น 60 นาที นวดศีรษะนานขึ้น ได้ครบเหมือนโปร 399 จ่ายเพิ่มแค่ 200', desc_en: 'From 45 to 60 minutes: a longer head massage, the full ฿399 treatment for just ฿200 more.' },
  /* 399 head spa (or partner ticket after UP60) -> the 599 set: a 30-min foot massage first, on a foot chair; the foot therapist gets 85 (half the 1-hour foot pay) */
  { id: 'UPFOOT', name_th: 'อัปเกรดเป็นเซ็ต 599: เพิ่มนวดเท้า 30 นาที', name_en: 'Upgrade to the ฿599 set: add a 30-min foot massage', price: 200, fee: 85, min: 30, seat: '+chair', for: 'HEAD60,PART45', rec: 'TRUE',
    desc_th: 'เริ่มด้วยนวดเท้า 30 นาที แล้วต่อสปาศีรษะ ได้ครบเหมือนเซ็ต 599', desc_en: 'Starts with a 30-minute foot massage, then your head spa: the full ฿599 set.' },
  { id: 'KERA', name_th: 'เคราติน', name_en: 'Keratin', price: 100, fee: 10, min: 0, seat: '', for: 'HAIR', rec: 'TRUE',
    desc_th: 'ช่วยฟื้นฟูบำรุงผมเสีย ผมแห้งเสีย ลดความชี้ฟู ทำให้ผมนุ่มลื่น มีน้ำหนัก เงางามขึ้นอย่างเป็นธรรมชาติ', desc_en: 'Repairs dry, damaged hair and calms frizz. Soft, smooth hair with natural weight and shine.' },
  { id: 'GLASS', name_th: 'เคลือบแก้ว', name_en: 'Glass gloss', price: 150, fee: 15, min: 0, seat: '', for: 'HAIR', rec: 'FALSE',
    desc_th: 'ช่วยบำรุงให้ผมดูมีน้ำหนัก เงางาม', desc_en: 'Leaves hair heavier and glossy.' },
  { id: 'SCRUB', name_th: 'สครับหนังศีรษะ', name_en: 'Scalp scrub', price: 100, fee: 10, min: 10, seat: 'wash', for: 'HAIR', rec: 'FALSE',
    desc_th: 'ช่วยขจัดคราบความมันส่วนเกิน รังแค เซลล์ผิวที่ตายแล้ว ลดความมันของเส้นผม', desc_en: 'Clears excess oil, flakes and dead skin. Less oily hair.' },
  { id: 'DETOX', name_th: 'Detox', name_en: 'Detox', price: 150, fee: 15, min: 0, seat: '', for: 'HAIR', rec: 'FALSE',
    desc_th: 'ล้างสารเคมีตกค้างจากการทำสี ดัด ยืดผม ลดความมันของหนังศีรษะ บำรุงผมให้กลับมามีน้ำหนักเงางาม', desc_en: 'Washes out leftover chemicals from colour, perms and straightening, calms an oily scalp and brings back weight and shine.' },
  { id: 'PURPLE', name_th: 'แชมพูม่วง + ทรีตเม้นม่วง', name_en: 'Purple shampoo + purple treatment', price: 110, fee: 10, min: 0, seat: '', for: 'HAIR', rec: 'FALSE',
    desc_th: 'สำหรับผมทำสีสว่าง ช่วยลดเหลือง ให้สีผมสวยนานขึ้น', desc_en: 'For light or bleached hair: cuts yellow tones so the colour lasts.' },
  { id: 'NANO', name_th: 'สปานาโน', name_en: 'Nano mist spa', price: 200, fee: 15, min: 10, seat: 'wash', for: 'HAIR', rec: 'FALSE',
    desc_th: 'อบไอน้ำนาโนให้ทรีตเมนต์ซึมลึกถึงแกนผม ผมนุ่มชุ่มชื่น', desc_en: 'A fine nano mist that helps the treatment soak deep into the hair. Soft, moist hair.' },
  /* no longer sold: kept so older visits and vouchers still show their names */
  { id: 'VIT', name_th: 'วิตามินบำรุงผม', name_en: 'Hair vitamin boost', price: 190, min: 0, seat: '', for: '', rec: 'FALSE', desc_th: 'เติมวิตามินให้เส้นผมและหนังศีรษะ ช่วยให้ผมนุ่ม ชุ่มชื้น ไม่แห้งกระด้าง ดูมีสุขภาพดี', desc_en: 'A vitamin boost for hair and scalp. Softer, well-moisturised, healthy-looking hair.' },
  { id: 'HERB', name_th: 'ลูกประคบสมุนไพรอุ่น', name_en: 'Warm herbal compress', price: 150, min: 0, seat: '', for: '', rec: 'FALSE', desc_th: '', desc_en: '' },
  { id: 'EXT30', name_th: 'เพิ่มเวลานวด 30 นาที', name_en: 'Add 30 minutes', price: 290, min: 30, seat: 'first', for: '', rec: 'FALSE', desc_th: '', desc_en: '' }
];
/* member levels by money spent in a calendar year (paid orders). A level reached this year also lasts all of next year.
   free: add-ons given free on every visit (the member's own seat) */
LANA.TIERS = [
  { id: 'BRONZE', name_th: 'บรอนซ์', name_en: 'Bronze', minSpend: 0, free: '', desc_th: 'สมาชิก Lana', desc_en: 'Lana member' },
  { id: 'SILVER', name_th: 'ซิลเวอร์', name_en: 'Silver', minSpend: 5000, free: 'SCRUB', desc_th: 'สครับหนังศีรษะฟรีทุกครั้ง', desc_en: 'Free scalp scrub every visit' },
  { id: 'GOLD', name_th: 'โกลด์', name_en: 'Gold', minSpend: 12000, free: 'SCRUB,KERA', desc_th: 'สครับหนังศีรษะ + เคราตินฟรีทุกครั้ง', desc_en: 'Free scalp scrub + keratin every visit' },
  { id: 'DIAMOND', name_th: 'ไดมอนด์', name_en: 'Diamond', minSpend: 25000, free: 'SCRUB,KERA,DETOX', desc_th: 'สครับหนังศีรษะ เคราติน และ Detox ฟรีทุกครั้ง', desc_en: 'Free scalp scrub, keratin and detox every visit' }
];
/* partner vouchers: rule quiet = Mon–Thu before 16:00 */
/* code: what the clinic types into the customer's LINE app. One use per member per code. Blank rule = any day and time */
LANA.PARTNERS = [
  { id: 'DRTAN', name_th: 'Dr.Tan Clinic', name_en: 'Dr.Tan Clinic', code: 'drtanclinic2026', prog: 'PART45', days: 60, rule: 'quiet',
    desc_th: 'ลูกค้าคลินิก รับสปาศีรษะ สระไดร์ 45 นาที ฟรี 1 ครั้ง', desc_en: 'Clinic guests get one free 45-min Head Spa, Wash & Blow-dry.' },
  { id: 'JB', name_th: 'JB Clinic', name_en: 'JB Clinic', code: 'jbclinic2026', prog: 'PART45', days: 60, rule: 'quiet',
    desc_th: 'ลูกค้าคลินิก รับสปาศีรษะ สระไดร์ 45 นาที ฟรี 1 ครั้ง', desc_en: 'Clinic guests get one free 45-min Head Spa, Wash & Blow-dry.' }
];
/* promo codes the owner adds in the sheet Codes: code, gives (an add-on id = free add-on voucher, or a program id = free ticket), until (last day), active */
LANA.CODES = [];
LANA.STAFF = [
  { id: 'S1', name: 'แอน', phone: '+66811111111', pin: '1111', type: 'PT', branch: 'NIM', skills: 'ALL', active: 'TRUE', role: 'นวด' },
  { id: 'S2', name: 'นิด', phone: '+66822222222', pin: '2222', type: 'FT', branch: 'NIM', skills: 'ALL', active: 'TRUE', role: 'นวด' },
  { id: 'S4', name: 'ฝน', phone: '+66844444444', pin: '4444', type: 'PT', branch: 'NIM', skills: 'ALL', active: 'TRUE', role: 'ผม' },
  { id: 'S5', name: 'เมย์', phone: '+66855555555', pin: '5555', type: 'PT', branch: 'NIM', skills: 'ALL', active: 'TRUE', role: 'ผม' },
  { id: 'S3', name: 'มุก', phone: '+66833333333', pin: '3333', type: 'PT', branch: 'MCH', skills: 'ALL', active: 'TRUE' }
];

/* distance in metres between two GPS points */
function lnDistance(lat1, lng1, lat2, lng2) {
  var R = 6371000, r = Math.PI / 180, dLat = (lat2 - lat1) * r, dLng = (lng2 - lng1) * r;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return Math.round(2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
function lnFind(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
function lnHM(m) { var h = Math.floor(m / 60), x = m % 60; return (h < 10 ? '0' : '') + h + ':' + (x < 10 ? '0' : '') + x; }
function lnPairs(str) { return String(str || '').split(',').filter(Boolean).map(function (p) { var kv = p.split(':'); return { k: kv[0].trim(), v: parseFloat(kv[1]) || 0 }; }); }
function lnNormPhone(raw, intl) {
  var str = String(raw || '').trim(), d = str.replace(/\D/g, '');
  if (!d) return '';
  if (intl || (str.charAt(0) === '+' && d.indexOf('66') !== 0)) return '+' + d;
  if (d.indexOf('66') === 0 && d.length >= 11) d = d.slice(2);
  if (d.charAt(0) === '0') d = d.slice(1);
  return '+66' + d;
}
function lnCanDo(staff, progId) { var s = String(staff.skills || 'ALL').toUpperCase(); return s === 'ALL' || s.split(',').map(function (x) { return x.trim(); }).indexOf(progId) >= 0; }

/* seats one person's visit needs, in order, with hair / style / add-on minutes added */
function lnChain(prog, person) {
  var segs = lnPairs(prog.segs).map(function (p) { return { res: p.k, min: p.v }; });
  var hair = lnFind(LANA.HAIR, person.hair) || LANA.HAIR[0], style = lnFind(LANA.STYLES, person.style) || LANA.STYLES[0];
  if (String(prog.hair).toUpperCase() === 'TRUE') segs.forEach(function (s) { if (s.res === 'dry') s.min += hair.min + style.min; });
  (person.addons || []).forEach(function (id) {
    var a = lnFind(LANA.ADDONS, id); if (!a || !a.min) return;
    if (String(a.seat || '').charAt(0) === '+') { segs.unshift({ res: a.seat.slice(1), min: +a.min }); return; }   /* a new step first (foot massage before the head spa) */
    var target = a.seat === 'first' ? segs[0] : segs.filter(function (s) { return s.res === a.seat; })[0];
    if (target) target.min += a.min;
  });
  return segs;
}
function lnChainMin(segs) { return segs.reduce(function (s, x) { return s + x.min; }, 0); }

/* a step may allow several kinds of seat, best first: "oil/thai" = an oil bed, else a Thai bed */
function lnKinds(res) { return String(res || '').split('/').filter(Boolean); }
/* seats to try for step i of a guest: the planned one first, then every seat of the kinds that step allows */
function lnSeatCands(branch, pe, i, pref) {
  var kinds = lnKinds(pe && pe.chain && pe.chain[i] ? pe.chain[i].res : pref && pref.res), out = [];
  if (pref && pref.res && pref.unit && (+branch[pref.res] || 0) >= pref.unit) out.push({ res: pref.res, unit: +pref.unit });
  kinds.forEach(function (k) { for (var u = 1; u <= (+branch[k] || 0); u++) if (!out.some(function (o) { return o.res === k && o.unit === u; })) out.push({ res: k, unit: u }); });
  return out;
}
function lnUnitFree(rows, br, date, res, unit, a, b) {
  for (var i = 0; i < rows.length; i++) { var r = rows[i];
    if (r.branch === br && r.date === date && r.res === res && r.unit === unit && a < r.end + LANA.BUFFER && r.start < b + LANA.BUFFER) return false; }
  return true;
}
/* booked or live seats of every visit except one */
function lnOccupied(bookings, exceptId, nowMin) {
  var rows = [];
  bookings.forEach(function (bk) {
    if (bk.id === exceptId || ['noshow', 'cancelled'].indexOf(bk.status) >= 0) return;
    if (bk.live && bk.live.length) {
      bk.live.forEach(function (r) { var e = bk.finishedAt != null && bk.finishedAt !== '' ? Math.min(r.end, +bk.finishedAt) : r.end;
        /* a guest still in service stays on the seat of their latest step until moved or finished, even past its planned end */
        if (nowMin != null && bk.status === 'inservice' && r.scanned && !bk.live.some(function (x) { return x.pi === r.pi && x.i > r.i && x.scanned; })) e = Math.max(e, nowMin + 1); if (e > r.start) rows.push({ branch: bk.branch, date: bk.date, res: r.res, unit: r.unit, start: r.start, end: e, bid: bk.id }); });
    } else bk.people.forEach(function (p) { (p.alloc || []).forEach(function (a) { rows.push({ branch: bk.branch, date: bk.date, res: a.res, unit: a.unit, start: a.start, end: a.end, bid: bk.id }); }); });
  });
  return rows;
}
/* people limit: seats are not the only limit, someone has to do the work.
   Staff column role: 'นวด' (massage) / 'ผม' (hair: wash, head spa, dry) / blank = both.
   Branch columns massStaff / hairStaff override the count (e.g. fewer people on duty than on the list). */
var LN_GROUP = { thai: 'mass', chair: 'mass', oil: 'mass', wash: 'hair', dry: 'hair' };
function lnRole(s) { var r = String(s.role || '').trim().toLowerCase(); return /นวด|mass/.test(r) ? 'mass' : /ผม|hair/.test(r) ? 'hair' : 'both'; }
function lnCrewCaps(branch, staff) {
  var on = (staff || []).filter(function (s) { return s.branch === branch.id && String(s.active).toUpperCase() !== 'FALSE'; });
  var cap = { mass: 0, hair: 0, all: on.length };
  on.forEach(function (s) { var r = lnRole(s); if (r !== 'hair') cap.mass++; if (r !== 'mass') cap.hair++; });
  if (+branch.massStaff > 0) cap.mass = +branch.massStaff;
  if (+branch.hairStaff > 0) cap.hair = +branch.hairStaff;
  if (+branch.massStaff > 0 || +branch.hairStaff > 0) cap.all = Math.max(cap.all, (+branch.massStaff || 0) + (+branch.hairStaff || 0));
  return cap.all ? cap : null;   /* nobody listed for this branch: seats are the only limit */
}
/* most jobs of one kind (or in total) running at the same moment within [a, b) */
function lnPeak(rows, br, date, group, a, b) {
  var mine = rows.filter(function (r) { return r.branch === br && r.date === date && (!group || LN_GROUP[r.res] === group) && r.start < b && a < r.end; });
  var pts = [a].concat(mine.map(function (r) { return r.start; }).filter(function (t) { return t > a && t < b; })), peak = 0;
  pts.forEach(function (t) { var n = mine.filter(function (r) { return r.start <= t && t < r.end; }).length; if (n > peak) peak = n; });
  return peak;
}
/* today, once the shop has been open a while: only the people who actually clocked in can take work */
var LN_NOW = null;
function lnDuty(store, now) {
  LN_NOW = { date: now.date, min: now.min };
  var sf = store.staff(), sh = store.shifts().filter(function (r) { return r.date === now.date && !r.out; });
  store.branches().forEach(function (br) {
    br._duty = null; if (now.min < LANA.OPEN + 45) return;
    var on = sf.filter(function (s) { return s.branch === br.id && sh.some(function (r) { return r.staffId === s.id; }); }); if (!on.length) return;
    var d = { date: now.date, mass: 0, hair: 0, all: on.length }; on.forEach(function (s) { var r = lnRole(s); if (r !== 'hair') d.mass++; if (r !== 'mass') d.hair++; });
    br._duty = d;
  });
}
function lnCrewFree(rows, branch, date, res, a, b) {
  var cap = branch._cap; if (!cap) return true;
  var du = branch._duty; if (du && du.date === date) cap = { mass: Math.min(cap.mass, du.mass), hair: Math.min(cap.hair, du.hair), all: Math.min(cap.all, du.all) };
  var g = LN_GROUP[res]; if (g && lnPeak(rows, branch.id, date, g, a, b) >= cap[g]) return false;
  if (lnPeak(rows.filter(function (r) { return LN_GROUP[r.res]; }), branch.id, date, '', a, b) >= cap.all) return false;
  return true;
}
function lnAllocate(branch, date, start, chains, rows) {
  if (start < LANA.OPEN || start + Math.max.apply(null, chains.map(lnChainMin)) > LANA.CLOSE) return null;
  var used = rows.slice(), out = [];
  for (var i = 0; i < chains.length; i++) {
    var m = start, alloc = [];
    for (var j = 0; j < chains[i].length; j++) {
      var s = chains[i][j], found = null, ks = lnKinds(s.res);
      for (var q = 0; q < ks.length && !found; q++) { if (!lnCrewFree(used, branch, date, ks[q], m, m + s.min)) continue; for (var u = 1; u <= (+branch[ks[q]] || 0); u++) if (lnUnitFree(used, branch.id, date, ks[q], u, m, m + s.min)) { found = { res: ks[q], unit: u }; break; } }
      if (!found) return null;
      var row = { branch: branch.id, date: date, res: found.res, unit: found.unit, start: m, end: m + s.min };
      alloc.push(row); used.push(row); m += s.min;
    }
    out.push(alloc);
  }
  return out;
}
/* actual seats once a visit starts. Seats already in use never change; later seats may move to a free unit. */
/* Seat plan for a visit in service. Follows what really happened: steps already done stay as they were,
   the current step keeps its real start, later steps start when the current one ends (never in the past).
   soft = true (starting / moving): a later step with no free seat keeps its planned seat and is flagged clash
   (the therapist picks a free one when it is time) instead of refusing; closing time is not enforced. */
function lnExtFor(pe, i) { return pe.extBy ? (+pe.extBy[i] || 0) : (i === 0 ? (+pe.ext || 0) : 0); }
function lnCurSeg(bk, pi) { var c = 0; (bk.live || []).forEach(function (r) { if (r.pi === pi && r.scanned && r.i > c) c = r.i; }); return c; }
/* add (d = +1) or undo (d = -1) one 30-minute extension on the step the guest is in now */
function lnAddExt(bk, d) {
  var pe = bk.people[0], i = lnCurSeg(bk, 0);
  if (d > 0) bk._oldEnd = lnEnd(bk); else delete bk._oldEnd;   /* read once by lnTryChange */
  if (!pe.extBy) { pe.extBy = {}; if (+pe.ext) pe.extBy[0] = +pe.ext; }
  pe.extBy[i] = (+pe.extBy[i] || 0) + d; pe.ext = (+pe.ext || 0) + d;
}
/* a step of the first guest is cut short at `at` (moved on, handed over or finished early):
   30-minute extension blocks on that step that were not used are not charged and not paid. Returns how many were dropped. */
function lnDropExt(bk, rows, at) {
  var pe = bk.people[0], dropped = 0;
  if (!(+bk.ext)) return 0;
  if (!pe.extBy) { pe.extBy = {}; if (+pe.ext) pe.extBy[0] = +pe.ext; }
  rows.forEach(function (r) {
    if (!r || r.pi !== 0) return;
    var have = +pe.extBy[r.i] || 0; if (!have) return;
    var left = Math.max(0, r.end - Math.max(at, r.start)), n = Math.min(have, Math.floor(left / LANA.EXT_MIN), +bk.ext);
    for (var k = 0; k < n; k++) { var di = -1; (bk.due || []).forEach(function (d, j) { if (d.kind === 'ext') di = j; }); if (di >= 0) bk.due.splice(di, 1); }
    if (n) { pe.extBy[r.i] = have - n; pe.ext = Math.max(0, (+pe.ext || 0) - n); bk.ext = +bk.ext - n; bk.extDropped = (+bk.extDropped || 0) + n; dropped += n; }
  });
  return dropped;
}
function lnBuildLive(bk, branch, others, nowMin, soft) {
  var placed = [], rows = others.slice(), old = bk.live || [];
  function oldRow(pi, i) { return old.filter(function (r) { return r.pi === pi && r.i === i; })[0]; }
  for (var pi = 0; pi < bk.people.length; pi++) {
    var pe = bk.people[pi], m = +bk.svcStart;
    for (var i = 0; i < pe.alloc.length; i++) {
      var seg = pe.alloc[i], len = seg.end - seg.start + lnExtFor(pe, i) * LANA.EXT_MIN;
      if (i === 0) len -= (pe.cut || 0);
      if (seg.res === 'dry') len += pe.dryPlus || 0;
      var prev = oldRow(pi, i), nxt = oldRow(pi, i + 1), row;
      if (prev && prev.scanned && nxt && nxt.scanned) {            /* done */
        row = Object.assign({}, prev); placed.push(row); rows.push(row); m = row.end; continue;
      }
      if (prev && prev.scanned) {                                  /* in progress: real start, same seat */
        row = { branch: bk.branch, date: bk.date, res: prev.res || seg.res, unit: prev.unit, start: +prev.start, end: +prev.start + len, pi: pi, i: i, scanned: true };
        if (prev.scannedAt != null) row.scannedAt = prev.scannedAt;
        if (prev.staffId) row.staffId = prev.staffId;
        if (!lnUnitFree(rows, bk.branch, bk.date, row.res, row.unit, Math.max(nowMin, row.start), row.end)) { if (!soft) return { ok: false, res: row.res, start: row.start, end: row.end }; row.clash = true; }
      } else {                                                     /* not started yet */
        var st = Math.max(m, nowMin), cands = lnSeatCands(branch, pe, i, prev || seg), got = null;
        if (!cands.length) cands = [{ res: seg.res, unit: seg.unit }];
        for (var k = 0; k < cands.length; k++) if (lnUnitFree(rows, bk.branch, bk.date, cands[k].res, cands[k].unit, st, st + len)) { got = cands[k]; break; }
        if (!got && !soft) return { ok: false, res: cands[0].res, start: st, end: st + len };
        row = { branch: bk.branch, date: bk.date, res: (got || cands[0]).res, unit: (got || cands[0]).unit, start: st, end: st + len, pi: pi, i: i };
        if (!got) row.clash = true;
      }
      if (!soft && row.end > LANA.CLOSE) return { ok: false, res: 'close', start: row.start, end: row.end };
      placed.push(row); rows.push(row); m = row.end;
    }
  }
  return { ok: true, live: placed };
}
/* try a change; if a not-yet-started visit is in the way, move it to another free seat at the same time */
function lnTryChange(bk, branch, all, nowMin, apply, soft) {
  var others = lnOccupied(all, bk.id), r = lnBuildLive(bk, branch, others, nowMin, soft);
  delete bk._oldEnd;   /* extensions are never refused for lack of people: the station shows who to hurry instead */
  if (r.ok) { if (apply) bk.live = r.live; return { ok: true, moved: [] }; }
  if (r.res === 'close') return r;
  var blockers = all.filter(function (x) { return x.id !== bk.id && x.branch === bk.branch && x.date === bk.date && ['booked', 'checkedin', 'accepted'].indexOf(x.status) >= 0 &&
    x.people.some(function (pe) { return pe.alloc.some(function (a) { return a.res === r.res && a.start < r.end + LANA.BUFFER && r.start < a.end + LANA.BUFFER; }); }); });
  for (var i = 0; i < blockers.length; i++) {
    var B = blockers[i], without = others.filter(function (row) { return row.bid !== B.id; }), r2 = lnBuildLive(bk, branch, without, nowMin);
    if (!r2.ok) continue;
    var rowsB = lnOccupied(all, B.id).filter(function (row) { return row.bid !== bk.id; }).concat(r2.live);
    var alt = lnAllocate(branch, B.date, B.people[0].alloc[0].start, B.people.map(function (pe) { return pe.chain; }), rowsB);
    if (!alt) continue;
    if (apply) { bk.live = r2.live; B.people.forEach(function (pe, j) { pe.alloc = alt[j]; }); }
    return { ok: true, moved: [B] };
  }
  return { ok: false, res: r.res, at: r.start };
}
function lnEnd(bk) { return bk.live && bk.live.length ? Math.max.apply(null, bk.live.map(function (r) { return r.end; })) : 0; }

/* staff pay for one finished visit */
/* pay rules for part-timers: massage and wash-massage by the minute, 'pct:10' = 10% of the price, 'fixed:30' = a flat amount */
function lnPayAmt(prog, p) { return p.k === 'fixed' ? p.v : p.k === 'pct' ? (+prog.price || 0) * p.v / 100 : p.v * (LANA.RATE[p.k] || 0); }
function lnPayLabel(prog, p) { return p.k === 'fixed' ? prog.name_th : p.k === 'pct' ? p.v + '% ' + prog.name_th : prog.name_th + ' (' + p.k + ' ' + p.v + ' นาที)'; }
/* ----- part-time pay per item, in baht. The sheet "ค่ามือ" (LANA.PAYRATES) sets each number; a blank cell uses the formula below ----- */
/* two jobs, paid differently (part-time):
   massage therapist (massage bed / foot chair) = baht per hour (LANA.RATE)
   hair technician (wash bed + dryer: head spa, wash, blow-dry) = HAIR_SHARE (10%) of what that part of the treatment sells for
   dry2: blank = hair pay split by minutes when someone else dries; a number = fixed amount for the one who dries */
var LN_HAIR_SEATS = { wash: 1, dry: 1 };
function lnMins(prog) { var t = { all: 0, hair: 0, mass: 0, wash: 0, dry: 0 }; lnPairs(prog.segs).forEach(function (s) { t.all += s.v; if (LN_HAIR_SEATS[s.k]) t.hair += s.v; else t.mass += s.v; if (s.k === 'wash' || s.k === 'dry') t[s.k] += s.v; }); return t; }
function lnMassKind(prog) { var k = lnPairs(prog.pay).map(function (p) { return p.k; }).filter(function (k) { return k !== 'head' && LANA.RATE[k]; })[0]; return k || (/chair/.test(prog.segs || '') ? 'foot' : 'thai'); }
/* menu price of one hour of a kind of massage (its 60-minute program), used to take the massage part out of a combo */
var LN_HOUR_PROG = { thai: 'THAI60', foot: 'FOOT60', neck: 'NECK60', oil: 'OIL60' };
function lnMassHourPrice(kind) { var p = lnFind(LANA.PROGRAMS, LN_HOUR_PROG[kind] || 'THAI60'); return p ? +p.price : 0; }
function lnRateDef(prog) {
  var m = lnMins(prog), r2 = function (x) { return Math.round(x * 100) / 100; }, kind = lnMassKind(prog);
  /* combo: the massage part is taken out at its full menu price per hour; the hair technician gets 10% of what is left */
  var hairSale = m.hair ? Math.max(0, (+prog.price || 0) - (m.mass ? lnMassHourPrice(kind) * m.mass / 60 : 0)) : 0;
  var r = { massage: r2(m.mass * (LANA.RATE[kind] || 0)), wash: Math.round(hairSale * LANA.HAIR_SHARE), dry2: '', partner: LANA.PARTNER_FEE, ext: 0 };
  r.ext = m.mass ? r2(30 * (LANA.RATE[kind] || 0)) : Math.round(lnExtPrice(prog) * LANA.HAIR_SHARE);
  return r;
}
/* extending 30 minutes costs half the 1-hour price (the 60-minute version of the same treatment, or the price per hour) */
function lnExtPrice(prog) {
  if (!prog) return LANA.EXT_PRICE;
  var mins = function (p) { return lnPairs(p.segs).reduce(function (s, x) { return s + x.v; }, 0); };
  var h = prog.group ? LANA.PROGRAMS.filter(function (x) { return x.group === prog.group && mins(x) === 60 && lnOnSale(x); })[0] : null;
  return Math.round((h ? +h.price : (+prog.price || 0) * 60 / Math.max(60, mins(prog) || 60)) / 2);   /* shorter than an hour (Express): half its price */
}
function lnBkExtPrice(b) { return lnExtPrice(lnFind(LANA.PROGRAMS, b.people[0].prog)); }
function lnRate(prog) {
  var d = lnRateDef(prog), o = (LANA.PAYRATES || {})['prog:' + prog.id];
  if (o) Object.keys(d).forEach(function (k) { if (o[k] !== '' && o[k] != null && !isNaN(+o[k])) d[k] = +o[k]; });
  return d;
}
/* extras (hair length / dry style / add-on): baht for the therapist */
function lnXPay(kind, item) {
  var o = (LANA.PAYRATES || {})[kind + ':' + item.id];
  if (o && o.pay !== '' && o.pay != null && !isNaN(+o.pay)) return +o.pay;
  if (item.fee !== undefined && item.fee !== '' && !isNaN(+item.fee)) return +item.fee;   /* therapist pay set in the price list */
  return Math.round((+item.price || 0) * LANA.EXTRA_SHARE * 100) / 100;
}
/* what the guest paid on top of the program: hair length, blow-dry style, add-ons (10% of these goes to the therapist) */
function lnExtras(pe, part) {
  var hair = lnFind(LANA.HAIR, pe.hair), style = lnFind(LANA.STYLES, pe.style), amt = 0, pay = 0, names = [];
  if (lnTrue((lnFind(LANA.PROGRAMS, pe.prog) || {}).hairFree)) hair = null;   /* one price for any length */
  if ((!part || part === 'dry') && hair && +hair.price) { amt += +hair.price; pay += lnXPay('hair', hair); names.push('ผมยาว'); }
  if ((!part || part === 'dry') && style && +style.price) { amt += +style.price; pay += lnXPay('style', style); names.push(style.name_th); }
  if (!part || part === 'addons') (pe.addons || []).forEach(function (id) { var a = lnFind(LANA.ADDONS, id); if (a && +a.price) { amt += +a.price; pay += lnXPay('addon', a); names.push(a.name_th); } });
  return { amount: amt, pay: pay, label: names.join(' + ') };
}
function lnPay(bk, staff) {
  var lines = [], total = 0;
  function add(label, amt) { amt = Math.round(amt * 100) / 100; if (amt) { lines.push({ label: label, amount: amt }); total += amt; } }
  bk.people.forEach(function (pe) {
    var prog = lnFind(LANA.PROGRAMS, pe.prog); if (!prog) return;
    var hair = lnFind(LANA.HAIR, pe.hair) || LANA.HAIR[0], style = lnFind(LANA.STYLES, pe.style) || LANA.STYLES[0];
    var extras = lnExtras(pe);
    var R = lnRate(prog), two = R.massage && R.wash;
    if (pe.partner) {   /* free ticket from a partner clinic: a flat fee for bringing the guest in, + pay for anything they paid extra */
      add('ตั๋วฟรีพาร์ทเนอร์ (เหมา) · ' + prog.name_th, R.partner);
      if (extras.pay) add('ของเพิ่ม: ' + extras.label, extras.pay);
      return;
    }
    if (staff.type === 'FT') {
      var sale = (+pe.value || prog.price) + (lnTrue(prog.hairFree) ? 0 : hair.price) + style.price + (pe.addons || []).reduce(function (s, id) { var a = lnFind(LANA.ADDONS, id); return s + (a ? a.price : 0); }, 0);
      add('10% ' + prog.name_th, sale * LANA.FT_SHARE);
    } else {
      add(prog.name_th + (two ? ' · ส่วนนวด' : ''), R.massage);
      add(prog.name_th + (two ? ' · ส่วนผม' : '') + ' (' + Math.round(LANA.HAIR_SHARE * 100) + '%)', R.wash);
      if (String(prog.dry).toUpperCase() === 'TRUE' && LANA.DRY_FEE) add('ค่าได', LANA.DRY_FEE);
      if (extras.pay) add('ของเพิ่ม: ' + extras.label, extras.pay);
    }
  });
  var extPaid = (bk.due || []).filter(function (d) { return d.kind === 'ext'; }).length;
  if (extPaid && !bk.paidDue) lines.push({ label: 'ต่อเวลา ' + extPaid * 30 + ' นาที · รอลูกค้าจ่าย ยังไม่นับ', amount: 0, pending: true });
  if (extPaid && bk.paidDue) {
    var p0 = lnFind(LANA.PROGRAMS, bk.people[0].prog);
    var extSum = (bk.due || []).filter(function (d) { return d.kind === 'ext'; }).reduce(function (s, d) { return s + (+d.amount || 0); }, 0);
    if (staff.type === 'FT') add('10% ต่อเวลา', extSum * LANA.FT_SHARE);
    else add('ต่อเวลา ' + extPaid * 30 + ' นาที', extPaid * lnRate(p0).ext);
  }
  if (+bk.tip) add('ทิป', +bk.tip);
  return { lines: lines, total: Math.round(total * 100) / 100 };
}

/* pay when several therapists shared one visit (massage by one, wash by another, dry by a third):
   part-time = the rate of the steps each did, full-time = 10% split by minutes worked, tip split equally */
var LN_RES_KIND = { thai: 'thai', wash: 'head', dry: 'head', chair: null };
function lnPayShare(bk, staff) {
  var rows = (bk.live || []).filter(function (r) { return r.staffId; }), ids = {};
  rows.forEach(function (r) { ids[r.staffId] = 1; }); (bk.crew || []).forEach(function (c) { ids[c.id] = 1; });
  var crew = Object.keys(ids), skipped = ['finished', 'done'].indexOf(bk.status) >= 0 && (bk.live || []).some(function (r) { return !r.scanned; });
  if (crew.length <= 1 && !skipped) { var one = lnPay(bk, staff); one.tip = +bk.tip || 0; return one; }
  var lines = [], total = 0;
  function add(label, amt) { amt = Math.round(amt * 100) / 100; if (amt) { lines.push({ label: label, amount: amt }); total += amt; } }
  bk.people.forEach(function (pe, pi) {
    var prog = lnFind(LANA.PROGRAMS, pe.prog); if (!prog) return;
    var mine = (bk.live || []).filter(function (r) { return r.pi === pi; }).sort(function (a, b) { return a.i - b.i; });
    var owner = function (r) { if (!r) return ''; if (r.staffId) return r.staffId; if (skipped && !r.scanned) return '';   /* a step the guest skipped is not paid */
      var prev = mine.filter(function (x) { return x.i < r.i && x.staffId; }).pop(); return prev ? prev.staffId : bk.staffId; };
    var rowOfRes = function (res) { return mine.filter(function (r) { return r.res === res; })[0] || mine[0]; };
    var hair = lnFind(LANA.HAIR, pe.hair) || LANA.HAIR[0], style = lnFind(LANA.STYLES, pe.style) || LANA.STYLES[0];
    var dryR = mine.filter(function (r) { return r.res === 'dry'; })[0], firstR = mine.filter(function (r) { return r.res !== 'dry'; })[0] || mine[0];
    var exDry = lnExtras(pe, 'dry'), R = lnRate(prog), two = R.massage && R.wash;
    var massR = mine.filter(function (r) { return r.res === 'thai' || r.res === 'chair' || r.res === 'oil'; })[0] || firstR, washR = mine.filter(function (r) { return r.res === 'wash'; })[0] || firstR;
    var myAddons = (pe.addons || []).filter(function (id) { var x = lnFind(LANA.ADDONS, id); return x && +x.price && owner(x.seat === 'first' ? mine[0] : rowOfRes(String(x.seat || '').replace('+', ''))) === staff.id; });
    var addAmt = myAddons.reduce(function (t, id) { return t + lnXPay('addon', lnFind(LANA.ADDONS, id)); }, 0);
    /* hair pay (wash + dry): one person = all of it. Someone else dried: split by minutes, or a fixed amount for the dryer if set in the sheet */
    var mm = lnMins(prog), hairPart = function () {
      if (!R.wash) return;
      var w = owner(washR), d = dryR ? owner(dryR) : w, pct = ' (' + Math.round(LANA.HAIR_SHARE * 100) + '%)';
      if (!dryR || w === d) { if (w === staff.id) add(prog.name_th + (two ? ' · ส่วนผม' : '') + pct, R.wash); return; }
      var fixed = R.dry2 !== '' && R.dry2 != null && !isNaN(+R.dry2) && +R.dry2 > 0;
      var dPay = fixed ? +R.dry2 : R.wash * mm.dry / (mm.hair || 1), wPay = fixed ? R.wash : R.wash - dPay;
      if (w === staff.id) add(prog.name_th + ' · ส่วนสระ' + pct, wPay);
      if (d === staff.id) add(prog.name_th + ' · ส่วนได' + (fixed ? '' : pct), dPay);
    };
    var dryByOther = function () {};
    var shareExtras = function () {
      if (exDry.pay && owner(dryR || mine[mine.length - 1]) === staff.id) add('ของเพิ่ม: ' + exDry.label, exDry.pay);
      if (addAmt) add('ของเพิ่ม: ' + myAddons.map(function (id) { return lnFind(LANA.ADDONS, id).name_th; }).join(' + '), addAmt);
    };
    if (pe.partner) {
      if (owner(firstR) === staff.id) add('ตั๋วฟรีพาร์ทเนอร์ (เหมา) · ' + prog.name_th, R.partner);
      dryByOther();
      shareExtras();
    } else if (staff.type === 'FT') {
      var all = 0, me = 0; mine.forEach(function (r) { var m = Math.max(0, r.end - r.start); all += m; if (owner(r) === staff.id) me += m; });
      var sale = (+pe.value || prog.price) + (lnTrue(prog.hairFree) ? 0 : hair.price) + style.price + (pe.addons || []).reduce(function (t, id) { var x = lnFind(LANA.ADDONS, id); return t + (x ? x.price : 0); }, 0);
      if (all && me) add('10% ' + prog.name_th + ' (ทำ ' + me + ' จาก ' + all + ' นาที)', sale * LANA.FT_SHARE * me / all);
    } else {
      if (R.massage && owner(massR) === staff.id) add(prog.name_th + (two ? ' · ส่วนนวด' : ''), R.massage);
      hairPart();
      var dryRow = mine.filter(function (r) { return r.res === 'dry'; })[0] || mine[mine.length - 1];
      if (String(prog.dry).toUpperCase() === 'TRUE' && LANA.DRY_FEE && owner(dryRow) === staff.id) add('ค่าได', LANA.DRY_FEE);
      dryByOther();
      shareExtras();
    }
    /* extensions belong to the step the guest was in when it was added */
    if (pi === 0) {
      var extN = (bk.due || []).filter(function (d) { return d.kind === 'ext'; }).length, segs = [];
      if (pe.extBy) Object.keys(pe.extBy).sort().forEach(function (k) { for (var n = 0; n < +pe.extBy[k]; n++) segs.push(+k); });
      while (segs.length < extN) segs.push(0);
      var myExt = segs.slice(0, extN).filter(function (i) { return owner(mine.filter(function (r) { return r.i === i; })[0]) === staff.id; });
      if (myExt.length && !bk.paidDue) lines.push({ label: 'ต่อเวลา ' + myExt.length * 30 + ' นาที · รอลูกค้าจ่าย ยังไม่นับ', amount: 0, pending: true });
      if (myExt.length && bk.paidDue) {
        if (staff.type === 'FT') add('10% ต่อเวลา', myExt.length * lnBkExtPrice(bk) * LANA.FT_SHARE);
        else myExt.forEach(function () { add('ต่อเวลา 30 นาที', R.ext); });
      }
    }
  });
  if (!crew.length) crew = [bk.staffId];
  var tip = +bk.tip ? Math.round(+bk.tip / crew.length * 100) / 100 : 0;
  if (tip && crew.indexOf(staff.id) >= 0) add('ทิป (หาร ' + crew.length + ' คน)', tip); else tip = 0;
  return { lines: lines, total: Math.round(total * 100) / 100, tip: tip, shared: crew.length };
}

/* ----- customer side helpers ----- */
function lnTrue(v) { return String(v).toUpperCase() === 'TRUE'; }
function lnOnSale(p) { return !!p && (p.active === undefined || p.active === '' || lnTrue(p.active)); }
function lnId(n) { var c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = ''; for (var i = 0; i < (n || 8); i++) s += c.charAt(Math.floor(Math.random() * c.length)); return s; }
function lnPack(p, n) {
  if (n === 3) return +p.pack3 || 0;   /* blank = not sold */
  if (n === 'pass') return +p.pass30 || 0;   /* 30-day buffet, blank = not sold */
  if (n === 5) return +p.pack5 || Math.round(p.price * 5 * 0.91 / 10) * 10;
  if (n === 11) return +p.pack11 || p.price * 10;
  return +p.price;
}
function lnSteps(p) { return String(p.steps || '').split(';').filter(Boolean).map(function (x) { var a = x.split('|'); return [a[0] || '', a[1] || a[0] || '', +a[2] || 0]; }); }
function lnProgAt(p, br) { return !!br && lnTrue(br.active) && lnPairs(p.segs).every(function (s) { return lnKinds(s.k).some(function (k) { return (+br[k] || 0) > 0; }); }); }
/* "for" lists program ids; HAIR = every treatment with a hair wash (including ones added later and partner tickets) */
/* add-ons that only make sense together: on a partner ticket the foot upgrade comes with the 60-min upgrade (200 + 200 = the 599 set) */
var LN_ADDON_NEEDS = { UPFOOT: 'UP60' };
function lnAddonFix(progId, ids) {
  var out = (ids || []).slice();
  out.slice().forEach(function (id) { var nd = LN_ADDON_NEEDS[id], x = nd && lnFind(LANA.ADDONS, nd); if (x && lnAddonFor(x, progId) && out.indexOf(nd) < 0) out.push(nd); });
  return out;
}
function lnAddonRes(a) { var s = String(a && a.seat || ''); return s.charAt(0) === '+' ? s.slice(1) : ''; }   /* a seat the add-on needs that the program does not have */
function lnAddonFor(a, progId) {
  var f = String(a.for || '').split(',').map(function (x) { return x.trim(); });
  if (f.indexOf(progId) >= 0) return true;
  if (f.indexOf('HAIR') >= 0) { var p = lnFind(LANA.PROGRAMS, progId); return !!p && lnTrue(p.hair); }
  return false;
}
/* what one person pays on top of the ticket: long hair, blow-dry style, add-ons (free ones from vouchers) */
function lnPersonLines(prog, pe, free, tierFree, tierName) {
  var lines = [], hair = lnFind(LANA.HAIR, pe.hair), style = lnFind(LANA.STYLES, pe.style);
  if (lnTrue(prog.hair) && !lnTrue(prog.hairFree) && hair && +hair.price) lines.push({ kind: 'hair', th: 'ผมยาว (' + hair.name_th + ')', en: 'Long hair (' + (hair.name_en || hair.name_th) + ')', amount: +hair.price });
  if (lnTrue(prog.hair) && style && +style.price) lines.push({ kind: 'style', th: style.name_th, en: style.name_en || style.name_th, amount: +style.price });
  (pe.addons || []).forEach(function (id) {
    var ad = lnFind(LANA.ADDONS, id); if (!ad) return;
    var tf = (tierFree || []).indexOf(id) >= 0, f = !tf && (free || []).indexOf(id) >= 0;
    lines.push({ kind: 'addon', id: id, th: ad.name_th + (tf ? ' · ฟรีสิทธิ์ ' + (tierName || '') : f ? ' · ฟรีด้วยวอเชอร์' : ''), en: (ad.name_en || ad.name_th) + (tf ? ' · free (' + (tierName || '') + ')' : f ? ' · free with voucher' : ''), amount: tf || f ? 0 : +ad.price });
  });
  return lines;
}
function lnSum(lines) { return lines.reduce(function (s, l) { return s + (+l.amount || 0); }, 0); }
function lnDow(date) { return new Date(date + 'T00:00:00Z').getUTCDay(); }
function lnAddDays(d, n) { var x = new Date(d + 'T00:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); }
/* ===== END CORE ===== */

/* ===== LANA STAFF API (same code runs in Apps Script and in the demo) =====
   store: { bookings(): [...], saveBooking(bk), staff(): [...], branches(): [...],
            shifts(): [...], addShift(row), updateShift(row), session(token) -> staffId, newSession(staffId) -> token,
            log(staffId, bookingId, action, detail), lock(fn) }
   now:   { date: 'YYYY-MM-DD', min: minutes since midnight (Bangkok) }  */
function staffApi(req, store, now) {
  var a = req.action;
  if (a === 'login') return apiLogin(req, store);
  if (a === 'lineLogin') return apiLineLogin(req, store);
  var sid = store.session(req.token);
  if (!sid) throw new Error('LOGIN');
  var me = lnFind(store.staff(), sid);
  if (!me || String(me.active).toUpperCase() !== 'TRUE') throw new Error('LOGIN');
  if (a === 'feed') return apiFeed(me, store, now);
  if (a === 'clock') return store.lock(function () { return apiClock(me, req, store, now); });
  if (a === 'accept') return store.lock(function () { return apiAccept(me, req, store, now); });
  if (a === 'start') return store.lock(function () { return apiStart(me, req, store, now); });
  if (a === 'extend') return store.lock(function () { return apiExtend(me, req, store, now); });
  if (a === 'finish') return store.lock(function () { return apiFinish(me, req, store, now); });
  if (a === 'handoff') return store.lock(function () { return apiHandoff(me, req, store, now); });
  if (a === 'release') return store.lock(function () { return apiRelease(me, req, store, now); });
  if (a === 'move') return store.lock(function () { return apiMove(me, req, store, now); });
  if (a === 'pay') return apiPayReport(me, store, now);
  if (a === 'unlink') return store.lock(function () { me.lineUserId = ''; store.saveStaff(me); store.log(me.id, '', 'line_unlink', ''); return { ok: true }; });
  throw new Error('UNKNOWN');
}
function apiLogin(req, store) {
  var phone = lnNormPhone(req.phone, req.intl);
  var s = store.staff().filter(function (x) { return x.phone === phone && String(x.active).toUpperCase() === 'TRUE'; })[0];
  if (!s || String(s.pin) !== String(req.pin)) throw new Error('BAD_LOGIN');
  /* first time inside LINE: phone + PIN links this LINE account to the staff row, later opens skip the PIN */
  if (req.idToken) {
    var uid = store.lineUser(req.idToken);
    store.lock(function () {
      store.staff().forEach(function (x) { if (x.lineUserId === uid && x.id !== s.id) { x.lineUserId = ''; store.saveStaff(x); } });
      s.lineUserId = uid; store.saveStaff(s); store.log(s.id, '', 'line_link', '');
    });
  }
  return { token: store.newSession(s.id), staff: apiStaffPublic(s), linked: !!req.idToken };
}
function apiLineLogin(req, store) {
  var uid = store.lineUser(req.idToken);
  var s = store.staff().filter(function (x) { return x.lineUserId && x.lineUserId === uid && String(x.active).toUpperCase() === 'TRUE'; })[0];
  if (!s) throw new Error('NOT_LINKED');
  return { token: store.newSession(s.id), staff: apiStaffPublic(s), linked: true };
}
function apiStaffPublic(s) { return { id: s.id, name: s.name, type: s.type, branch: s.branch }; }
function apiOnShift(me, store, now) {
  return store.shifts().filter(function (r) { return r.staffId === me.id && r.date === now.date && !r.out; })[0] || null;
}
function apiClock(me, req, store, now) {
  var open = apiOnShift(me, store, now);
  /* clock-in only at your own branch, checked by GPS (within radiusM of the branch pin) */
  var dist = '';
  if (req.on && !open) {
    var br = lnFind(store.branches(), me.branch);
    if (br && br.lat !== '' && br.lat != null && br.lng !== '' && br.lng != null) {
      if (req.lat == null || req.lng == null || req.lat === '' || req.lng === '') throw new Error('NEED_GPS');
      dist = lnDistance(+req.lat, +req.lng, +br.lat, +br.lng);
      if (dist > (+br.radiusM || 1000)) { var e = new Error('TOO_FAR:' + dist); throw e; }
    }
  }
  if (req.on && !open) store.addShift({ staffId: me.id, date: now.date, branch: me.branch, in: lnHM(now.min), out: '', inDistance: dist, inAccuracy: req.acc || '' });
  if (!req.on && open) {
    if (LN_PUSH.jobsInApp && apiMine(me, store, now)) throw new Error('HAS_JOB');
    open.out = lnHM(now.min); store.updateShift(open);
  }
  var res = apiFeed(me, store, now);
  if (!req.on) { var p = apiPayReport(me, store, now); res.summary = { jobs: res.doneToday, pay: p.today }; }
  store.log(me.id, '', req.on ? 'clock_in' : 'clock_out', req.on ? 'GPS ' + dist + ' m (±' + (req.acc || '?') + ' m)' : '');
  return res;
}
function apiMine(me, store, now) {
  return store.bookings().filter(function (b) { return b.staffId === me.id && b.date === now.date && (b.status === 'accepted' || b.status === 'inservice'); })[0] || null;
}
function apiJobView(b, store, now, withCheck) {
  var branch = lnFind(store.branches(), b.branch), people = b.people.map(function (pe) {
    var prog = lnFind(LANA.PROGRAMS, pe.prog) || {}, hair = lnFind(LANA.HAIR, pe.hair), style = lnFind(LANA.STYLES, pe.style);
    return { name: pe.name, prog: prog.name_th, progId: pe.prog, hair: hair ? hair.name_th : '', hairId: pe.hair || '', style: style && style.id !== 'normal' ? style.name_th : '',
      addons: (pe.addons || []).map(function (id) { var x = lnFind(LANA.ADDONS, id); return x ? x.name_th : id; }), pressure: pe.pressure || 'medium', elbow: pe.elbow || 'ok', stretch: pe.stretch || 'ok',
      focus: pe.focus || [], quiet: !!pe.quiet, note: pe.healthOk ? (pe.note || '') : '', alerts: pe.healthOk ? (pe.alerts || []).map(function (c) { var a = LANA.ALERTS.filter(function (x) { return x[0] === c; })[0]; return a ? a[1] : c; }) : [], minutes: lnChainMin(pe.chain) };
  });
  var first = b.people[0].alloc[0], v = { id: b.id, q: b.q || b.code, status: b.status, branch: b.branch, people: people,
    start: first.start, seat: { res: first.res, unit: first.unit, code: b.branch + '-' + LANA.RES[first.res][2] + first.unit },
    plannedEnd: Math.max.apply(null, b.people.map(function (pe) { return pe.alloc[pe.alloc.length - 1].end; })),
    ext: b.ext || 0, earlyReq: !!b.earlyReq, upgrade: b.upgrade || null };
  if (b.status === 'inservice') {
    v.svcStart = +b.svcStart; v.end = lnEnd(b);
    v.seats = b.live.map(function (r) { return { label: LANA.RES[r.res][0] + ' ' + r.unit, start: r.start, end: r.end, res: r.res, unit: r.unit, i: r.i, pi: r.pi, scanned: !!r.scanned || r.i === 0, clash: !!r.clash, code: b.branch + '-' + LANA.RES[r.res][2] + r.unit, who: b.people[r.pi] ? b.people[r.pi].name : '', by: r.staffId ? (lnFind(store.staff(), r.staffId) || {}).name || '' : '' }; });
    if (b.handoff) {
      var nx = b.live.filter(function (r) { return !r.scanned && r.i > 0; }).sort(function (x, y) { return x.start - y.start; })[0], cur = b.live.filter(function (r) { return r.scanned; }).pop();
      if (nx) { v.handoff = true; v.seat = { res: nx.res, unit: nx.unit, code: b.branch + '-' + LANA.RES[nx.res][2] + nx.unit }; v.start = nx.start; v.from = b.handoffFrom || ''; v.at = cur ? LANA.RES[cur.res][0] + ' ' + cur.unit : ''; }
    }
    if (withCheck) {
      var copy = JSON.parse(JSON.stringify(b)), all = store.bookings().map(function (x) { return x.id === b.id ? copy : JSON.parse(JSON.stringify(x)); });
      lnAddExt(copy, 1);
      var r = lnTryChange(copy, branch, all, now.min, false);
      v.extPrice = lnBkExtPrice(b); v.canExtend = r.ok; v.extMoves = r.ok && r.moved.length ? (r.moved[0].q || r.moved[0].code) : '';
      v.extBlock = r.ok ? '' : (r.res === 'close' ? 'ร้านปิด 21:00' : r.res === 'crew' ? 'มีลูกค้าจองรอคิวต่อ' : LANA.RES[r.res][0] + ' มีคิวต่อ');
    }
  }
  return v;
}
function apiFeed(me, store, now) {
  var shift = apiOnShift(me, store, now), all = store.bookings(), mine = apiMine(me, store, now);
  var waiting = all.filter(function (b) { return b.branch === me.branch && b.date === now.date && ((b.status === 'inservice' && b.handoff) || (b.status === 'checkedin' && b.people.every(function (pe) { return lnCanDo(me, pe.prog); }))); })
    .sort(function (x, y) { return (y.handoff ? 1 : 0) - (x.handoff ? 1 : 0) || x.people[0].alloc[0].start - y.people[0].alloc[0].start; });
  var done = all.filter(function (b) { return b.date === now.date && ['finished', 'done'].indexOf(b.status) >= 0 && lnInCrew(b, me.id); });
  var pr = apiPayReport(me, store, now), todayJobs = pr.jobs.filter(function (j) { return j.date === now.date; });
  return {
    jobsInApp: !!LN_PUSH.jobsInApp, todayPay: pr.today, todayJobs: todayJobs, dailyMin: pr.dailyMin, topUpToday: pr.topUpToday,
    now: now, me: apiStaffPublic(me), onShift: !!shift, shiftIn: shift ? shift.in : '',
    waiting: shift && !mine ? waiting.map(function (b) { return apiJobView(b, store, now, false); }) : [],
    waitingCount: waiting.length,
    mine: mine ? apiJobView(mine, store, now, true) : null,
    doneToday: done.length,
    board: apiBoard(me.branch, store, now)
  };
}
function apiBoard(branchId, store, now) {
  var br = lnFind(store.branches(), branchId), rows = lnOccupied(store.bookings().filter(function (b) { return b.date === now.date; }), null, now.min), out = [];
  ['wash', 'dry', 'thai', 'oil', 'chair'].forEach(function (res) {
    for (var u = 1; u <= (+br[res] || 0); u++) {
      var cur = rows.filter(function (r) { return r.branch === branchId && r.res === res && r.unit === u && now.min >= r.start && now.min < r.end; })[0];
      var nxt = rows.filter(function (r) { return r.branch === branchId && r.res === res && r.unit === u && r.start > now.min; }).sort(function (x, y) { return x.start - y.start; })[0];
      out.push({ label: LANA.RES[res][0] + ' ' + u, code: branchId + '-' + LANA.RES[res][2] + u, busyUntil: cur ? cur.end : null, next: nxt ? nxt.start : null });
    }
  });
  return out;
}
function apiGet(store, id) { var b = store.bookings().filter(function (x) { return x.id === id; })[0]; if (!b) throw new Error('NOT_FOUND'); return b; }
function apiAccept(me, req, store, now) {
  if (!apiOnShift(me, store, now)) throw new Error('NOT_ON_SHIFT');
  if (apiMine(me, store, now)) throw new Error('HAS_JOB');
  var b = apiGet(store, req.id);
  if (b.branch !== me.branch) throw new Error('OTHER_BRANCH');
  if (b.status === 'inservice' && b.handoff) {   /* next step of a visit another therapist handed over */
    b.handoff = false; b.staffId = me.id; b.staffName = me.name; b.notified = [];
    lnCrewAdd(b, me); store.saveBooking(b); store.log(me.id, b.id, 'accept_step', '');
    return apiFeed(me, store, now);
  }
  if (b.status !== 'checkedin') throw new Error('TAKEN');
  if (!b.people.every(function (pe) { return lnCanDo(me, pe.prog); })) throw new Error('NOT_SKILLED');
  b.status = 'accepted'; b.staffId = me.id; b.staffName = me.name; b.acceptedAt = lnHM(now.min);
  store.saveBooking(b); store.log(me.id, b.id, 'accept', '');
  return apiFeed(me, store, now);
}
function apiStart(me, req, store, now) {
  var b = apiGet(store, req.id);
  if (b.staffId !== me.id || b.status !== 'accepted') throw new Error('NOT_YOURS');
  if (b.branch !== me.branch) throw new Error('OTHER_BRANCH');
  var first = b.people[0].alloc[0], code = String(req.bed || '').trim().toUpperCase(), m = /^([A-Z]+)-([WDTCO])(\d+)$/.exec(code);
  if (!m || m[1] !== b.branch) throw new Error('BAD_BED');
  var res = { W: 'wash', D: 'dry', T: 'thai', C: 'chair', O: 'oil' }[m[2]];
  if (lnKinds((b.people[0].chain[0] || first).res).indexOf(res) < 0) throw new Error('WRONG_BED_TYPE');
  var br = lnFind(store.branches(), b.branch), all = store.bookings();
  if (+m[3] < 1 || +m[3] > (+br[res] || 0)) throw new Error('BAD_BED');
  b.svcStart = now.min;
  if (b.endCap) b.people.forEach(function (pe) { pe.cut = Math.max(0, now.min + lnChainMin(pe.chain) - b.endCap); });
  b.people[0].alloc[0] = Object.assign({}, first, { res: res, unit: +m[3] });
  /* the guest who is here now goes first: only a guest physically on a seat blocks it; later guests planned on it
     are re-seated (or pick a free seat when their turn comes) */
  var others = lnOccupied(all, b.id, now.min).filter(function (row) { var x = lnFind(all, row.bid); return row.res !== first.res || (x && x.status === 'inservice'); });
  var built = lnBuildLive(b, br, others, now.min, true), r = { ok: built.ok, moved: [] };
  if (built.ok) {
    b.live = built.live;
  }
  if (!r.ok) { b.svcStart = ''; b.people[0].alloc[0] = first; throw new Error('BED_BUSY'); }
  if (b.live[0].unit !== +m[3] || b.live[0].clash) { b.svcStart = ''; b.live = []; b.people[0].alloc[0] = first; throw new Error('BED_BUSY'); }
  r.moved = lnReseat(b, br, all);
  if (req.hair && req.hair !== 'ok') {
    var order = LANA.HAIR.map(function (h) { return h.id; }), from = b.people[0].hair || 'short';
    if (order.indexOf(req.hair) > order.indexOf(from)) b.upgrade = { from: from, to: req.hair, state: 'pending' };
  }
  b.status = 'inservice';
  b.live.forEach(function (row) { if (row.i === 0) { row.scanned = true; row.scannedAt = now.min; row.staffId = me.id; } });
  lnCrewAdd(b, me);
  store.saveBooking(b); if (r.moved) r.moved.forEach(function (x) { store.saveBooking(x); });
  store.log(me.id, b.id, 'start', code + (b.upgrade ? ' hair:' + b.upgrade.to : ''));
  return apiFeed(me, store, now);
}
function apiExtend(me, req, store, now) {
  var b = apiGet(store, req.id);
  if (b.staffId !== me.id || b.status !== 'inservice') throw new Error('NOT_YOURS');
  var br = lnFind(store.branches(), b.branch), all = store.bookings();
  lnAddExt(b, 1);
  var r = lnTryChange(b, br, all, now.min, true);
  if (!r.ok) { lnAddExt(b, -1); throw new Error(r.res === 'close' ? 'CLOSING' : r.res === 'crew' ? 'NO_CREW' : 'NO_ROOM'); }
  b.ext = (b.ext || 0) + 1;
  b.due = b.due || []; b.due.push({ kind: 'ext', th: 'ต่อเวลา 30 นาที', en: 'Extra 30 min', amount: lnBkExtPrice(b) });
  store.saveBooking(b); r.moved.forEach(function (x) { store.saveBooking(x); });
  store.log(me.id, b.id, 'extend', r.moved.length ? 'moved ' + (r.moved[0].q || r.moved[0].code) : '');
  return apiFeed(me, store, now);
}
/* hand the guest to the next free therapist for the next step (e.g. massage done -> someone else washes) */
function apiHandoff(me, req, store, now) {
  var b = apiGet(store, req.id);
  if (b.staffId !== me.id || b.status !== 'inservice') throw new Error('NOT_YOURS');
  if (!(b.live || []).some(function (r) { return !r.scanned && r.i > 0; })) throw new Error('NO_NEXT_STEP');
  b.handoff = true; b.handoffFrom = me.name; b.handoffAt = now.min; b.staffId = ''; b.staffName = ''; b.notified = []; b.notifyAt = '';
  store.saveBooking(b); store.log(me.id, b.id, 'handoff', lnHM(now.min));
  return apiFeed(me, store, now);
}
function lnCrewAdd(b, s) { b.crew = b.crew || []; if (!b.crew.some(function (c) { return c.id === s.id; })) b.crew.push({ id: s.id, name: s.name }); }
function lnInCrew(b, id) { return b.staffId === id || (b.crew || []).some(function (c) { return c.id === id; }) || (b.live || []).some(function (r) { return r.staffId === id; }); }
/* give an accepted job back to the queue (it cannot start yet, or the therapist must leave) */
function apiRelease(me, req, store, now) {
  var b = apiGet(store, req.id);
  if (b.staffId !== me.id || b.status !== 'accepted') throw new Error('NOT_YOURS');
  b.status = 'checkedin'; b.staffId = ''; b.staffName = ''; b.acceptedAt = '';
  store.saveBooking(b); store.log(me.id, b.id, 'release', lnHM(now.min));
  return apiFeed(me, store, now);
}
/* after a guest takes a seat early or late, move not-yet-started guests planned on the same seats to another free seat at the same time */
function lnReseat(b, br, all) {
  var moved = [];
  all.forEach(function (x) {
    if (x.id === b.id || x.branch !== b.branch || x.date !== b.date || ['booked', 'checkedin', 'accepted'].indexOf(x.status) < 0) return;
    var hit = x.people.some(function (pe) { return pe.alloc.some(function (a) { return b.live.some(function (r) { return r.res === a.res && r.unit === a.unit && a.start < r.end + LANA.BUFFER && r.start < a.end + LANA.BUFFER; }); }); });
    if (!hit) return;
    var rows = lnOccupied(all, x.id).filter(function (row) { return row.bid !== b.id; }).concat(b.live);
    var alt = lnAllocate(br, x.date, x.people[0].alloc[0].start, x.people.map(function (pe) { return pe.chain; }), rows);
    if (alt) { x.people.forEach(function (pe, j) { pe.alloc = alt[j]; }); moved.push(x); }
  });
  return moved;
}
/* next step of the visit (e.g. wash bed -> dryer): scan the chair's QR when it is time to move */
function apiMove(me, req, store, now) {
  var b = apiGet(store, req.id);
  if (b.staffId !== me.id || b.status !== 'inservice') throw new Error('NOT_YOURS');
  var code = String(req.bed || '').trim().toUpperCase(), m = /^([A-Z]+)-([WDTCO])(\d+)$/.exec(code);
  if (!m || m[1] !== b.branch) throw new Error('BAD_BED');
  var res = { W: 'wash', D: 'dry', T: 'thai', C: 'chair', O: 'oil' }[m[2]], unit = +m[3];
  if (unit < 1 || unit > (+(lnFind(store.branches(), b.branch) || {})[res] || 0)) throw new Error('BAD_BED');
  /* the therapist can move as soon as the current step is done, even before the planned time */
  var next = b.live.filter(function (r) { return !r.scanned && r.i > 0; }).sort(function (x, y) { return x.start - y.start; });
  if (!next.length) throw new Error('NOT_YET');
  var seen = {}, firsts = next.filter(function (x) { if (seen[x.pi]) return false; seen[x.pi] = 1; return true; });
  var r = firsts.filter(function (x) { var pe = b.people[x.pi], c = pe && pe.chain && pe.chain[x.i]; return lnKinds(c ? c.res : x.res).indexOf(res) >= 0; })[0];
  if (!r) throw new Error('WRONG_BED_TYPE');
  var others = lnOccupied(store.bookings(), b.id, now.min), len = r.end - r.start;
  if (!lnUnitFree(others, b.branch, b.date, res, unit, now.min, now.min + len)) throw new Error('BED_BUSY');
  var keep = JSON.stringify(b.live);
  /* the previous step really ended now (early or late); this one really starts now on the scanned seat */
  lnDropExt(b, b.live.filter(function (x) { return x.pi === r.pi && x.i === r.i - 1 && x.end > now.min; }), now.min);
  b.live.forEach(function (x) { if (x.pi === r.pi && x.i === r.i - 1) x.end = Math.max(+x.start + 1, now.min); });
  r.res = res; r.unit = unit; r.start = now.min; r.end = now.min + len; r.scanned = true; r.scannedAt = now.min; r.staffId = me.id; delete r.clash;
  var br = lnFind(store.branches(), b.branch), rb = lnBuildLive(b, br, others, now.min, true);
  if (!rb.ok) { b.live = JSON.parse(keep); throw new Error('BED_BUSY'); }
  b.live = rb.live;
  lnReseat(b, br, store.bookings()).forEach(function (x) { store.saveBooking(x); });
  store.saveBooking(b); store.log(me.id, b.id, 'move', code);
  return apiFeed(me, store, now);
}
function apiFinish(me, req, store, now) {
  var b = apiGet(store, req.id);
  if (b.staffId !== me.id || b.status !== 'inservice') throw new Error('NOT_YOURS');
  var end = lnEnd(b);
  var left = (b.live || []).filter(function (r) { return !r.scanned && r.i > 0; });
  if (left.length && !req.skip) throw new Error('NEXT_STEP');
  if (now.min < end && !b.earlyReq && !req.skip) throw new Error('TOO_EARLY');
  if (req.skip && now.min < end) lnDropExt(b, (b.live || []).filter(function (r) { return r.pi === 0 && r.end > now.min; }), now.min);   /* unused extra time is not charged */
  if (req.skip) { b.earlyByStaff = true; store.log(me.id, b.id, 'early_by_staff', lnHM(now.min) + ' / end ' + lnHM(end) + (left.length ? ' / skip ' + left.map(function (r) { return r.res + r.unit; }).join(',') : '')); }
  b.status = 'finished'; b.finishedAt = now.min;
  store.saveBooking(b); store.log(me.id, b.id, 'finish', lnHM(now.min) + ' / end ' + lnHM(end)); lnAutoDone(store, now);
  return apiFeed(me, store, now);
}
/* guaranteed minimum per day for part-timers on days they clocked in: the shop tops their pay (without tips) up to DAILY_MIN */
function lnTopUp(store, staff, date, fee) {
  if (!LANA.DAILY_MIN || !staff || staff.type === 'FT') return 0;
  if (!store.shifts().some(function (r) { return r.staffId === staff.id && r.date === date; })) return 0;
  return Math.max(0, Math.round((LANA.DAILY_MIN - fee) * 100) / 100);
}
function apiPayReport(me, store, now) {
  var mine = store.bookings().filter(function (b) { return ['finished', 'done'].indexOf(b.status) >= 0 && lnInCrew(b, me.id); });
  var days = {}, fees = {}, out = [];
  mine.forEach(function (b) {
    var p = lnPayShare(b, me), held = !!b.flagged;
    out.push({ date: b.date, q: b.q || b.code, prog: (lnFind(LANA.PROGRAMS, b.people[0].prog) || {}).name_th, lines: p.lines, total: p.total, held: held, status: b.status });
    if (!held) { days[b.date] = (days[b.date] || 0) + p.total; fees[b.date] = (fees[b.date] || 0) + p.total - (p.tip || 0); }
  });
  store.shifts().forEach(function (r) { if (r.staffId === me.id && !(r.date in fees)) { fees[r.date] = 0; days[r.date] = days[r.date] || 0; } });
  /* past days: top-up is final; today: shown as "so far" */
  Object.keys(fees).forEach(function (d) {
    var tu = lnTopUp(store, me, d, fees[d]);
    if (tu && d < now.date) { days[d] += tu; out.push({ date: d, q: '', prog: 'ประกันค่ามือขั้นต่ำวันละ ' + LANA.DAILY_MIN, lines: [{ label: 'ร้านเติมให้ครบ ' + LANA.DAILY_MIN, amount: tu }], total: tu, held: false, status: 'topup' }); }
  });
  out.sort(function (x, y) { return x.date < y.date ? 1 : -1; });
  var feeToday = fees[now.date] || 0, tuToday = lnTopUp(store, me, now.date, feeToday);
  return { me: apiStaffPublic(me), today: days[now.date] || 0, jobs: out.slice(0, 40), byDay: days, dailyMin: me.type === 'FT' ? 0 : LANA.DAILY_MIN, topUpToday: tuToday };
}

/* ===== LINE ALERTS (run every minute by a time trigger; the demo runs it on every clock step) =====
   Saves messages: a new job goes first to the PUSH_FIRST idle therapists with the fewest jobs today,
   after PUSH_WAIT minutes nobody took it -> the rest of the idle ones. One 10-minute warning per job end.
   Returns [{ staffId, to, kind, text, bookingId }] for store.push(). */
var LN_PUSH = { FIRST: 2, WAIT: 2, WARN: 10, warnOn: true, moveOn: true, jobsInApp: false };   /* jobsInApp false: jobs are taken at the station tablet; the LINE app is for clock in/out and pay */
/* everyone still clocked in at 22:00 (or from an earlier day) is clocked out by the system */
var LN_AUTO_OUT = 22 * 60;
function lnAutoClockOut(store, now) {
  var n = 0;
  store.shifts().forEach(function (r) {
    if (r.out || !(r.date < now.date || now.min >= LN_AUTO_OUT)) return;
    r.out = lnHM(LN_AUTO_OUT); r.outNote = 'ระบบออกงานให้อัตโนมัติ'; store.updateShift(r); store.log(r.staffId, '', 'auto_clock_out', r.date); n++;
  });
  return n;
}
function staffTick(store, now) {
  lnAutoClockOut(store, now);
  lnStationTick(store, now); lnAutoDone(store, now);
  /* a job from an earlier day that nobody ended (therapist forgot to press finish): close it so it does not block anyone */
  store.bookings().forEach(function (b) {
    if (b.date >= now.date) return;
    if (b.status === 'inservice') {
      b.status = 'finished'; b.finishedAt = lnEnd(b) || +b.svcStart || 0; b.autoFinished = true; store.saveBooking(b); store.log(b.staffId || '', b.id, 'auto_finish', 'not ended on ' + b.date);
    }
    if (b.status === 'finished') {
      /* served but never checked out at the kiosk (nothing to pay, or walked out): close it so tickets count as used */
      var dueAmt = lnSum(b.due || []); cCheckoutDone(store, b, now); b.paidDue = !(dueAmt > 0); b.autoClosed = true; store.saveBooking(b);
      if (dueAmt > 0) store.log(b.staffId || '', b.id, 'UNPAID_EXTRAS', b.date + ' ' + (b.q || '') + ' ' + dueAmt);
    } else if (b.status === 'checkedin' || b.status === 'accepted') {
      /* checked in but never served that day: give the ticket back (members) or flag a refund (guests without an account) */
      b.status = 'cancelled'; b.unserved = true; store.saveBooking(b);
      (b.tix || []).forEach(function (id) { var k = lnFind(store.tickets(), id); if (k && k.status === 'booked') { k.status = k.memberId ? 'active' : 'void'; k.bookingId = ''; store.saveTicket(k); } });
      store.log(b.staffId || '', b.id, b.memberId ? 'UNSERVED_TICKET_RETURNED' : 'UNSERVED_REFUND_NEEDED', b.date + ' ' + (b.q || ''));
    }
  });
  var out = [], all = store.bookings().filter(function (b) { return b.date === now.date; }), staff = store.staff();
  var busy = {}, jobs = {};
  all.forEach(function (b) {
    if (b.status === 'accepted' || b.status === 'inservice') busy[b.staffId] = 1;
    if (b.status === 'finished' || b.status === 'done') jobs[b.staffId] = (jobs[b.staffId] || 0) + 1;
  });
  var onShift = {}; store.shifts().forEach(function (r) { if (r.date === now.date && !r.out) onShift[r.staffId] = 1; });
  all.forEach(function (b) {
    if (!LN_PUSH.jobsInApp || b.auto) return;   /* station mode: no job / move / warning messages in LINE */
    if (b.status === 'checkedin' || (b.status === 'inservice' && b.handoff)) {
      var start = b.handoff ? now.min : b.people[0].alloc[0].start;
      if (start - now.min > 15) return; /* booked guest who checked in very early: wait until 15 min before */
      var free = staff.filter(function (s) {
        return String(s.active).toUpperCase() === 'TRUE' && s.branch === b.branch && onShift[s.id] && !busy[s.id] && s.lineUserId &&
          b.people.every(function (pe) { return lnCanDo(s, pe.prog); });
      }).sort(function (x, y) { return (jobs[x.id] || 0) - (jobs[y.id] || 0); });
      var sent = b.notified || [], fresh = free.filter(function (s) { return sent.indexOf(s.id) < 0; });
      if (!fresh.length) return;
      if (!sent.length) { fresh = fresh.slice(0, LN_PUSH.FIRST); b.notifyAt = now.min; }
      else if (now.min - (+b.notifyAt || 0) < LN_PUSH.WAIT) return;
      var pe = b.people[0], prog = lnFind(LANA.PROGRAMS, pe.prog) || {}, more = b.people.length > 1 ? ' (+' + (b.people.length - 1) + ' คน)' : '';
      var nxs = b.handoff ? b.live.filter(function (r) { return !r.scanned && r.i > 0; }).sort(function (x, y) { return x.start - y.start; })[0] : null;
      var text = b.handoff && nxs ? 'ส่งต่อขั้น' + LANA.RES[nxs.res][0] + ' ' + (b.q || b.code) + ' · ลูกค้ารออยู่ (จาก ' + (b.handoffFrom || '') + ')\nแตะเพื่อเปิดแอปแล้วกดรับงาน'
        : 'มีลูกค้ารอ ' + (b.q || b.code) + ' · ' + (prog.name_th || pe.prog) + more + ' · ' + lnChainMin(pe.chain) + ' นาที\nแตะเพื่อเปิดแอปแล้วกดรับงาน';
      fresh.forEach(function (s) { out.push({ staffId: s.id, to: s.lineUserId, kind: 'job', text: text, bookingId: b.id }); });
      b.notified = sent.concat(fresh.map(function (s) { return s.id; }));
      store.saveBooking(b);
    } else if (b.status === 'inservice' && LN_PUSH.moveOn && (b.live || []).some(function (r) { return !r.scanned && r.i > 0 && r.start - now.min <= 1 && (b.movePushed || []).indexOf(r.pi + ':' + r.i) < 0; })) {
      var mv = b.live.filter(function (r) { return !r.scanned && r.i > 0 && r.start - now.min <= 1 && (b.movePushed || []).indexOf(r.pi + ':' + r.i) < 0; })[0], sm = lnFind(staff, b.staffId);
      b.movePushed = (b.movePushed || []).concat([mv.pi + ':' + mv.i]); store.saveBooking(b);
      if (sm && sm.lineUserId) out.push({ staffId: sm.id, to: sm.lineUserId, kind: 'move', text: 'ถึงเวลาย้าย ' + (b.q || b.code) + ' ไป' + LANA.RES[mv.res][0] + ' ' + mv.unit + '\nเปิดแอปแล้วสแกน QR ที่' + LANA.RES[mv.res][0], bookingId: b.id });
    } else if (b.status === 'inservice' && LN_PUSH.warnOn) {
      var end = lnEnd(b), left = end - now.min, s = lnFind(staff, b.staffId);
      if (left > LN_PUSH.WARN || left <= 0 || +b.warned === end || !s || !s.lineUserId) return;
      out.push({ staffId: s.id, to: s.lineUserId, kind: 'warn', text: 'อีก ' + left + ' นาทีครบเวลา ' + (b.q || b.code) + ' (' + lnHM(end) + ')\nถามลูกค้าว่าอยากต่อเวลาไหม', bookingId: b.id });
      b.warned = end; store.saveBooking(b);
    }
  });
  return out;
}
/* ===== END API ===== */

/* ===== OWNER REPORTS: daily totals per branch, and what to pay each therapist =====
   Pure function (works in the demo and in Apps Script). Dates are 'yyyy-MM-dd'. */
function lnReports(store) {
  var days = {}, pay = {}, staff = store.staff(), bks = store.bookings();
  function D(date, br) { var k = date + '|' + br; return days[k] = days[k] || { date: date, branch: br, guests: 0, walkin: 0, line: 0, noshow: 0, unserved: 0, sWalk: 0, sBook: 0, sCourse: 0, sExtra: 0, tips: 0, payroll: 0 }; }
  function items(o) { var it = o.items; if (typeof it === 'string') { try { it = JSON.parse(it); } catch (e) { it = []; } } return it || []; }
  bks.forEach(function (b) {
    if (b.status === 'finished' || b.status === 'done') {
      var d = D(b.date, b.branch); d.guests += b.people.length; if (b.kiosk) d.walkin += b.people.length; else d.line += b.people.length;
      var crewIds = (b.crew && b.crew.length ? b.crew.map(function (c) { return c.id; }) : [b.staffId]);
      crewIds.forEach(function (sid) {
      var s = lnFind(staff, sid);
      if (s) {
        var p = lnPayShare(b, s), tip = p.tip || 0, k = b.date + '|' + s.id;
        var P = pay[k] = pay[k] || { date: b.date, branch: b.branch, staffId: s.id, name: s.name, type: s.type === 'FT' ? 'ประจำ' : 'พาร์ทไทม์', jobs: 0, fee: 0, tips: 0, held: 0, early: 0, waiting: 0 };
        P.jobs++;
        if (b.flagged) P.held += p.total; else { P.fee += p.total - tip; P.tips += tip; d.payroll += p.total; }
        if (b.earlyByStaff) P.early++;
        if (b.status === 'finished') P.waiting++;   /* guest has not checked out yet: extension/tip not counted until they pay */
      }
      });
    } else if (b.status === 'noshow') D(b.date, b.branch).noshow += b.people.length;
    else if (b.status === 'cancelled' && b.unserved) D(b.date, b.branch).unserved += b.people.length;
  });
  store.orders().forEach(function (o) {
    if (o.status !== 'paid' || !o.paidAt) return;
    var date = String(o.paidAt).slice(0, 10), b = o.bookingId ? lnFind(bks, o.bookingId) : null, d = D(date, b ? b.branch : 'LINE');
    if (o.kind === 'walkin') d.sWalk += +o.amount;
    else if (o.kind === 'book') d.sBook += +o.amount;
    else if (o.kind === 'buy' || o.kind === 'upcourse') d.sCourse += +o.amount;
    else if (o.kind === 'refund') d.sWalk += +o.amount;   /* negative */
    else if (o.kind === 'checkout') { var tip = items(o).reduce(function (t, it) { return t + (it && it.en === 'Tip' ? +it.amount || 0 : 0); }, 0); d.tips += tip; d.sExtra += +o.amount - tip; }
  });
  /* daily guarantee for part-timers who clocked in (also on days with no job) */
  store.shifts().forEach(function (r) { var s = lnFind(staff, r.staffId), k = r.date + '|' + r.staffId; if (!s || s.type === 'FT' || pay[k]) return;
    pay[k] = { date: r.date, branch: s.branch, staffId: s.id, name: s.name, type: 'พาร์ทไทม์', jobs: 0, fee: 0, tips: 0, held: 0, early: 0, waiting: 0 }; });
  Object.keys(pay).forEach(function (k) { var P = pay[k], s = lnFind(staff, P.staffId), tu = lnTopUp(store, s, P.date, P.fee);
    P.topup = tu; if (tu) { P.fee += tu; D(P.date, P.branch).payroll += tu; } });
  var dl = Object.keys(days).map(function (k) { return days[k]; }).sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : a.branch < b.branch ? -1 : 1; });
  var pl = Object.keys(pay).map(function (k) { return pay[k]; }).sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : a.name < b.name ? -1 : 1; });
  return { daily: dl, pay: pl };
}

/* ===== OWNER PAGE: sales by month and by day, per branch (or all). Needs the owner password (Script Property OWNER_KEY). ===== */
function ownerApi(req, store, now) {
  var k = store.ownerKey ? store.ownerKey() : '';
  if (!k || String(req.key || '') !== String(k)) throw new Error('OWNER_KEY');
  var brs = store.branches().map(function (b) { return { id: b.id, name: b.name_th || b.id }; });
  if (req.action === 'oInit') return { branches: brs, today: now.date, month: now.date.slice(0, 7) };
  var br = String(req.branch || 'ALL'), bks = store.bookings(), staff = store.staff(), members = store.members();
  function items(o) { var it = o.items; if (typeof it === 'string') { try { it = JSON.parse(it); } catch (e) { it = []; } } return it || []; }
  function tipOf(o) { return items(o).reduce(function (t, x) { return t + (x && x.en === 'Tip' ? +x.amount || 0 : 0); }, 0); }
  function brOf(o) { var b = o.bookingId ? lnFind(bks, o.bookingId) : null; return b ? b.branch : 'LINE'; }
  function inBr(id) { return br === 'ALL' || id === br; }
  function who(o, b) { var m = o && o.memberId ? lnFind(members, o.memberId) : b && b.memberId ? lnFind(members, b.memberId) : null; return m ? m.name : b ? b.people.map(function (p) { return p.name; }).join(', ') : ''; }
  var PAYM = { cash: 'เงินสด', card: 'บัตร (เครื่องรูด)' };
  var KIND = { refund: 'คืนเงิน', walkin: 'หน้าร้าน', book: 'จองใน LINE', buy: 'ซื้อคอร์ส', upcourse: 'อัปเป็นคอร์ส', checkout: 'ส่วนเพิ่มตอนจบ' };
  function what(o, b) {
    var p = lnFind(LANA.PROGRAMS, o.prog || (b && b.people[0].prog)) || {}, n = +o.count || 1;
    if (o.kind === 'buy' || o.kind === 'upcourse' || (o.kind === 'walkin' && n > 1)) return (p.name_th || '') + ' คอร์ส ' + n + ' ครั้ง';
    if (o.kind === 'walkin' || o.kind === 'book') return (p.name_th || '') + (b && b.people.length > 1 ? ' × ' + b.people.length + ' คน' : '') + (o.kind === 'book' ? ' (ส่วนเพิ่มตอนจอง)' : '');
    var parts = items(o).filter(function (x) { return x && x.en !== 'Tip'; }).map(function (x) { return x.th; });
    return parts.join(' + ') || 'ทิป';
  }
  var paid = store.orders().filter(function (o) { return o.status === 'paid' && o.paidAt && inBr(brOf(o)); });
  var pay = lnReports(store).pay.filter(function (p) { return inBr(p.branch); });
  if (req.action === 'oMonth') {
    var mon = String(req.month || now.date.slice(0, 7)), days = {}, sum = { sales: 0, tips: 0, bills: 0, guests: 0, payroll: 0, walkin: 0, book: 0, course: 0, extra: 0 };
    paid.forEach(function (o) {
      if (String(o.paidAt).slice(0, 7) !== mon) return;
      var d = String(o.paidAt).slice(0, 10), tip = tipOf(o), net = +o.amount - tip;
      days[d] = (days[d] || 0) + net; sum.sales += net; sum.tips += tip; sum.bills++;
      if (o.kind === 'walkin') sum.walkin += net; else if (o.kind === 'book') sum.book += net; else if (o.kind === 'checkout') sum.extra += net; else sum.course += net;
    });
    bks.forEach(function (b) { if (inBr(b.branch) && b.date.slice(0, 7) === mon && (b.status === 'finished' || b.status === 'done')) sum.guests += b.people.length; });
    pay.forEach(function (p) { if (p.date.slice(0, 7) === mon) sum.payroll += p.fee + p.tips; });
    var prev = mon.split('-'), py = +prev[0], pm = +prev[1] - 1; if (!pm) { pm = 12; py--; }
    var pmon = py + '-' + (pm < 10 ? '0' : '') + pm, prevSales = 0;
    paid.forEach(function (o) { if (String(o.paidAt).slice(0, 7) === pmon) prevSales += +o.amount - tipOf(o); });
    sum.payroll = Math.round(sum.payroll);
    return { month: mon, sum: sum, prevSales: prevSales, days: Object.keys(days).sort().map(function (d) { return { date: d, sales: days[d] }; }) };
  }
  if (req.action === 'oDay') {
    var date = String(req.date || now.date), rows = [], paidVisit = {};
    paid.forEach(function (o) {
      if (String(o.paidAt).slice(0, 10) !== date) return;
      var b = o.bookingId ? lnFind(bks, o.bookingId) : null, tip = tipOf(o);
      if (b && (o.kind === 'walkin' || o.kind === 'book')) paidVisit[b.id] = 1;
      rows.push({ time: String(o.paidAt).slice(11, 16), name: who(o, b), what: what(o, b), kind: KIND[o.kind] || o.kind, branch: brOf(o), amount: +o.amount - tip, tip: tip, q: b ? b.q || '' : '', pay: o.kind === 'refund' ? 'คืนเงิน' : PAYM[o.method] || 'Beam', by: o.paidBy ? ((lnFind(staff, o.paidBy) || {}).name || o.paidBy) : '' });
    });
    /* visits paid earlier with a course ticket: no money today, listed so the day is complete */
    bks.forEach(function (b) {
      if (!inBr(b.branch) || b.date !== date || paidVisit[b.id] || (b.status !== 'finished' && b.status !== 'done')) return;
      var p = lnFind(LANA.PROGRAMS, b.people[0].prog) || {};
      if (b.kiosk && !(b.tix || []).length) return;
      rows.push({ time: b.checkedAt || lnHM(+b.svcStart || 0), name: who(null, b), what: (p.name_th || '') + (b.people.length > 1 ? ' × ' + b.people.length + ' คน' : ''), kind: 'ใช้ตั๋วคอร์ส', branch: b.branch, amount: 0, tip: 0, q: b.q || '' });
    });
    rows.sort(function (a, b) { return a.time < b.time ? -1 : 1; });
    var tot = { sales: 0, tips: 0, bills: 0, byKind: {} };
    tot.byPay = {}; rows.forEach(function (r) { tot.sales += r.amount; tot.tips += r.tip; if (r.amount > 0 || r.tip) tot.bills++; tot.byKind[r.kind] = (tot.byKind[r.kind] || 0) + r.amount; if (r.pay) tot.byPay[r.pay] = (tot.byPay[r.pay] || 0) + r.amount + r.tip; });
    var guests = 0; bks.forEach(function (b) { if (inBr(b.branch) && b.date === date && (b.status === 'finished' || b.status === 'done')) guests += b.people.length; });
    var dayPay = pay.filter(function (p) { return p.date === date; }).map(function (p) { return { name: p.name, jobs: p.jobs, fee: Math.round(p.fee), tips: p.tips, total: Math.round(p.fee + p.tips) }; });
    tot.payroll = dayPay.reduce(function (t, p) { return t + p.total; }, 0);
    var att = store.shifts().filter(function (r) { var s = lnFind(staff, r.staffId); return r.date === date && s && inBr(s.branch); }).map(function (r) {
      var s = lnFind(staff, r.staffId), a = toMinHM(r.in), z = r.out ? toMinHM(r.out) : (date === now.date ? now.min : 0);
      return { name: s.name, branch: s.branch, inAt: r.in, outAt: r.out || '', open: !r.out, auto: !!r.outNote, photo: String(r.photo || ''), via: r.inDistance === 'station' ? 'ipad' : 'app', hours: z > a ? Math.round((z - a) / 6) / 10 : 0 };
    }).sort(function (x, y) { return x.inAt < y.inAt ? -1 : 1; });
    return { date: date, rows: rows, total: tot, guests: guests, staff: dayPay, att: att };
  }
  if (req.action === 'oPay') {
    /* pay for a date range: total per therapist, and every job line */
    var from = String(req.from || now.date), to = String(req.to || from), people = {}, list = [];
    bks.forEach(function (b) {
      if (!inBr(b.branch) || b.date < from || b.date > to || (b.status !== 'finished' && b.status !== 'done')) return;
      var ids = b.crew && b.crew.length ? b.crew.map(function (c) { return c.id; }) : [b.staffId];
      var p0 = lnFind(LANA.PROGRAMS, b.people[0].prog) || {};
      ids.forEach(function (sid) {
        var s = lnFind(staff, sid); if (!s) return;
        var p = lnPayShare(b, s), tip = p.tip || 0, fee = Math.round((p.total - tip) * 100) / 100, held = !!b.flagged;
        var P = people[s.id] = people[s.id] || { id: s.id, name: s.name, type: s.type === 'FT' ? 'ประจำ' : 'พาร์ทไทม์', jobs: 0, fee: 0, tips: 0, held: 0 };
        P.jobs++; if (held) P.held += p.total; else { P.fee += fee; P.tips += tip; }
        var STEP = { thai: 'นวด', wash: 'สระ', dry: 'ได', chair: 'นวด' }, did = [];
        (b.live || []).forEach(function (r) { if (r.staffId === sid && did.indexOf(STEP[r.res]) < 0) did.push(STEP[r.res]); });
        list.push({ date: b.date, time: b.checkedAt || lnHM(+b.svcStart || 0), q: b.q || b.code, what: (p0.name_th || '') + (b.people.length > 1 ? ' × ' + b.people.length + ' คน' : ''),
          steps: p.shared > 1 ? did.join(' + ') : '', shared: p.shared || 1,
          name: s.name, sid: s.id, fee: fee, tip: tip, held: held, waiting: b.status === 'finished', early: !!b.earlyByStaff, lines: p.lines });
      });
    });
    /* daily guarantee top-ups (days already over) */
    var dayFee = {};
    list.forEach(function (x) { if (!x.held) { var k = x.date + '|' + x.sid; dayFee[k] = (dayFee[k] || 0) + x.fee; } });
    store.shifts().forEach(function (r) {
      var s = lnFind(staff, r.staffId); if (!s || s.type === 'FT' || !inBr(s.branch) || r.date < from || r.date > to || r.date >= now.date) return;
      var k = r.date + '|' + s.id; if (dayFee[k] === -1) return;
      var tu = lnTopUp(store, s, r.date, dayFee[k] || 0); dayFee[k] = -1; if (!tu) return;
      var P = people[s.id] = people[s.id] || { id: s.id, name: s.name, type: 'พาร์ทไทม์', jobs: 0, fee: 0, tips: 0, held: 0 };
      P.fee += tu; P.topup = (P.topup || 0) + tu;
      list.push({ date: r.date, time: '22:00', q: '', what: 'ประกันค่ามือขั้นต่ำ ' + LANA.DAILY_MIN + ' (ร้านเติมให้ครบ)', steps: '', shared: 1, name: s.name, sid: s.id, fee: tu, tip: 0, held: false, waiting: false, early: false, topup: true, lines: [] });
    });
    list.sort(function (a, b) { return a.date === b.date ? (a.time < b.time ? -1 : 1) : a.date < b.date ? -1 : 1; });
    var ppl = Object.keys(people).map(function (k) { var x = people[k]; x.fee = Math.round(x.fee); x.total = Math.round(x.fee + x.tips); return x; }).sort(function (a, b) { return b.total - a.total; });
    return { from: from, to: to, people: ppl, list: list, total: ppl.reduce(function (t, x) { return t + x.total; }, 0) };
  }
  if (req.action === 'oPerson') {
    /* one person over a period: pay, tips, days worked, minutes late (vs their start time), and every job */
    var who = lnFind(staff, req.id); if (!who) throw new Error('NOT_FOUND');
    var pf = String(req.from || now.date), pt = String(req.to || pf);
    var all = ownerApi({ action: 'oPay', key: req.key, branch: req.branch, from: pf, to: pt }, store, now);
    var me = all.people.filter(function (x) { return x.id === who.id; })[0] || { fee: 0, tips: 0, total: 0, jobs: 0, held: 0, topup: 0 };
    var startAt = String(who.start || '').trim() ? toMinHM(who.start) : (who.type === 'FT' ? LANA.OPEN : null);
    var byDay = {}, ipad = 0, app = 0;
    store.shifts().forEach(function (r) { if (r.staffId !== who.id || r.date < pf || r.date > pt) return;
      var a = toMinHM(r.in), z = r.out ? toMinHM(r.out) : (r.date === now.date ? now.min : a), d = byDay[r.date] = byDay[r.date] || { date: r.date, inAt: r.in, first: a, mins: 0, outAt: '', photo: String(r.photo || ''), via: r.inDistance === 'station' ? 'ipad' : 'app' };
      if (r.inDistance === 'station') ipad++; else app++;
      if (a < d.first) { d.first = a; d.inAt = r.in; d.photo = String(r.photo || ''); d.via = r.inDistance === 'station' ? 'ipad' : 'app'; } d.mins += Math.max(0, z - a); d.outAt = r.out || d.outAt; });
    var days = Object.keys(byDay).sort().map(function (k) { var d = byDay[k], late = startAt == null ? 0 : Math.max(0, d.first - startAt);
      return { date: d.date, inAt: d.inAt, outAt: d.outAt, hours: Math.round(d.mins / 6) / 10, late: late, photo: d.photo, via: d.via }; });
    var lateDays = days.filter(function (d) { return d.late > 0; });
    return { from: pf, to: pt, person: { id: who.id, name: who.name, type: who.type === 'FT' ? 'ประจำ' : 'พาร์ทไทม์', start: startAt == null ? '' : lnHM(startAt) },
      fee: me.fee, tips: me.tips, total: me.total, topup: Math.round(me.topup || 0), held: me.held, jobs: me.jobs,
      worked: days.length, lateMin: lateDays.reduce(function (t, d) { return t + d.late; }, 0), lateDays: lateDays.length, days: days, ipadIns: ipad, appIns: app, photoFolder: store.photoFolderUrl ? store.photoFolderUrl() : '',
      list: all.list.filter(function (x) { return x.sid === who.id; }) };
  }
  throw new Error('BAD_ACTION');
}

/* ===== JOB STATION: one tablet (with a receipt printer) where therapists tap a job, tap their name, and print the job slip.
   Accepting starts the visit; the steps (massage -> wash -> dry) and the end run by the clock.
   From "bed status" a step can be handed back to the shared queue, extended, or ended early. Auth: the counter tablet password. ===== */
var LN_UNDO_MIN = 15;   /* minutes after taking a job when it can still be put back */
/* ---------- guest changes their mind after check-in (before the job starts) ----------
   ticket from their wallet: goes back. paid at the kiosk today: refund (shop hands the money back), or keep it as a ticket for next time (members only, 90 days; add-ons refunded) */
function stDropOne(store, br, id) {
  var b = lnFind(store.bookings(), id); if (!b || b.branch !== br.id) throw new Error('NOT_FOUND');
  if (b.status !== 'checkedin' || (b.live || []).some(function (r) { return r.scanned; })) throw new Error('NOT_NOW');
  return b;
}
function stDropInfo(store, b) {
  var o = b.orderId ? lnFind(store.orders(), b.orderId) : null, paid = o && o.status === 'paid' ? +o.amount || 0 : 0, prog = 0;
  if (o) { var it = o.items; if (typeof it === 'string') { try { it = JSON.parse(it); } catch (e) { it = []; } }
    var t0 = (b.tix || []).map(function (id) { return lnFind(store.tickets(), id); })[0];
    if (t0 && t0.orderId === o.id && it && it[0]) prog = +it[0].amount || 0; }   /* first line of a kiosk order is the treatment itself */
  var m = b.memberId ? lnFind(store.members(), b.memberId) : null, fromWallet = !!(b.tix || []).length && !prog;
  return { id: b.id, q: b.q || '', name: b.people[0].name || (m && m.name) || '', prog: (lnFind(LANA.PROGRAMS, b.people[0].prog) || {}).name_th || '', n: b.people.length,
    paid: paid, extras: Math.max(0, paid - prog), fromWallet: fromWallet, canKeep: !!m && prog > 0, member: !!m };
}
/* ---------- "ขอคิววันนี้" typed in the staff LINE OA: free places per hour, ready to copy to a customer ---------- */
var LN_ASK_PROGS = [['HEAD60', 'สปาผม', 'Head spa']];   /* ads are for the head spa only */
function lnFreeTable(store, br, date, now) {
  var out = [], progs = LN_ASK_PROGS.map(function (x) { var p = lnFind(LANA.PROGRAMS, x[0]); return p && lnProgAt(p, br) ? { p: p, th: x[1], en: x[2], ch: lnChain(p, { hair: 'short', style: 'normal', addons: [] }) } : null; }).filter(Boolean);
  var rows = cRows(store, date, null), from = date === now.date ? Math.ceil(now.min / 60) * 60 : LANA.OPEN;
  for (var m = Math.max(LANA.OPEN, from); m + 60 <= LANA.CLOSE; m += 60) {
    out.push({ m: m, free: progs.map(function (x) { var n = 0; while (n < 6 && lnAllocate(br, date, m, Array.apply(null, Array(n + 1)).map(function () { return x.ch; }), rows)) n++; return { th: x.th, en: x.en, n: n }; }) });
  }
  return out;
}
/* 13:00 -> 1:00 PM (easier for foreign guests) */
function lnAmPm(m) { var h = Math.floor(m / 60), x = m % 60, h12 = h % 12 || 12; return h12 + ':' + (x < 10 ? '0' : '') + x + (h < 12 ? ' AM' : ' PM'); }
function lnQueueText(store, now, text, branchIds) {
  var t = String(text || '').toLowerCase(), tomorrow = /พรุ่งนี้|tomorrow/.test(t), date = tomorrow ? lnAddDays(now.date, 1) : now.date;
  lnDuty(store, now);
  var brs = store.branches().filter(function (b) { return lnTrue(b.active) && (!branchIds || branchIds.indexOf(b.id) >= 0); });
  var parts = brs.map(function (br) {
    var tb = lnFreeTable(store, br, date, now);
    var head = (tomorrow ? 'ตารางคิวพรุ่งนี้ค่ะ' : 'ตารางคิววันนี้ค่ะ') + ' · ' + (br.name_th || br.id) + '\n' + (tomorrow ? 'Available booking tomorrow' : 'Available booking today') + (br.name_en ? ' · ' + br.name_en : '');
    if (!tb.length) return head + '\n\nวันนี้ไม่มีรอบเหลือแล้วค่ะ / No more slots today';
    return head + '\n\n' + tb.map(function (r) {
      var n = r.free[0] ? r.free[0].n : 0, k = n >= 6 ? '6+' : n;
      return lnAmPm(r.m) + '  ' + (n ? 'ว่าง ' + k + ' ที่ / ' + k + ' slot' + (n > 1 ? 's' : '') + ' available' : 'เต็ม / Full');
    }).join('\n');
  });
  return parts.join('\n\n') || 'ยังไม่มีสาขาที่เปิดค่ะ';
}
/* ---------- appointment grid at the station tablet ---------- */
function stDays(now) { var out = []; for (var i = 0; i < LN_C.DAYS; i++) out.push(lnAddDays(now.date, i)); return out; }
/* a booking not yet checked in at this branch (only those can be moved or cancelled here) */
function stOwnBooking(store, br, id) {
  var b = lnFind(store.bookings(), id); if (!b || b.branch !== br.id) throw new Error('NOT_FOUND');
  if (b.status !== 'booked') throw new Error('NOT_NOW');
  return b;
}
/* people booked together (phone booking for 2-4) move together */
function stGroup(store, b) { return b.group ? store.bookings().filter(function (x) { return x.group === b.group && x.status === 'booked'; }) : [b]; }
function stGroupRows(store, date, grp) { var ids = grp.map(function (x) { return x.id; }); return lnOccupied(store.bookings().filter(function (x) { return x.date === date && ids.indexOf(x.id) < 0; }), null); }
function stGroupChains(grp) { var c = []; grp.forEach(function (x) { x.people.forEach(function (pe) { c.push(pe.chain); }); }); return c; }
function stFreeTimes(br, store, now, b, date) {
  var grp = stGroup(store, b), chains = stGroupChains(grp), rows = stGroupRows(store, date, grp), out = [];
  if (!lnProgAt(lnFind(LANA.PROGRAMS, b.people[0].prog), br)) return out;
  for (var m = LANA.OPEN; m < LANA.CLOSE; m += LN_C.STEP) {
    if (date === now.date && m < now.min) continue;
    if (lnAllocate(br, date, m, chains, rows)) out.push(m);
  }
  return out;
}
function stSched(br, store, now, date) {
  var order = ['wash', 'dry', 'thai', 'oil', 'chair'], cols = [];
  order.forEach(function (k) { for (var u = 1; u <= (+br[k] || 0); u++) cols.push({ res: k, unit: u, label: LANA.RES[k][0] + ' ' + u }); });
  var mem = {}; store.members().forEach(function (m) { mem[m.id] = m; });
  var blocks = [];
  store.bookings().forEach(function (b) {
    if (b.branch !== br.id || b.date !== date || ['noshow', 'cancelled', 'converted'].indexOf(b.status) >= 0) return;
    var m = mem[b.memberId] || {}, p0 = lnFind(LANA.PROGRAMS, b.people[0].prog) || {};
    var info = { id: b.id, status: b.status, q: b.q || '', code: b.code || '', src: b.src || (b.memberId ? 'line' : 'walkin'), phone: b.phone || m.phone || '', n: b.people.length,
      prog: p0.name_th || b.people[0].prog, start: b.people[0].alloc && b.people[0].alloc[0] ? b.people[0].alloc[0].start : 0, tix: (b.tix || []).length, payAtShop: !!b.payAtShop, group: b.group ? store.bookings().filter(function (x) { return x.group === b.group && x.status === 'booked'; }).length : 0 };
    var push = function (pi, r, end) { var pe = b.people[pi] || b.people[0];
      blocks.push(Object.assign({ res: r.res, unit: +r.unit, from: r.start, to: end, name: pe.name || m.name || (info.src === 'walkin' ? 'วอคอิน' : 'ลูกค้า'), who: pi }, info)); };
    if (b.live && b.live.length) b.live.forEach(function (r) { var e = b.finishedAt != null && b.finishedAt !== '' ? Math.min(r.end, +b.finishedAt) : r.end; if (e > r.start) push(r.pi || 0, r, e); });
    else b.people.forEach(function (pe, pi) { (pe.alloc || []).forEach(function (r) { push(pi, r, r.end); }); });
  });
  return { date: date, today: now.date, now: now.min, open: LANA.OPEN, close: LANA.CLOSE, step: LN_C.STEP, noShow: LANA.NOSHOW_MIN, days: stDays(now), cols: cols, blocks: blocks };
}
function stationApi(req, store, now) {
  var k = store.kioskKey(); if (!k || String(req.kiosk || '') !== String(k)) throw new Error('KIOSK_KEY');
  var br = lnFind(store.branches(), String(req.branch || '').toUpperCase()); if (!br) throw new Error('BAD_BRANCH');
  var a = req.action;
  return store.lock(function () {
    lnStationTick(store, now); lnAutoDone(store, now); lnDuty(store, now);
    if (a === 'sBoard') return stBoard(br, store, now);
    /* the Lana Print app by the printer asks for slips to print (accepted on any tablet), then says which it printed */
    if (a === 'sPrintQ') return { slips: store.bookings().filter(function (x) { return x.branch === br.id && x.date === now.date && (+x.printN || 0) > (+x.printDone || 0) && now.min - (+x.printAt || 0) <= 20 && ['inservice', 'finished', 'done'].indexOf(x.status) >= 0; })
      .map(function (x) { return { id: x.id, n: +x.printN, text: lnSlipText(stSlip(x, br, store), now) }; }) };
    if (a === 'sPrinted') { var pb = lnFind(store.bookings(), req.id); if (pb && pb.branch === br.id) { pb.printDone = Math.max(+pb.printDone || 0, +req.n || 0); store.saveBooking(pb); } return { ok: true }; }
    /* booking taken by phone / Facebook page: seats are held, the guest pays at the counter tablet when they arrive */
    if (a === 'sBookInfo') {
      var day = String(req.date || now.date), progs = LANA.PROGRAMS.filter(function (p) { return lnOnSale(p) && lnProgAt(p, br); }).map(function (p) {
        var g = String(p.group || '').split('|')[0];
        return { id: p.id, name: p.name_th, group: g, cat: p.cat || (lnTrue(p.hair) ? 'hair' : 'massage'), price: +p.price, min: lnPairs(p.segs).reduce(function (t, x) { return t + x.v; }, 0) }; });
      var nP = Math.max(1, Math.min(4, +req.n || 1)), times = req.prog ? cSlots({ branch: br.id, date: day, prog: req.prog, people: Array.apply(null, Array(nP)).map(function () { return { hair: 'short' }; }) }, store, now, null).times : [];
      return { progs: progs, times: times, days: LN_C.DAYS, list: stPhoneList(br, store, now) };
    }
    /* who is this phone number: name and tickets they can book with */
    if (a === 'sBookWho') {
      var wp = req.phone ? lnNormPhone(req.phone) : '', wm = wp && cPhoneOK(wp) ? cMemberBy(store, 'phone', wp) : null;
      if (!wm) return { member: null };
      var cnt = {}; store.tickets().forEach(function (k) { if (k.memberId === wm.id && k.status === 'active' && !(k.expires && now.date > k.expires)) cnt[k.prog] = (cnt[k.prog] || 0) + 1; });
      return { member: { name: wm.name }, tickets: Object.keys(cnt).map(function (p) { var pg = lnFind(LANA.PROGRAMS, p) || {}; return { prog: p, name: pg.name_th || p, n: cnt[p] }; }) };
    }
    if (a === 'sBook') {
      var pg = lnFind(LANA.PROGRAMS, req.prog), m = +req.time, name = String(req.name || '').trim().slice(0, 40), ph = req.phone ? lnNormPhone(req.phone) : '';
      if (!pg || !lnOnSale(pg) || !lnProgAt(pg, br)) throw new Error('NOT_HERE');
      if (!cDateOK(String(req.date), now) || !cTimeOK(req.time) || (req.date === now.date && m < now.min)) throw new Error('BAD_TIME');
      if (!name) throw new Error('NEED_NAME');
      if (!ph || !cPhoneOK(ph)) throw new Error('BAD_PHONE');
      var mem = cMemberBy(store, 'phone', ph);
      if (!mem) { mem = { id: 'M' + lnId(7), lineUserId: '', name: name, phone: ph, email: '', birthMonth: '', consentMarketing: 'FALSE', privacyAt: '', noShows: 0, source: 'phone', createdAt: cStamp(now), lastPrefs: '' }; store.saveMember(mem); }
      /* several people coming together: one booking each (each pays at the counter tablet), seats found for all at the same time */
      var n = Math.max(1, Math.min(4, +req.n || 1)), group = n > 1 ? lnId(6) : '';
      var pes = Array.apply(null, Array(n)).map(function (_, i) { var x = cCleanPerson(pg, { hair: lnTrue(pg.hair) ? 'short' : '', note: req.note }, i, null); x.name = i ? name + ' (คนที่ ' + (i + 1) + ')' : name; return x; });
      var chs = pes.map(function (x) { return lnChain(pg, x); }), al = lnAllocate(br, req.date, m, chs, cRows(store, req.date, null));
      if (!al) throw new Error('SLOT_TAKEN');
      var useT = req.useTicket ? cPickTickets(store, mem.id, pg.id, n, req.date, m) : null;   /* book with the member's tickets: held now, used when they check in */
      if (req.useTicket && !useT) throw new Error('NO_TICKET');
      var made = pes.map(function (x, i) {
        x.chain = chs[i]; x.alloc = al[i];
        var nb = { id: lnId(8), code: 'LN' + lnId(5), q: '', branch: br.id, date: req.date, status: 'booked', people: [x], ext: 0, due: [], live: [], memberId: mem.id, tix: [], vouchers: [], paid: 0,
          src: 'phone', payAtShop: true, phone: ph, email: mem.email || '', group: group, bookedBy: String(req.by || 'หน้าร้าน').slice(0, 30) };
        if (useT) { var tk = useT[i]; tk.status = 'booked'; tk.bookingId = nb.id; store.saveTicket(tk); nb.tix = [tk.id]; if (tk.src === 'partner') x.partner = true; }
        store.saveBooking(nb); store.log('', nb.id, 'book_phone', br.id + ' ' + nb.date + ' ' + lnHM(m) + ' ' + pg.id + (n > 1 ? ' ' + (i + 1) + '/' + n : ''));
        return nb;
      });
      return { ok: true, booking: { id: made[0].id, code: made[0].code, date: made[0].date, start: m, n: n }, list: stPhoneList(br, store, now) };
    }
    if (a === 'sBookCancel') {
      var cb = lnFind(store.bookings(), req.id); if (!cb || !cb.payAtShop || cb.branch !== br.id) throw new Error('NOT_FOUND');
      if (cb.status !== 'booked') throw new Error('NOT_NOW');
      cb.status = 'cancelled'; store.saveBooking(cb); store.log('', cb.id, 'cancel_phone', '');
      (cb.tix || []).forEach(function (id) { var k = lnFind(store.tickets(), id); if (k && k.status === 'booked' && k.bookingId === cb.id) { k.status = 'active'; k.bookingId = ''; store.saveTicket(k); } });   /* ticket back to the wallet */
      return { ok: true, list: stPhoneList(br, store, now) };
    }
    /* appointment grid: beds across the top, time down the side; tap a booking to move or cancel it */
    if (a === 'sSched') return stSched(br, store, now, String(req.date || now.date));
    /* the same free-slot table as "ขอคิววันนี้" in LINE, for the chat inbox's quick reply */
    if (a === 'sQueueText') return { text: lnQueueText(store, now, req.tomorrow ? 'พรุ่งนี้' : 'วันนี้', [br.id]) };
    if (a === 'sMoveSlots') {
      var mb = stOwnBooking(store, br, req.id), md = String(req.date || mb.date);
      if (!cDateOK(md, now)) throw new Error('BAD_TIME');
      return { id: mb.id, date: md, days: stDays(now), times: stFreeTimes(br, store, now, mb, md) };
    }
    if (a === 'sMoveBk') {
      var vb = stOwnBooking(store, br, req.id), vd = String(req.date || vb.date), vt = +req.time;
      if (!cDateOK(vd, now) || stFreeTimes(br, store, now, vb, vd).indexOf(vt) < 0) throw new Error('SLOT_TAKEN');
      var vg = stGroup(store, vb), val = lnAllocate(br, vd, vt, stGroupChains(vg), stGroupRows(store, vd, vg));
      if (!val) throw new Error('SLOT_TAKEN');
      var was = vb.date + ' ' + lnHM(vb.people[0].alloc[0].start), k = 0;
      vg.forEach(function (x) { x.date = vd; x.people.forEach(function (pe) { pe.alloc = val[k++]; }); x.reminded = false; store.saveBooking(x); store.log('', x.id, 'move_station', was + ' -> ' + vd + ' ' + lnHM(vt)); });
      var vm = lnFind(store.members(), vb.memberId); if ((vm && vm.email) || vb.email) { try { cConfirmMail(store, vb, vm, true); } catch (e) {} }
      return stSched(br, store, now, vd);
    }
    if (a === 'sCancelBk') {
      var xb = stOwnBooking(store, br, req.id), xd = xb.date;
      (req.all ? stGroup(store, xb) : [xb]).forEach(function (x) {
        x.status = 'cancelled'; x.cancelledBy = 'station'; store.saveBooking(x); store.log('', x.id, 'cancel_station', String(req.by || '').slice(0, 30));
        (x.tix || []).forEach(function (id) { var k = lnFind(store.tickets(), id); if (k && k.status === 'booked' && k.bookingId === x.id) { k.status = 'active'; k.bookingId = ''; store.saveTicket(k); } });   /* ticket back to the wallet */
      });
      return stSched(br, store, now, String(req.date || xd));
    }
    /* guest already checked in (paid / used a ticket) changes their mind before anyone starts */
    if (a === 'sDropInfo') return stDropInfo(store, stDropOne(store, br, req.id));
    if (a === 'sDrop') {
      var db = stDropOne(store, br, req.id), di = stDropInfo(store, db), mode = req.mode === 'keep' && di.canKeep ? 'keep' : 'refund', refund = mode === 'keep' ? di.extras : di.paid;
      db.status = 'cancelled'; db.dropped = mode; db.droppedAt = lnHM(now.min); store.saveBooking(db);
      (db.tix || []).forEach(function (id) { var k = lnFind(store.tickets(), id); if (!k || k.bookingId !== db.id) return;
        var bought = k.src === 'kiosk' && k.orderId && k.orderId === db.orderId;   /* bought at the kiosk for this visit */
        if (bought && mode !== 'keep') k.status = 'void'; else { k.status = 'active'; if (bought) { k.src = 'kept'; k.expires = lnAddDays(now.date, 90); } }
        k.bookingId = ''; store.saveTicket(k); });
      (db.vouchers || []).forEach(function (id) { var v = lnFind(store.vouchers(), id); if (v && v.bookingId === db.id) { v.status = 'active'; v.bookingId = ''; store.saveVoucher(v); } });
      if (refund > 0) store.saveOrder({ id: 'R' + lnId(9), memberId: db.memberId || '', kind: 'refund', amount: -refund, status: 'paid', prog: db.people[0].prog, count: 1, bookingId: db.id, beamId: '', beamUrl: '',
        items: JSON.stringify([{ th: 'คืนเงิน ' + (db.q || '') + (mode === 'keep' ? ' (ค่าของเพิ่ม)' : ''), en: 'Refund', amount: -refund }]), label: 'Refund ' + (db.q || ''), createdAt: cStamp(now), paidAt: cStamp(now) });
      store.log('', db.id, 'drop_' + mode, (db.q || '') + ' refund ' + refund + ' by ' + String(req.by || '').slice(0, 30));
      return stBoard(br, store, now);
    }
    /* money taken at the counter (cash or the card machine): staff PIN says who took it */
    if (a === 'sCounterPay') {
      var po = null;
      if (/^B:/.test(String(req.id))) {   /* balance of a finished visit (upgrade / extras) paid at the counter */
        var db0 = lnFind(store.bookings(), String(req.id).slice(2)); if (!db0 || db0.branch !== br.id || db0.status !== 'finished') throw new Error('NOT_NOW');
        var due0 = lnSum(db0.due || []); if (!(due0 > 0)) throw new Error('NOT_NOW');
        po = { id: 'O' + lnId(9), memberId: db0.memberId || '', kind: 'checkout', amount: due0, status: 'pending', prog: '', count: 1, bookingId: db0.id, beamId: '', beamUrl: '', items: JSON.stringify(db0.due || []), label: 'Lana balance', createdAt: cStamp(now), paidAt: '' };
      } else po = lnFind(store.orders(), req.id);
      if (!po) throw new Error('NOT_FOUND');
      var payer = lnFind(store.staff(), req.staffId); if (!payer || payer.branch !== br.id) throw new Error('BAD_STAFF');
      if (!String(payer.pin || '').trim() || String(req.pin || '').trim() !== String(payer.pin).trim()) throw new Error('BAD_PIN');
      if (po.status === 'paid') throw new Error('ALREADY_PAID');
      if (po.status !== 'pending' && po.status !== 'expired' && po.status !== 'cancelled') throw new Error('NOT_NOW');
      /* the guest may have paid on Beam a moment ago: check first so nobody pays twice */
      var bst = ''; try { if (po.beamId) bst = String(store.beamStatus(po.beamId) || '').toUpperCase(); } catch (e) {}
      if (bst === 'PAID') { cFulfil(store, po, now); return { paidBy: 'beam', board: stBoard(br, store, now) }; }
      try { if (po.beamId) store.beamDisable(po.beamId); } catch (e) {}
      var pb0 = po.bookingId ? lnFind(store.bookings(), po.bookingId) : null;
      po.status = 'pending'; po.method = 'card';   /* cashless shop: the counter takes cards only */ po.paidBy = payer.id; store.saveOrder(po);
      cFulfil(store, po, now);
      store.log(payer.id, po.bookingId || '', 'paid_' + po.method, po.id + ' ' + po.amount);
      var pbk = po.bookingId ? lnFind(store.bookings(), po.bookingId) : null;
      if (req.lite) return { paidBy: po.method, kind: po.kind, q: pbk ? pbk.q || '' : '', vkey: pbk ? pbk.vkey || '' : '', bookingId: po.bookingId || '', status: pbk ? pbk.status : '', booking: pbk ? cView(pbk, store, now, false) : null };   /* kiosk: everything for the next screen in one answer */
      return { paidBy: po.method, q: pbk ? pbk.q || '' : '', status: pbk ? pbk.status : '', board: stBoard(br, store, now) };
    }
    if (a === 'sClock') {   /* clock in/out at the station tablet (for staff without the LINE app, e.g. part-timers called in) */
      var who = lnFind(store.staff(), req.staffId); if (!who || who.branch !== br.id) throw new Error('BAD_STAFF');
      /* own PIN (Staff sheet) so nobody clocks in for a friend; a photo from the tablet camera is kept for the owner to check */
      if (!String(who.pin || '').trim() || String(req.pin || '').trim() !== String(who.pin).trim()) { store.log(who.id, '', 'clock_bad_pin', 'station'); throw new Error('BAD_PIN'); }
      var open = store.shifts().filter(function (r) { return r.staffId === who.id && r.date === now.date && !r.out; })[0];
      var photo = '';
      if (req.on && !open && !/^data:image\/jpeg;base64,/.test(String(req.photo || ''))) throw new Error('NEED_PHOTO');
      if (req.on && !open && req.photo && store.savePhoto) { try { photo = store.savePhoto(String(req.photo), now.date + '_' + lnHM(now.min).replace(':', '') + '_' + who.name + '_' + who.id + '.jpg') || ''; } catch (e) { photo = ''; } }
      if (req.on && !open) store.addShift({ staffId: who.id, date: now.date, branch: br.id, in: lnHM(now.min), out: '', inDistance: 'station', inAccuracy: '', photo: photo || 'บันทึกรูปไม่สำเร็จ' });
      if (!req.on && open) { open.out = lnHM(now.min); open.outNote = 'ออกที่แท็บเล็ตรับงาน'; store.updateShift(open); }
      store.log(who.id, '', req.on ? 'clock_in' : 'clock_out', 'station');
      return stBoard(br, store, now);
    }
    var b = apiGet(store, req.id); if (b.branch !== br.id || b.date !== now.date) throw new Error('NOT_FOUND');
    if (a === 'sAccept') return stAccept(b, br, req, store, now);
    if (a === 'sHandoff') {
      if (b.status !== 'inservice' || b.handoff) throw new Error('NOT_NOW');
      if (!(b.live || []).some(function (r) { return !r.scanned && r.i > 0; })) throw new Error('NO_NEXT_STEP');
      var from = lnFind(store.staff(), b.staffId);
      b.handoff = true; b.handoffFrom = from ? from.name : ''; b.handoffAt = now.min; b.staffId = ''; b.staffName = ''; b.notified = [];
      store.saveBooking(b); store.log(from ? from.id : '', b.id, 'handoff', 'station ' + lnHM(now.min));
      return stBoard(br, store, now);
    }
    if (a === 'sNext') {   /* the same therapist moves the guest to the next step now */
      if (b.status !== 'inservice' || b.handoff) throw new Error('NOT_NOW');
      var me = lnFind(store.staff(), b.staffId) || { id: b.staffId, name: b.staffName }, allb = store.bookings();
      stStartNext(b, br, me, allb, now, function () { return lnOccupied(allb, b.id, now.min).filter(function (row) { var x = lnFind(allb, row.bid); return x && x.status === 'inservice'; }); });
      store.saveBooking(b); lnReseat(b, br, allb).forEach(function (x) { store.saveBooking(x); }); store.log(me.id || '', b.id, 'next_step', 'station ' + lnHM(now.min));
      return stBoard(br, store, now);
    }
    if (a === 'sExtend') {
      if (b.status !== 'inservice') throw new Error('NOT_NOW');
      if (b.handoff) throw new Error('HANDED_OFF');   /* nobody is serving the guest: extend after someone picks up the step */
      lnAddExt(b, 1);
      var r = lnTryChange(b, br, store.bookings(), now.min, true);
      if (!r.ok) { lnAddExt(b, -1); throw new Error(r.res === 'close' ? 'CLOSING' : r.res === 'crew' ? 'NO_CREW' : 'NO_ROOM'); }
      b.ext = (+b.ext || 0) + 1; b.due = b.due || []; b.due.push({ kind: 'ext', th: 'ต่อเวลา 30 นาที', en: 'Extra 30 min', amount: lnBkExtPrice(b) });
      store.saveBooking(b); r.moved.forEach(function (x) { store.saveBooking(x); }); store.log(b.staffId || '', b.id, 'extend', 'station');
      return stBoard(br, store, now);
    }
    /* sell an add-on or a Dyson style during the visit (hair treatments): added to the bill, paid at checkout. Tap again to take it off */
    if (a === 'sChangeProg') {   /* pressed the wrong treatment, or the guest switched: price difference is collected at the end */
      if (['inservice', 'finished', 'done'].indexOf(b.status) < 0) throw new Error('NOT_NOW');
      var np = lnFind(LANA.PROGRAMS, req.prog); if (!np || !lnOnSale(np) || !lnProgAt(np, br)) throw new Error('NOT_HERE');
      var p0 = b.people[0], from = lnFind(LANA.PROGRAMS, p0.fromProg || p0.prog) || {}, n = b.people.length;
      b.due = (b.due || []).filter(function (d) { return d.kind !== 'prog'; });
      b.people.forEach(function (pe) { if (!pe.fromProg) pe.fromProg = pe.prog; pe.prog = np.id; pe.value = +np.price; });
      if (np.id === from.id) b.people.forEach(function (pe) { delete pe.fromProg; });
      var diff = (+np.price - (+from.price || 0)) * n;
      if (diff > 0) b.due.push({ kind: 'prog', id: np.id, th: 'เปลี่ยนเป็น ' + np.name_th, en: 'Changed to ' + (np.name_en || np.name_th), amount: diff });
      if (b.status === 'done' && diff > 0) { b.status = 'finished'; b.paidDue = false; }   /* reopened so the difference can be paid */
      store.saveBooking(b); store.log(String(req.by || b.staffId || ''), b.id, 'change_prog', (from.id || '') + ' -> ' + np.id + ' diff ' + diff);
      return { diff: diff, board: stBoard(br, store, now) };
    }
    if (a === 'sUpsell') {
      if (b.status !== 'inservice') throw new Error('NOT_NOW');
      var pe = b.people[0], pg = lnFind(LANA.PROGRAMS, pe.prog) || {}; b.due = b.due || [];
      if (!lnTrue(pg.hair)) throw new Error('NOT_NOW');
      if (req.addon) {
        var ad = lnFind(LANA.ADDONS, req.addon); if (!ad || !+ad.price || !lnAddonFor(ad, pg.id)) throw new Error('BAD_FORM');
        var had = b.due.filter(function (d) { return d.kind === 'addon' && d.id === ad.id; })[0];
        if (had) { b.due.splice(b.due.indexOf(had), 1); pe.addons = (pe.addons || []).filter(function (x) { return x !== ad.id; }); }
        else { if ((pe.addons || []).indexOf(ad.id) >= 0) throw new Error('ALREADY'); pe.addons = (pe.addons || []).concat([ad.id]); b.due.push({ kind: 'addon', id: ad.id, th: ad.name_th, en: ad.name_en || ad.name_th, amount: +ad.price }); }
      } else if (req.style) {
        var ns = lnFind(LANA.STYLES, req.style); if (!ns) throw new Error('BAD_FORM');
        var hs = b.due.filter(function (d) { return d.kind === 'style'; })[0];
        if (hs && hs.id === ns.id) { b.due.splice(b.due.indexOf(hs), 1); pe.style = hs.from || 'normal'; }
        else {
          var base = hs ? hs.from : pe.style, old = lnFind(LANA.STYLES, base) || { price: 0 }, diff = +ns.price - (+old.price || 0);
          if (diff <= 0) throw new Error('BAD_FORM');
          if (hs) b.due.splice(b.due.indexOf(hs), 1);
          pe.style = ns.id; b.due.push({ kind: 'style', id: ns.id, from: base || 'normal', th: ns.name_th, en: ns.name_en || ns.name_th, amount: diff });
        }
      } else throw new Error('BAD_FORM');
      store.saveBooking(b); store.log(b.staffId || '', b.id, 'upsell', req.addon || req.style);
      return stBoard(br, store, now);
    }
    if (a === 'sFinish') {
      if (b.status !== 'inservice') throw new Error('NOT_NOW');
      var end = lnEnd(b);
      if (now.min < end) lnDropExt(b, (b.live || []).filter(function (r) { return r.pi === 0 && r.end > now.min; }), now.min);   /* unused extra time is not charged */
      if (!b.staffId && b.handoff) { var last = (b.live || []).filter(function (x) { return x.staffId; }).pop(); if (last) b.staffId = last.staffId; }
      b.handoff = false; b.status = 'finished'; b.finishedAt = now.min; b.earlyByStaff = now.min < end;
      store.saveBooking(b); store.log(b.staffId || '', b.id, 'finish_station', lnHM(now.min) + ' / end ' + lnHM(end)); lnAutoDone(store, now);
      return stBoard(br, store, now);
    }
    if (a === 'sUndo') {   /* taken by mistake / not started yet: put the guest back in the queue, no pay */
      var la = b.lastAccept;
      if (b.status !== 'inservice' || b.handoff || !la || now.min - la.at > LN_UNDO_MIN) throw new Error('NOT_NOW');
      if (la.kind === 'first') {
        var nExt = +b.ext || 0;
        b.status = 'checkedin'; b.live = []; b.svcStart = ''; b.staffId = ''; b.staffName = ''; b.acceptedAt = ''; b.crew = []; b.auto = false; b.notified = [];
        b.people.forEach(function (pe) { pe.cut = 0; pe.ext = 0; pe.extBy = {}; });
        if (nExt) { b.due = (b.due || []).filter(function (d) { return d.kind !== 'ext'; }); b.ext = 0; }
      } else {
        b.live.forEach(function (r) { if (r.scanned && r.staffId === la.staffId && r.scannedAt >= la.at) { r.scanned = false; delete r.staffId; delete r.scannedAt; } });
        b.handoff = true; b.staffId = ''; b.staffName = '';
        if (!b.live.some(function (r) { return r.staffId === la.staffId; })) b.crew = (b.crew || []).filter(function (c) { return c.id !== la.staffId; });
        var rbu = lnBuildLive(b, br, lnOccupied(store.bookings(), b.id, now.min), now.min, true); if (rbu.ok) b.live = rbu.live;
      }
      b.lastAccept = null; store.saveBooking(b); store.log(la.staffId, b.id, 'undo_accept', lnHM(now.min));
      return stBoard(br, store, now);
    }
    if (a === 'sSlip') { if (b.status !== 'inservice' || b.handoff) throw new Error('NOT_NOW'); if (req.remote) { lnPrintWant(b, now); store.saveBooking(b); } return { slip: stSlip(b, br, store) }; }
    throw new Error('BAD_ACTION');
  });
}
/* the clock moves station visits along: next step when its time comes, finished at the end (not while handed back) */
/* finished with nothing more to pay: close it at once (no need to stop at the kiosk to rate and tip) */
function lnAutoDone(store, now) {
  store.bookings().forEach(function (b) {
    if (b.status !== 'finished' || lnSum(b.due || []) > 0) return;
    var o = b.orderId ? lnFind(store.orders(), b.orderId) : null; if (o && o.kind === 'checkout' && o.status === 'pending') return;
    cCheckoutDone(store, b, now); b.autoClosed = true; store.saveBooking(b);
  });
}
function lnStationTick(store, now) {
  lnAutoDone(store, now);
  store.bookings().forEach(function (b) {
    if (b.date !== now.date || b.status !== 'inservice' || !b.auto || b.handoff) return;
    var changed = false;
    var br = lnFind(store.branches(), b.branch) || {}, all = store.bookings();
    (b.live || []).filter(function (r) { return !r.scanned && r.i > 0 && r.start <= now.min; }).sort(function (x, y) { return x.start - y.start; }).forEach(function (r) {
      var prev = b.live.filter(function (x) { return x.pi === r.pi && x.i === r.i - 1; })[0]; if (prev && !prev.scanned) return;
      /* the planned seat may still hold someone who ran over: take another free one of the same kind, or wait on the current seat */
      var occ = lnOccupied(all, b.id, now.min).filter(function (row) { var x = lnFind(all, row.bid); return x && x.status === 'inservice'; }), len = r.end - r.start, unit = 0;
      var cands = lnSeatCands(br, b.people[r.pi], r.i, r), pick = null;
      for (var k = 0; k < cands.length && !pick; k++) if (lnUnitFree(occ, b.branch, b.date, cands[k].res, cands[k].unit, now.min, now.min + 1)) pick = cands[k];
      if (pick) { unit = pick.unit; r.res = pick.res; }
      if (!unit) { if (r.waitSince == null) { r.waitSince = now.min; changed = true; } return; }   /* next seat still in use: the guest waits where they are */
      if (r.waitSince != null) { if (prev) prev.end = now.min; r.start = now.min; r.end = now.min + len; delete r.waitSince; }   /* waited for a seat: this step still gets its full time */
      /* otherwise the step began on time (the minute timer may have skipped a few minutes): keep the planned times */
      r.unit = unit; r.scanned = true; r.scannedAt = r.start; r.staffId = (prev && prev.staffId) || b.staffId; delete r.clash; changed = true;   /* each guest stays with their own therapist */
    });
    if (changed) { var rb = lnBuildLive(b, br, lnOccupied(all, b.id, now.min), now.min, true); if (rb.ok) b.live = rb.live; }
    if (!(b.live || []).some(function (r) { return !r.scanned; }) && now.min >= lnEnd(b)) {
      b.status = 'finished'; b.finishedAt = lnEnd(b); changed = true; store.log(b.staffId || '', b.id, 'auto_end', lnHM(b.finishedAt));
    }
    if (changed) store.saveBooking(b);
  });
}
function stAccept(b, br, req, store, now) {
  var s = lnFind(store.staff(), req.staffId);
  if (!s || s.branch !== br.id || String(s.active).toUpperCase() === 'FALSE') throw new Error('BAD_STAFF');
  /* must clock in first (own PIN + photo), so a job cannot clock in someone who is not here */
  if (!store.shifts().some(function (r) { return r.staffId === s.id && r.date === now.date && !r.out; })) throw new Error('CLOCK_IN_FIRST');
  var all = store.bookings();
  /* only a guest physically on a seat blocks it */
  var physical = function () { return lnOccupied(all, b.id, now.min).filter(function (row) { var x = lnFind(all, row.bid); return x && x.status === 'inservice'; }); };
  if (b.status === 'inservice' && b.handoff) {
    stStartNext(b, br, s, all, now, physical);
    b.handoff = false; b.staffId = s.id; b.staffName = s.name; lnCrewAdd(b, s); b.lastAccept = { staffId: s.id, at: now.min, kind: 'step' };
    lnPrintWant(b, now); store.saveBooking(b); lnReseat(b, br, all).forEach(function (x) { store.saveBooking(x); }); store.log(s.id, b.id, 'accept_step', 'station');
    return { slip: stSlip(b, br, store), board: stBoard(br, store, now) };
  }
  if (b.status !== 'checkedin') throw new Error('TAKEN');
  /* a couple / group: each guest may have their own therapist (crew[i] = staff for guest i, blank = the one accepting) */
  var crewS = b.people.map(function (pe, i) { var id = (req.crew || [])[i]; if (!id || id === s.id) return s;
    var x = lnFind(store.staff(), id); if (!x || x.branch !== br.id || String(x.active).toUpperCase() === 'FALSE') throw new Error('BAD_STAFF');
    if (!store.shifts().some(function (r) { return r.staffId === x.id && r.date === now.date && !r.out; })) throw new Error('CLOCK_IN_FIRST'); return x; });
  var first = b.people[0].alloc[0], occ0 = physical(), len0 = first.end - first.start;
  var seat0 = stSeatNow(br, b, occ0, now);
  /* staff can see the seat is really free (the last guest left, nobody pressed finish): start anyway */
  if (!seat0 && req.force) { seat0 = lnSeatCands(br, b.people[0], 0, first)[0]; b.forced = true; }
  if (!seat0) throw new Error('SEAT_BUSY');
  var unit = seat0.unit, kinds0 = lnKinds((b.people[0].chain[0] || first).res);
  b.svcStart = now.min;
  if (b.endCap) b.people.forEach(function (pe) { pe.cut = Math.max(0, now.min + lnChainMin(pe.chain) - b.endCap); });
  b.people[0].alloc[0] = Object.assign({}, first, { res: seat0.res, unit: unit });
  var others = lnOccupied(all, b.id, now.min).filter(function (row) { var x = lnFind(all, row.bid); return kinds0.indexOf(row.res) < 0 || (x && x.status === 'inservice'); });
  var built = lnBuildLive(b, br, others, now.min, true);
  if (!built.ok && req.force) built = lnBuildLive(b, br, [], now.min, true);
  if (!built.ok) { b.svcStart = ''; b.people[0].alloc[0] = first; throw new Error('SEAT_BUSY'); }
  b.live = built.live;
  b.live.forEach(function (row) { if (row.i === 0) { row.scanned = true; row.scannedAt = now.min; row.staffId = (crewS[row.pi] || s).id; } });
  b.status = 'inservice'; b.auto = true; b.staffId = s.id; b.staffName = s.name; b.acceptedAt = lnHM(now.min); crewS.forEach(function (x) { lnCrewAdd(b, x); }); b.lastAccept = { staffId: s.id, at: now.min, kind: 'first' };
  lnPrintWant(b, now);
  store.saveBooking(b); lnReseat(b, br, all).forEach(function (x) { store.saveBooking(x); });
  store.log(s.id, b.id, req.force ? 'accept_forced' : 'accept', 'station ' + LANA.RES[seat0.res][2] + unit);
  if (req.lite) return { ok: true };
  return { slip: stSlip(b, br, store), board: stBoard(br, store, now) };
}
/* begin the next step of each guest now (picked up from the shared queue, or the same therapist moving on early) */
function stStartNext(b, br, s, all, now, physical) {
  var next = b.live.filter(function (r) { return !r.scanned && r.i > 0; }).sort(function (x, y) { return x.start - y.start; });
  var seen = {}; next = next.filter(function (r) { if (seen[r.pi]) return false; seen[r.pi] = 1; return true; });
  if (!next.length) throw new Error('NO_NEXT_STEP');
  var occ = physical(), picks = next.map(function (r) {
    return lnSeatCands(br, b.people[r.pi], r.i, r).filter(function (c) { return lnUnitFree(occ, b.branch, b.date, c.res, c.unit, now.min, now.min + 1); })[0] || null;
  });
  if (picks.some(function (u) { return !u; })) throw new Error('SEAT_BUSY');   /* the next seat is still in use: the guest waits where they are */
  next.forEach(function (r, ix) {
    var len = r.end - r.start;
    lnDropExt(b, b.live.filter(function (x) { return x.pi === r.pi && x.i === r.i - 1 && x.end > now.min; }), now.min);
    b.live.forEach(function (x) { if (x.pi === r.pi && x.i === r.i - 1) x.end = Math.max(+x.start + 1, now.min); });
    r.res = picks[ix].res; r.unit = picks[ix].unit; r.start = now.min; r.end = now.min + len; r.scanned = true; r.scannedAt = now.min; r.staffId = s.id; delete r.clash;
  });
  var rb = lnBuildLive(b, br, lnOccupied(all, b.id, now.min), now.min, true); if (rb.ok) b.live = rb.live;
}
function stSteps(b) {
  return (b.live || []).map(function (r) { var pe = b.people[r.pi] || {}; return { pi: r.pi, who: pe.name || '', label: LANA.RES[r.res][0] + ' ' + r.unit, res: r.res, start: r.start, end: r.end, done: !!r.scanned && (b.live.some(function (x) { return x.pi === r.pi && x.i > r.i && x.scanned; })), now: !!r.scanned && !b.live.some(function (x) { return x.pi === r.pi && x.i > r.i && x.scanned; }), by: r.staffId || '' }; });
}
function lnPrintWant(b, now) { b.printN = (+b.printN || 0) + 1; b.printAt = now.min; }
/* the slip as text for the Lana Print app (#LANA1 layout: kind|left|right per line); same lines as the station page draws */
function lnSlipText(s, now) {
  var hm = lnHM, L = [['c', 'LANA · ' + s.branch], ['q', s.q], ['c', 'หมอนวด: ' + s.therapist]];
  if (s.partial) L.push(['c', 'ทำต่อ' + (s.from ? 'จาก ' + s.from : '')]);
  L.push(['hr']);
  s.people.forEach(function (p, i) {
    if (i) L.push(['hr']);
    L.push(['k', p.name]);
    [['โปรแกรม', p.prog + ' ' + p.min + ' นาที'], p.hair ? ['ผมยาว', p.hair] : null, p.style ? ['ทรงเป่า', p.style] : null, p.addons.length ? ['เพิ่ม', p.addons.join(', ')] : null,
      ['น้ำหนักมือ', p.pressure + (p.elbow ? ' · ' + p.elbow : '')], p.focus.length ? ['เน้น', p.focus.join(', ')] : null, p.nostretch ? ['', '★ ไม่ต้องปลุก ไม่บิด ไม่ดัดตัว (ปล่อยหลับ)'] : null,
      p.quiet ? ['', 'ขอพักเงียบๆ'] : null, (p.alerts || []).length ? ['⚠ ระวัง', p.alerts.join(', ')] : null, p.note ? ['ลูกค้าเขียน', p.note] : null].filter(Boolean).forEach(function (r) { L.push(['r', r[0], r[1]]); });
  });
  L.push(['hr']);
  s.steps.forEach(function (x) { L.push(['r', (s.people.length > 1 ? x.who + ' · ' : '') + x.label, hm(x.start) + '–' + hm(x.end)]); });
  L.push(['hr'], ['c', 'เริ่ม ' + hm(s.partial && s.steps.length ? s.steps[0].start : s.start)], ['end', 'จบ ' + hm(s.end)], ['small', 'ปริ้น ' + hm(now.min)]);
  return '#LANA1\n' + L.map(function (l) { return l.map(function (x) { return String(x == null ? '' : x).replace(/[|\n]/g, ' '); }).join('|'); }).join('\n');
}
function stSlip(b, br, store) {
  var staff = store.staff();
  return { q: b.q || b.code, branch: br.name_th || br.id, start: +b.svcStart, end: lnEnd(b), therapist: (lnFind(staff, b.staffId) || {}).name || '',
    steps: stSteps(b).filter(function (s) { return !s.done; }).map(function (s) { s.by = (lnFind(staff, s.by) || {}).name || ''; return s; }),
    from: b.handoffFrom || '', partial: stSteps(b).some(function (s) { return s.done; }),
    people: b.people.map(function (pe) {
      var p = lnFind(LANA.PROGRAMS, pe.prog) || {}, h = lnFind(LANA.HAIR, pe.hair), st = lnFind(LANA.STYLES, pe.style);
      return { name: pe.name, prog: p.name_th || pe.prog, min: lnChainMin(pe.chain), hair: h ? h.name_th : '', style: st && st.id !== 'normal' ? st.name_th : '',
        addons: (pe.addons || []).map(function (id) { var x = lnFind(LANA.ADDONS, id); return x ? x.name_th : id; }),
        pressure: { light: 'เบา', medium: 'กลาง', firm: 'หนัก' }[pe.pressure] || 'กลาง', elbow: pe.elbow === 'no' ? 'ไม่ใช้ศอก' : '', nostretch: pe.stretch === 'no', quiet: !!pe.quiet,
        focus: pe.focus || [], note: pe.healthOk ? (pe.note || '') : '', noteNotThai: !!(pe.healthOk && pe.note && /[A-Za-z]/.test(pe.note) && !/[\u0E00-\u0E7F]/.test(pe.note)),
        alerts: pe.healthOk ? (pe.alerts || []).map(function (c) { var a = LANA.ALERTS.filter(function (x) { return x[0] === c; })[0]; return a ? a[1] : c; }) : [] };
    }), ext: +b.ext || 0 };
}
/* backend version: the station page warns when the Apps Script deployment is older than the page */
var LN_BUILD = 62;
/* a guest who booked ahead (LINE / phone) and whose time has come */
function stBookedDue(b, now) { var t = +b.bookedFor || b.people[0].alloc[0].start; return b.status === 'checkedin' && (b.src === 'line' || !!b.fromPhone) && t <= now.min + 5 ? t : 0; }
/* booked guest is here but no seat or nobody free for the first step: which running job to hurry */
function stRush(b, br, all, staff, people, now) {
  if (b.status !== 'checkedin') return null;   /* any guest in the queue: tell staff before they tap, instead of an error after */
  var first = b.people[0].chain[0] || b.people[0].alloc[0], kinds = lnKinds(first.res), len = first.min || (first.end - first.start), g = LN_GROUP[kinds[0]];
  var occ = lnOccupied(all, b.id, now.min).filter(function (row) { var x = lnFind(all, row.bid); return x && x.status === 'inservice'; });
  var seatFree = !!stSeatNow(br, b, occ, now);
  var fits = function (p) { return p.role === 'both' || p.role === g; };
  var personFree = people.some(function (p) { return p.on && !p.busy.length && fits(p); });
  if (seatFree && personFree) return null;
  var live = all.filter(function (x) { return x.status === 'inservice' && !x.handoff && x.id !== b.id; }).map(function (x) {
    var cur = x.live.filter(function (r) { return r.scanned; }).pop(), p = people.filter(function (q) { return q.id === x.staffId; })[0];
    var onSeat = cur && kinds.indexOf(cur.res) >= 0, byFit = p && fits(p);
    return { x: x, end: lnEnd(x), seat: onSeat, person: byFit, who: p ? p.name : '' };
  }).filter(function (o) { return (!seatFree && o.seat) || (!personFree && o.person); }).sort(function (p, q) { return p.end - q.end; });
  if (!live.length) return { why: !seatFree ? 'seat' : 'staff' };
  var t = live[0]; return { why: !seatFree ? 'seat' : 'staff', q: t.x.q || t.x.code, id: t.x.id, staff: t.who, end: t.end };
}
/* a seat for the first step: one free for the whole step if possible, otherwise any seat nobody is sitting on right now
   (a guest already here is served now; a later step of someone else waits a little instead of the shop refusing) */
function stSeatNow(br, b, occ, now) {
  var first = b.people[0].alloc[0], len = first.end - first.start, cands = lnSeatCands(br, b.people[0], 0, first);
  var whole = cands.filter(function (c) { return lnUnitFree(occ, b.branch, b.date, c.res, c.unit, now.min, now.min + len); })[0];
  if (whole) return whole;
  var sitting = occ.filter(function (r) { return r.start <= now.min && r.end > now.min; });
  return cands.filter(function (c) { return !sitting.some(function (r) { return r.branch === b.branch && r.date === b.date && r.res === c.res && +r.unit === +c.unit; }); })[0] || null;
}
function stBoard(br, store, now) {
  var all = store.bookings().filter(function (b) { return b.branch === br.id && b.date === now.date; }), staff = store.staff();
  var nm = function (id) { return (lnFind(staff, id) || {}).name || ''; };
  var people = staff.filter(function (s) { return s.branch === br.id && String(s.active).toUpperCase() !== 'FALSE'; }).map(function (s) {
    var cur = all.filter(function (b) { return b.status === 'inservice' && b.staffId === s.id; }).map(function (b) { return b.q || b.code; });
    var done = all.filter(function (b) { return (b.status === 'finished' || b.status === 'done') && lnInCrew(b, s.id); }).length;
    var sh = store.shifts().filter(function (r) { return r.staffId === s.id && r.date === now.date; }), on = sh.some(function (r) { return !r.out; });
    return { id: s.id, name: s.name, busy: cur, done: done, on: on, inAt: on ? sh.filter(function (r) { return !r.out; })[0].in : '' };
  }).sort(function (x, y) { return (y.on ? 1 : 0) - (x.on ? 1 : 0); });
  var progOf = function (b) { var p = lnFind(LANA.PROGRAMS, b.people[0].prog) || {}; return p.name_th || b.people[0].prog; };
  people.forEach(function (p) { var s = lnFind(staff, p.id); p.role = s ? lnRole(s) : 'both'; });
  var waiting = all.filter(function (b) { return b.status === 'checkedin' || (b.status === 'inservice' && b.handoff); }).map(function (b) {
    var nx = b.handoff ? b.live.filter(function (r) { return !r.scanned && r.i > 0; }).sort(function (x, y) { return x.start - y.start; })[0] : null, cur = b.handoff ? b.live.filter(function (r) { return r.scanned; }).pop() : null;
    var pe = b.people[0], h = lnFind(LANA.HAIR, pe.hair);
    return { id: b.id, q: b.q || b.code, prog: progOf(b), people: b.people.length, name: b.people.map(function (p) { return p.name; }).join(', '), min: lnChainMin(pe.chain),
      since: b.handoff ? +b.handoffAt : toMinHM(b.checkedAt), start: b.people[0].alloc[0].start, hair: h ? h.name_th : '', handoff: !!b.handoff,
      next: nx ? LANA.RES[nx.res][0] : '', at: cur ? LANA.RES[cur.res][0] + ' ' + cur.unit : '', from: b.handoffFrom || '',
      rest: b.handoff ? b.live.filter(function (r) { return !r.scanned; }).sort(function (x, y) { return x.start - y.start; }).map(function (r) { return { label: LANA.RES[r.res][0], min: r.end - r.start }; }) : [],
      booked: stBookedDue(b, now), rush: stRush(b, br, all, staff, people, now) };
  }).sort(function (x, y) { return (y.handoff ? 1 : 0) - (x.handoff ? 1 : 0) || (y.booked ? 1 : 0) - (x.booked ? 1 : 0) || x.since - y.since; });   /* booked guests whose time has come go before walk-ins */
  var live = all.filter(function (b) { return b.status === 'inservice' && !b.handoff; }).map(function (b) {
    var copy = JSON.parse(JSON.stringify(b)), allc = store.bookings().map(function (x) { return x.id === b.id ? copy : JSON.parse(JSON.stringify(x)); });
    lnAddExt(copy, 1); var r = lnTryChange(copy, br, allc, now.min, false);
    var steps = stSteps(b).map(function (s) { s.by = nm(s.by); return s; });
    var pe0 = b.people[0], pg0 = lnFind(LANA.PROGRAMS, pe0.prog) || {}, hairJob = lnTrue(pg0.hair), added = (b.due || []).filter(function (d) { return d.kind === 'addon' || d.kind === 'style'; });
    var upsell = !hairJob ? null : {
      addons: LANA.ADDONS.filter(function (a) { return +a.price && lnAddonFor(a, pg0.id) && !lnAddonRes(a); }).map(function (a) { var ad = added.some(function (d) { return d.kind === 'addon' && d.id === a.id; });
        return { id: a.id, name: a.name_th, price: +a.price, on: (pe0.addons || []).indexOf(a.id) >= 0, added: ad }; }),
      styles: LANA.STYLES.filter(function (x) { return +x.price; }).map(function (x) { return { id: x.id, name: x.name_th, price: +x.price, on: pe0.style === x.id, added: added.some(function (d) { return d.kind === 'style' && d.id === x.id; }) }; }),
      due: added.reduce(function (s, d) { return s + (+d.amount || 0); }, 0) };
    return { id: b.id, q: b.q || b.code, prog: progOf(b), name: b.people.map(function (p) { return p.name; }).join(', '), staff: nm(b.staffId), start: +b.svcStart, end: lnEnd(b), ext: +b.ext || 0, extPrice: lnBkExtPrice(b), upsell: upsell,
      steps: steps, hasNext: b.live.some(function (x) { return !x.scanned && x.i > 0; }), canUndo: !!(b.lastAccept && now.min - b.lastAccept.at <= LN_UNDO_MIN),
      next: (function () { var n = b.live.filter(function (x) { return !x.scanned && x.i > 0; }).sort(function (x, y) { return x.start - y.start; })[0]; return n ? { label: LANA.RES[n.res][0], at: n.start, min: n.end - n.start } : null; })(), canExtend: r.ok, extBlock: r.ok ? '' : (r.res === 'close' ? 'ร้านใกล้ปิด' : LANA.RES[r.res][0] + ' มีคิวต่อ') };
  }).sort(function (x, y) { return x.end - y.end; });
  var finished = all.filter(function (b) { return b.status === 'finished'; }).map(function (b) { return { id: b.id, q: b.q || b.code, prog: progOf(b), staff: nm(b.staffId), at: +b.finishedAt }; });
  /* orders still unpaid from the last hour at this branch (the guest may want to pay cash / card here) */
  var since = now.min - 60, counter = store.orders().filter(function (o) {
    if (o.status !== 'pending' || !o.bookingId) return false; var c = String(o.createdAt || ''); if (c.slice(0, 10) !== now.date || toMinHM(c.slice(11, 16)) < since) return false;
    var b = lnFind(store.bookings(), o.bookingId); return !!b && b.branch === br.id;
  }).map(function (o) { var b = lnFind(store.bookings(), o.bookingId), p = lnFind(LANA.PROGRAMS, b.people[0].prog) || {};
    return { id: o.id, bookingId: o.bookingId, amount: +o.amount, kind: o.kind, ask: lnTrue(o.counter), at: String(o.createdAt).slice(11, 16), name: b.people.map(function (x) { return x.name; }).join(', '), prog: o.kind === 'checkout' ? 'ยอดค้าง / ทิป' : (p.name_th || '') + (b.people.length > 1 ? ' × ' + b.people.length : ''), q: b.q || '' };
  }).sort(function (x, y) { return (y.ask ? 1 : 0) - (x.ask ? 1 : 0) || (x.at < y.at ? -1 : 1); });
  /* a finished visit with a balance shows here only after the guest has started paying at the kiosk (and picked the card machine): staff cannot close it on their own */
  live.forEach(function (l) { l.rushFor = waiting.filter(function (w) { return w.booked && w.rush && w.rush.id === l.id; }).map(function (w) { return { q: w.q, at: w.booked }; }); });
  return { ver: LN_BUILD, counter: counter, now: now, branch: { id: br.id, name: br.name_th || br.id }, staff: people, waiting: waiting, live: live, finished: finished, beds: apiBoard(br.id, store, now) };
}
/* phone / page bookings still to come (pay at the shop) */
function stPhoneList(br, store, now) {
  return store.bookings().filter(function (b) { return b.payAtShop && b.branch === br.id && b.status === 'booked' && b.date >= now.date; })
    .sort(function (x, y) { return (x.date + lnHM(x.people[0].alloc[0].start)) < (y.date + lnHM(y.people[0].alloc[0].start)) ? -1 : 1; })
    .map(function (b) { var p = lnFind(LANA.PROGRAMS, b.people[0].prog) || {}; return { id: b.id, code: b.code, date: b.date, start: b.people[0].alloc[0].start, name: b.people[0].name, phone: b.phone, prog: p.name_th || b.people[0].prog, price: +p.price || 0, ticket: (b.tix || []).length > 0 }; });
}
function toMinHM(hm) { var p = String(hm || '').split(':'); return p.length > 1 ? +p[0] * 60 + +p[1] : 0; }

/* ===== LANA CUSTOMER + COUNTER TABLET API (same code runs in Apps Script and in the demo) =====
   Extra store methods used here (see memstore.js / gas.js):
     members(), saveMember(m), tickets(), saveTicket(t), orders(), saveOrder(o), vouchers(), saveVoucher(v),
     claims(), saveClaim(c), csession(token) -> lineUserId, newCsession(lineUserId) -> token,
     lineUser(idToken, 'cust'), kioskKey(), beamCreate(order, returnUrl) -> { id, url }, beamStatus(beamId) -> 'PAID' | ...,
     mail(to, subject, html)
   Booking status: hold (waiting for payment) > booked > checkedin > accepted > inservice > finished > done; noshow; cancelled */

var LN_C = { LEAD: 30, HOLD_MIN: 20, PAY_MIN: 15, MAX_UPCOMING: 2, DAYS: 8, STEP: 30 };

function custApi(req, store, now) {
  var a = req.action;
  if (a !== 'config' && a !== 'hello') lnDuty(store, now);
  if (a === 'config') return cConfig(store);
  if (a === 'hello') return cHello(req, store, now);
  if (a === 'order') return store.lock(function () { return cOrderState(req, store, now); });
  if (a === 'payCancel') return store.lock(function () { return cPayCancel(req, store, now); });
  if (a === 'visit') return store.lock(function () { cSweep(store, now); var b = cByVkey(store, req.vkey); return { booking: cView(b, store, now, true) }; });
  if (a === 'slots') return store.lock(function () { return cSlots(req, store, now, req.token ? cMeOrNull(req, store) : null); });
  if (/^(extend|early|upgrade|checkout|thanked|upcourse|seen)$/.test(a) && (req.vkey || req.kiosk)) {
    if (req.kiosk) cKioskAuth(req, store);
    return store.lock(function () { return cVisitAction(a, req, store, now, null); });
  }
  if (a.charAt(0) === 'k' && a.length > 1 && a.charAt(1) === a.charAt(1).toUpperCase()) { cKioskAuth(req, store); return store.lock(function () { return cKiosk(a, req, store, now); }); }
  var uid = store.csession(req.token); if (!uid) throw new Error('LOGIN');
  if (a === 'signup') return store.lock(function () { return cSignup(uid, req, store, now); });
  if (a === 'link') return store.lock(function () { return cLink(uid, req, store, now); });
  var me = cMemberBy(store, 'lineUserId', uid); if (!me) throw new Error('NOT_MEMBER');
  if (a === 'me') return store.lock(function () { return cMe(me, store, now); });
  return store.lock(function () {
    if (a === 'profile') return cProfile(me, req, store, now);
    if (a === 'buy') return cBuy(me, req, store, now);
    if (a === 'book') return cBook(me, req, store, now);
    if (a === 'resched') return cResched(me, req, store, now);
    if (a === 'earlier') return cEarlier(me, req, store, now);
    if (a === 'checkin') return cCheckinAt(me, req, store, now);
    if (a === 'claim') return cClaim(me, req, store, now);
    if (a === 'redeem') return cRedeem(me, req, store, now);
    if (/^(extend|early|upgrade|checkout|thanked|upcourse|seen)$/.test(a)) return cVisitAction(a, req, store, now, me);
    throw new Error('UNKNOWN');
  });
}

/* ---------- catalogue for the apps ---------- */
/* a photo for the menu: any https image link, or a Google Drive share link (file shared as "anyone with the link") */
function cImgUrl(v, store) {
  v = String(v || '').trim(); if (!v) return '';
  if (!/^https?:\/\//i.test(v)) return store && store.photoUrl ? store.photoUrl(v) : '';   /* a file name: look it up in the "Lana Photos" Drive folder */
  var m = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=view&)?id=)([\w-]{20,})/.exec(v);
  if (m) return 'https://drive.google.com/thumbnail?id=' + m[1] + '&sz=w1200';
  return /^https:\/\//.test(v) ? v : '';
}
function cConfig(store) {
  var brs = store.branches();
  return {
    open: LANA.OPEN, close: LANA.CLOSE, noShow: LANA.NOSHOW_MIN, extPrice: LANA.EXT_PRICE, extMin: LANA.EXT_MIN, lead: LN_C.LEAD, days: LN_C.DAYS, step: LN_C.STEP,
    branches: brs.map(function (b) { return { id: b.id, name_th: b.name_th, name_en: b.name_en, active: lnTrue(b.active), soon: String(b.active).toUpperCase() === 'SOON', addr: b.addr || '', map: b.map || '', res: { wash: +b.wash || 0, dry: +b.dry || 0, thai: +b.thai || 0, chair: +b.chair || 0, oil: +b.oil || 0 } }; }).filter(function (b) { return b.active || b.soon; }),
    /* programs no longer sold stay in the list (hidden) so tickets already bought still show and can be used */
    programs: LANA.PROGRAMS.map(function (p) {
      var g = String(p.group || '').split('|'), v = String(p.vlabel || '').split('|');
      return { id: p.id, name_th: p.name_th, name_en: p.name_en || p.name_th, price: +p.price, pair: +p.pair || 0, pack3: lnPack(p, 3), pack5: lnPack(p, 5), pack11: lnPack(p, 11), pass30: lnPack(p, 'pass'), hair: lnTrue(p.hair),
        hidden: !lnOnSale(p), extPrice: lnExtPrice(p), hairFree: lnTrue(p.hairFree), cat: p.cat || (lnTrue(p.hair) ? 'hair' : 'massage'), group: g[0] ? { th: g[0], en: g[1] || g[0] } : null, vlabel: v[0] ? { th: v[0], en: v[1] || v[0] } : null,
        segs: lnPairs(p.segs).map(function (s) { return { res: s.k, min: s.v }; }), stretch: lnTrue(p.stretch), steps: lnSteps(p), desc_th: p.desc_th || '', desc_en: p.desc_en || p.desc_th || '', img: cImgUrl(p.img || p.id + '.jpg', store),
        at: brs.filter(function (b) { return lnProgAt(p, b); }).map(function (b) { return b.id; }) };
    }).map(function (x, i) { return [x, i]; }).sort(function (a, b) {   /* menu order: hair, combo, massage (sheet order inside each) */
      var r = function (x) { return x.cat === 'hair' ? 0 : x.cat === 'massage' ? 2 : 1; }; return r(a[0]) - r(b[0]) || a[1] - b[1]; }).map(function (x) { return x[0]; }),
    alerts: LANA.ALERTS.map(function (a) { return { id: a[0], name_th: a[1], name_en: a[2] }; }),
    hair: LANA.HAIR.map(function (h) { return { id: h.id, name_th: h.name_th, name_en: h.name_en || h.name_th, price: +h.price, min: +h.min }; }),
    styles: LANA.STYLES.map(function (h) { return { id: h.id, name_th: h.name_th, name_en: h.name_en || h.name_th, price: +h.price, min: +h.min }; }),
    addons: LANA.ADDONS.map(function (x) { return { id: x.id, name_th: x.name_th, name_en: x.name_en || x.name_th, price: +x.price, min: +x.min, for: LANA.PROGRAMS.filter(function (p) { return lnAddonFor(x, p.id); }).map(function (p) { return p.id; }), rec: lnTrue(x.rec), desc_th: x.desc_th || '', desc_en: x.desc_en || x.desc_th || '', res: lnAddonRes(x), needs: LN_ADDON_NEEDS[x.id] || '' }; }),
    partners: (LANA.PARTNERS || []).map(function (x) { return { id: x.id, name_th: x.name_th, name_en: x.name_en || x.name_th, prog: x.prog, days: +x.days || 60, rule: x.rule || '', desc_th: x.desc_th || '', desc_en: x.desc_en || x.desc_th || '' }; })
  };
}

/* ---------- members ---------- */
function cMemberBy(store, key, val) {
  if (!val) return null;
  var v = key === 'email' ? String(val).toLowerCase() : val;
  return store.members().filter(function (m) { return (key === 'email' ? String(m.email || '').toLowerCase() : m[key]) === v; })[0] || null;
}
function cMeOrNull(req, store) { var uid = store.csession(req.token); return uid ? cMemberBy(store, 'lineUserId', uid) : null; }
function cPhoneOK(e) { return /^\+66\d{9}$/.test(e) || (/^\+\d{8,15}$/.test(e) && e.indexOf('+66') !== 0); }
function cEmailOK(e) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e || ''); }
function cHello(req, store, now) {
  var uid = store.lineUser(req.idToken, 'cust'), m = cMemberBy(store, 'lineUserId', uid), out = { token: store.newCsession(uid), member: m ? cMemberPub(m) : null };
  if (m && now) out.me = store.lock(function () { return cMe(cMemberBy(store, 'lineUserId', uid), store, now); }); /* saves a second round trip */
  return out;
}
function cMemberPub(m) { return { id: m.id, name: m.name, phone: m.phone, email: m.email, birthMonth: +m.birthMonth || null, consent: lnTrue(m.consentMarketing), noShows: +m.noShows || 0 }; }
function cSignup(uid, req, store, now) {
  if (cMemberBy(store, 'lineUserId', uid)) throw new Error('ALREADY_MEMBER');
  var name = String(req.name || '').trim().slice(0, 60), phone = lnNormPhone(req.phone, req.intl), email = String(req.email || '').trim().slice(0, 120);
  if (!name || !cPhoneOK(phone) || !cEmailOK(email)) throw new Error('BAD_FORM');
  if (!req.privacy) throw new Error('NEED_PRIVACY');
  /* someone who first came through the counter tablet with this phone: link that record to LINE */
  var m = cMemberBy(store, 'phone', phone), byMail = cMemberBy(store, 'email', email);
  if (m && m.lineUserId) throw new Error('PHONE_TAKEN');
  if (byMail && byMail.lineUserId && byMail !== m) throw new Error('EMAIL_TAKEN');
  if (!m) m = byMail;   /* came to the counter with only an email */
  else if (byMail && byMail !== m) cMergeMember(store, byMail, m);   /* phone and email were two tablet records of the same person */
  var isNew = !m;
  if (!m) m = { id: 'M' + lnId(7), createdAt: cStamp(now), noShows: 0, source: 'line' };
  Object.assign(m, { lineUserId: uid, name: name, phone: phone, email: email, consentMarketing: req.consent ? 'TRUE' : 'FALSE', privacyAt: cStamp(now) });
  store.saveMember(m);
  if (isNew || !store.vouchers().some(function (v) { return v.memberId === m.id && v.kind === 'welcome'; }))
    store.saveVoucher({ id: 'V' + lnId(7), memberId: m.id, kind: 'welcome', addon: 'SCRUB', month: '', year: '', status: 'active', bookingId: '', createdAt: cStamp(now) });
  store.log('', '', 'member_signup', m.id);
  return cMe(m, store, now);
}
/* move everything of record `from` onto record `to` (same person seen twice at the tablet) */
function cMergeMember(store, from, to) {
  store.tickets().forEach(function (x) { if (x.memberId === from.id) { x.memberId = to.id; store.saveTicket(x); } });
  store.orders().forEach(function (x) { if (x.memberId === from.id) { x.memberId = to.id; store.saveOrder(x); } });
  store.bookings().forEach(function (x) { if (x.memberId === from.id) { x.memberId = to.id; store.saveBooking(x); } });
  store.vouchers().forEach(function (x) { if (x.memberId === from.id) { x.memberId = to.id; store.saveVoucher(x); } });
  store.claims().forEach(function (x) { if (x.memberId === from.id) { x.memberId = to.id; store.saveClaim(x); } });
  if (!to.email && from.email) to.email = from.email;
  from.mergedInto = to.id; from.email = ''; from.phone = ''; from.source = 'merged'; store.saveMember(from);
  store.log('', '', 'member_merge', from.id + ' -> ' + to.id);
}
/* someone who first came through the counter tablet (gave a phone or email) joins LINE: attach that record instead of starting over */
function cLink(uid, req, store, now) {
  if (cMemberBy(store, 'lineUserId', uid)) throw new Error('ALREADY_MEMBER');
  if (!req.privacy) throw new Error('NEED_PRIVACY');
  var raw = String(req.id || '').trim(), m = raw.indexOf('@') > 0 ? cMemberBy(store, 'email', raw) : cMemberBy(store, 'phone', lnNormPhone(raw, raw.charAt(0) === '+'));
  if (!m) {
    /* visits from the tablet before member records were kept: build one from those bookings */
    var isMail = raw.indexOf('@') > 0, key = isMail ? raw.toLowerCase() : lnNormPhone(raw, raw.charAt(0) === '+');
    var old = store.bookings().filter(function (b) { return !b.memberId && b.kiosk && (isMail ? String(b.email || '').toLowerCase() === key : b.phone === key); });
    if (!old.length) throw new Error('NO_RECORD');
    m = { id: 'M' + lnId(7), lineUserId: '', name: old[old.length - 1].people[0].name, phone: isMail ? '' : key, email: isMail ? raw : (old[old.length - 1].email || ''), birthMonth: '', consentMarketing: 'FALSE', privacyAt: '', noShows: 0, source: 'kiosk', createdAt: cStamp(now), lastPrefs: '' };
    old.forEach(function (b) {
      b.memberId = m.id; store.saveBooking(b);
      (b.tix || []).forEach(function (id) { var k = lnFind(store.tickets(), id); if (k && !k.memberId) { k.memberId = m.id; store.saveTicket(k); } });
      if (b.orderId) { var o = lnFind(store.orders(), b.orderId); if (o && !o.memberId) { o.memberId = m.id; store.saveOrder(o); } }
    });
  }
  if (m.lineUserId) throw new Error('PHONE_TAKEN');
  m.lineUserId = uid; m.privacyAt = cStamp(now); if (req.consent != null) m.consentMarketing = req.consent ? 'TRUE' : 'FALSE';
  store.saveMember(m);
  if (!store.vouchers().some(function (v) { return v.memberId === m.id && v.kind === 'welcome'; }))
    store.saveVoucher({ id: 'V' + lnId(7), memberId: m.id, kind: 'welcome', addon: 'SCRUB', month: '', year: '', status: 'active', bookingId: '', createdAt: cStamp(now) });
  store.log('', '', 'member_link', m.id);
  return cMe(m, store, now);
}
/* level from what the member paid this year or last year (whichever is higher) */
function cSpent(store, memberId, year) {
  return store.orders().reduce(function (s, o) {
    if (o.memberId !== memberId || o.status !== 'paid' || String(o.paidAt || '').slice(0, 4) !== String(year)) return s;
    var items = o.items; if (typeof items === 'string') { try { items = JSON.parse(items); } catch (e) { items = []; } }
    var tip = (items || []).reduce(function (t, it) { return t + (it && it.en === 'Tip' ? +it.amount || 0 : 0); }, 0);   /* tips go to the therapist, not to the member level */
    return s + Math.max(0, (+o.amount || 0) - tip);
  }, 0);
}
function cTier(store, me, now) {
  var tiers = (LANA.TIERS || []).slice().sort(function (a, b) { return +a.minSpend - +b.minSpend; }), y = +now.date.slice(0, 4);
  if (!tiers.length || !me) return null;
  var spent = cSpent(store, me.id, y), last = cSpent(store, me.id, y - 1), basis = Math.max(spent, last), cur = tiers[0];
  tiers.forEach(function (t) { if (basis >= +t.minSpend) cur = t; });
  var nextT = tiers.filter(function (t) { return +t.minSpend > spent; })[0];
  var free = String(cur.free || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
  return { id: cur.id, name_th: cur.name_th, name_en: cur.name_en || cur.name_th, desc_th: cur.desc_th || '', desc_en: cur.desc_en || cur.desc_th || '', free: free, spent: spent, lastYear: last,
    year: y, next: nextT && nextT.id !== cur.id ? { name_th: nextT.name_th, name_en: nextT.name_en || nextT.name_th, need: +nextT.minSpend - spent, desc_th: nextT.desc_th || '', desc_en: nextT.desc_en || '' } : null };
}
function cProfile(me, req, store, now) {
  var name = String(req.name || '').trim(), phone = lnNormPhone(req.phone, req.intl), email = String(req.email || '').trim();
  if (name) me.name = name.slice(0, 60);
  if (req.phone != null && req.phone !== '') { if (!cPhoneOK(phone)) throw new Error('BAD_PHONE'); var o = cMemberBy(store, 'phone', phone); if (o && o.id !== me.id) throw new Error('PHONE_TAKEN'); me.phone = phone; }
  if (email) { if (!cEmailOK(email)) throw new Error('BAD_EMAIL'); var other = cMemberBy(store, 'email', email); if (other && other.id !== me.id && other.source !== 'merged') throw new Error('EMAIL_TAKEN'); me.email = email; }
  if (req.consent != null) me.consentMarketing = req.consent ? 'TRUE' : 'FALSE';
  if (req.birthMonth != null) { var bm = +req.birthMonth; me.birthMonth = bm >= 1 && bm <= 12 ? bm : ''; }
  store.saveMember(me);
  return cMe(me, store, now);
}
/* gifts that appear on their own: birthday vitamin in the birth month, partner tickets once approved in the Claims sheet */
function cGifts(me, store, now) {
  var month = +now.date.slice(5, 7), year = now.date.slice(0, 4), out = [];
  if (+me.birthMonth === month && !store.vouchers().some(function (v) { return v.memberId === me.id && v.kind === 'birthday' && String(v.year) === year; })) {
    store.saveVoucher({ id: 'V' + lnId(7), memberId: me.id, kind: 'birthday', addon: 'KERA', month: month, year: year, status: 'active', bookingId: '', createdAt: cStamp(now) });
    out.push('birthday');
  }
  store.claims().filter(function (c) { return c.memberId === me.id && String(c.status).toLowerCase() === 'approved'; }).forEach(function (c) {
    var pt = lnFind(LANA.PARTNERS, c.partner) || LANA.PARTNERS[0];
    store.saveTicket({ id: 'T' + lnId(8), memberId: me.id, prog: pt.prog, status: 'active', src: 'partner', rule: pt.rule || '', expires: lnAddDays(now.date, +pt.days || 60), orderId: '', bookingId: '', createdAt: cStamp(now), usedAt: '' });
    c.status = 'issued'; store.saveClaim(c); out.push('claim');
  });
  return out;
}

/* ---------- state for MY LANA ---------- */
function cMe(me, store, now) {
  cSweep(store, now);
  var gifts = cGifts(me, store, now);
  var tix = store.tickets().filter(function (k) { return k.memberId === me.id && k.status === 'active' && !(k.expires && now.date > k.expires); });
  var vs = store.vouchers().filter(function (v) { return v.memberId === me.id && cVoucherOK(v, now); });
  var mine = store.bookings().filter(function (b) { return b.memberId === me.id; });
  var show = mine.filter(function (b) {
    if (['booked', 'checkedin', 'accepted', 'inservice', 'finished'].indexOf(b.status) >= 0) return true;
    if (b.status === 'hold') return true;
    if (b.status === 'done') return !b.thanked && b.date === now.date;
    if (b.status === 'noshow') return !b.seen;
    return false;
  }).sort(function (x, y) { return (x.date + lnHM(x.people[0].alloc[0].start)) < (y.date + lnHM(y.people[0].alloc[0].start)) ? -1 : 1; });
  return {
    member: cMemberPub(me), gifts: gifts, now: now, tier: cTier(store, me, now),
    tickets: tix.map(function (k) { return { id: k.id, prog: k.prog, src: k.src, rule: k.rule || '', expires: k.expires || '' }; }),
    passes: store.tickets().filter(function (k) { return k.memberId === me.id && k.status === 'pass'; }).map(function (k) { return { id: k.id, prog: k.prog, expires: k.expires }; }),
    vouchers: vs.map(function (v) { return { id: v.id, kind: v.kind, addon: v.addon, expires: v.expires || '', code: v.code || '' }; }),
    claims: store.claims().filter(function (c) { return c.memberId === me.id && String(c.partner).indexOf('CODE:') !== 0; }).map(function (c) { return { id: c.id, partner: c.partner, receipt: c.receipt, status: String(c.status).toLowerCase() }; }),
    bookings: show.map(function (b) { return cView(b, store, now, true); }),
    lastPrefs: cJSON(me.lastPrefs, {}),
    history: cHistory(store, me)
  };
}
/* recent visits and purchases for MY LANA */
function cHistory(store, me) {
  var paidFor = {}, out = [];
  store.orders().forEach(function (o) { if (o.memberId === me.id && o.status === 'paid') {
    if (o.bookingId) paidFor[o.bookingId] = (paidFor[o.bookingId] || 0) + (+o.amount || 0);
    if (o.kind === 'buy' || o.kind === 'upcourse') out.push({ type: 'buy', date: String(o.paidAt || o.createdAt).slice(0, 10), prog: o.prog, count: +o.count || 1, amount: +o.amount || 0 });
  } });
  store.bookings().forEach(function (b) {
    if (b.memberId !== me.id || ['done', 'finished', 'noshow'].indexOf(b.status) < 0) return;
    out.push({ type: b.status === 'noshow' ? 'noshow' : 'visit', date: b.date, start: b.people[0].alloc[0].start, prog: b.people[0].prog, n: b.people.length, branch: b.branch, amount: paidFor[b.id] || 0, stars: +b.stars || 0, kiosk: !!b.kiosk });
  });
  out.sort(function (x, y) { return x.date < y.date ? 1 : x.date > y.date ? -1 : (y.start || 0) - (x.start || 0); });
  return out.slice(0, 15);
}
function cJSON(s, d) { if (s && typeof s === 'object') return s; try { return s ? JSON.parse(s) : d; } catch (e) { return d; } }
function cStamp(now) { return now.date + ' ' + lnHM(now.min); }

/* what the customer sees about one visit */
function cView(b, store, now, withChecks) {
  var p0 = b.people[0], a0 = p0.alloc, st = a0[0].start;
  var v = { id: b.id, code: b.code, q: b.q || '', status: b.status, branch: b.branch, date: b.date, start: st,
    end: Math.max.apply(null, b.people.map(function (pe) { return pe.alloc[pe.alloc.length - 1].end; })),
    people: b.people.map(function (pe) { return { name: pe.name, prog: pe.prog, hair: pe.hair || '', style: pe.style || 'normal', addons: pe.addons || [], pressure: pe.pressure || 'medium', elbow: pe.elbow || 'ok', stretch: pe.stretch || 'ok', focus: pe.focus || [], quiet: !!pe.quiet }; }),
    ext: b.ext || 0, due: (b.due || []).map(function (d) { return { th: d.th, en: d.en, amount: d.amount }; }), paid: +b.paid || 0, guest: !!b.guest, kiosk: !!b.kiosk,
    staffName: b.staffName || '', upgrade: b.upgrade || null, earlyReq: !!b.earlyReq, endCap: b.endCap || null, stars: +b.stars || 0,
    single: (b.tix || []).every(function (id) { var k = lnFind(store.tickets(), id); return !k || k.src === 'single' || k.src === 'kiosk'; }),
    quiet: (b.tix || []).some(function (id) { var k = lnFind(store.tickets(), id); return k && k.rule === 'quiet'; }), holdUntil: b.holdUntil || null, orderId: b.orderId || '', payAtShop: !!b.payAtShop, tixHeld: b.payAtShop ? (b.tix || []).length : 0 };
  if (b.status === 'inservice' || b.status === 'finished') { v.svcStart = +b.svcStart; v.liveEnd = lnEnd(b) || v.end; }
  if (withChecks && b.status === 'inservice') {
    var br = lnFind(store.branches(), b.branch), copy = JSON.parse(JSON.stringify(b)), all = store.bookings().map(function (x) { return x.id === b.id ? copy : JSON.parse(JSON.stringify(x)); });
    lnAddExt(copy, 1);
    var r = lnTryChange(copy, br, all, now.min, false);
    v.canExtend = r.ok; v.extBlock = r.ok ? '' : r.res === 'close' ? 'close' : r.res;
    var nxt = r.ok ? null : cNextOn(store, b, r.res, now); v.extNext = nxt;
  }
  if (withChecks && b.status === 'booked' && b.date === now.date) v.earlier = cEarlierSlots(b, store, now);
  return v;
}
function cNextOn(store, b, res, now) {
  var t = []; store.bookings().forEach(function (x) { if (x.id !== b.id && x.branch === b.branch && x.date === b.date && ['booked', 'checkedin', 'accepted', 'hold'].indexOf(x.status) >= 0) x.people.forEach(function (pe) { pe.alloc.forEach(function (a) { if (a.res === res && a.start >= now.min) t.push(a.start); }); }); });
  t.sort(function (x, y) { return x - y; }); return t.length ? t[0] : null;
}

/* ---------- tickets ---------- */
function cTicketOK(k, date, start) {
  if (k.expires && date > k.expires) return false;
  if (k.rule === 'quiet') { var d = lnDow(date); if (d < 1 || d > 4 || start >= 16 * 60) return false; }
  return true;
}
function cPickTickets(store, memberId, prog, n, date, start) {
  var ok = store.tickets().filter(function (k) { return k.memberId === memberId && k.status === 'active' && k.prog === prog && cTicketOK(k, date, start); });
  ok.sort(function (a, b) { var q = (a.rule === 'quiet' ? 0 : 1) - (b.rule === 'quiet' ? 0 : 1); if (q) return q; var ea = a.expires || '9999', eb = b.expires || '9999'; return ea < eb ? -1 : ea > eb ? 1 : 0; });
  return ok.length >= n ? ok.slice(0, n) : null;
}

/* ---------- people, seats, times ---------- */
function cCleanPerson(prog, raw, i, me) {
  raw = raw || {};
  var hair = lnTrue(prog.hair) ? (lnFind(LANA.HAIR, raw.hair) ? raw.hair : null) : '';
  var style = lnTrue(prog.hair) && lnFind(LANA.STYLES, raw.style) ? raw.style : 'normal';
  var addons = lnAddonFix(prog.id, raw.addons || []).filter(function (id, j, arr) { var x = lnFind(LANA.ADDONS, id); return x && lnAddonFor(x, prog.id) && arr.indexOf(id) === j; });
  var note = String(raw.note || '').trim().slice(0, 200), codes = LANA.ALERTS.map(function (a) { return a[0]; });
  var alerts = (raw.alerts || []).map(String).filter(function (c, j, arr) { return codes.indexOf(c) >= 0 && arr.indexOf(c) === j; });
  return { name: String(raw.name || (i === 0 && me ? me.name : '') || '').trim().slice(0, 40) || (i === 0 ? 'Guest' : 'ผู้ติดตาม ' + (i + 1)), prog: prog.id, hair: hair, style: style, addons: addons,
    pressure: ['light', 'medium', 'firm'].indexOf(raw.pressure) >= 0 ? raw.pressure : 'medium', elbow: raw.elbow === 'no' ? 'no' : 'ok', stretch: raw.stretch === 'no' ? 'no' : 'ok',
    focus: (raw.focus || []).map(String).slice(0, 6), quiet: !!raw.quiet, note: note && raw.healthOk ? note : '', alerts: raw.healthOk ? alerts : [], healthOk: !!((note || alerts.length) && raw.healthOk) };
}
function cRows(store, date, exceptId) {
  var bks = store.bookings().filter(function (b) { return b.date === date; }), today = LN_NOW && LN_NOW.date === date;
  var rows = lnOccupied(bks, exceptId, today ? LN_NOW.min : null);
  if (today) bks.forEach(function (b) {   /* guests already here but not started yet cannot start in the past: their plan slides to now */
    if (b.status !== 'checkedin' || b.id === exceptId) return; var d = LN_NOW.min - b.people[0].alloc[0].start; if (d <= 0) return;
    rows.forEach(function (r) { if (r.bid === b.id) { r.start += d; r.end += d; } });
  });
  return rows;
}
function cDateOK(date, now) { return /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= now.date && date <= lnAddDays(now.date, LN_C.DAYS - 1); }
function cSlots(req, store, now, me) {
  cSweep(store, now);
  var br = lnFind(store.branches(), req.branch), resch = null, chains, tixCheck, n;
  if (!br || !cDateOK(req.date, now)) return { times: [] };
  if (req.resched) {
    if (!me) throw new Error('LOGIN');
    resch = lnFind(store.bookings(), req.resched); if (!resch || resch.memberId !== me.id) throw new Error('NOT_FOUND');
    var rt = (resch.tix || []).map(function (id) { return lnFind(store.tickets(), id); }).filter(Boolean);
    chains = resch.people.map(function (pe) { return pe.chain; }); n = chains.length;
    tixCheck = function (m) { return rt.every(function (k) { return cTicketOK(k, req.date, m); }); };
    if (!lnProgAt(lnFind(LANA.PROGRAMS, resch.people[0].prog), br)) return { times: [] };
  } else {
    var prog = lnFind(LANA.PROGRAMS, req.prog); if (!prog || !lnProgAt(prog, br)) return { times: [] };
    var people = (Array.isArray(req.people) && req.people.length ? req.people : [{}]).slice(0, 4).map(function (x, i) { return cCleanPerson(prog, x, i, me); });
    n = people.length; chains = people.map(function (pe) { return lnChain(prog, pe); });
    tixCheck = me ? function (m) { return !!cPickTickets(store, me.id, prog.id, n, req.date, m); } : function () { return true; };
  }
  var rows = cRows(store, req.date, resch ? resch.id : null), maxLen = Math.max.apply(null, chains.map(lnChainMin)), out = [];
  for (var m = LANA.OPEN; m + maxLen <= LANA.CLOSE; m += LN_C.STEP) {
    if (req.date === now.date && m < now.min + LN_C.LEAD) continue;
    out.push({ m: m, ok: !!(tixCheck(m) && lnAllocate(br, req.date, m, chains, rows)) });
  }
  return { times: out, minutes: maxLen };
}
function cUpcoming(store, memberId) { return store.bookings().filter(function (b) { return b.memberId === memberId && (b.status === 'booked' || b.status === 'hold'); }); }
function cVoucherFree(store, me, now, prog, addons) {
  var month = +now.date.slice(5, 7), free = [], used = [];
  (addons || []).forEach(function (id) {
    var v = store.vouchers().filter(function (x) { return x.memberId === me.id && x.addon === id && used.indexOf(x) < 0 && cVoucherOK(x, now); })[0];
    if (v) { free.push(id); used.push(v); }
  });
  return { free: free, used: used };
}
function cBook(me, req, store, now) {
  cSweep(store, now);
  var prog = lnFind(LANA.PROGRAMS, req.prog), br = lnFind(store.branches(), req.branch), m = +req.time;
  if (!cTimeOK(req.time)) throw new Error('BAD_TIME');
  if (!prog || !br || !lnProgAt(prog, br)) throw new Error('NOT_HERE');
  if (!cDateOK(req.date, now) || (req.date === now.date && m < now.min + LN_C.LEAD)) throw new Error('BAD_TIME');
  if (cUpcoming(store, me.id).length >= LN_C.MAX_UPCOMING) throw new Error('TOO_MANY');
  var span = lnChainMin(lnChain(prog, cCleanPerson(prog, (req.people || [])[0] || {}, 0, me)));
  if (store.bookings().some(function (x) { if (x.memberId !== me.id || x.date !== req.date || ['hold', 'booked', 'checkedin', 'accepted', 'inservice'].indexOf(x.status) < 0) return false;
    var a = x.people[0].alloc[0].start, e = Math.max.apply(null, x.people.map(function (pe) { return pe.alloc[pe.alloc.length - 1].end; })); return m < e && a < m + span; })) throw new Error('OVERLAP');
  if ((+me.noShows || 0) >= 2 && req.date !== now.date) throw new Error('SAME_DAY_ONLY');
  var people = (req.people || []).slice(0, 4).map(function (x, i) { return cCleanPerson(prog, x, i, me); });
  if (!people.length) throw new Error('BAD_FORM');
  if (lnTrue(prog.hair) && people.some(function (pe) { return !pe.hair; })) throw new Error('NEED_HAIR');
  var tix = cPickTickets(store, me.id, prog.id, people.length, req.date, m); if (!tix) throw new Error('NO_TICKET');
  var chains = people.map(function (pe) { return lnChain(prog, pe); }), al = lnAllocate(br, req.date, m, chains, cRows(store, req.date, null));
  if (!al) throw new Error('SLOT_TAKEN');
  var tier = cTier(store, me, now), tf = tier ? tier.free : [], tn = tier ? tier.name_en : '';
  var vf = cVoucherFree(store, me, now, prog, people[0].addons.filter(function (id) { return tf.indexOf(id) < 0; })), due = 0;
  people.forEach(function (pe, i) { pe.chain = chains[i]; pe.alloc = al[i]; due += lnSum(lnPersonLines(prog, pe, i === 0 ? vf.free : [], i === 0 ? tf : [], tn)); });
  var b = { id: lnId(8), code: 'LN' + lnId(5), q: '', branch: br.id, date: req.date, status: due ? 'hold' : 'booked', people: people, ext: 0, due: [], live: [],
    memberId: me.id, tix: tix.map(function (k) { return k.id; }), vouchers: vf.used.map(function (v) { return v.id; }), paid: 0, src: 'line', email: me.email, phone: me.phone };
  tix.forEach(function (k) { k.status = 'booked'; k.bookingId = b.id; store.saveTicket(k); });
  tix.forEach(function (k, i) { if (k.src === 'partner' && b.people[i]) b.people[i].partner = true; });   /* free partner ticket: therapist gets the partner fee */
  vf.used.forEach(function (v) { v.status = 'used'; v.bookingId = b.id; store.saveVoucher(v); });
  me.lastPrefs = JSON.stringify({ prog: prog.id, addons: people[0].addons, style: people[0].style, pressure: people[0].pressure, elbow: people[0].elbow, stretch: people[0].stretch, focus: people[0].focus, quiet: people[0].quiet, hair: people[0].hair });
  store.saveMember(me);
  var out = { bookingId: b.id };
  if (due) {
    b.holdUntil = cStamp({ date: now.date, min: now.min + LN_C.HOLD_MIN });
    var lines = []; people.forEach(function (pe, i) { lnPersonLines(prog, pe, i === 0 ? vf.free : [], i === 0 ? tf : [], tn).forEach(function (l) { if (l.amount) lines.push(l); }); });
    var o = cNewOrder(store, now, { memberId: me.id, kind: 'book', amount: due, bookingId: b.id, items: lines, label: prog.name_en + ' extras' }, req.returnUrl);
    b.orderId = o.id; out.orderId = o.id; out.url = o.beamUrl; out.amount = due;
  }
  store.saveBooking(b);
  if (!due) cConfirmMail(store, b, me);
  store.log('', b.id, 'book', b.status + ' ' + br.id + ' ' + b.date + ' ' + lnHM(m));
  out.booking = cView(b, store, now, false);
  return out;
}
function cOwn(store, me, id) { var b = lnFind(store.bookings(), id); if (!b || !me || b.memberId !== me.id) throw new Error('NOT_FOUND'); return b; }
function cResched(me, req, store, now) {
  cSweep(store, now);
  var b = cOwn(store, me, req.id); if (b.status !== 'booked') throw new Error('CANT_MOVE');
  var br = lnFind(store.branches(), req.branch), m = +req.time;
  if (!cTimeOK(req.time)) throw new Error('BAD_TIME');
  if (!br || !lnProgAt(lnFind(LANA.PROGRAMS, b.people[0].prog), br)) throw new Error('NOT_HERE');
  if (!cDateOK(req.date, now) || (req.date === now.date && m < now.min + LN_C.LEAD)) throw new Error('BAD_TIME');
  if ((+me.noShows || 0) >= 2 && req.date !== now.date) throw new Error('SAME_DAY_ONLY');
  if (!(b.tix || []).every(function (id) { var k = lnFind(store.tickets(), id); return !k || cTicketOK(k, req.date, m); })) throw new Error('TICKET_RULE');
  var al = lnAllocate(br, req.date, m, b.people.map(function (pe) { return pe.chain; }), cRows(store, req.date, b.id));
  if (!al) throw new Error('SLOT_TAKEN');
  b.branch = br.id; b.date = req.date; b.people.forEach(function (pe, i) { pe.alloc = al[i]; }); b.reminded = false;
  store.saveBooking(b); cConfirmMail(store, b, me, true); store.log('', b.id, 'resched', br.id + ' ' + b.date + ' ' + lnHM(m));
  return cMe(me, store, now);
}
/* same-day earlier times that fit everyone (they need ~30 min to get here) */
function cEarlierSlots(b, store, now) {
  var st = b.people[0].alloc[0].start, out = [], br = lnFind(store.branches(), b.branch), chains = b.people.map(function (pe) { return pe.chain; }), rows = cRows(store, b.date, b.id);
  var tix = (b.tix || []).map(function (id) { return lnFind(store.tickets(), id); }).filter(Boolean);
  for (var m = Math.ceil((now.min + LN_C.LEAD) / LN_C.STEP) * LN_C.STEP; m <= st - 60 && out.length < 4; m += LN_C.STEP)
    if (tix.every(function (k) { return cTicketOK(k, b.date, m); }) && lnAllocate(br, b.date, m, chains, rows)) out.push(m);
  return out;
}
function cEarlier(me, req, store, now) {
  var b = cOwn(store, me, req.id); if (b.status !== 'booked' || b.date !== now.date) throw new Error('CANT_MOVE');
  if (cEarlierSlots(b, store, now).indexOf(+req.time) < 0) throw new Error('SLOT_TAKEN');
  var al = lnAllocate(lnFind(store.branches(), b.branch), b.date, +req.time, b.people.map(function (pe) { return pe.chain; }), cRows(store, b.date, b.id));
  b.people.forEach(function (pe, i) { pe.alloc = al[i]; }); b.reminded = false;
  store.saveBooking(b); cConfirmMail(store, b, me, true);
  return cMe(me, store, now);
}

/* ---------- check-in (shop QR in LINE, or counter tablet) ----------
   window: 30 min before to 30 min after the booked time. Late > 5 min: ends at the original time. Late > LANA.NOSHOW_MIN (Config noShowMin, 15): no-show, seats free again, tickets go back. */
function cNoShow(store, b, now) {
  b.status = 'noshow';
  (b.tix || []).forEach(function (id) { var k = lnFind(store.tickets(), id); if (k && k.status === 'booked') { k.status = 'active'; k.bookingId = ''; store.saveTicket(k); } });
  store.saveBooking(b);
  var m = lnFind(store.members(), b.memberId); if (m) { m.noShows = (+m.noShows || 0) + 1; store.saveMember(m); }
  store.log('', b.id, 'noshow', '');
}
/* a booking time must be a whole number of minutes inside opening hours (e.g. 900 = 15:00) */
function cTimeOK(t) { var m = +t; return t !== '' && t != null && isFinite(m) && m === Math.round(m) && m >= LANA.OPEN && m < LANA.CLOSE && (m - LANA.OPEN) % LN_C.STEP === 0; }
function cQueue(store, b) {
  if (b.q) return b.q;
  var n = 1;   /* next number after the highest one today, so numbers never repeat */
  store.bookings().forEach(function (x) { if (x.branch === b.branch && x.date === b.date && x.q) { var k = +String(x.q).replace(/\D/g, ''); if (k >= n) n = k + 1; } });
  return 'A' + (n < 10 ? '0' : '') + n;
}
function cDoCheckin(store, b, branchId, now, move) {
  var st = b.people[0].alloc[0].start, br = lnFind(store.branches(), branchId);
  if (b.status !== 'booked') return { result: 'already' };
  if (b.date !== now.date) return { result: 'otherday' };
  if (now.min > st + LANA.NOSHOW_MIN) { cNoShow(store, b, now); return { result: 'noshow' }; }
  var startNow = Math.ceil(now.min / 5) * 5, chains = b.people.map(function (pe) { return pe.chain; });
  var canNow = lnProgAt(lnFind(LANA.PROGRAMS, b.people[0].prog), br) && !!lnAllocate(br, now.date, startNow, chains, cRows(store, now.date, b.id));
  if (b.branch !== branchId || now.min < st - 30) {
    if (!move) return { result: b.branch !== branchId ? 'otherbranch' : 'early', canNow: canNow, opensAt: st - 30 };
    if (!canNow) return { result: 'nofree' };
    var al = lnAllocate(br, now.date, startNow, chains, cRows(store, now.date, b.id));
    b.branch = branchId; b.people.forEach(function (pe, i) { pe.alloc = al[i]; }); b.endCap = null;
  } else if (now.min > st + 5) b.endCap = st + Math.max.apply(null, chains.map(lnChainMin));
  b.status = 'checkedin'; b.q = cQueue(store, b); b.checkedAt = lnHM(now.min);
  store.saveBooking(b); store.log('', b.id, 'checkin', branchId + (move ? ' moved' : ''));
  return { result: 'checkedin', q: b.q, late: b.endCap ? now.min - st : 0 };
}
/* the visit that matters right now: one in progress, else the next booked one, else one finished and waiting to pay */
function cTodayVisit(store, memberId, now) {
  var mine = store.bookings().filter(function (x) { return x.memberId === memberId && x.date === now.date; })
    .sort(function (x, y) { return x.people[0].alloc[0].start - y.people[0].alloc[0].start; });
  var pick = function (sts) { return mine.filter(function (x) { return sts.indexOf(x.status) >= 0; })[0] || null; };
  /* several bookings today: the one still in its check-in window (not over 30 min late) comes first */
  var open = mine.filter(function (x) { return x.status === 'booked' && x.people[0].alloc[0].start >= now.min - 30; })[0] || null;
  return pick(['checkedin', 'accepted', 'inservice']) || open || pick(['booked']) || pick(['finished']);
}
/* at the door: a booking whose check-in window is open now beats a visit that is only waiting */
function cCheckinVisit(store, memberId, now) {
  var due = store.bookings().filter(function (x) { var st = x.people[0].alloc[0].start; return x.memberId === memberId && x.date === now.date && x.status === 'booked' && now.min >= st - 30 && now.min <= st + LANA.NOSHOW_MIN; })[0];
  var cur = cTodayVisit(store, memberId, now);
  return due && (!cur || cur.status !== 'inservice') ? due : cur;
}
function cCheckinAt(me, req, store, now) {
  cSweep(store, now);
  var br = lnFind(store.branches(), String(req.branch || '').toUpperCase()); if (!br || !lnTrue(br.active)) throw new Error('BAD_BRANCH');
  var b = req.id ? cOwn(store, me, req.id) : cCheckinVisit(store, me.id, now);
  var missed = !b && store.bookings().filter(function (x) { return x.memberId === me.id && x.date === now.date && x.status === 'noshow'; })[0];
  var r = b ? cDoCheckin(store, b, br.id, now, !!req.move) : missed ? { result: 'noshow' } : { result: 'none' };
  if (missed) b = missed;
  var out = cMe(me, store, now); out.checkin = r; out.checkin.bookingId = b ? b.id : ''; return out;
}

/* ---------- during and after the visit ---------- */
function cByVkey(store, vkey) { var b = vkey ? store.bookings().filter(function (x) { return x.vkey && x.vkey === vkey; })[0] : null; if (!b) throw new Error('NOT_FOUND'); return b; }
function cVisitAction(a, req, store, now, me) {
  var b = me ? cOwn(store, me, req.id) : req.vkey ? cByVkey(store, req.vkey) : lnFind(store.bookings(), req.id);
  if (!b) throw new Error('NOT_FOUND');
  if (req.kiosk && !req.vkey && !me && req.branch && b.branch !== req.branch) throw new Error('NOT_FOUND');
  var br = lnFind(store.branches(), b.branch), out = {};
  if (a === 'extend') {
    if (b.status !== 'inservice') throw new Error('NOT_NOW');
    if (!req.kiosk) throw new Error('ASK_THERAPIST');   /* extending is done by the therapist in the staff app */
    lnAddExt(b, 1);
    var r = lnTryChange(b, br, store.bookings(), now.min, true);
    if (!r.ok) { lnAddExt(b, -1); throw new Error(r.res === 'close' ? 'CLOSING' : r.res === 'crew' ? 'NO_CREW' : 'NO_ROOM'); }
    b.ext = (b.ext || 0) + 1; b.due = b.due || []; b.due.push({ kind: 'ext', th: 'ต่อเวลา 30 นาที', en: 'Extra 30 min', amount: lnBkExtPrice(b) });
    store.saveBooking(b); r.moved.forEach(function (x) { store.saveBooking(x); }); store.log('', b.id, 'extend_by_guest', '');
  } else if (a === 'early') {
    if (b.status !== 'inservice') throw new Error('NOT_NOW');
    b.earlyReq = true; store.saveBooking(b); store.log('', b.id, 'early_request', lnHM(now.min));
  } else if (a === 'upgrade') {
    var u = b.upgrade; if (b.status !== 'inservice' || !u || u.state !== 'pending') throw new Error('NOT_NOW');
    if (req.yes) {
      var hTo = lnFind(LANA.HAIR, u.to), hFrom = lnFind(LANA.HAIR, u.from) || LANA.HAIR[0];
      b.due = b.due || []; b.due.push({ kind: 'hair', th: 'อัปเกรดผมยาว', en: 'Long-hair upgrade', amount: Math.max(0, hTo.price - hFrom.price) });
      b.people[0].hair = u.to; var before = b.people[0].dryPlus || 0; b.people[0].dryPlus = before + Math.max(0, hTo.min - hFrom.min);
      var ru = lnTryChange(b, br, store.bookings(), now.min, true);
      if (!ru.ok) { b.people[0].dryPlus = before; out.note = 'DRYER_BUSY'; } else ru.moved.forEach(function (x) { store.saveBooking(x); });
      u.state = 'accepted';
    } else u.state = 'declined';
    store.saveBooking(b);
  } else if (a === 'checkout') {
    if (b.status !== 'finished') throw new Error('NOT_NOW');
    var tip = Math.max(0, Math.min(5000, Math.round(+req.tip || 0))), stars = Math.max(1, Math.min(5, Math.round(+req.stars || 0)));
    if (!+req.stars) throw new Error('NEED_STARS');
    b.co = { tip: tip, stars: stars, cmt: String(req.cmt || '').slice(0, 500) };
    var total = lnSum(b.due || []) + tip;
    var open = b.orderId ? lnFind(store.orders(), b.orderId) : null;
    if (open && open.kind === 'checkout' && open.status === 'pending') {
      if (+open.amount === total) { store.saveBooking(b); out.orderId = open.id; out.url = open.beamUrl; out.amount = total; return out; }
      open.status = 'replaced'; store.saveOrder(open);   /* tip changed: the old link is replaced (a payment on it is still caught and logged) */
    }
    if (total > 0) {
      var o = cNewOrder(store, now, { memberId: b.memberId || '', kind: 'checkout', amount: total, bookingId: b.id, items: (b.due || []).concat(tip ? [{ th: 'ทิป', en: 'Tip', amount: tip }] : []), label: 'Lana balance' }, req.returnUrl);
      b.orderId = o.id; store.saveBooking(b); out.orderId = o.id; out.url = o.beamUrl; out.amount = total;
    } else cCheckoutDone(store, b, now);
  } else if (a === 'thanked' || a === 'seen') {
    if (a === 'thanked') b.thanked = true; else b.seen = true; store.saveBooking(b);
  } else if (a === 'upcourse') {
    if (b.status !== 'done' || b.thanked || +b.stars !== 5) throw new Error('NOT_NOW');
    var p = lnFind(LANA.PROGRAMS, b.people[0].prog), credit = p.price * b.people.length, rest = Math.max(0, lnPack(p, 5) - credit), more = 5 - b.people.length;
    if (more <= 0 || !b.memberId) throw new Error('NOT_NOW');
    var o2 = cNewOrder(store, now, { memberId: b.memberId, kind: 'upcourse', amount: rest, bookingId: b.id, items: [{ th: p.name_th + ' คอร์ส 5 ครั้ง (หักที่จ่ายวันนี้)', en: p.name_en + ' 5-session pack', amount: rest }], label: p.name_en + ' pack', prog: p.id, count: more }, req.returnUrl);
    out.orderId = o2.id; out.url = o2.beamUrl; out.amount = rest;
  }
  out.booking = cView(b, store, now, true);
  return out;
}
function cCheckoutDone(store, b, now) {
  b.status = 'done'; b.paidDue = true; b.tip = b.co ? b.co.tip : 0; b.stars = b.co ? b.co.stars : 0; b.comment = b.co ? b.co.cmt : '';
  (b.tix || []).forEach(function (id) { var k = lnFind(store.tickets(), id); if (k) { k.status = 'used'; k.usedAt = cStamp(now); store.saveTicket(k); } });
  store.saveBooking(b); store.log(b.staffId || '', b.id, 'checkout', 'stars ' + b.stars + ' tip ' + b.tip);
}

/* ---------- buying ---------- */
function cBuy(me, req, store, now) {
  var p = lnFind(LANA.PROGRAMS, req.prog), n = { '1': 1, '3': 3, '5': 5, '11': 11, 'pass': 'pass' }[String(req.pack)];
  if (!p || !n || !lnOnSale(p)) throw new Error('BAD_FORM');
  var amount = lnPack(p, n); if (!amount) throw new Error('BAD_FORM');
  if (n === 'pass') {
    var po = cNewOrder(store, now, { memberId: me.id, kind: 'buy', amount: amount, prog: p.id, count: 1, pass: 30, items: [{ th: p.name_th + ' บุฟเฟ่ต์ 30 วัน', en: p.name_en + ' 30-day buffet', amount: amount }], label: p.name_en + ' buffet' }, req.returnUrl);
    return { orderId: po.id, url: po.beamUrl, amount: amount };
  }
  var o = cNewOrder(store, now, { memberId: me.id, kind: 'buy', amount: amount, prog: p.id, count: n, items: [{ th: p.name_th + ' × ' + n, en: p.name_en + ' × ' + n, amount: amount }], label: p.name_en + ' × ' + n }, req.returnUrl);
  return { orderId: o.id, url: o.beamUrl, amount: amount };
}
/* clinic code typed into the customer's LINE app: one free ticket, once per member per code */
function cRedeem(me, req, store, now) {
  var code = String(req.code || '').trim().toLowerCase().replace(/\s+/g, '');
  var pt = (LANA.PARTNERS || []).filter(function (p) { return p.code && String(p.code).trim().toLowerCase() === code; })[0];
  if (code && !pt) return cRedeemPromo(me, code, store, now);
  if (!code || !pt) throw new Error('BAD_CODE');
  if (store.claims().some(function (c) { return c.memberId === me.id && c.partner === pt.id; })) throw new Error('CODE_USED');
  store.saveTicket({ id: 'T' + lnId(8), memberId: me.id, prog: pt.prog, status: 'active', src: 'partner', rule: pt.rule || '', expires: +pt.days ? lnAddDays(now.date, +pt.days) : '', orderId: '', bookingId: '', createdAt: cStamp(now), usedAt: '' });
  store.saveClaim({ id: 'C' + lnId(7), memberId: me.id, partner: pt.id, receipt: code, status: 'issued', createdAt: cStamp(now), name: me.name, phone: me.phone });
  store.log('', '', 'partner_code', pt.id + ' ' + me.id);
  var out = cMe(me, store, now); out.redeemed = { partner: pt.id, prog: pt.prog }; return out;
}
/* promo code from the sheet Codes: once per member, until the last day */
function cRedeemPromo(me, code, store, now) {
  var pc = (LANA.CODES || []).filter(function (c) { return c.code && String(c.code).trim().toLowerCase().replace(/\s+/g, '') === code; })[0];
  if (!pc || String(pc.active).toUpperCase() === 'FALSE') throw new Error('BAD_CODE');
  var until = String(pc.until || '').trim();
  if (until && now.date > until) throw new Error('CODE_EXPIRED');
  var key = 'CODE:' + String(pc.code).trim().toUpperCase();
  if (store.claims().some(function (c) { return c.memberId === me.id && c.partner === key; })) throw new Error('CODE_USED');
  var gives = String(pc.gives || '').trim(), ad = lnFind(LANA.ADDONS, gives), pg = lnFind(LANA.PROGRAMS, gives), out;
  if (ad) store.saveVoucher({ id: 'V' + lnId(7), memberId: me.id, kind: 'promo', addon: ad.id, month: '', year: '', status: 'active', bookingId: '', createdAt: cStamp(now), expires: until, code: String(pc.code).trim() });
  else if (pg) store.saveTicket({ id: 'T' + lnId(8), memberId: me.id, prog: pg.id, status: 'active', src: 'promo', rule: '', expires: until, orderId: '', bookingId: '', createdAt: cStamp(now), usedAt: '' });
  else throw new Error('BAD_CODE');
  store.saveClaim({ id: 'C' + lnId(7), memberId: me.id, partner: key, receipt: code, status: 'issued', createdAt: cStamp(now), name: me.name, phone: me.phone });
  store.log('', '', 'promo_code', key + ' ' + me.id);
  out = cMe(me, store, now); out.redeemed = ad ? { addon: ad.id, until: until } : { prog: pg.id, until: until }; return out;
}
function cVoucherOK(v, now) { return v.status === 'active' && !(v.expires && now.date > v.expires) && (v.kind !== 'birthday' || +v.month === +now.date.slice(5, 7)); }
function cClaim(me, req, store, now) {
  var r = String(req.receipt || '').trim().toUpperCase(), pt = lnFind(LANA.PARTNERS, req.partner) || LANA.PARTNERS[0];
  if (r.length < 4) throw new Error('BAD_RECEIPT');
  if (store.claims().some(function (c) { return String(c.receipt).toUpperCase() === r && c.partner === pt.id; })) throw new Error('CLAIMED');
  store.saveClaim({ id: 'C' + lnId(7), memberId: me.id, partner: pt.id, receipt: r, status: 'pending', createdAt: cStamp(now), name: me.name, phone: me.phone });
  return cMe(me, store, now);
}

/* ---------- orders and Beam ---------- */
function cNewOrder(store, now, o, returnUrl) {
  o.id = 'O' + lnId(9); o.status = 'pending'; o.createdAt = cStamp(now); o.paidAt = '';
  var link = store.beamCreate(o, returnUrl, now);
  o.beamId = link.id; o.beamUrl = link.url;
  store.saveOrder(o); store.log('', o.bookingId || '', 'order_' + o.kind, o.id + ' ' + o.amount);
  return o;
}
/* the app polls this after Beam sends the customer back; also the minute trigger checks pending orders */
function cOrderState(req, store, now) {
  var o = lnFind(store.orders(), req.id); if (!o) throw new Error('NOT_FOUND');
  cSweep(store, now);
  if (o.status === 'pending' || o.status === 'replaced') cCheckOrder(store, o, now);
  var b = o.bookingId ? lnFind(store.bookings(), o.bookingId) : null;
  /* the hold ran out: the page stops waiting (the order stays open in the sheet so a late payment is still caught) */
  var shown = o.status === 'pending' && b && b.status === 'cancelled' && (o.kind === 'walkin' || o.kind === 'book') ? 'expired' : o.status;
  return { id: o.id, kind: o.kind, status: shown, amount: +o.amount, prog: o.prog || '', count: +o.count || 0, bookingId: o.bookingId || '', q: b ? b.q || '' : '', vkey: b && o.kind === 'walkin' ? b.vkey : '' };
}
/* the guest pressed cancel on Beam's page (or "cancel" in the app): close the link and give the seats and tickets back now, not after the 20-minute hold */
function cPayCancel(req, store, now) {
  var o = lnFind(store.orders(), req.id); if (!o) throw new Error('NOT_FOUND');
  if (o.status === 'pending' || o.status === 'replaced') cCheckOrder(store, o, now);   /* paid after all? then it is kept */
  if (o.status === 'pending' || o.status === 'replaced') {
    try { if (store.beamDisable) store.beamDisable(o.beamId); } catch (e) {}
    o.status = 'cancelled'; store.saveOrder(o); store.log('', o.bookingId || '', 'pay_cancelled', o.id);
    var b = o.bookingId ? lnFind(store.bookings(), o.bookingId) : null;
    if (b && b.status === 'hold' && (o.kind === 'book' || o.kind === 'walkin') && b.orderId === o.id) cReleaseHold(store, b);
  }
  return cOrderState({ id: o.id }, store, now);
}
function cCheckOrder(store, o, now) {
  var st = '';
  try { st = String(store.beamStatus(o.beamId) || '').toUpperCase(); } catch (e) { return; }
  if (st === 'PAID') cFulfil(store, o, now);
  else if (st === 'EXPIRED' || st === 'DISABLED') { o.status = 'expired'; store.saveOrder(o); var b = o.bookingId ? lnFind(store.bookings(), o.bookingId) : null; if (b && b.status === 'hold') cReleaseHold(store, b); }
}
function cFulfil(store, o, now) {
  if (o.status === 'paid') return;
  o.status = 'paid'; o.paidAt = cStamp(now); store.saveOrder(o);
  var b = o.bookingId ? lnFind(store.bookings(), o.bookingId) : null, m = o.memberId ? lnFind(store.members(), o.memberId) : null;
  if (o.kind === 'buy' && +o.pass) {
    /* buffet: one pass ticket; each day it gives one normal ticket (see cPassMint) */
    store.saveTicket({ id: 'P' + lnId(8), memberId: o.memberId, prog: o.prog, status: 'pass', src: 'pass', rule: '', expires: lnAddDays(now.date, +o.pass - 1), orderId: o.id, bookingId: '', createdAt: cStamp(now), usedAt: '' });
    cPassMint(store, now);
  } else if (o.kind === 'buy') {
    for (var i = 0; i < +o.count; i++) store.saveTicket({ id: 'T' + lnId(8), memberId: o.memberId, prog: o.prog, status: 'active', src: +o.count === 1 ? 'single' : 'course', rule: '', expires: '', orderId: o.id, bookingId: '', createdAt: cStamp(now), usedAt: '' });
  } else if (o.kind === 'upcourse') {
    for (var j = 0; j < +o.count; j++) store.saveTicket({ id: 'T' + lnId(8), memberId: o.memberId, prog: o.prog, status: 'active', src: 'course', rule: '', expires: '', orderId: o.id, bookingId: '', createdAt: cStamp(now), usedAt: '' });
    if (b) { b.thanked = true; store.saveBooking(b); }
  } else if (o.kind === 'book' && b) {
    b.paid = (+b.paid || 0) + +o.amount;
    if (b.status === 'hold') { b.status = 'booked'; b.holdUntil = ''; }
    else if (b.status === 'cancelled') { /* paid after the hold ran out: keep it if the seats are still free, otherwise refund by hand */
      var al = lnAllocate(lnFind(store.branches(), b.branch), b.date, b.people[0].alloc[0].start, b.people.map(function (pe) { return pe.chain; }), cRows(store, b.date, b.id));
      if (al && cRetake(store, b)) { b.people.forEach(function (pe, i) { pe.alloc = al[i]; }); b.status = 'booked'; } else store.log('', b.id, 'PAID_AFTER_HOLD_REFUND_NEEDED', o.id);
    }
    store.saveBooking(b); if (b.status === 'booked') cConfirmMail(store, b, m);
  } else if (o.kind === 'walkin' && b) {
    b.paid = (+b.paid || 0) + +o.amount;
    if (b.status === 'cancelled') {   /* paid after the 20-minute hold ran out: seat them now if a seat is free, else the shop refunds */
      var kbr = lnFind(store.branches(), b.branch), kch = b.people.map(function (pe) { return pe.chain; }), kst = Math.ceil(now.min / 5) * 5, kal = null, krows = cRows(store, now.date, b.id);
      if (b.date === now.date) for (; kst + lnChainMin(kch[0]) <= LANA.CLOSE && !(kal = lnAllocate(kbr, now.date, kst, kch, krows)); kst += 5);
      if (kal) {
        b.people.forEach(function (pe, i) { pe.alloc = kal[i]; }); b.status = 'hold';
        (b.tix || []).forEach(function (id) { var k = lnFind(store.tickets(), id); if (k && k.status === 'void') { k.status = 'booked'; k.bookingId = b.id; store.saveTicket(k); } });
      } else store.log('', b.id, 'PAID_AFTER_HOLD_REFUND_NEEDED', o.id + ' ' + o.amount);
    }
    for (var w = 1; w < (+o.count || 1); w++) store.saveTicket({ id: 'T' + lnId(8), memberId: o.memberId, prog: o.prog, status: 'active', src: 'course', rule: '', expires: '', orderId: o.id, bookingId: '', createdAt: cStamp(now), usedAt: '' });
    if (b.status === 'hold') { b.status = 'checkedin'; b.q = cQueue(store, b); b.checkedAt = lnHM(now.min); b.holdUntil = ''; }
    store.saveBooking(b);
  } else if (o.kind === 'checkout' && b) {
    if (b.status === 'done') store.log('', b.id, 'PAID_TWICE_REFUND_NEEDED', o.id + ' ' + o.amount);
    else { b.paid = (+b.paid || 0) + +o.amount; cCheckoutDone(store, b, now); }
  }
  if (o.memberId && m && m.email) store.mail(m.email, 'ใบเสร็จ Lana · Receipt ' + o.id, cReceiptHtml(o));
  else if (b && b.email) store.mail(b.email, 'ใบเสร็จ Lana · Receipt ' + o.id, cReceiptHtml(o));
  store.log('', o.bookingId || '', 'paid_' + o.kind, o.id + ' ' + o.amount);
}
function cRetake(store, b) {
  var ok = (b.tix || []).every(function (id) { var k = lnFind(store.tickets(), id); return k && (k.status === 'active' || k.bookingId === b.id); });
  if (!ok) return false;
  (b.tix || []).forEach(function (id) { var k = lnFind(store.tickets(), id); k.status = 'booked'; k.bookingId = b.id; store.saveTicket(k); });
  return true;
}
function cReleaseHold(store, b) {
  b.status = 'cancelled';
  var pbBack = null;
  if (b.fromPhone) { var pb = lnFind(store.bookings(), b.fromPhone); if (pb && pb.status === 'converted') { pb.status = 'booked'; store.saveBooking(pb); pbBack = pb; } }   /* payment not made: the phone booking is back */
  (b.tix || []).forEach(function (id) { var k = lnFind(store.tickets(), id); if (k && k.bookingId === b.id && k.status === 'booked') {
    var paidFor = !k.orderId || (lnFind(store.orders(), k.orderId) || {}).status === 'paid';   /* a ticket bought in this unpaid order was never paid for */
    k.status = k.src === 'kiosk' || !paidFor ? 'void' : 'active'; k.bookingId = ''; store.saveTicket(k); } });
  (b.vouchers || []).forEach(function (id) { var v = lnFind(store.vouchers(), id); if (v && v.bookingId === b.id) { v.status = 'active'; v.bookingId = ''; store.saveVoucher(v); } });
  if (pbBack) (pbBack.tix || []).forEach(function (id) { var k = lnFind(store.tickets(), id); if (k && k.status === 'active') { k.status = 'booked'; k.bookingId = pbBack.id; store.saveTicket(k); } });   /* its ticket is held for it again */
  store.saveBooking(b); store.log('', b.id, 'hold_released', '');
}
function cMinOf(stamp) { var p = String(stamp || '').split(' '); return { date: p[0], min: p[1] ? +p[1].split(':')[0] * 60 + +p[1].split(':')[1] : 0 }; }
/* tidy up: unpaid holds past their time, missed visits */
/* buffet passes: while a pass is valid the member always has one ticket ready, at most one new ticket per day */
function cPassMint(store, now) {
  var tk = store.tickets(), passes = tk.filter(function (k) { return k.status === 'pass'; });
  passes.forEach(function (ps) {
    if (ps.expires && now.date > ps.expires) { ps.status = 'expired'; store.saveTicket(ps); return; }
    var kids = tk.filter(function (k) { return k.passId === ps.id; });
    if (kids.some(function (k) { return k.status === 'active' || k.status === 'booked' || String(k.createdAt).slice(0, 10) === now.date; })) return;
    store.saveTicket({ id: 'T' + lnId(8), memberId: ps.memberId, prog: ps.prog, status: 'active', src: 'pass', passId: ps.id, rule: '', expires: ps.expires, orderId: ps.orderId, bookingId: '', createdAt: cStamp(now), usedAt: '' });
  });
}
function cSweep(store, now) {
  cPassMint(store, now);
  store.bookings().forEach(function (b) {
    if (b.status === 'hold' && b.holdUntil) { var h = cMinOf(b.holdUntil); if (now.date > h.date || (now.date === h.date && now.min > h.min)) cReleaseHold(store, b); }
    if (b.status === 'booked' && (b.date < now.date || (b.date === now.date && now.min > b.people[0].alloc[0].start + LANA.NOSHOW_MIN))) cNoShow(store, b, now);
  });
}
/* minute trigger: sweep, check unpaid orders (last 2 hours), 2-hour reminder emails */
function custTick(store, now) {
  cSweep(store, now);
  var since = { date: now.date, min: now.min - 120 };
  store.orders().filter(function (o) { if (o.status !== 'pending' && o.status !== 'replaced' && o.status !== 'cancelled') return false;   /* cancelled: in case the link was paid before it closed */ var c = cMinOf(o.createdAt); return c.date === now.date && c.min >= since.min; })
    .forEach(function (o) { cCheckOrder(store, o, now); });
  store.bookings().forEach(function (b) {
    if (b.status !== 'booked' || b.date !== now.date || b.reminded || !b.email) return;
    var st = b.people[0].alloc[0].start;
    if (st - now.min <= 120 && st - now.min > 30) { store.mail(b.email, 'เตือนนัด Lana วันนี้ ' + lnHM(st) + ' · Reminder', cConfirmHtml(b, true)); b.reminded = true; store.saveBooking(b); }
  });
}

/* ---------- emails ---------- */
function cConfirmMail(store, b, m, moved) { var to = (m && m.email) || b.email; if (to) store.mail(to, (moved ? 'เลื่อนนัดแล้ว' : 'ยืนยันการจอง') + ' Lana ' + b.code + ' · ' + b.date + ' ' + lnHM(b.people[0].alloc[0].start), cConfirmHtml(b, false)); }
function cEsc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function cConfirmHtml(b, reminder) {
  var br = lnFind(LANA.BRANCHES, b.branch) || {}, p = lnFind(LANA.PROGRAMS, b.people[0].prog) || {};
  return '<div style="font-family:sans-serif;color:#3c2219;max-width:480px">' + '<h2 style="font-weight:600">' + (reminder ? 'อีกไม่นานเจอกันที่ Lana' : 'จองแล้ว ขอบคุณค่ะ') + '</h2>' +
    '<p><b>' + cEsc(p.name_th) + ' × ' + b.people.length + '</b><br>' + cEsc(br.name_th) + '<br>' + cEsc(b.date) + ' เวลา ' + lnHM(b.people[0].alloc[0].start) + '<br>รหัส ' + cEsc(b.code) + '</p>' +
    '<p>ถึงร้านแล้วสแกน QR ที่เคาน์เตอร์เพื่อเช็กอิน (เช็กอินได้ก่อนเวลา 30 นาที) ถ้ามาช้ากว่า ' + LANA.NOSHOW_MIN + ' นาที ตั๋วจะกลับเข้ากระเป๋าให้จองใหม่</p>' +
    '<p style="color:#7b6352;font-size:13px">' + cEsc(p.name_en) + ' × ' + b.people.length + ' · ' + cEsc(br.name_en) + ' · ' + cEsc(b.date) + ' ' + lnHM(b.people[0].alloc[0].start) + '. Scan the counter QR when you arrive.</p></div>';
}
function cReceiptHtml(o) {
  var items = cJSON(o.items, []);
  return '<div style="font-family:sans-serif;color:#3c2219;max-width:480px"><h2 style="font-weight:600">ใบเสร็จ · Receipt</h2><p>เลขที่ ' + cEsc(o.id) + ' · ' + cEsc(o.paidAt) + '</p><table style="width:100%;border-collapse:collapse">' +
    items.map(function (l) { return '<tr><td style="padding:4px 0">' + cEsc(l.th || l.en) + '<br><span style="color:#7b6352;font-size:12px">' + cEsc(l.en || '') + '</span></td><td style="text-align:right">฿' + (+l.amount).toLocaleString('en-US') + '</td></tr>'; }).join('') +
    '<tr><td style="border-top:1px solid #e2d1b6;padding-top:6px"><b>รวม · Total</b></td><td style="border-top:1px solid #e2d1b6;text-align:right"><b>฿' + (+o.amount).toLocaleString('en-US') + '</b></td></tr></table><p style="font-size:12px;color:#7b6352">Lana Sleep Salon &amp; Massage</p></div>';
}

/* ---------- counter tablet (no LINE needed) ---------- */
function cKioskAuth(req, store) { var k = store.kioskKey(); if (!k || String(req.kiosk || '') !== String(k)) throw new Error('KIOSK_KEY'); }
function cKioskFindMember(store, req) {
  var phone = req.phone ? lnNormPhone(req.phone, req.intl) : '', email = String(req.email || '').trim();
  return (phone && cMemberBy(store, 'phone', phone)) || (email && cMemberBy(store, 'email', email)) || null;
}
function cKiosk(a, req, store, now) {
  cSweep(store, now);
  var br = lnFind(store.branches(), req.branch); if (!br || !lnTrue(br.active)) throw new Error('BAD_BRANCH');
  if (a === 'kFind') {
    var m = cKioskFindMember(store, req);
    if (!m) return { member: null };
    var today = cCheckinVisit(store, m.id, now);
    /* still unpaid bookings made by phone today (e.g. the second of two friends): show those first */
    var phoneB = store.bookings().filter(function (x) { return x.memberId === m.id && x.date === now.date && x.status === 'booked' && x.payAtShop; })
      .sort(function (x, y) { return x.people[0].alloc[0].start - y.people[0].alloc[0].start; })[0];
    if (phoneB && (!today || today.status !== 'booked')) today = phoneB;
    var tix = store.tickets().filter(function (k) { return k.memberId === m.id && k.status === 'active' && cTicketOK(k, now.date, now.min); });
    var check = null;
    if (today && today.status === 'booked') {
      var st = today.people[0].alloc[0].start, chains = today.people.map(function (pe) { return pe.chain; });
      check = { late: now.min > st + LANA.NOSHOW_MIN, other: today.branch !== br.id, early: now.min < st - 30, opensAt: st - 30,
        canNow: lnProgAt(lnFind(LANA.PROGRAMS, today.people[0].prog), br) && !!lnAllocate(br, now.date, Math.ceil(now.min / 5) * 5, chains, cRows(store, now.date, today.id)) };
    }
    return { member: { id: m.id, name: m.name, tier: cTier(store, m, now) }, booking: today ? cView(today, store, now, false) : null, check: check,
      tickets: tix.map(function (k) { return { id: k.id, prog: k.prog }; }),
      vouchers: store.vouchers().filter(function (v) { return v.memberId === m.id && cVoucherOK(v, now); }).map(function (v) { return v.addon; }),
      held: today && today.payAtShop ? (today.tix || []).map(function (id) { var k = lnFind(store.tickets(), id); return k && k.status === 'booked' ? { id: k.id, prog: k.prog } : null; }).filter(Boolean) : [] };
  }
  if (a === 'kCheckin') {
    var b = lnFind(store.bookings(), req.id); if (!b) throw new Error('NOT_FOUND');
    if (b.payAtShop && b.status === 'booked') throw new Error('PAY_FIRST');   /* booked by phone: pays first (kStart with phoneBooking) */
    var r = cDoCheckin(store, b, br.id, now, !!req.move);
    if (r.result === 'checkedin') { if (!b.vkey) { b.vkey = lnId(12); store.saveBooking(b); } r.vkey = b.vkey; r.booking = cView(b, store, now, false); }
    return r;
  }
  if (a === 'kStart') return cKioskStart(req, store, now, br);
  /* guest prefers cash / card machine (or Beam is stuck): the order waits at the counter, the seat is held a little longer */
  if (a === 'kCounter') {
    var co = lnFind(store.orders(), req.id); if (!co || co.status !== 'pending') throw new Error('NOT_NOW');
    co.counter = 'TRUE'; store.saveOrder(co);
    var cb = co.bookingId ? lnFind(store.bookings(), co.bookingId) : null;
    if (cb && cb.status === 'hold') { cb.holdUntil = cStamp({ date: now.date, min: now.min + LN_C.HOLD_MIN + 10 }); store.saveBooking(cb); }
    store.log('', co.bookingId || '', 'pay_at_counter', co.id + ' ' + co.amount);
    return { id: co.id, amount: +co.amount, status: co.status };
  }
  /* staff on shift at this branch: the kiosk lets one of them confirm a card payment with their PIN */
  if (a === 'kStaff') { var onIds = store.shifts().filter(function (r) { return r.date === now.date && !r.out; }).map(function (r) { return r.staffId; });
    return { staff: store.staff().filter(function (s) { return s.branch === br.id && String(s.active).toUpperCase() !== 'FALSE'; }).map(function (s) { return { id: s.id, name: s.name, on: onIds.indexOf(s.id) >= 0, pin: !!String(s.pin || '').trim(), busy: store.bookings().filter(function (b) { return b.branch === br.id && b.date === now.date && b.status === 'inservice' && b.staffId === s.id; }).map(function (b) { return b.q || b.code; }) }; })
      .sort(function (x, y) { return (y.on ? 1 : 0) - (x.on ? 1 : 0); }) }; }
  if (a === 'kOut') return { list: store.bookings().filter(function (b) { return b.branch === br.id && b.date === now.date && b.status === 'finished'; }).map(function (b) { return { id: b.id, q: b.q || b.code, name: b.people[0].name, due: lnSum(b.due || []), view: cView(b, store, now, false) }; }) };
  if (a === 'kBoard') return { board: apiBoard(br.id, store, now) };
  throw new Error('UNKNOWN');
}
/* walk-in: pay now (or use a member ticket) and get a queue number, starting at the next free seat */
function cKioskStart(req, store, now, br) {
  if (now.min < LANA.OPEN || now.min >= LANA.CLOSE) throw new Error('CLOSED');
  var prog = lnFind(LANA.PROGRAMS, req.prog); if (!prog || !lnProgAt(prog, br)) throw new Error('NOT_HERE');
  var pe = cCleanPerson(prog, req.person, 0, null);
  if (lnTrue(prog.hair) && !pe.hair) throw new Error('NEED_HAIR');
  /* a phone / page booking for today: its seats are given back here and taken again by this paid visit */
  var pb = req.phoneBooking ? lnFind(store.bookings(), req.phoneBooking) : null;
  if (req.phoneBooking && (!pb || !pb.payAtShop || pb.status !== 'booked' || pb.date !== now.date || pb.branch !== br.id)) throw new Error('BAD_FORM');
  /* walk-in group (a couple, friends): same treatment, one payment, one queue number; each picks their own hair length */
  var others = [];
  if (Array.isArray(req.others) && req.others.length) {
    if (req.useTicket || pb || String(req.pack || '1') !== '1' || req.others.length > 3) throw new Error('BAD_FORM');
    others = req.others.map(function (o, i) {
      /* couple promo: two people on programs that share a "pair" price may pick different ones (neck or foot + head spa) */
      var op = o && o.prog && o.prog !== prog.id ? lnFind(LANA.PROGRAMS, o.prog) : prog;
      if (op !== prog && !(req.others.length === 1 && +prog.pair && +op.pair === +prog.pair && lnOnSale(op) && lnProgAt(op, br))) throw new Error('BAD_FORM');
      var x = cCleanPerson(op, Object.assign({}, o || {}, { prog: op.id }), i + 1, null); if (lnTrue(op.hair) && !x.hair) throw new Error('NEED_HAIR'); return x; });
  }
  var pairDeal = others.length === 1 && +prog.pair > 0 && +(lnFind(LANA.PROGRAMS, others[0].prog) || {}).pair === +prog.pair;   /* 2 people: one price for both */
  var progOf = function (x) { return lnFind(LANA.PROGRAMS, x.prog) || prog; };
  var chain = lnChain(prog, pe), chains = [chain].concat(others.map(function (x) { return lnChain(progOf(x), x); })), start = Math.ceil(now.min / 5) * 5, al = null, rows = cRows(store, now.date, pb ? pb.id : null);
  var longest = Math.max.apply(null, chains.map(lnChainMin));
  for (; start + longest <= LANA.CLOSE && !(al = lnAllocate(br, now.date, start, chains, rows)); start += 5);
  if (!al && pb) {
    /* booked by phone: the guest keeps the seats we promised, even if a job ran over or their hair needs a few more minutes */
    var pst = Math.max(Math.ceil(now.min / 5) * 5, pb.people[0].alloc[0].start), old = pb.people[0].alloc, m0 = pst;
    al = [chain.map(function (c, j) { var o = old[j] || old[old.length - 1], ks = lnKinds(c.res), r = { branch: br.id, date: now.date, res: ks.indexOf(o.res) >= 0 ? o.res : ks[0], unit: ks.indexOf(o.res) >= 0 ? o.unit : 1, start: m0, end: m0 + c.min }; m0 += c.min; return r; })];
    store.log('', pb.id, 'phone_seat_kept', 'no clean slot at pay time');
  }
  if (!al) throw new Error(Math.ceil(now.min / 5) * 5 + longest > LANA.CLOSE ? 'TOO_LATE' : 'FULL');
  var member = null, tix = null;
  if (req.useTicket || req.memberChoice === 'buy') {
    member = cKioskFindMember(store, req); if (!member) throw new Error('NOT_MEMBER');
  } else if (!req.memberChoice) {
    var match = cKioskFindMember(store, req);
    if (match) return { match: { name: match.name, tickets: store.tickets().filter(function (k) { return k.memberId === match.id && k.status === 'active' && k.prog === prog.id && cTicketOK(k, now.date, start); }).length } };
  }
  var name = String(req.name || (member && member.name) || '').trim().slice(0, 40);
  if (!name) throw new Error('NEED_NAME');
  var phone = req.phone ? lnNormPhone(req.phone, req.intl) : '', email = String(req.email || '').trim();
  if (req.phone && !cPhoneOK(phone)) throw new Error('BAD_PHONE');
  if (email && !cEmailOK(email)) throw new Error('BAD_EMAIL');
  if (req.useTicket) {
    /* a phone booking that already holds this member's ticket: use that one */
    var held = pb ? (pb.tix || []).map(function (id) { return lnFind(store.tickets(), id); }).filter(function (k) { return k && k.status === 'booked' && k.bookingId === pb.id && k.prog === prog.id; }) : [];
    tix = held.length ? [held[0]] : cPickTickets(store, member.id, prog.id, 1, now.date, start); if (!tix) throw new Error('NO_TICKET');
  }
  pe.name = name; pe.chain = chain; pe.alloc = al[0];
  others.forEach(function (x, i) { x.chain = chains[i + 1]; x.alloc = al[i + 1]; if (!String((req.others[i] || {}).name || '').trim()) x.name = name + ' +' + (i + 1); });
  if (!member && !req.memberChoice && (phone || email)) {
    /* first visit with a phone or email: keep a member record so it can be linked to LINE later and spending counts toward a level */
    member = { id: 'M' + lnId(7), lineUserId: '', name: name, phone: phone, email: email, birthMonth: '', consentMarketing: req.consent ? 'TRUE' : 'FALSE', privacyAt: '', noShows: 0, source: 'kiosk', createdAt: cStamp(now), lastPrefs: '' };
    store.saveMember(member);
  }
  /* buying a course at the counter: today's visit uses one, the rest go to the member's wallet (needs a phone or email) */
  var packN = tix ? 1 : ({ '1': 1, '3': 3, '5': 5, '11': 11 })[String(req.pack || '1')] || 1;
  if (!tix && (!lnOnSale(prog) || !lnPack(prog, packN))) throw new Error('BAD_FORM');
  if (packN > 1 && !member) throw new Error('NEED_CONTACT');
  var kTier = member ? cTier(store, member, now) : null;
  var kTf = kTier ? kTier.free : [], kVf = member ? cVoucherFree(store, member, now, prog, pe.addons.filter(function (id) { return kTf.indexOf(id) < 0; })) : { free: [], used: [] };
  var extras = lnPersonLines(prog, pe, kVf.free, kTf, kTier ? kTier.name_en : ''), total = lnSum(extras) + (tix ? 0 : lnPack(prog, packN));
  others.forEach(function (x) { var xp = progOf(x), xl = lnPersonLines(xp, x, [], [], ''); extras = extras.concat(xl); total += lnSum(xl) + +xp.price; });
  if (pairDeal) { total += +prog.pair - +prog.price - +progOf(others[0]).price; pe.value = others[0].value = +prog.pair / 2; }
  var b = { id: lnId(8), code: 'LN' + lnId(5), q: '', branch: br.id, date: now.date, status: 'hold', people: [pe].concat(others), ext: 0, due: [], live: [], kiosk: true, src: 'kiosk',
    memberId: member ? member.id : '', guest: !member || member.source === 'kiosk' && !member.lineUserId, tix: [], paid: 0, email: email || (member && member.email) || '', phone: phone || (member && member.phone) || '',
    consent: !!req.consent, vkey: lnId(12), verifiedBy: req.useTicket ? (req.phone ? 'phone' : 'email') : '' };
  if (pb) { if (pb.memberId && member && pb.memberId !== member.id) throw new Error('BAD_FORM'); b.fromPhone = pb.id; b.bookedFor = pb.people[0].alloc[0].start; }
  if (kVf.used.length) { b.vouchers = kVf.used.map(function (v) { return v.id; }); kVf.used.forEach(function (v) { v.status = 'used'; v.bookingId = b.id; store.saveVoucher(v); }); }
  var kt = null;
  if (tix) { tix.forEach(function (k) { k.status = 'booked'; k.bookingId = b.id; store.saveTicket(k); }); b.tix = tix.map(function (k) { return k.id; }); if (tix[0].src === 'partner') pe.partner = true; }
  else {
    kt = { id: 'T' + lnId(8), memberId: b.memberId, prog: prog.id, status: 'booked', src: packN > 1 ? 'course' : 'kiosk', rule: '', expires: '', orderId: '', bookingId: b.id, createdAt: cStamp(now), usedAt: '' };
    var kts = [kt].concat(others.map(function (x) { return Object.assign({}, kt, { id: 'T' + lnId(8), prog: x.prog }); }));
    b.tix = kts.map(function (x) { return x.id; });
  }
  var out = {};
  if (total > 0) {
    b.holdUntil = cStamp({ date: now.date, min: now.min + LN_C.HOLD_MIN });
    var o = cNewOrder(store, now, { memberId: b.memberId, kind: 'walkin', amount: total, bookingId: b.id, prog: prog.id, count: packN, items: (tix ? [] : pairDeal ? [{ th: 'โปรคู่ 2 คน: ' + prog.name_th + (progOf(others[0]) !== prog ? ' + ' + progOf(others[0]).name_th : ''), en: 'Couple deal: ' + prog.name_en + (progOf(others[0]) !== prog ? ' + ' + progOf(others[0]).name_en : ''), amount: +prog.pair }] : [{ th: prog.name_th + (packN > 1 ? ' คอร์ส ' + packN + ' ครั้ง' : others.length ? ' × ' + (others.length + 1) + ' คน' : ''), en: prog.name_en + (packN > 1 ? ' × ' + packN : others.length ? ' × ' + (others.length + 1) : ''), amount: lnPack(prog, packN) * (others.length + 1) }]).concat(extras.filter(function (l) { return l.amount; })), label: prog.name_en }, req.returnUrl);
    b.orderId = o.id; out.orderId = o.id; out.url = o.beamUrl; out.amount = total;
    if (kt) kts.forEach(function (x) { x.orderId = o.id; });
  } else { b.status = 'checkedin'; b.q = cQueue(store, b); b.checkedAt = lnHM(now.min); }
  if (kt) kts.forEach(function (x) { store.saveTicket(x); });
  store.saveBooking(b); store.log('', b.id, 'kiosk_' + (tix ? 'ticket' : 'walkin'), br.id + ' ' + lnHM(start));
  if (pb) { pb.status = 'converted'; pb.convertedTo = b.id; store.saveBooking(pb); }
  out.bookingId = b.id; out.q = b.q; out.vkey = b.vkey; out.start = start; out.booking = cView(b, store, now, false);
  return out;
}
/* ===== END CUSTOMER API ===== */


/* ===== Lana API on Cloudflare: a Worker in front, one Durable Object ("the shop") that keeps every table in memory
   and in its own SQLite. Same engine as the Apps Script version (core.js / api.js / cust_api.js are pasted above this file).
   Requests run one at a time inside the shop, so two tablets can never book the same seat.
   Google Sheet stays the place to edit menu, prices, staff: Apps Script pushes them here (pushConfig).
   Secrets (Beam, LINE, kiosk/owner passwords) also come from the Apps Script "Script Properties" in that push.
   The only secret set on Cloudflare itself is ADMIN_KEY (the same text as ADMIN_KEY in Script Properties). ===== */

var CF_TABLES = ['bookings', 'members', 'tickets', 'orders', 'vouchers', 'claims', 'shifts', 'staffx'];
var CF_KEEP_DAYS = 60;        /* bookings older than this stay in SQLite only (owner reports read them on request) */
var CF_ACTIVE = ['hold', 'booked', 'checkedin', 'accepted', 'inservice', 'finished'];
var CF_DEDUP = /^(config|hello|me|slots|visit|order|feed|kFind|kBoard|kOut|kStaff|sBoard|sSched|sQueueText|sBookInfo|sBookWho|sMoveSlots|sDropInfo|sSlip|sPrintQ|seen|extend|sExtend|login|lineLogin)$/;
var CF_PAY_KIND = { 'บริการ': 'prog', 'ผม': 'hair', 'ทรงได': 'style', 'ของเสริม': 'addon' };

function cfToMin(hhmm) { var p = String(hhmm).split(':'); return (+p[0]) * 60 + (+p[1] || 0); }
function cfNow(ms) {
  var d = new Date((ms || Date.now()) + 7 * 3600 * 1000), p = function (n) { return (n < 10 ? '0' : '') + n; };
  return { date: d.getUTCFullYear() + '-' + p(d.getUTCMonth() + 1) + '-' + p(d.getUTCDate()), min: d.getUTCHours() * 60 + d.getUTCMinutes(),
    stamp: d.getUTCFullYear() + '-' + p(d.getUTCMonth() + 1) + '-' + p(d.getUTCDate()) + ' ' + p(d.getUTCHours()) + ':' + p(d.getUTCMinutes()) + ':' + p(d.getUTCSeconds()) };
}
function cfDayBefore(date, n) { var t = Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10)) - n * 864e5, d = new Date(t); return d.toISOString().slice(0, 10); }
function cfRand(n) { var a = new Uint8Array(n || 16); crypto.getRandomValues(a); return Array.from(a, function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); }
async function cfSha(s) { var h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return Array.from(new Uint8Array(h), function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); }
function cfJson(o, status) { return new Response(JSON.stringify(o), { status: status || 200, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' } }); }

/* the menu / prices / staff tables from the Google Sheet -> LANA (same rules as loadConfig_ in Apps Script) */
function cfApplyConfig(T) {
  var table_ = function (n) { return (T[n] || []).map(function (r) { return Object.assign({}, r); }); };
  var c = {}; table_('Config').forEach(function (r) { c[r.key] = r.value; });
  if (c.open) LANA.OPEN = cfToMin(c.open);
  if (c.close) LANA.CLOSE = cfToMin(c.close);
  if (c.buffer) LANA.BUFFER = +c.buffer;
  if (c.noShowMin !== undefined && c.noShowMin !== '' && !isNaN(+c.noShowMin)) LANA.NOSHOW_MIN = +c.noShowMin;
  if (c.extPrice) LANA.EXT_PRICE = +c.extPrice;
  if (c.rateHeadPer45) LANA.RATE.head = +c.rateHeadPer45 / 45;
  if (c.rateThaiPer60) LANA.RATE.thai = +c.rateThaiPer60 / 60;
  if (c.rateFootPer60) LANA.RATE.foot = +c.rateFootPer60 / 60;
  if (c.rateNeckPer60) LANA.RATE.neck = +c.rateNeckPer60 / 60;
  if (c.rateOilPer60) LANA.RATE.oil = +c.rateOilPer60 / 60;
  if (c.dryFee !== undefined && c.dryFee !== '') LANA.DRY_FEE = +c.dryFee;
  if (c.drySplitFee !== undefined && c.drySplitFee !== '') LANA.DRY_SPLIT = +c.drySplitFee;
  if (c.partnerFee) LANA.PARTNER_FEE = +c.partnerFee;
  if (c.extraShare !== undefined && c.extraShare !== '') LANA.EXTRA_SHARE = +c.extraShare;
  if (c.dailyMin !== undefined && c.dailyMin !== '') LANA.DAILY_MIN = +c.dailyMin;
  if (c.ftShare) LANA.FT_SHARE = +c.ftShare;
  if (c.pushFirst) LN_PUSH.FIRST = +c.pushFirst;
  if (c.pushWait) LN_PUSH.WAIT = +c.pushWait;
  if (c.pushWarn) LN_PUSH.warnOn = String(c.pushWarn).toUpperCase() !== 'FALSE';
  if (c.pushMove) LN_PUSH.moveOn = String(c.pushMove).toUpperCase() !== 'FALSE';
  LN_PUSH.jobsInApp = String(c.staffAppJobs || 'FALSE').toUpperCase() === 'TRUE';
  var num = function (rows, keys) { return rows.map(function (r) { keys.forEach(function (k) { r[k] = +r[k] || 0; }); return r; }); };
  if (T.Branches) LANA.BRANCHES = num(table_('Branches'), ['wash', 'dry', 'thai', 'chair', 'oil', 'radiusM']).map(function (b) { b.lat = b.lat === '' ? '' : +b.lat; b.lng = b.lng === '' ? '' : +b.lng; return b; });
  if (T.Programs) LANA.PROGRAMS = num(table_('Programs'), ['price']);
  if (T.Hair) LANA.HAIR = num(table_('Hair'), ['price', 'min']);
  if (T.Styles) LANA.STYLES = num(table_('Styles'), ['price', 'min', 'staffFee']);
  if (T.Addons) LANA.ADDONS = num(table_('Addons'), ['price', 'min', 'staffFee']);
  var pt = table_('Partners'); if (pt.length) LANA.PARTNERS = num(pt, ['days']);
  var tr = table_('Tiers'); if (tr.length) LANA.TIERS = num(tr, ['minSpend']);
  LANA.CODES = table_('Codes').map(function (r) { if (/^\d{4}-\d{2}-\d{2}$/.test(r.until) === false && r.until) r.until = String(r.until).slice(0, 10); return r; });
  var COL = { massage: 'ค่ามือส่วนนวด', wash: 'ค่ามือส่วนสระ/นวดหัว', dry2: 'ค่าได ถ้าคนละคนกับคนสระ', partner: 'เคสฟรีพาร์ทเนอร์ (เหมา)', ext: 'ต่อเวลา 30 นาที (ต่อครั้ง)', pay: 'ค่ามือของเพิ่ม (ต่อชิ้น)' };
  LANA.PAYRATES = {};
  table_('ค่ามือ').forEach(function (r) { var k = CF_PAY_KIND[String(r['ประเภท']).trim()]; if (!k || !r['รหัส']) return;
    var o = {}; Object.keys(COL).forEach(function (f) { var v = r[COL[f]]; o[f] = v === '' || v == null ? '' : +String(v).replace(/[,฿\s]/g, ''); });
    LANA.PAYRATES[k + ':' + String(r['รหัส']).trim()] = o; });
}

export class Shop {
  constructor(ctx, env) {
    this.ctx = ctx; this.env = env; this.sql = ctx.storage.sql;
    this.dedup = new Map(); this.idt = new Map(); this.origin = '';
    var self = this;
    ctx.blockConcurrencyWhile(async function () { self.load(); });
  }
  q(sql) { var a = Array.prototype.slice.call(arguments, 1); return this.sql.exec.apply(this.sql, [sql].concat(a)).toArray(); }

  /* ---------- memory <-> SQLite ---------- */
  load() {
    this.sql.exec('CREATE TABLE IF NOT EXISTS rows (tbl TEXT NOT NULL, id TEXT NOT NULL, day TEXT, status TEXT, data TEXT NOT NULL, PRIMARY KEY (tbl, id))');
    this.sql.exec('CREATE INDEX IF NOT EXISTS rows_day ON rows (tbl, day)');
    this.sql.exec('CREATE TABLE IF NOT EXISTS log (n INTEGER PRIMARY KEY AUTOINCREMENT, time TEXT, staffId TEXT, bookingId TEXT, action TEXT, detail TEXT)');
    this.sql.exec('CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT)');
    this.sql.exec('CREATE TABLE IF NOT EXISTS sess (t TEXT PRIMARY KEY, kind TEXT, v TEXT, exp INTEGER)');
    this.sql.exec('CREATE TABLE IF NOT EXISTS photos (id TEXT PRIMARY KEY, at TEXT, name TEXT, data TEXT)');
    var kv = {}; this.q('SELECT k, v FROM kv').forEach(function (r) { kv[r.k] = r.v; });
    this.cfg = kv.config ? JSON.parse(kv.config) : null;
    this.secrets = kv.secrets ? JSON.parse(kv.secrets) : {};
    this.photosMap = kv.photos ? JSON.parse(kv.photos) : {};
    this.gasUrl = kv.gasUrl || '';
    this.cfgHash = kv.cfgHash || '';
    if (this.cfg) cfApplyConfig(this.cfg.tables || {});
    var from = cfDayBefore(cfNow().date, CF_KEEP_DAYS), self = this;
    this.db = {};
    CF_TABLES.forEach(function (t) {
      var rows = t === 'bookings' ? self.q("SELECT data FROM rows WHERE tbl = 'bookings' AND (day >= ? OR status IN ('hold','booked','checkedin','accepted','inservice','finished'))", from)
        : t === 'shifts' ? self.q("SELECT data FROM rows WHERE tbl = 'shifts' AND day >= ?", cfDayBefore(cfNow().date, 100))
        : self.q('SELECT data FROM rows WHERE tbl = ?', t);
      self.db[t] = rows.map(function (r) { return JSON.parse(r.data); });
    });
    this.index = {}; CF_TABLES.forEach(function (t) { self.reindex(t); });
    this.loadedDay = cfNow().date;
  }
  reindex(t) { var m = new Map(); this.db[t].forEach(function (o) { m.set(String(o.id || o._id), o); }); this.index[t] = m; }
  put(t, o, dirty) {
    var key = String(o.id || o._id), cur = this.index[t].get(key);
    if (cur !== o) {
      if (cur) { var i = this.db[t].indexOf(cur); if (i >= 0) this.db[t][i] = o; else this.db[t].push(o); }
      else this.db[t].push(o);
      this.index[t].set(key, o);
    }
    if (dirty) dirty.set(t + '\u0001' + key, [t, o]);
  }
  flush(dirty) {
    var self = this;
    dirty.forEach(function (v) {
      var t = v[0], o = v[1], data = {};
      Object.keys(o).forEach(function (k) { if (k !== '_row' && k !== '_archived') data[k] = o[k]; });
      self.sql.exec('INSERT OR REPLACE INTO rows (tbl, id, day, status, data) VALUES (?, ?, ?, ?, ?)', t, String(o.id || o._id), String(o.date || String(o.createdAt || '').slice(0, 10) || ''), String(o.status || ''), JSON.stringify(data));
    });
    dirty.clear();
  }
  /* each midnight: old finished bookings leave memory (still in SQLite) */
  trim() {
    var today = cfNow().date; if (today === this.loadedDay) return;
    var from = cfDayBefore(today, CF_KEEP_DAYS);
    this.db.bookings = this.db.bookings.filter(function (b) { return b.date >= from || CF_ACTIVE.indexOf(b.status) >= 0; });
    var sfrom = cfDayBefore(today, 100); this.db.shifts = this.db.shifts.filter(function (r) { return r.date >= sfrom; });
    this.reindex('bookings'); this.reindex('shifts'); this.loadedDay = today;
    this.sql.exec('DELETE FROM sess WHERE exp < ?', Date.now());
  }

  /* ---------- the store the engine sees (same interface as sheetStore_ in Apps Script) ---------- */
  store(job) {
    var self = this, db = this.db, dirty = job.dirty, sec = this.secrets;
    var saver = function (t) { return function (o) { self.put(t, o, dirty); }; };
    var st = {
      bookings: function () {
        if (job.archive && !job.allBk) { job.allBk = true; var have = self.index.bookings;
          self.q("SELECT data FROM rows WHERE tbl = 'bookings'").forEach(function (r) { var b = JSON.parse(r.data); if (!have.has(String(b.id))) { b._archived = true; db.bookings.push(b); } }); }
        return db.bookings; },
      saveBooking: function (b) { if (b._archived) return; self.put('bookings', b, dirty); },
      staff: function () {
        var x = self.index.staffx;
        return (self.staffList || (self.staffList = ((self.cfg && self.cfg.staff) || []).map(function (s) { s = Object.assign({}, s); s.phone = lnNormPhone(s.phone); return s; })))
          .map(function (s) { var o = x.get(String(s.id)); if (o && o.lineUserId !== undefined) s.lineUserId = o.lineUserId; return s; });
      },
      saveStaff: function (s) { self.put('staffx', { id: s.id, lineUserId: s.lineUserId || '' }, dirty); job.relay.push({ relay: 'staffLine', id: s.id, lineUserId: s.lineUserId || '' }); },
      branches: function () { var sf = st.staff(); LANA.BRANCHES.forEach(function (b) { b._cap = lnCrewCaps(b, sf); }); return LANA.BRANCHES; },
      shifts: function () { return db.shifts; },
      addShift: function (r) { if (!r._id) r._id = 'H' + cfRand(6); self.put('shifts', r, dirty); },
      updateShift: function (r) { if (!r._id) r._id = 'H' + cfRand(6); self.put('shifts', r, dirty); },
      savePhoto: function (dataUrl, name) {
        var m = /^data:image\/jpeg;base64,([A-Za-z0-9+\/=]+)$/.exec(String(dataUrl || '')); if (!m || m[1].length > 400000) return '';
        var id = cfRand(12); self.sql.exec('INSERT INTO photos (id, at, name, data) VALUES (?, ?, ?, ?)', id, cfNow().stamp, String(name || ''), m[1]);
        return self.origin + '/photo/' + id;
      },
      photoFolderUrl: function () { return self.origin + '/photos?k=' + encodeURIComponent(sec.OWNER_KEY || ''); },
      photoUrl: function (name) { var n = String(name || '').trim(); return self.photosMap[n] || self.photosMap[n.replace(/\.\w+$/, '')] || ''; },
      session: function (t) { return self.sess(t, 's'); },
      newSession: function (sid) { return self.newSess('s', sid); },
      csession: function (t) { return self.sess(t, 'c'); },
      newCsession: function (uid) { return self.newSess('c', uid); },
      log: function (s, b, a, d) { self.sql.exec('INSERT INTO log (time, staffId, bookingId, action, detail) VALUES (?, ?, ?, ?, ?)', cfNow().stamp, String(s || ''), String(b || ''), String(a || ''), String(d == null ? '' : d)); },
      lock: function (fn) { return fn(); },   /* the shop runs one request at a time already */
      members: function () { return db.members; }, saveMember: saver('members'),
      tickets: function () { return db.tickets; }, saveTicket: saver('tickets'),
      orders: function () {
        if (job.archive && !job.allOr) { job.allOr = true; }   /* orders are never trimmed from memory */
        return db.orders; }, saveOrder: saver('orders'),
      vouchers: function () { return db.vouchers; }, saveVoucher: saver('vouchers'),
      claims: function () { return db.claims; }, saveClaim: saver('claims'),
      lineUser: function (idToken, kind) { var hit = self.idt.get((kind || 's') + ':' + idToken); if (!hit || hit.exp < Date.now()) throw new Error('BAD_ID_TOKEN'); return hit.sub; },
      push: function (msgs) { job.push = job.push.concat(msgs || []); },
      kioskKey: function () { return sec.KIOSK_KEY || ''; },
      ownerKey: function () { return sec.OWNER_KEY || ''; },
      /* Beam needs the network: the link is made right after the engine finishes, the answer gets the real address */
      beamCreate: function (o, returnUrl) { job.beam.push({ o: o, returnUrl: returnUrl }); return { id: '', url: '__BEAM_URL_' + o.id + '__' }; },
      beamStatus: function (id) { var s = job.beamSeen[id]; if (!s) throw new Error('BEAM_UNKNOWN'); return s; },
      beamDisable: function (id) { if (id) job.disable.push(id); },
      mail: function (to, subject, html) { job.relay.push({ relay: 'mail', to: to, subject: subject, html: html }); }
    };
    return st;
  }
  newJob(archive) { return { dirty: new Map(), beam: [], beamSeen: {}, disable: [], push: [], relay: [], archive: !!archive }; }
  sess(t, kind) { if (!t) return null; var r = this.q('SELECT v, exp FROM sess WHERE t = ? AND kind = ?', String(t), kind)[0]; return r && r.exp > Date.now() ? r.v : null; }
  newSess(kind, v) { var t = cfRand(16); this.sql.exec('INSERT INTO sess (t, kind, v, exp) VALUES (?, ?, ?, ?)', t, kind, String(v), Date.now() + 6 * 3600 * 1000); return t; }

  /* ---------- outside services ---------- */
  beamBase() { return String(this.secrets.BEAM_ENV || '').toLowerCase() === 'playground' ? 'https://playground.api.beamcheckout.com' : 'https://api.beamcheckout.com'; }
  beamAuth() { var id = this.secrets.BEAM_MERCHANT_ID, key = this.secrets.BEAM_API_KEY; if (!id || !key) throw new Error('PAY_SETUP'); return 'Basic ' + btoa(id + ':' + key); }
  async beamStatusNet(id) {
    var r = await fetch(this.beamBase() + '/api/v1/payment-links/' + encodeURIComponent(id), { headers: { Authorization: this.beamAuth() } });
    if (r.status !== 200) throw new Error('BEAM_' + r.status);
    return (await r.json()).status;
  }
  async beamCreateNet(o, returnUrl) {
    var satang = Math.round(+o.amount * 100), back = /^https:\/\//.test(returnUrl || '') ? returnUrl : '';
    if (back) back += (back.indexOf('?') >= 0 ? '&' : '?') + 'order=' + o.id;
    var body = { order: { currency: 'THB', netAmount: satang, description: String(o.label || 'Lana').slice(0, 100), referenceId: o.id,
      orderItems: [{ itemName: String(o.label || 'Lana').slice(0, 100), description: o.kind, price: satang, quantity: 1, sku: o.kind, productId: o.prog || o.kind }] },
      linkSettings: { card: { isEnabled: true }, qrPromptPay: { isEnabled: true }, eWallets: { isEnabled: true }, mobileBanking: { isEnabled: true } },
      collectDeliveryAddress: false, expiresAt: new Date(Date.now() + LN_C.PAY_MIN * 60000).toISOString() };
    if (back) { body.redirectUrl = back; body.cancelUrl = back + '&cancel=1'; }
    var self = this, send = function () { return fetch(self.beamBase() + '/api/v1/payment-links', { method: 'POST', headers: { Authorization: self.beamAuth(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); };
    var r = await send();
    if ((r.status < 200 || r.status >= 300) && body.cancelUrl) { delete body.cancelUrl; r = await send(); }
    if (r.status < 200 || r.status >= 300) { var txt = await r.text(); throw new Error('PAY_FAILED ' + r.status + ' ' + txt.slice(0, 200)); }
    var j = await r.json(); return { id: j.id || j.paymentLinkId, url: j.url };
  }
  /* statuses the engine may ask for during this request (orders it will look at) */
  async prefetchBeam(job, orders) {
    var self = this, ids = orders.filter(function (o) { return o && o.beamId && !job.beamSeen[o.beamId]; }).map(function (o) { return o.beamId; }).filter(function (x, i, a) { return a.indexOf(x) === i; }).slice(0, 25);
    await Promise.all(ids.map(function (id) { return self.beamStatusNet(id).then(function (s) { job.beamSeen[id] = s; }, function () {}); }));
  }
  async prefetchLine(req) {
    if (!req.idToken) return;
    var kind = req.app === 'cust' ? 'cust' : 's', key = kind + ':' + req.idToken, hit = this.idt.get(key);
    if (hit && hit.exp > Date.now()) return;
    if (/^demo:/.test(req.idToken) && this.env.DEMO === '1') { this.idt.set(key, { sub: req.idToken.slice(5), exp: Date.now() + 1800e3 }); return; }
    var r = await fetch('https://api.line.me/oauth2/v2.1/verify', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'id_token=' + encodeURIComponent(req.idToken) + '&client_id=' + encodeURIComponent(this.secrets[kind === 'cust' ? 'CUST_LOGIN_CHANNEL' : 'LINE_LOGIN_CHANNEL'] || '') });
    if (r.status !== 200) return;
    var sub = (await r.json()).sub; if (sub) this.idt.set(key, { sub: sub, exp: Date.now() + 1800e3 });
  }
  async after(job, st) {
    var self = this, failed = null;
    /* Beam links made after the engine ran: patch the orders, or undo the hold if Beam said no */
    for (var i = 0; i < job.beam.length; i++) {
      var x = job.beam[i], o = x.o;
      try { var link = await this.beamCreateNet(o, x.returnUrl); o.beamId = link.id; o.beamUrl = link.url; job.urls = job.urls || {}; job.urls[o.id] = link.url; }
      catch (e) {
        failed = 'PAY_FAILED'; st.log('', o.bookingId || '', 'beam_error', String(e.message).slice(0, 300));
        o.status = 'cancelled'; o.beamUrl = '';
        var b = o.bookingId ? lnFind(st.bookings(), o.bookingId) : null;
        if (b && b.status === 'hold' && b.orderId === o.id) cReleaseHold(st, b);
      }
      st.saveOrder(o);
    }
    this.flush(job.dirty);
    job.disable.forEach(function (id) { fetch(self.beamBase() + '/api/v1/payment-links/' + encodeURIComponent(id) + '/disable', { method: 'PATCH', headers: { Authorization: self.beamAuth() } }).catch(function () {}); });
    this.sendRelay(job.relay);
    return failed;
  }
  sendRelay(list) {
    if (!list.length || !this.gasUrl || !this.env.ADMIN_KEY) return;
    var self = this;
    this.ctx.waitUntil(fetch(this.gasUrl, { method: 'POST', body: JSON.stringify({ relay: 'batch', key: this.env.ADMIN_KEY, items: list }) }).catch(function (e) { self.q('INSERT INTO log (time, action, detail) VALUES (?, ?, ?)', cfNow().stamp, 'relay_failed', String(e.message)); }));
  }
  async linePush(msgs, st) {
    var token = this.secrets.LINE_STAFF_TOKEN, liff = this.secrets.LIFF_ID;
    if (!token) { msgs.forEach(function (m) { st.log(m.staffId, m.bookingId, 'push_skipped', 'no LINE_STAFF_TOKEN'); }); return; }
    await Promise.all(msgs.map(async function (m) {
      var lines = m.text.split('\n'), body = { type: 'bubble', size: 'kilo', body: { type: 'box', layout: 'vertical', spacing: 'sm', contents: [
        { type: 'text', text: m.kind === 'job' ? 'งานใหม่' : m.kind === 'move' ? 'ถึงเวลาย้ายที่' : 'ใกล้ครบเวลา', size: 'xs', color: m.kind === 'warn' ? '#b5651d' : '#6b7a45', weight: 'bold' },
        { type: 'text', text: lines[0], wrap: true, weight: 'bold', size: 'md', color: '#3c2219' },
        { type: 'text', text: lines[1] || '', wrap: true, size: 'sm', color: '#7a6a5d' }] } };
      if (liff) body.footer = { type: 'box', layout: 'vertical', contents: [{ type: 'button', style: 'primary', color: '#3c2219', height: 'sm', action: { type: 'uri', label: m.kind === 'job' ? 'เปิดดูงาน' : 'เปิดงานของฉัน', uri: 'https://liff.line.me/' + liff } }] };
      var r = await fetch('https://api.line.me/v2/bot/message/push', { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ to: m.to, messages: [{ type: 'flex', altText: lines[0], contents: body }] }) }).catch(function () { return { status: 0, text: async function () { return 'network'; } }; });
      st.log(m.staffId, m.bookingId, r.status === 200 ? 'push_' + m.kind : 'push_failed', r.status === 200 ? lines[0] : (await r.text()).slice(0, 200));
    }));
  }

  /* ---------- requests ---------- */
  async fetch(request) {
    var url = new URL(request.url); this.origin = url.origin;
    try {
      this.trim();
      if (url.pathname === '/tick') return cfJson(await this.tick());
      if (url.pathname === '/status') {   /* a quick health check anyone can open (no secrets in it) */
        var sc = this.secrets, db = this.db;
        return cfJson({ ok: true, setUp: !!this.cfg, programs: this.cfg ? LANA.PROGRAMS.filter(function (p) { return lnOnSale(p); }).length : 0, staff: this.cfg ? (this.cfg.staff || []).length : 0,
          keys: { kiosk: !!sc.KIOSK_KEY, owner: !!sc.OWNER_KEY, beam: !!(sc.BEAM_MERCHANT_ID && sc.BEAM_API_KEY), lineStaff: !!sc.LINE_STAFF_TOKEN, custLogin: !!sc.CUST_LOGIN_CHANNEL, appsScript: !!this.gasUrl, adminKey: !!this.env.ADMIN_KEY },
          data: { bookings: db.bookings.length, orders: db.orders.length, members: db.members.length, tickets: db.tickets.length, shifts: db.shifts.length },
          lastTick: this.lastTick || '', now: cfNow().stamp, version: LN_BUILD });
      }
      if (url.pathname.indexOf('/admin/') === 0) return await this.admin(request, url);
      if (url.pathname.indexOf('/photo/') === 0) return this.photo(url.pathname.slice(7));
      if (url.pathname === '/photos') return this.gallery(url);
      if (url.pathname === '/line-staff') return cfJson(await this.lineStaff(JSON.parse(await request.text())));
      var raw = await request.text(), req = JSON.parse(raw || '{}');
      if (req.events) return cfJson(await this.lineStaff(req));
      if (!req.action) return cfJson(await this.beamWebhook(req));
      return cfJson(await this.api(req, raw));
    } catch (err) { return cfJson({ ok: false, error: String(err && err.message || err) }); }
  }
  async api(req, raw) {
    if (!this.cfg) return { ok: false, error: 'NOT_SET_UP' };
    var useDedup = !CF_DEDUP.test(String(req.action)) && req.app !== 'owner', key = '';
    if (useDedup) {
      key = await cfSha(raw); var hit = this.dedup.get(key);
      if (hit && hit.exp > Date.now()) { if (hit.out) return hit.out; return await hit.wait; }   /* the same change sent twice within seconds: answer both the same */
      var release; this.dedup.set(key, { exp: Date.now() + 15000, wait: new Promise(function (r) { release = r; }) });
    }
    var res;
    try { res = await this.apiRun(req); }
    catch (e) { res = { ok: false, error: String(e && e.message || e) }; }
    if (useDedup) { var d = this.dedup.get(key); if (d) { d.out = res; d.exp = Date.now() + 15000; } release(res); if (this.dedup.size > 500) { var t = Date.now(), m = this.dedup; m.forEach(function (v, k) { if (v.exp < t) m.delete(k); }); } }
    return res;
  }
  async apiRun(req) {
    var job = this.newJob(req.app === 'owner'), st = this.store(job), now = cfNow();
    await this.prefetchLine(req);
    /* payments the engine may check during this request */
    var ord = req.id ? this.index.orders.get(String(req.id)) : null, look = ord ? [ord] : [];
    if (req.id && !ord) { var bk = this.index.bookings.get(String(req.id).replace(/^B:/, '')); if (bk && bk.orderId) look.push(this.index.orders.get(String(bk.orderId))); }
    if (req.action === 'order' || req.action === 'payCancel' || req.action === 'sCounterPay' || req.action === 'cancelPay' || ord) await this.prefetchBeam(job, look);
    var out, err = null;
    try {
      out = req.app === 'cust' ? custApi(req, st, now) : req.app === 'owner' ? ownerApi(req, st, now) : req.app === 'station' ? stationApi(req, st, now) : staffApi(req, st, now);
    } catch (e) { err = String(e && e.message || e); }
    this.flush(job.dirty);
    var failed = await this.after(job, st);
    if (job.push.length) await this.linePush(job.push, st);
    var res;
    if (err) res = { ok: false, error: err };
    else if (failed) res = { ok: false, error: failed };
    else {
      var s = JSON.stringify(out === undefined ? null : out);
      if (job.urls) Object.keys(job.urls).forEach(function (id) { s = s.split('__BEAM_URL_' + id + '__').join(String(job.urls[id]).replace(/"/g, '\\"')); });
      res = { ok: true, data: JSON.parse(s) };
    }
    return res;
  }
  async beamWebhook(payload) {
    var s = JSON.stringify(payload), m = s.match(/"(?:paymentLinkId|sourceId|id)"\s*:\s*"([A-Za-z0-9_-]{6,})"/g) || [], ids = m.map(function (x) { return x.split('"')[3]; });
    var list = this.db.orders.filter(function (o) { return (o.status === 'pending' || o.status === 'cancelled' || o.status === 'replaced') && ids.indexOf(o.beamId) >= 0; });
    if (!list.length) return { ok: true };
    var job = this.newJob(), st = this.store(job), now = cfNow();
    await this.prefetchBeam(job, list);   /* never trust the webhook alone: ask Beam */
    list.forEach(function (o) { if (job.beamSeen[o.beamId]) cCheckOrder(st, o, now); });
    this.flush(job.dirty); await this.after(job, st);
    return { ok: true };
  }
  async lineStaff(req) {
    var token = this.secrets.LINE_STAFF_TOKEN; if (!token || !this.cfg) return { ok: true };
    var self = this, job = this.newJob(), st = this.store(job), now = cfNow();
    for (var i = 0; i < (req.events || []).length; i++) {
      var ev = req.events[i];
      if (ev.type !== 'message' || !ev.message || ev.message.type !== 'text' || !ev.replyToken) continue;
      var text = String(ev.message.text || '');
      if (!/ขอคิว|คิวว่าง|ตารางคิว|คิววันนี้|คิวพรุ่งนี้|queue|slot/i.test(text)) continue;
      var uid = ev.source && ev.source.userId, me = uid ? st.staff().filter(function (s) { return s.lineUserId === uid; })[0] : null;
      var named = st.branches().filter(function (b) { return text.indexOf(b.name_th) >= 0 || text.indexOf(String(b.name_th).replace('สาขา', '')) >= 0 || new RegExp('\\b' + b.id + '\\b', 'i').test(text); }).map(function (b) { return b.id; });
      var reply = lnQueueText(st, now, text, named.length ? named : me ? [me.branch] : null);
      await fetch('https://api.line.me/v2/bot/message/reply', { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ replyToken: ev.replyToken, messages: [{ type: 'text', text: reply.slice(0, 4900) }] }) }).catch(function () {});
      st.log(me ? me.id : '', '', 'line_ask_queue', text.slice(0, 40));
    }
    this.flush(job.dirty);
    return { ok: true };
  }
  /* every minute (Cloudflare cron): holds that ran out, payments, reminders, LINE pushes, 22:00 clock-out */
  async tick() {
    this.lastTick = cfNow().stamp;
    if (!this.cfg) return { ok: false, error: 'NOT_SET_UP' };
    var job = this.newJob(), st = this.store(job), now = cfNow(), out = { ok: true };
    if (now.min >= LN_AUTO_OUT && now.min < LN_AUTO_OUT + 5) lnAutoClockOut(st, now);
    if (now.min >= LANA.OPEN - 30 && now.min <= LANA.CLOSE + 30) {
      var since = now.min - 120;
      await this.prefetchBeam(job, this.db.orders.filter(function (o) { if (o.status !== 'pending' && o.status !== 'replaced' && o.status !== 'cancelled') return false; var c = cMinOf(o.createdAt); return c.date === now.date && c.min >= since; }));
      custTick(st, now);
      var msgs = staffTick(st, now); if (msgs.length) st.push(msgs);
    }
    this.flush(job.dirty);
    await this.after(job, st);
    if (job.push.length) await this.linePush(job.push, st);
    this.flush(job.dirty);
    return out;
  }
  photo(id) {
    var r = this.q('SELECT data FROM photos WHERE id = ?', String(id).replace(/[^a-f0-9]/g, ''))[0];
    if (!r) return new Response('not found', { status: 404 });
    var bin = atob(r.data), a = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
    return new Response(a, { headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'private, max-age=86400' } });
  }
  gallery(url) {
    if (!this.secrets.OWNER_KEY || url.searchParams.get('k') !== this.secrets.OWNER_KEY) return new Response('ต้องเปิดจากหน้า owner', { status: 401 });
    var rows = this.q('SELECT id, at, name FROM photos ORDER BY at DESC LIMIT 300'), esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var html = '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>รูปเข้างาน</title><style>body{font-family:sans-serif;margin:16px;background:#f7f1ea}div{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px}figure{margin:0;background:#fff;padding:6px;border-radius:8px}img{width:100%;border-radius:6px}figcaption{font-size:12px}</style><h2>รูปเข้างาน (ล่าสุด 300 รูป)</h2><div>' +
      rows.map(function (r) { return '<figure><a href="/photo/' + r.id + '" target="_blank"><img loading="lazy" src="/photo/' + r.id + '"></a><figcaption>' + esc(r.name || r.at) + '</figcaption></figure>'; }).join('') + '</div>';
    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  /* ---------- from / to Apps Script (protected by ADMIN_KEY) ---------- */
  async admin(request, url) {
    var key = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/, '') || url.searchParams.get('key') || '';
    if (!this.env.ADMIN_KEY || key !== this.env.ADMIN_KEY) return cfJson({ ok: false, error: 'ADMIN_KEY' }, 401);
    var self = this, path = url.pathname.slice(7);
    if (path === 'config') {   /* menu, prices, staff, photos and secrets from the Google Sheet */
      var body = JSON.parse(await request.text());
      var set = function (k, v) { self.sql.exec('INSERT OR REPLACE INTO kv (k, v) VALUES (?, ?)', k, v); };
      this.cfg = { tables: body.tables || {}, staff: body.staff || [] }; set('config', JSON.stringify(this.cfg));
      if (body.secrets) { this.secrets = body.secrets; set('secrets', JSON.stringify(body.secrets)); }
      if (body.photos) { this.photosMap = body.photos; set('photos', JSON.stringify(body.photos)); }
      if (body.gasUrl) { this.gasUrl = body.gasUrl; set('gasUrl', body.gasUrl); }
      this.cfgHash = String(body.hash || ''); set('cfgHash', this.cfgHash);
      this.staffList = null; cfApplyConfig(this.cfg.tables);
      return cfJson({ ok: true, programs: LANA.PROGRAMS.length, staff: this.cfg.staff.length });
    }
    if (path === 'hash') return cfJson({ ok: true, hash: this.cfgHash });
    if (path === 'import') {   /* the move from Google Sheet: whole tables, replaced */
      var imp = JSON.parse(await request.text()), counts = {};
      Object.keys(imp.tables || {}).forEach(function (t) {
        if (CF_TABLES.indexOf(t) < 0) return;
        self.sql.exec('DELETE FROM rows WHERE tbl = ?', t);
        var dirty = new Map(); self.db[t] = []; self.reindex(t);
        imp.tables[t].forEach(function (o) { if (t === 'shifts' && !o._id) o._id = 'H' + cfRand(6); if (!(o.id || o._id)) return; self.put(t, o, dirty); });
        self.flush(dirty); counts[t] = self.db[t].length;
      });
      if (imp.log) imp.log.forEach(function (r) { self.sql.exec('INSERT INTO log (time, staffId, bookingId, action, detail) VALUES (?, ?, ?, ?, ?)', String(r.time || ''), String(r.staffId || ''), String(r.bookingId || ''), String(r.action || ''), String(r.detail || '')); });
      this.load();
      return cfJson({ ok: true, counts: counts });
    }
    if (path === 'export') {   /* Apps Script copies everything back into the sheet each night (reports, or to move back) */
      var days = +url.searchParams.get('days') || 60, from = cfDayBefore(cfNow().date, days), out = {};
      CF_TABLES.forEach(function (t) {
        var rows = t === 'bookings' || t === 'shifts' ? self.q('SELECT data FROM rows WHERE tbl = ? AND (day >= ? OR status IN (\'hold\',\'booked\',\'checkedin\',\'accepted\',\'inservice\',\'finished\'))', t, from) : self.q('SELECT data FROM rows WHERE tbl = ?', t);
        out[t] = rows.map(function (r) { return JSON.parse(r.data); });
      });
      out.log = this.q('SELECT time, staffId, bookingId, action, detail FROM log WHERE time >= ? ORDER BY n', from);
      return cfJson({ ok: true, tables: out });
    }
    return cfJson({ ok: false, error: 'UNKNOWN' }, 404);
  }
}

/* the Worker: everything goes to the one shop */
export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } });
    var url = new URL(request.url);
    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '')) return cfJson({ ok: true, msg: 'Lana API is running (Cloudflare)', version: LN_BUILD });
    var shop = env.SHOP.get(env.SHOP.idFromName('main'));
    return shop.fetch(request);
  },
  async scheduled(event, env, ctx) {
    var shop = env.SHOP.get(env.SHOP.idFromName('main'));
    ctx.waitUntil(shop.fetch('https://shop/tick', { method: 'POST' }));
  }
};
