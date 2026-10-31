export interface SeedBanner {
  badge: string
  title: string
  subtitle: string
  description: string
  cta_label: string
  cta_link: string
  secondary_label: string
  secondary_link: string
  image_url: string
  sort_order: number
  is_active: number
}

export interface SeedCategory {
  id: number
  slug: string
  name_th: string
  name_en: string
  description: string
  icon: string
  image_url: string
  sort_order: number
}

export interface SeedProduct {
  sku: string
  slug: string
  name: string
  subtitle: string
  brand: string
  category_id: number
  description: string
  specs: string[]
  price_display: string
  price_amount: number | null
  image_url: string
  stock_status: string
  is_featured: number
}

export interface SeedArticle {
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  cover_image: string
  author_name: string
  published_at: string
}

export const SEED_BANNERS: SeedBanner[] = [
  {
    badge: 'CSF TECHNOLOGY TOUCH • ENTERPRISE DISTRIBUTOR',
    title: 'Audio / Video & Broadcasting Solutions',
    subtitle: 'ระบบเสียงห้องประชุม ห้องเรียนอัจฉริยะ ระบบประกาศสาธารณะ และอุปกรณ์เชื่อมต่อมาตรฐานสากล',
    description:
      'คัดสรรอุปกรณ์ระบบเสียงและภาพระดับมืออาชีพ อาทิ DSPPA Public Address, ลำโพงเพดานและคอลัมน์กันน้ำ, เครื่องขยายเสียงดิจิทัล และหัวต่อสายสัญญาณคุณภาพสูง พร้อมทีมวิศวกรให้คำปรึกษาครบวงจร',
    cta_label: 'ดูสินค้ากลุ่ม Audio / Video',
    cta_link: '/products?category=audio-video-products',
    secondary_label: 'ขอใบเสนอราคาองค์กร',
    secondary_link: '/contact',
    image_url: '/images/hero-av.jpg',
    sort_order: 1,
    is_active: 1
  },
  {
    badge: 'AI SURVEILLANCE & SECURITY',
    title: 'CCTV Solution Products',
    subtitle: 'กล้องวงจรปิดเครือข่าย IP Camera ความละเอียดสูง และเครื่องบันทึก NVR ระดับองค์กร',
    description:
      'โซลูชันระบบรักษาความปลอดภัยครบวงจร ตั้งแต่ Starlight Motorized IR Dome, Speed Dome 30X Optical Zoom, กล้อง Fisheye 360° ไปจนถึงเครื่องบันทึก 64CH 8HDD รองรับ RAID 0/1/5/6/10',
    cta_label: 'สำรวจระบบ CCTV ทั้งหมด',
    cta_link: '/products?category=cctv-solution-products',
    secondary_label: 'ปรึกษาผ่าน LINE OA',
    secondary_link: '/contact#social-connect',
    image_url: '/images/hero-cctv.jpg',
    sort_order: 2,
    is_active: 1
  },
  {
    badge: 'TELECOM & INFRASTRUCTURE',
    title: 'IP Network System',
    subtitle: 'โครงข่ายสื่อสารความเร็วสูง PoE+ Switch, Fiber Optic และระบบเครือข่ายสำหรับอาคารและโรงงาน',
    description:
      'ออกแบบและจัดจำหน่ายอุปกรณ์โครงสร้างพื้นฐานด้านเครือข่าย Telecom Network รองรับการส่งสัญญาณภาพ เสียง และข้อมูลความเร็วสูงอย่างมีเสถียรภาพ ต่อเนื่อง 24 ชั่วโมง',
    cta_label: 'ดูโซลูชัน IP Network',
    cta_link: '/products?category=ip-network-system',
    secondary_label: 'ติดต่อฝ่ายขาย',
    secondary_link: '/contact',
    image_url: '/images/hero-network.jpg',
    sort_order: 3,
    is_active: 1
  },
  {
    badge: 'SMART ENTERPRISE INTEGRATION',
    title: 'IT Solution & Electronic Components',
    subtitle: 'เทคโนโลยีครบวงจรสำหรับองค์กร หน่วยงานภาครัฐ และภาคเอกชน ในงบประมาณที่คุ้มค่า',
    description:
      'บริษัท ซีเอสเอฟ จำกัด มุ่งมั่นคัดสรรสินค้าภายใต้แบรนด์ชั้นนำ จัดส่งรวดเร็วตรงตามกำหนดการ พร้อมบริการหลังการขายที่เป็นรากฐานสำคัญของธุรกิจคุณ',
    cta_label: 'รู้จัก CSF Technology Touch',
    cta_link: '/about',
    secondary_label: 'ขอใบเสนอราคาด่วน',
    secondary_link: '/contact',
    image_url: '/images/hero-it.jpg',
    sort_order: 4,
    is_active: 1
  }
]

export const SEED_CATEGORIES: SeedCategory[] = [
  {
    id: 1,
    slug: 'audio-video-products',
    name_th: 'ระบบเสียงและภาพ (Audio / Video)',
    name_en: 'Audio / Video Products',
    description:
      'ลำโพงเพดาน ลำโพงคอลัมน์กันน้ำ เครื่องขยายเสียงดิจิทัล ชุดเครื่องเสียงห้องเรียนอัจฉริยะ และหัวต่อสายสัญญาณ XLR / Speakon มาตรฐานมืออาชีพ',
    icon: 'Volume2',
    image_url: '/images/hero-av.jpg',
    sort_order: 1
  },
  {
    id: 2,
    slug: 'cctv-solution-products',
    name_th: 'ระบบกล้องวงจรปิด (CCTV Solutions)',
    name_en: 'CCTV Solution Products',
    description:
      'กล้อง IP Camera Starlight, Speed Dome PTZ, กล้อง Fisheye 6MP, เครื่องบันทึก NVR 16/32/64 ช่อง รองรับ RAID และอุปกรณ์ยึดติดตั้งครบชุด',
    icon: 'ShieldCheck',
    image_url: '/images/hero-cctv.jpg',
    sort_order: 2
  },
  {
    id: 3,
    slug: 'ip-network-system',
    name_th: 'ระบบเครือข่าย (IP Network System)',
    name_en: 'IP Network System',
    description:
      'อุปกรณ์สวิตช์เครือข่าย Gigabit PoE+, โครงข่ายใยแก้วนำแสง Fiber Optic, ตู้แร็คเซิร์ฟเวอร์ และอุปกรณ์เชื่อมต่อโครงข่ายสื่อสารระดับองค์กร',
    icon: 'Network',
    image_url: '/images/hero-network.jpg',
    sort_order: 3
  },
  {
    id: 4,
    slug: 'it-solution-products',
    name_th: 'โซลูชันไอทีและชิ้นส่วนอิเล็กทรอนิกส์',
    name_en: 'IT Solution Products',
    description:
      'อุปกรณ์ IT Solution สำหรับห้องประชุมอัจฉริยะ ระบบสำรองไฟ UPS ระดับองค์กร เซิร์ฟเวอร์จัดเก็บข้อมูล และ Electronic Components เฉพาะทาง',
    icon: 'Cpu',
    image_url: '/images/hero-it.jpg',
    sort_order: 4
  }
]

export const SEED_PRODUCTS: SeedProduct[] = [
  // Audio / Video Products (Authentic csf.co.th SKUs)
  {
    sku: 'DSP501',
    slug: 'dsp501-ceiling-speaker',
    name: 'DSP501 — 3W-6W Commercial Ceiling Speaker',
    subtitle: 'ลำโพงติดเพดาน 4.5 นิ้ว สำหรับระบบเสียงประกาศอาคาร สำนักงาน และโรงแรม',
    brand: 'DSPPA Audio',
    category_id: 1,
    description:
      'ลำโพงติดเพดานคุณภาพสูง รองรับแรงดันสายสัญญาณ 100V (3W, 6W) และ 70V (1.5W, 3W, 5W) หน้ากากตะแกรงอะลูมิเนียมปลอดสนิม พร้อมโครง ABS แข็งแรง ติดตั้งสะดวกรวดเร็วด้วยคลิปล็อกสปริง ให้เสียงคมชัดเป็นธรรมชาติ',
    specs: [
      'แรงดันสายสัญญาณ: 100V (3W, 6W) / 70V (1.5W, 3W, 5W)',
      'ขนาดดอกลำโพง: 4.5 นิ้ว พร้อมตะแกรง Aluminum Grille และขอบ ABS Baffle',
      'ความดังสูงสุด (Max. SPL): 96±2dB',
      'การตอบสนองความถี่: 75Hz – 20kHz',
      'ขนาดเจาะฝ้าเพดาน (Cutout Size): Ø154mm – Ø164mm ติดตั้งง่ายด้วย Spring Clip'
    ],
    price_display: 'ขอใบเสนอราคา (ราคาส่งโครงการ)',
    price_amount: 890,
    image_url: '/images/prod-speaker.jpg',
    stock_status: 'มีสินค้าพร้อมส่ง',
    is_featured: 1
  },
  {
    sku: 'WA124',
    slug: 'wa124-5w-ceiling-speaker',
    name: 'WA124 — 5W High-Sensitivity Ceiling Speaker',
    subtitle: 'ลำโพงติดเพดานขนาด 6.5 นิ้ว ความไวสูง เสียงคมชัดครอบคลุมพื้นที่กว้าง',
    brand: 'DSPPA Audio',
    category_id: 1,
    description:
      'ลำโพงติดเพดานดอกลำโพงขนาด 6.5 นิ้ว กำลังขับพิกัด 5W (รองรับ 100V 5W/10W และ 70V 2.5W/5W) ค่าความไวสูงถึง 93±2dB ให้ความดังสูงสุด 100±2dB ผลิตจากพลาสติกวิศวกรรมคุณภาพสูง เหมาะสำหรับอาคารสำนักงาน ห้างสรรพสินค้า และสถานศึกษา',
    specs: [
      'รองรับระบบสาย: 100V (5W, 10W) และ 70V (2.5W, 5W)',
      'กำลังขับปกติ (Rated Power): 5W',
      'ความดังสูงสุด (Max SPL): 100±2dB / ความไว (Sensitivity): 93±2dB',
      'ดอกลำโพงขนาด: 6.5 นิ้ว x 1 ยูนิต',
      'ย่านความถี่ตอบสนอง: 130Hz – 18kHz',
      'ตัวถังผลิตจาก High Quality Engineering Plastic น้ำหนักเบา ทนทาน'
    ],
    price_display: 'ขอใบเสนอราคา (ราคาส่งโครงการ)',
    price_amount: 950,
    image_url: '/uploads/products/wa124.jpg',
    stock_status: 'มีสินค้าพร้อมส่ง',
    is_featured: 0
  },
  {
    sku: 'DSP255II',
    slug: 'dsp255ii-waterproof-column-speaker',
    name: 'DSP255II — 30W Waterproof Column Speaker with Power Tap',
    subtitle: 'ลำโพงคอลัมน์อะลูมิเนียมอัลลอยกันน้ำ 30W สำหรับติดตั้งทั้งภายในและภายนอกอาคาร',
    brand: 'DSPPA Audio',
    category_id: 1,
    description:
      'ลำโพงคอลัมน์ดีไซน์เพรียวบางตัวถังอะลูมิเนียมอัลลอยแข็งแรงทนทานกันน้ำ กันสนิม ติดตั้งได้ทั้งกลางแจ้งและในร่ม มาพร้อมดอกลำโพง Woofer ขนาด 3 นิ้ว 2 ดอก และ Tweeter 1 นิ้ว 1 ดอก ให้มิติเสียงชัดเจน พร้อมสวิตช์ปรับ Power Tap เลือกกำลังขับได้ตามพื้นที่ใช้งาน',
    specs: [
      'การออกแบบกันน้ำ (Outdoor Waterproof Design) เหมาะทั้ง Indoor และ Outdoor',
      'ดอกลำโพง: 2 x 3" Woofer + 1 x 1" Tweeter ให้คุณภาพเสียงพูดและดนตรีที่ยอดเยี่ยม',
      'กำลังขับสูงสุด: 30W พร้อม Power Tap ปรับเลือกโหมดกำลังขับได้อิสระ',
      'วัสดุตัวถัง: Solid Aluminum Alloy Housing ทนทาน ไม่เป็นสนิม',
      'ดีไซน์กะทัดรัด กลมกลืนกับงานตกแต่งสถาปัตยกรรมทุกประเภท'
    ],
    price_display: 'ขอใบเสนอราคา (ราคาส่งโครงการ)',
    price_amount: 3450,
    image_url: '/images/prod-speaker.jpg',
    stock_status: 'มีสินค้าพร้อมส่ง',
    is_featured: 1
  },
  {
    sku: 'MP60U',
    slug: 'mp60u-digital-mixer-amplifier',
    name: 'MP60U — 60W Mini USB/Tuner/Bluetooth Digital Mixer Amplifier',
    subtitle: 'เครื่องขยายเสียงมิกเซอร์ดิจิทัล 60W รองรับ Bluetooth, USB, FM และระบบประกาศฉุกเฉิน',
    brand: 'DSPPA Audio',
    category_id: 1,
    description:
      'เครื่องขยายเสียงดิจิทัลมิกเซอร์ขนาดกะทัดรัด กำลังขับ 60W ครบครันด้วยช่องสัญญาณ 3 MIC, 2 AUX Line และ 1 EMC Input สำหรับสัญญาณเตือนภัยฉุกเฉิน รองรับการต่อลำโพงทั้งแบบ 100V/70V และ 4Ω–16Ω พร้อมฟังก์ชันเล่นเพลงผ่าน USB, FM Radio, Bluetooth และรีโมทคอนโทรล',
    specs: [
      'ช่องสัญญาณเข้า: 3 MIC / 2 AUX Line / 1 EMC Emergency Input',
      'ช่องสัญญาณออก: 1 AUX Line Output',
      'รองรับโหลดลำโพงทั้งระบบ 100V/70V และความต้านทานต่ำ 4Ω–16Ω',
      'รองรับการเชื่อมต่อไร้สาย Bluetooth, เครื่องเล่น USB MP3 และจูนเนอร์วิทยุ FM',
      'มาพร้อมรีโมทคอนโทรลอินฟราเรดควบคุมระยะไกล'
    ],
    price_display: 'ขอใบเสนอราคา (ราคาส่งโครงการ)',
    price_amount: 5900,
    image_url: '/images/prod-amplifier.jpg',
    stock_status: 'มีสินค้าพร้อมส่ง',
    is_featured: 1
  },
  {
    sku: 'DSP6606',
    slug: 'dsp6606-active-passive-wall-speaker',
    name: 'DSP6606 — 2x30W Stereo Active + Passive Speaker System',
    subtitle: 'ชุดลำโพงสเตอริโอแอคทีฟพร้อมหน่วยความจำ 4GB และแอมป์ดิจิทัล Hi-Fi ในตัว',
    brand: 'DSPPA Audio',
    category_id: 1,
    description:
      'ชุดลำโพงคู่ (1 Active + 1 Passive) กำลังขับ 2x30W สเตอริโอ มาพร้อมแอมป์ดิจิทัล Hi-Fi ในตัว หน่วยความจำภายใน 4GB และแบตเตอรี่ RTC สามารถตั้งเวลาทำงานแบบออฟไลน์ได้โดยไม่ต้องพึ่งพาเครื่องแม่ข่าย รองรับการประกาศทางไกลและสัญญาณเตือนภัยฉุกเฉิน',
    specs: [
      'กำลังขับสเตอริโอ: 2 x 30W (ลำโพง Active 1 ตู้ + Passive 1 ตู้)',
      'หน่วยความจำในตัว 4GB สำหรับเก็บไฟล์เสียง พร้อม RTC Battery และ Hi-Fi Digital Amplifier',
      'ทำงานแบบ Offline ได้โดยไม่ต้องติดตั้งซอฟต์แวร์หรือเครื่องควบคุมกลาง',
      'พอร์ตเชื่อมต่อ: 1 AUX Input, 1 AUX Output รองรับ Remote Paging & Emergency Alarm',
      'รองรับไฟล์เสียงหลากหลาย: MP3, WMA, WAV, AAC, OGG, APE, FLAC'
    ],
    price_display: 'ขอใบเสนอราคา (ราคาส่งโครงการ)',
    price_amount: 6800,
    image_url: '/images/prod-speaker.jpg',
    stock_status: 'มีสินค้าพร้อมส่ง',
    is_featured: 0
  },
  {
    sku: 'MINI60-EDU',
    slug: 'classroom-audio-solution-mini60',
    name: 'Classroom Audio Solution — Mini60 Smart Classroom Set',
    subtitle: 'ชุดระบบเสียงห้องเรียนอัจฉริยะพร้อมบริการดูแลรักษาสำหรับสถานศึกษาและห้องฝึกอบรม',
    brand: 'CSF Education Solution',
    category_id: 1,
    description:
      'โซลูชันระบบกระจายเสียงสำหรับห้องเรียนและห้องบรรยาย ออกแบบให้เสียงพูดของผู้สอนชัดเจนทั่วถึงทุกที่นั่ง ลดอาการล้าของเสียง รองรับการเชื่อมต่อสื่อการสอนมัลติมีเดีย คอมพิวเตอร์ และไมโครโฟนไร้สาย พร้อมบริการหลังการขาย Classroom Audio Maintenance Support โดยทีมช่างผู้เชี่ยวชาญ',
    specs: [
      'แอมปลิฟายเออร์คลาส D ประสิทธิภาพสูง ประหยัดพลังงานขนาด 60W',
      'รองรับไมโครโฟนไร้สายสำหรับผู้สอน พร้อมระบบตัดเสียงรบกวนและป้องกันเสียงหอน (Anti-Feedback)',
      'ช่องต่อสัญญาณเสียงจากคอมพิวเตอร์ โปรเจคเตอร์ และกระดานอัจฉริยะครบครัน',
      'กระจายเสียงสม่ำเสมอทั่วห้องเรียนขนาด 40–80 ที่นั่ง',
      'รวมบริการให้คำปรึกษาการติดตั้งและ Classroom Audio Maintenance Support'
    ],
    price_display: 'ขอใบเสนอราคาโครงการสถานศึกษา',
    price_amount: 12500,
    image_url: '/uploads/articles/classroom-support.jpg',
    stock_status: 'พร้อมจัดส่งและติดตั้ง',
    is_featured: 0
  },
  {
    sku: 'NC3FXX',
    slug: 'nc3fxx-3-pole-female-xlr-connector',
    name: 'NC3FXX — Professional 3-Pole Female XLR Cable Connector',
    subtitle: 'หัวต่อสายสัญญาณเสียง XLR ตัวเมีย 3 ขั้ว มาตรฐานสตูดิโอและงานบรอดแคสต์',
    brand: 'Neutrik / Pro Audio',
    category_id: 1,
    description:
      'ขั้วต่อสายไมโครโฟนและสัญญาณเสียงสมดุล (Balanced Audio) แบบ 3-Pole Female XLR ตัวถังโลหะหล่อแข็งแรงทนทาน พร้อมบูทยางป้องกันสายหักงอ ให้การนำสัญญาณที่แม่นยำ ไร้เสียงรบกวน',
    specs: [
      'ประเภทหัวต่อ: 3-Pole Female XLR Cable Connector',
      'หน้าสัมผัสชุบเงินนำสัญญาณเสียงดีเยี่ยม ค่าความต้านทานต่ำ',
      'ระบบ Strain Relief จับยึดสายแน่นหนาป้องกันสายขาดใน',
      'มีรุ่นคู่กัน: NC3MXX (XLR ตัวผู้), NP2X / NP3X (Phone Plug) และสายสำเร็จรูป 2XLR'
    ],
    price_display: 'สอบถามราคาปลีก-ส่ง (ยกลัง)',
    price_amount: 195,
    image_url: '/uploads/products/nc3fxx.jpg',
    stock_status: 'มีสต็อกพร้อมส่งทันที',
    is_featured: 0
  },
  {
    sku: 'NL4FX',
    slug: 'nl4fx-speakon-connector-4-pole',
    name: 'NL4FX — Professional 4-Pole Speakon Cable Connector',
    subtitle: 'หัวต่อสายลำโพง Speakon 4 ขั้ว ระบบล็อกนิรภัย มาตรฐานงานระบบเสียงมืออาชีพ',
    brand: 'Pro Audio Interconnect',
    category_id: 1,
    description:
      'หัวต่อสายลำโพงแบบ Speakon 4 Poles มาตรฐานอุตสาหกรรมระบบเสียงพีเอและบรอดแคสต์ ระบบล็อกแน่นหนา Quick Lock ป้องกันการหลุดขณะใช้งาน รองรับกระแสไฟฟ้าสูงและการนำสัญญาณเสียงที่แม่นยำ',
    specs: [
      'ประเภทหัวต่อ: Speakon Cable Connector 4 Poles',
      'ระบบล็อกนิรภัย Twist-Lock ป้องกันสายหลุดโดยไม่ตั้งใจ',
      'รองรับสายลำโพงขนาดมาตรฐานงานติดตั้งและทัวร์ริ่ง',
      'หน้าสัมผัสโลหะนำไฟฟ้าสูง ลดการสูญเสียสัญญาณ',
      'มีสินค้าในตระกูลเดียวกัน: NL2FX, NP3X, NP2X, NC3MXX, NC3FXX และสายสำเร็จรูป 2XLR (1M/2M/3M)'
    ],
    price_display: 'สอบถามราคาปลีก-ส่ง (ยกลัง)',
    price_amount: 240,
    image_url: '/images/prod-connector.jpg',
    stock_status: 'มีสต็อกพร้อมส่งทันที',
    is_featured: 0
  },

  // CCTV Solution Products (Authentic csf.co.th Sunell SKUs)
  {
    sku: 'SN-NVR10/08E3/064NSH',
    slug: 'sn-nvr10-08e3-064nsh-64ch-8hdd-nvr',
    name: 'SN-NVR10/08E3/064NSH — 64CH 8HDD Enterprise RAID Network Video Recorder',
    subtitle: 'เครื่องบันทึกภาพเครือข่ายระดับองค์กร 64 ช่อง รองรับ 8 HDD สูงสุด 48TB และระบบ RAID 0/1/5/6/10',
    brand: 'Sunell Security',
    category_id: 2,
    description:
      'เครื่องบันทึกภาพกล้องวงจรปิด IP ระดับ Enterprise รองรับกล้องสูงสุด 64 ช่องสัญญาณ แบนด์วิดท์ขาเข้าสูงสุด 384Mbps ถอดรหัส H.265/H.264 ความละเอียดแสดงผลและย้อนหลังสูงสุด 12MP รองรับฮาร์ดดิสก์ 8 ลูกพร้อมระบบปกป้องข้อมูล RAID 0/1/5/6/10 และ N+M Hot Standby สำหรับงานที่ต้องการเสถียรภาพสูงสุด',
    specs: [
      'รองรับกล้อง IP Camera สูงสุด 64 ช่อง (Max 384Mbps Incoming Bandwidth)',
      'รองรับการบีบอัดวิดีโอ H.265 / H.264 / MPEG4 ประหยัดพื้นที่จัดเก็บ',
      'ความละเอียดการดูสดและย้อนหลังสูงสุดถึง 12 Megapixels',
      'ช่องแสดงผลวิดีโอ 2x HDMI และ VGA แสดงผลพร้อมกัน รองรับการเล่นย้อนหลัง 4/8/16 ช่องพร้อมกัน',
      'รองรับ 8 SATA HDDs ความจุรวมสูงสุด 48TB+ พร้อมระบบ RAID 0/1/5/6/10',
      'รองรับมาตรฐาน ONVIF Version 2.4, Smart Tracking และระบบสำรองฉุกเฉิน N+M Hot Standby'
    ],
    price_display: 'ขอใบเสนอราคาโครงการ (B2B)',
    price_amount: 42900,
    image_url: '/uploads/products/sn-nvr10-08e3-064nsh.jpg',
    stock_status: 'พร้อมส่ง / สั่งซื้อโครงการ',
    is_featured: 1
  },
  {
    sku: 'SN-NVR10/02E3/016NSE',
    slug: 'sn-nvr10-02e3-016nse-16ch-2hdd-nvr',
    name: 'SN-NVR10/02E3/016NSE — 16CH 2HDD Network Video Recorder',
    subtitle: 'เครื่องบันทึกภาพ IP Camera 16 ช่อง ระบบปฏิบัติการ Embedded Linux เสถียรสูง พร้อม Dual Gigabit LAN',
    brand: 'Sunell Security',
    category_id: 2,
    description:
      'เครื่องบันทึกภาพ NVR ขนาด 16 ช่องสำหรับสำนักงาน อาคารพาณิชย์ และคลังสินค้า ทำงานบนระบบปฏิบัติการ Embedded Linux ที่มีความเสถียรสูง รองรับฮาร์ดดิสก์ SATA 2 ลูก พอร์ตเครือข่ายคู่ 2x RJ45 Gigabit และแสดงผลภาพคมชัดระดับ 1080P พร้อมกันทั้ง HDMI และ VGA',
    specs: [
      'รองรับการเชื่อมต่อกล้อง IP Camera สูงสุด 16 ช่อง ความละเอียด 1080P+',
      'ระบบปฏิบัติการ Embedded Linux Operation System ทำงานต่อเนื่องเสถียรสูง',
      'รองรับฮาร์ดดิสก์ 2x SATA Hard Disk',
      'พอร์ตเครือข่ายคู่ 2x RJ45 10M/100M/1000M Gigabit Network Interface',
      'เอาต์พุตภาพ HDMI และ VGA แสดงผลพร้อมกันความละเอียด 1080P พร้อม 2x USB 2.0 Host'
    ],
    price_display: 'ขอใบเสนอราคา (ราคาส่งช่าง/องค์กร)',
    price_amount: 8500,
    image_url: '/uploads/products/sn-nvr10-02e3-016nse.jpg',
    stock_status: 'มีสินค้าพร้อมส่ง',
    is_featured: 0
  },
  {
    sku: 'SN-IPV57/41UDR/Z',
    slug: 'sn-ipv57-41udr-z-4mp-motorized-vandal-ir-dome',
    name: 'SN-IPV57/41UDR/Z — 4MP Motorized Vandal-Proof Network IR Dome',
    subtitle: 'กล้องโดมเครือข่าย 4 ล้านพิกเซล เลนส์ซูมมอเตอร์ 2.7-12mm กันน้ำ IP67 กันกระแทก IK10',
    brand: 'Sunell Security',
    category_id: 2,
    description:
      'กล้องวงจรปิดทรงโดมความละเอียด 4MP (2592x1520 @30fps) มาพร้อมเลนส์ซูมปรับโฟกัสอัตโนมัติ Motorized 2.7–12mm อินฟราเรดอัจฉริยะ Smart IR ระยะ 30 เมตร ภาพคมชัดแม้แสงน้อย พร้อมฟังก์ชัน WDR, 3D DNR, Defog, HLC และตัวถังนิรภัยมาตรฐานกันน้ำ IP67 และกันทุบทำลาย IK10',
    specs: [
      'เซนเซอร์รับภาพ 1/3" Progressive Scan CMOS ความละเอียด 4MP (2592×1520 @25/30fps)',
      'เลนส์ปรับซูมมอเตอร์ไฟฟ้า Motorized Lens 2.7–12mm ปรับมุมมองผ่านระบบได้ทันที',
      'รองรับ Triple Streams และ Smart IR ระยะส่องสว่างกลางคืนสูงสุด 30 เมตร',
      'เทคโนโลยีปรับแต่งภาพครบครัน: WDR, 3D DNR (S/N Ratio 52dB), ROI, Defog, HLC, Corridor Mode, DIS',
      'มาตรฐานความทนทานระดับอุตสาหกรรม IP67 กันน้ำกันฝุ่น และ IK10 ป้องกันการทุบทำลาย'
    ],
    price_display: 'ขอใบเสนอราคาโครงการ (B2B)',
    price_amount: 5400,
    image_url: '/uploads/products/sn-ipv57-41udr-z.jpg',
    stock_status: 'มีสินค้าพร้อมส่ง',
    is_featured: 1
  },
  {
    sku: 'SN-IPV57/20UDR/Z',
    slug: 'sn-ipv57-20udr-z-starlight-motorized-ir-dome',
    name: 'SN-IPV57/20UDR/Z — 1080P Starlight Motorized Network IR Dome',
    subtitle: 'กล้องโดมเทคโนโลยี Starlight ภาพสีชัดเจนในที่แสงน้อย พร้อมเลนส์มอเตอร์ 2.7-12mm IP67/IK10',
    brand: 'Sunell Security',
    category_id: 2,
    description:
      'กล้องโดมเครือข่าย Starlight เซนเซอร์ 1/2.8" Progressive Scan CMOS ให้ประสิทธิภาพภาพในสภาวะแสงน้อยยอดเยี่ยมเป็นพิเศษ เลนส์ Motorized 2.7–12mm ความละเอียด 1080P@30fps รองรับ Triple Streams ประหยัดแบนด์วิดท์ พร้อมมาตรฐาน IP67 และ IK10',
    specs: [
      'เซนเซอร์ 1/2.8" Progressive Scan CMOS เทคโนโลยี Starlight ประสิทธิภาพแสงน้อยยอดเยี่ยม',
      'เลนส์ Motorized 2.7–12mm ความละเอียด Full HD 1080P @30fps',
      'รองรับ Triple Streams และ Smart IR ส่องสว่างไกล 30 เมตร',
      'รองรับ WDR, 3D DNR, ROI, Defog, HLC, Corridor Mode และระบบกันสั่น DIS',
      'ตัวถังโลหะทนทานมาตรฐาน IP67 และกันกระแทก IK10'
    ],
    price_display: 'ขอใบเสนอราคาโครงการ (B2B)',
    price_amount: 4900,
    image_url: '/images/prod-dome-cam.jpg',
    stock_status: 'มีสินค้าพร้อมส่ง',
    is_featured: 0
  },
  {
    sku: 'SN-IPS57/30BDN/ZSD30',
    slug: 'sn-ips57-30bdn-zsd30-high-speed-dome-30x',
    name: 'SN-IPS57/30BDN/ZSD30 — 3.0MP 30X Optical Zoom Network High Speed Dome',
    subtitle: 'กล้อง PTZ High Speed Dome ซูมออปติคอล 30 เท่า สำหรับเฝ้าระวังพื้นที่บริเวณกว้างและโรงงานอุตสาหกรรม',
    brand: 'Sunell Security',
    category_id: 2,
    description:
      'กล้องหมุนส่ายก้มเงยความเร็วสูง (PTZ Speed Dome) ความละเอียด 3.0MP (2048x1536 @30fps) ซูมเลนส์ Optical แท้ได้ถึง 30 เท่า และ Digital Zoom 16 เท่า เหมาะสำหรับตรวจการณ์พื้นที่ลานจอดรถ คลังสินค้า ท่าเรือ นิคมอุตสาหกรรม และโครงการสมาร์ทซิตี้',
    specs: [
      'เซนเซอร์ 1/2.8" Progressive Scan CMOS ความละเอียด 3.0MP (2048×1536 @30fps)',
      'กำลังขยายซูม 30X Optical Zoom และ 16X Digital Zoom คมชัดทุกระยะ',
      'รองรับการส่งสัญญาณภาพแบบ Multiple Streams อัตราบิตเรตต่ำ ประหยัดแบนด์วิดท์',
      'ระบบลดสัญญาณรบกวน 3D DNR และ ICR ปรับโหมดกลางวัน-กลางคืนอัตโนมัติ',
      'รองรับขายึดติดตั้งครบชุด อาทิ SN-CBK624 (Wall), SN-CBK626 (Corner), SN-CBK627 (Pole Mount)'
    ],
    price_display: 'ขอใบเสนอราคาโครงการ (B2B)',
    price_amount: 19800,
    image_url: '/uploads/products/sn-ips56-30bdr-zsd30.jpg',
    stock_status: 'พร้อมส่ง / สั่งซื้อโครงการ',
    is_featured: 1
  },
  {
    sku: 'SN-IPV56/60HDR',
    slug: 'sn-ipv56-60hdr-6mp-fisheye-camera',
    name: 'SN-IPV56/60HDR — 6MP Panoramic 360° Fisheye Network Camera',
    subtitle: 'กล้องวงจรปิดมุมมองรอบทิศทาง 360 องศา ความละเอียด 6 ล้านพิกเซล พร้อมระบบคลี่ภาพ De-warping',
    brand: 'Sunell Security',
    category_id: 2,
    description:
      'กล้อง Fisheye มุมมองพาโนรามา 360 องศา ความละเอียดสูง 6MP เซนเซอร์ขนาดใหญ่ 1/1.8" Progressive Scan CMOS มาพร้อมเทคโนโลยี Unique De-warping แปลงภาพมุมกว้างให้ดูแยกส่วนได้เสมือนติดกล้องหลายตัว ลดจุดอับสายตาในห้องประชุม โถงต้อนรับ และพื้นที่ค้าปลีก',
    specs: [
      'เซนเซอร์ 1/1.8" Progressive Scan CMOS ความละเอียดสูง 6 Megapixels',
      'เทคโนโลยี Unique De-warping Image คลี่ภาพมุมมองรอบทิศทางได้อย่างเป็นธรรมชาติ',
      'ให้ภาพคมชัดในสภาวะแสงน้อย อัตราการใช้แบนด์วิดท์ต่ำ',
      'ฟีเจอร์ปรับสภาพแสง 3D DNR, dWDR, ICR, HLC',
      'อินฟราเรด Smart IR ระยะครอบคลุมรอบตัว 10 เมตร'
    ],
    price_display: 'ขอใบเสนอราคาโครงการ (B2B)',
    price_amount: 9200,
    image_url: '/uploads/products/sn-ipv56-60hdr.jpg',
    stock_status: 'มีสินค้าพร้อมส่ง',
    is_featured: 0
  },
  {
    sku: 'SN-CBK624',
    slug: 'sn-cbk624-wall-mount-bracket',
    name: 'SN-CBK624 — Heavy-Duty Speed Dome Wall Mount Bracket',
    subtitle: 'ขายึดกล้อง Speed Dome ติดผนังอะลูมิเนียมอัลลอยมาตรฐานงานภายนอกอาคาร',
    brand: 'Sunell Security',
    category_id: 2,
    description:
      'ขายึดผนัง (Wall Mount Bracket) สำหรับกล้อง PTZ Speed Dome ผลิตจากอะลูมิเนียมอัลลอยเคลือบสีกันสนิม รองรับการร้อยสายภายในตัวขาอย่างเรียบร้อย ใช้ร่วมกับอุปกรณ์เสริม SN-CBK625 (Pendant Cap), SN-CBK626 (Corner Mount) และ SN-CBK627 (Pole Mount)',
    specs: [
      'วัสดุ Aluminum Alloy แข็งแรงทนทาน รองรับสภาพอากาศกลางแจ้ง',
      'ออกแบบช่องเดินสายไฟและสายแลนซ่อนภายในตัวขายึดปลอดภัย',
      'รองรับการใช้งานร่วมกับชุดยึดมุมเสา SN-CBK626 และชุดรัดเสากลม SN-CBK627'
    ],
    price_display: 'สอบถามราคาโครงการ',
    price_amount: 1150,
    image_url: '/uploads/products/sn-cbk624.jpg',
    stock_status: 'มีสินค้าพร้อมส่ง',
    is_featured: 0
  },

  // IP Network System (Completing CSF's 4 Core Pillars!)
  {
    sku: 'CSF-SW24G-POE370',
    slug: 'csf-managed-24port-gigabit-poe-switch',
    name: 'CSF-SW24G-POE370 — 24-Port Gigabit L2+ Managed PoE+ Switch (4x SFP)',
    subtitle: 'สวิตช์จ่ายไฟผ่านสายแลน 24 พอร์ต กำลังไฟรวม 370W พร้อมพอร์ต Fiber SFP 4 ช่องสำหรับงาน CCTV และ Wi-Fi องค์กร',
    brand: 'CSF Telecom Network',
    category_id: 3,
    description:
      'สวิตช์เครือข่ายระดับองค์กร L2+ Managed Gigabit PoE+ จำนวน 24 พอร์ต รองรับมาตรฐาน IEEE 802.3af/at จ่ายไฟรวมสูงสุด 370W สำหรับกล้อง IP Camera, โทรศัพท์ IP Phone และ Access Point พร้อมพอร์ตอัปลิงก์ 4x Gigabit SFP เชื่อมต่อโครงข่ายใยแก้วนำแสงระยะไกลอย่างมั่นคง',
    specs: [
      'พอร์ตเชื่อมต่อ: 24x 10/100/1000Mbps RJ45 PoE+ Ports + 4x 1000Mbps SFP Fiber Slots',
      'กำลังไฟ PoE Budget รวมสูงสุด 370W (สูงสุด 30W ต่อพอร์ต มาตรฐาน IEEE 802.3af/at)',
      'รองรับฟีเจอร์เครือข่ายองค์กร: 802.1Q VLAN, QoS, IGMP Snooping, STP/RSTP และ Link Aggregation',
      'โหมด AI PoE Watchdog รีบูตกล้องหรืออุปกรณ์ปลายทางอัตโนมัติเมื่อค้าง',
      'ตัวถังโลหะมาตรฐานเข้าตู้แร็ค 19 นิ้ว 1U พร้อมระบบป้องกันไฟกระชาก 6kV'
    ],
    price_display: 'ขอใบเสนอราคาโครงการ (B2B)',
    price_amount: 11900,
    image_url: '/images/hero-network.jpg',
    stock_status: 'มีสินค้าพร้อมส่ง',
    is_featured: 1
  },

  // IT Solution Products
  {
    sku: 'CSF-UPS3000-RT',
    slug: 'csf-smart-online-ups-3kva-rack-tower',
    name: 'CSF-UPS3000-RT — 3kVA / 2700W True Online Double-Conversion Rack/Tower UPS',
    subtitle: 'เครื่องสำรองไฟระบบ True Online สำหรับเซิร์ฟเวอร์ เครื่องบันทึก NVR ตู้สาขา และอุปกรณ์ห้องควบคุม',
    brand: 'CSF IT Power Solution',
    category_id: 4,
    description:
      'เครื่องสำรองไฟเทคโนโลยี True Online Double-Conversion ขนาด 3kVA (2700W) จ่ายกระแสไฟ Pure Sine Wave นิ่งสนิทไร้ช่วงสลับไฟ (Zero Transfer Time) ปกป้องระบบเซิร์ฟเวอร์ เครื่องบันทึกภาพ NVR 64CH และอุปกรณ์ระบบเสียงบรอดแคสต์จากปัญหาไฟตก ไฟกระชาก และไฟดับได้อย่างสมบูรณ์',
    specs: [
      'กำลังไฟพิกัด: 3000VA / 2700W (Power Factor 0.9) ระบบ True Online Double-Conversion',
      'เวลาโอนย้ายแหล่งจ่ายไฟ 0 ms (Zero Transfer Time) ป้องกันอุปกรณ์รีสตาร์ท 100%',
      'ติดตั้งได้ทั้งแบบวางตั้ง (Tower) และเข้าตู้แร็คมาตรฐาน 19 นิ้ว (2U Rackmount)',
      'หน้าจอ LCD แสดงสถานะโหลด แรงดันไฟ และระดับแบตเตอรี่แบบเรียลไทม์',
      'รองรับการ์ด SNMP เสริมสำหรับแจ้งเตือนสถานะไฟฟ้าเข้าสู่ระบบเครือข่ายหรือ LINE OA'
    ],
    price_display: 'ขอใบเสนอราคาโครงการ (B2B)',
    price_amount: 21500,
    image_url: '/images/hero-it.jpg',
    stock_status: 'พร้อมส่งและบริการติดตั้ง',
    is_featured: 1
  }
]

export const SEED_ARTICLES: SeedArticle[] = [
  {
    slug: 'classroom-audio-maintenance-support',
    title: 'Classroom Audio Maintenance Support — แนวทางดูแลรักษาระบบเสียงห้องเรียนและห้องประชุมให้พร้อมใช้งานต่อเนื่อง',
    excerpt:
      'เทคนิคการตรวจสอบ บำรุงรักษา และยืดอายุการใช้งานชุดเครื่องเสียงห้องเรียน ไมโครโฟนไร้สาย และลำโพงประกาศ เพื่อความต่อเนื่องในการเรียนการสอนและการทำงานขององค์กร',
    content: `บริษัท ซีเอสเอฟ จำกัด (CSF Technology Touch) ให้ความสำคัญอย่างยิ่งกับการบริการหลังการขายและการดูแลรักษาระบบให้พร้อมใช้งานอย่างต่อเนื่อง โดยเฉพาะระบบเสียงในห้องเรียน (Classroom Audio) และห้องประชุมองค์กรที่ต้องใช้งานเป็นประจำทุกวัน

### 1. การตรวจสอบระดับสัญญาณและป้องกันอาการเสียงหอน (Acoustic Feedback)
การตั้งค่า Gain ของเครื่องขยายเสียง เช่นรุ่น MP60U หรือชุด Mini60 ควรกำหนดระดับอ้างอิงที่เหมาะสมกับขนาดห้อง และจัดวางตำแหน่งลำโพงคอลัมน์หรือลำโพงเพดาน (เช่น DSP501 / WA124) ไม่ให้ยิงเสียงเข้าหาหัวไมโครโฟนโดยตรง จะช่วยลดเสียงหอนและถนอมดอกลำโพงในระยะยาว

### 2. การดูแลสายสัญญาณและหัวต่อมาตรฐาน (XLR & Speakon)
ปัญหาเสียงขาดหายหรือมีเสียงจี่รบกวนกว่า 70% มักเกิดจากจุดเชื่อมต่อที่หลวมหรือเกิดคราบออกไซด์ การเลือกใช้หัวต่อมาตรฐานอย่าง Speakon 4-Pole (NL4FX) และสายสัญญาณ XLR คุณภาพสูง พร้อมตรวจสอบความแน่นหนาทุกภาคการศึกษา จะช่วยลดเวลาหยุดชะงักได้มาก

### 3. บริการตรวจสอบและให้คำปรึกษาโดยทีมงาน CSF
สำหรับโรงเรียน มหาวิทยาลัย และหน่วยงานองค์กรที่ต้องการปรับปรุงระบบเสียงเดิมหรือต้องการอะไหล่ทดแทนที่ได้มาตรฐาน สามารถส่งภาพหน้างานหรือรุ่นอุปกรณ์ผ่าน LINE Official Account ของ CSF เพื่อให้ทีมวิศวกรประเมินและจัดทำใบเสนอราคาได้อย่างรวดเร็ว`,
    category: 'Product Support',
    cover_image: '/uploads/articles/classroom-support.jpg',
    author_name: 'ฝ่ายบริการเทคนิค CSF Technology Touch',
    published_at: '2026-09-15 10:00:00'
  },
  {
    slug: 'enterprise-ip-cctv-nvr-raid-design-guide',
    title: 'คู่มือเลือกเครื่องบันทึก NVR และออกแบบระบบจัดเก็บข้อมูล RAID สำหรับกล้องวงจรปิดองค์กร',
    excerpt:
      'วิธีคำนวณแบนด์วิดท์ ความจุฮาร์ดดิสก์ และการเลือกใช้ระบบ RAID 5 / RAID 6 บนเครื่องบันทึก 64CH เพื่อให้ข้อมูลภาพสำคัญขององค์กรปลอดภัยสูงสุด',
    content: `ในการออกแบบระบบรักษาความปลอดภัยกล้องวงจรปิด IP CCTV สำหรับอาคารสำนักงาน โรงงานอุตสาหกรรม หรือคลังสินค้าขนาดใหญ่ สิ่งสำคัญไม่แพ้ความคมชัดของตัวกล้อง คือความเสถียรของเครื่องบันทึกภาพเครือข่าย (NVR)

### ทำไมองค์กรขนาดใหญ่ควรเลือก NVR ที่รองรับ RAID และ Hot Standby?
สำหรับโครงการที่มีกล้องตั้งแต่ 16 ถึง 64 ตัวขึ้นไป การบันทึกภาพความละเอียด 4MP–6MP ตลอด 24 ชั่วโมง จะสร้างปริมาณข้อมูลมหาศาล เครื่องบันทึกระดับองค์กรอย่าง **SN-NVR10/08E3/064NSH** จึงถูกออกแบบให้รองรับฮาร์ดดิสก์ถึง 8 ลูก พร้อมเทคโนโลยี **RAID 0/1/5/6/10** ซึ่งช่วยให้ข้อมูลวิดีโอไม่สูญหายแม้ฮาร์ดดิสก์ลูกใดลูกหนึ่งเกิดขัดข้องกะทันหัน

### การจับคู่กับสวิตช์ PoE+ และการสำรองไฟ
เพื่อให้ระบบบันทึกภาพทำงานได้ต่อเนื่องแม้เกิดเหตุไฟดับ แนะนำให้เชื่อมต่อกล้องผ่าน Managed Gigabit PoE+ Switch ที่มีระบบ PoE Watchdog และสำรองไฟตู้แร็คกลางด้วย True Online UPS ทีมงาน CSF ยินดีช่วยคำนวณพื้นที่จัดเก็บข้อมูล (Storage Calculator) ย้อนหลัง 30/60/90 วันให้ฟรีสำหรับทุกโครงการ`,
    category: 'Technology Knowledge',
    cover_image: '/images/hero-cctv.jpg',
    author_name: 'ทีมวิศวกรโซลูชัน CSF',
    published_at: '2026-10-08 14:30:00'
  },
  {
    slug: 'commercial-pa-100v-line-speaker-selection',
    title: 'เข้าใจระบบลำโพง 100V Line สำหรับงานระบบเสียงประกาศอาคาร สำนักงาน และพื้นที่กลางแจ้ง',
    excerpt:
      'ทำความรู้จักความแตกต่างระหว่างระบบลำโพง 100V Line กับลำโพงความต้านทานต่ำ (8 โอห์ม) เพื่อการเดินสายระยะไกลโดยไม่สูญเสียกำลังเสียง',
    content: `หลายองค์กรที่กำลังวางระบบเสียงตามสาย (Public Address System) หรือเสียงเพลงคลอเบาๆ (Background Music) ในอาคารหลายชั้น มักสงสัยว่าทำไมจึงต้องใช้ลำโพงและแอมป์ระบบ **70V / 100V Line**

### ข้อดีของระบบ 100V Line ในงานอาคาร
1. **เดินสายได้ไกลหลายร้อยเมตร** โดยกำลังเสียงตกลงน้อยมากเมื่อเทียบกับระบบ 4–8 โอห์มทั่วไป
2. **พ่วงลำโพงหลายจุดบนสายเส้นเดียวได้อย่างยืดหยุ่น** เพียงนำค่าวัตต์ (Power Tap) ของลำโพงแต่ละตัว เช่น ลำโพงเพดาน **DSP501 (3W/6W)** หรือลำโพงคอลัมน์กันน้ำ **DSP255II (30W)** มารวมกันไม่ให้เกินประมาณ 80% ของกำลังขับแอมป์ เช่น **MP60U (60W)**
3. **ปรับความดังแยกโซนได้ง่าย** เช่น โถงต้อนรับใช้ 6W ห้องทำงานใช้ 3W และลานจอดรถกึ่งกลางแจ้งใช้คอลัมน์กันน้ำ 30W

ต้องการให้ทีมงาน CSF ช่วยวางผังจุดติดตั้งลำโพงตามแปลนอาคาร สามารถติดต่อฝ่ายขายได้ทันทีทั้งทางโทรศัพท์ อีเมล และ LINE OA`,
    category: 'Technology Knowledge',
    cover_image: '/images/hero-av.jpg',
    author_name: 'ทีมวิศวกรระบบเสียง CSF',
    published_at: '2026-10-22 09:15:00'
  }
]

export const SEED_SETTINGS: Record<string, { value: string; group: string }> = {
  site_logo: { value: '/uploads/brand/csf_logo.png', group: 'brand' },
  site_url: { value: 'https://uat.csf.co.th', group: 'general' },
  line_oa_add_url: { value: '', group: 'social' },
  ga4_measurement_id: { value: '', group: 'tracking' },
  gtm_container_id: { value: '', group: 'tracking' },
  facebook_pixel_id: { value: '', group: 'tracking' },
  custom_head_scripts: { value: '', group: 'tracking' },
  custom_body_start_scripts: { value: '', group: 'tracking' },
  custom_body_end_scripts: { value: '', group: 'tracking' },
  company_name_th: { value: 'บริษัท ซีเอสเอฟ จำกัด', group: 'company' },
  company_name_en: { value: 'CSF Co., Ltd. — CSF Technology Touch', group: 'company' },
  brand_tagline: {
    value: 'ผู้นำเข้าและจัดจำหน่ายอุปกรณ์ IT Solution, Telecom Network, Audio/Video, Broadcasting & CCTV ครบวงจร',
    group: 'company'
  },
  tax_id: { value: '0105560106452 (สำนักงานใหญ่)', group: 'company' },
  history_text: {
    value:
      'บริษัท ซีเอสเอฟ จำกัด ก่อตั้งขึ้นเพื่อดำเนินธุรกิจในการนำเข้าและจัดจำหน่ายอุปกรณ์ที่เกี่ยวข้องกับเทคโนโลยีในแขนงต่างๆ เช่น IT Solution, Telecom Network, Audio/Video, Broadcasting, CCTV และ Electronic Component โดยมีเจตนารมณ์ที่จะสรรหาสินค้าภายใต้ยี่ห้อชั้นนำของกลุ่มอุตสาหกรรมด้านต่างๆ และจัดจำหน่ายให้ตรงกับความต้องการของผู้ใช้งานภายในงบประมาณที่เหมาะสม อีกทั้งยังมุ่งเน้นการบริการที่รวดเร็ว ตั้งแต่การนำเสนอสินค้า การเสนอราคาที่ต้องการ รวมถึงการบริการหลังการขายที่ถือเป็นเรื่องสำคัญอย่างยิ่งสำหรับองค์กรต่างๆ ที่ต้องการความต่อเนื่องในการใช้งานและแก้ไขปัญหาอย่างรวดเร็ว ภายใต้นโยบาย "การบริการที่ดี คือรากฐานสำคัญของธุรกิจ" ดังนั้นสินค้าที่ดีต้องมาพร้อมกับการบริการที่ยอดเยี่ยมและราคาที่เหมาะสม ซึ่งเป็นองค์ประกอบสำคัญในการดำเนินธุรกิจของเรา',
    group: 'company'
  },
  vision_intro: {
    value:
      'เรามุ่งเน้นในการเป็นผู้ให้บริการในการจัดหาสินค้าที่ตอบสนองความต้องการของกลุ่มลูกค้า บริษัทฯ, ห้างร้าน, องค์กร, หน่วยงานภาครัฐและเอกชน โดยมีองค์ประกอบหลัก 4 ประการดังนี้',
    group: 'company'
  },
  vision_pillars: {
    value: JSON.stringify([
      {
        title: 'คุณภาพมาตรฐานตรงตามการใช้งาน',
        desc: 'คัดสรรสินค้าที่มีคุณภาพดี จากผู้ผลิตและแบรนด์ชั้นนำ เหมาะสมกับลักษณะงานจริงที่ลูกค้าแต่ละองค์กรต้องการ'
      },
      {
        title: 'ราคาคุ้มค่าตามงบประมาณ',
        desc: 'นำเสนอโซลูชันและอุปกรณ์ในราคาที่เหมาะสม โปร่งใส สอดคล้องกับงบประมาณของทั้งภาคเอกชนและภาครัฐ'
      },
      {
        title: 'จัดส่งรวดเร็ว กำหนดการชัดเจน',
        desc: 'บริหารจัดการสต็อกและโลจิสติกส์อย่างเป็นระบบ จัดส่งรวดเร็วและแจ้งกำหนดการส่งมอบที่แน่นอนเชื่อถือได้'
      },
      {
        title: 'บริการหลังการขายและให้คำปรึกษาไว',
        desc: 'ดูแลหลังการขายร่วมกับผู้ผลิต/ผู้นำเข้าโดยตรง พร้อมทีมให้คำปรึกษาทางเทคนิคและแก้ไขปัญหาอย่างสะดวกรวดเร็ว'
      }
    ]),
    group: 'company'
  },
  address_th: {
    value: '481/78 หมู่บ้านซื่อตรงพรีเมี่ยม พระราม 2 ถนนแสมดำ แขวงแสมดำ เขตบางขุนเทียน กรุงเทพมหานคร 10150',
    group: 'contact'
  },
  address_en: {
    value: '481/78 Suetrong Premium Rama2 Village, Samae Dam Road, Samae Dum Sub-area, Bang Khun Thian Area, Bangkok 10150',
    group: 'contact'
  },
  phone_primary: { value: '081-308-9678', group: 'contact' },
  email_sales: { value: 'sales@csf.co.th', group: 'contact' },
  email_info: { value: 'info@csf.co.th', group: 'contact' },
  email_alt: { value: 'csf8889@gmail.com', group: 'contact' },
  working_hours: { value: 'จันทร์ – ศุกร์ เวลา 09:00 – 17:00 น.', group: 'contact' },
  google_maps_embed: {
    value: 'https://maps.google.com/maps?q=Suetrong+Premium+Rama+2+Samae+Dam+Bang+Khun+Thian+Bangkok+10150&t=&z=14&ie=UTF8&iwloc=&output=embed',
    group: 'contact'
  }
}

export const SEED_SOCIAL_INTEGRATIONS = [
  {
    platform: 'line_oa',
    display_name: 'CSF Technology Touch Official',
    handle_or_url: '@csf.co.th',
    channel_id: '2006481920',
    channel_secret: '',
    access_token: '',
    verify_token: 'csf_line_webhook_2026',
    target_recipient_id: '',
    qr_code_url: '',
    pixel_id: '',
    auto_reply_enabled: 1,
    notify_on_inquiry: 1,
    auto_publish_content: 1,
    welcome_message:
      'สวัสดีครับ ยินดีต้อนรับสู่ บริษัท ซีเอสเอฟ จำกัด (CSF Technology Touch) สามารถพิมพ์รหัสสินค้า เช่น DSP501, MP60U, SN-NVR10 เพื่อดูสเปก หรือแจ้งรายการขอใบเสนอราคาได้ทันทีครับ',
    is_enabled: 1
  },
  {
    platform: 'facebook',
    display_name: 'CSF Technology Touch Thailand',
    handle_or_url: 'https://www.facebook.com/csf.co.th',
    channel_id: '10849203948102',
    channel_secret: '',
    access_token: '',
    verify_token: 'csf_fb_verify_2026',
    target_recipient_id: '',
    qr_code_url: '',
    pixel_id: '',
    auto_reply_enabled: 1,
    notify_on_inquiry: 1,
    auto_publish_content: 1,
    welcome_message:
      'ขอบคุณที่ทักแชทเพจ CSF Technology Touch ครับ ทีมฝ่ายขายพร้อมดูแลเรื่องสเปกสินค้าและใบเสนอราคาในเวลาทำการ จ.-ศ. 09:00-17:00 น. หรือฝากเบอร์ติดต่อกลับไว้ได้เลยครับ',
    is_enabled: 1
  }
]
