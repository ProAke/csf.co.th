-- CSF Technology Touch (csf.co.th) Live MariaDB SQL Export
-- Target Database: pacific_csfnuxt (Import directly without CREATE DATABASE privilege)
-- Generated at: 2026-10-31T15:36:24.826Z
-- =============================================================================
-- CSF Technology Touch (csf.co.th) — MariaDB 10.6+ / 11.x Relational Schema
-- Target Database: `pacific_csfnuxt` (Import directly via phpMyAdmin, CLI, or auto-init)
-- Charset: utf8mb4 / Collation: utf8mb4_unicode_ci
-- =============================================================================

SET NAMES utf8mb4;
SET time_zone = '+07:00';

-- 1. Admin & Backoffice Users
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(64) NOT NULL,
  `email` VARCHAR(160) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(160) NOT NULL,
  `role` ENUM('superadmin', 'editor', 'sales') NOT NULL DEFAULT 'superadmin',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `last_login_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_username` (`username`),
  UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Homepage Hero Banners / Slider
CREATE TABLE IF NOT EXISTS `banners` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `badge` VARCHAR(120) NOT NULL DEFAULT '',
  `title` VARCHAR(220) NOT NULL,
  `subtitle` VARCHAR(255) NOT NULL DEFAULT '',
  `description` TEXT NULL,
  `cta_label` VARCHAR(100) NOT NULL DEFAULT 'ดูสินค้าและโซลูชัน',
  `cta_link` VARCHAR(255) NOT NULL DEFAULT '/products',
  `secondary_label` VARCHAR(100) NOT NULL DEFAULT 'ขอใบเสนอราคา',
  `secondary_link` VARCHAR(255) NOT NULL DEFAULT '/contact',
  `image_url` VARCHAR(500) NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_banners_active_order` (`is_active`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Product & Solution Categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(120) NOT NULL,
  `name_th` VARCHAR(180) NOT NULL,
  `name_en` VARCHAR(180) NOT NULL,
  `description` TEXT NULL,
  `icon` VARCHAR(64) NOT NULL DEFAULT 'Cpu',
  `image_url` VARCHAR(500) NOT NULL DEFAULT '',
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_categories_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Products Catalog (Audio/Video, CCTV, IP Network, IT Solutions)
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `sku` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(180) NOT NULL,
  `name` VARCHAR(240) NOT NULL,
  `subtitle` VARCHAR(255) NOT NULL DEFAULT '',
  `brand` VARCHAR(120) NOT NULL DEFAULT 'CSF Partner Brand',
  `category_id` INT UNSIGNED NOT NULL,
  `description` TEXT NULL,
  `specs_json` LONGTEXT NULL COMMENT 'JSON array of technical specifications',
  `price_display` VARCHAR(120) NOT NULL DEFAULT 'สอบถามราคาพิเศษ (B2B)',
  `price_amount` DECIMAL(12,2) NULL DEFAULT NULL,
  `image_url` VARCHAR(500) NOT NULL DEFAULT '',
  `datasheet_url` VARCHAR(500) NOT NULL DEFAULT '',
  `stock_status` VARCHAR(60) NOT NULL DEFAULT 'พร้อมส่ง / สั่งซื้อองค์กร',
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `views_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_products_slug` (`slug`),
  KEY `idx_products_category` (`category_id`),
  KEY `idx_products_featured` (`is_featured`, `is_active`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Knowledge Base & Product Support Articles
CREATE TABLE IF NOT EXISTS `articles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(200) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `excerpt` TEXT NULL,
  `content` LONGTEXT NOT NULL,
  `category` VARCHAR(100) NOT NULL DEFAULT 'Product Support',
  `cover_image` VARCHAR(500) NOT NULL DEFAULT '',
  `author_name` VARCHAR(120) NOT NULL DEFAULT 'ทีมวิศวกร CSF Technology Touch',
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `published_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `views_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_articles_slug` (`slug`),
  KEY `idx_articles_published` (`is_published`, `published_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Customer Inquiries / Quotation Requests (RFQ) & Social Leads
CREATE TABLE IF NOT EXISTS `inquiries` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ref_code` VARCHAR(40) NOT NULL,
  `customer_name` VARCHAR(160) NOT NULL,
  `company_name` VARCHAR(200) NOT NULL DEFAULT '',
  `email` VARCHAR(160) NOT NULL DEFAULT '',
  `phone` VARCHAR(60) NOT NULL DEFAULT '',
  `line_id` VARCHAR(120) NOT NULL DEFAULT '',
  `subject` VARCHAR(240) NOT NULL,
  `message` TEXT NOT NULL,
  `product_id` INT UNSIGNED NULL DEFAULT NULL,
  `product_sku` VARCHAR(100) NOT NULL DEFAULT '',
  `attachments_json` LONGTEXT NULL COMMENT 'JSON array of uploaded documents (PDF, JPEG, PNG, Excel, Word, PowerPoint)',
  `source_channel` VARCHAR(40) NOT NULL DEFAULT 'website',
  `status` ENUM('new', 'in_progress', 'quoted', 'closed') NOT NULL DEFAULT 'new',
  `admin_notes` TEXT NULL,
  `notified_line` TINYINT(1) NOT NULL DEFAULT 0,
  `notified_facebook` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_inquiries_ref` (`ref_code`),
  KEY `idx_inquiries_status` (`status`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Social Integrations Config (LINE Official Account & Facebook Page/Messenger)
CREATE TABLE IF NOT EXISTS `social_integrations` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `platform` VARCHAR(32) NOT NULL COMMENT 'line_oa | facebook',
  `display_name` VARCHAR(160) NOT NULL,
  `handle_or_url` VARCHAR(255) NOT NULL DEFAULT '',
  `channel_id` VARCHAR(160) NOT NULL DEFAULT '',
  `channel_secret` VARCHAR(255) NOT NULL DEFAULT '',
  `access_token` TEXT NULL,
  `verify_token` VARCHAR(160) NOT NULL DEFAULT '',
  `target_recipient_id` VARCHAR(160) NOT NULL DEFAULT '',
  `qr_code_url` VARCHAR(500) NOT NULL DEFAULT '',
  `pixel_id` VARCHAR(100) NOT NULL DEFAULT '',
  `auto_reply_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `notify_on_inquiry` TINYINT(1) NOT NULL DEFAULT 1,
  `auto_publish_content` TINYINT(1) NOT NULL DEFAULT 0,
  `welcome_message` TEXT NULL,
  `is_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_social_platform` (`platform`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Social Integration Webhook & Broadcast Logs
CREATE TABLE IF NOT EXISTS `social_logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `platform` VARCHAR(32) NOT NULL,
  `direction` VARCHAR(20) NOT NULL COMMENT 'inbound | outbound',
  `event_type` VARCHAR(80) NOT NULL,
  `sender_or_target` VARCHAR(180) NOT NULL DEFAULT '',
  `summary` VARCHAR(500) NOT NULL,
  `payload_json` LONGTEXT NULL,
  `status` VARCHAR(40) NOT NULL DEFAULT 'delivered',
  `http_status` INT NOT NULL DEFAULT 200,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_social_logs_created` (`platform`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Site Settings & Dynamic Company Content
CREATE TABLE IF NOT EXISTS `site_settings` (
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` LONGTEXT NOT NULL,
  `setting_group` VARCHAR(60) NOT NULL DEFAULT 'general',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Security Audit & Threat Detection Logs
CREATE TABLE IF NOT EXISTS `security_logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `event_type` VARCHAR(60) NOT NULL COMMENT 'login_success, login_failed, brute_force_blocked, scanner_blocked, upload_rejected, password_changed, csrf_blocked',
  `severity` VARCHAR(20) NOT NULL DEFAULT 'info' COMMENT 'info, warn, critical',
  `ip_address` VARCHAR(80) NOT NULL DEFAULT '',
  `actor` VARCHAR(120) NOT NULL DEFAULT '',
  `target_path` VARCHAR(255) NOT NULL DEFAULT '',
  `user_agent` VARCHAR(255) NOT NULL DEFAULT '',
  `detail` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_security_logs_created` (`severity`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


SET FOREIGN_KEY_CHECKS = 0;

-- Data for table `users`
INSERT IGNORE INTO `users` (`id`, `username`, `email`, `password_hash`, `full_name`, `role`, `is_active`, `last_login_at`, `created_at`) VALUES (1, 'admin', 'admin@csf.co.th', 'c1a8c5ad4ab6ea6fa18d91e60abe9ee3:b87d3b91d19f242e2466b33cd5f63d7a88b9ea3030ed19ee5bf72f0b39f2f2dc7b53933ff3c1f6492cf06e691f7067d8bda254b8cc48e1e4d8e9da0d342a339b', 'ผู้ดูแลระบบ CSF Technology Touch', 'superadmin', 1, '2026-10-31 15:36:24', '2026-10-31 22:36:12');

-- Data for table `categories`
DELETE FROM `categories`;
INSERT INTO `categories` (`id`, `slug`, `name_th`, `name_en`, `description`, `icon`, `image_url`, `sort_order`, `is_active`, `created_at`) VALUES (1, 'audio-video-products', 'ระบบเสียงและภาพ (Audio / Video)', 'Audio / Video Products', 'ลำโพงเพดาน ลำโพงคอลัมน์กันน้ำ เครื่องขยายเสียงดิจิทัล ชุดเครื่องเสียงห้องเรียนอัจฉริยะ และหัวต่อสายสัญญาณ XLR / Speakon มาตรฐานมืออาชีพ', 'Volume2', '/images/hero-av.jpg', 1, 1, '2026-10-31 22:36:12');
INSERT INTO `categories` (`id`, `slug`, `name_th`, `name_en`, `description`, `icon`, `image_url`, `sort_order`, `is_active`, `created_at`) VALUES (2, 'cctv-solution-products', 'ระบบกล้องวงจรปิด (CCTV Solutions)', 'CCTV Solution Products', 'กล้อง IP Camera Starlight, Speed Dome PTZ, กล้อง Fisheye 6MP, เครื่องบันทึก NVR 16/32/64 ช่อง รองรับ RAID และอุปกรณ์ยึดติดตั้งครบชุด', 'ShieldCheck', '/images/hero-cctv.jpg', 2, 1, '2026-10-31 22:36:12');
INSERT INTO `categories` (`id`, `slug`, `name_th`, `name_en`, `description`, `icon`, `image_url`, `sort_order`, `is_active`, `created_at`) VALUES (3, 'ip-network-system', 'ระบบเครือข่าย (IP Network System)', 'IP Network System', 'อุปกรณ์สวิตช์เครือข่าย Gigabit PoE+, โครงข่ายใยแก้วนำแสง Fiber Optic, ตู้แร็คเซิร์ฟเวอร์ และอุปกรณ์เชื่อมต่อโครงข่ายสื่อสารระดับองค์กร', 'Network', '/images/hero-network.jpg', 3, 1, '2026-10-31 22:36:12');
INSERT INTO `categories` (`id`, `slug`, `name_th`, `name_en`, `description`, `icon`, `image_url`, `sort_order`, `is_active`, `created_at`) VALUES (4, 'it-solution-products', 'โซลูชันไอทีและชิ้นส่วนอิเล็กทรอนิกส์', 'IT Solution Products', 'อุปกรณ์ IT Solution สำหรับห้องประชุมอัจฉริยะ ระบบสำรองไฟ UPS ระดับองค์กร เซิร์ฟเวอร์จัดเก็บข้อมูล และ Electronic Components เฉพาะทาง', 'Cpu', '/images/hero-it.jpg', 4, 1, '2026-10-31 22:36:12');

-- Data for table `banners`
DELETE FROM `banners`;
INSERT INTO `banners` (`id`, `badge`, `title`, `subtitle`, `description`, `cta_label`, `cta_link`, `secondary_label`, `secondary_link`, `image_url`, `sort_order`, `is_active`, `created_at`) VALUES (1, 'CSF TECHNOLOGY TOUCH • ENTERPRISE DISTRIBUTOR', 'Audio / Video & Broadcasting Solutions', 'ระบบเสียงห้องประชุม ห้องเรียนอัจฉริยะ ระบบประกาศสาธารณะ และอุปกรณ์เชื่อมต่อมาตรฐานสากล', 'คัดสรรอุปกรณ์ระบบเสียงและภาพระดับมืออาชีพ อาทิ DSPPA Public Address, ลำโพงเพดานและคอลัมน์กันน้ำ, เครื่องขยายเสียงดิจิทัล และหัวต่อสายสัญญาณคุณภาพสูง พร้อมทีมวิศวกรให้คำปรึกษาครบวงจร', 'ดูสินค้ากลุ่ม Audio / Video', '/products?category=audio-video-products', 'ขอใบเสนอราคาองค์กร', '/contact', '/images/hero-av.jpg', 1, 1, '2026-10-31 22:36:12');
INSERT INTO `banners` (`id`, `badge`, `title`, `subtitle`, `description`, `cta_label`, `cta_link`, `secondary_label`, `secondary_link`, `image_url`, `sort_order`, `is_active`, `created_at`) VALUES (2, 'AI SURVEILLANCE & SECURITY', 'CCTV Solution Products', 'กล้องวงจรปิดเครือข่าย IP Camera ความละเอียดสูง และเครื่องบันทึก NVR ระดับองค์กร', 'โซลูชันระบบรักษาความปลอดภัยครบวงจร ตั้งแต่ Starlight Motorized IR Dome, Speed Dome 30X Optical Zoom, กล้อง Fisheye 360° ไปจนถึงเครื่องบันทึก 64CH 8HDD รองรับ RAID 0/1/5/6/10', 'สำรวจระบบ CCTV ทั้งหมด', '/products?category=cctv-solution-products', 'ปรึกษาผ่าน LINE OA', '/contact#social-connect', '/images/hero-cctv.jpg', 2, 1, '2026-10-31 22:36:12');
INSERT INTO `banners` (`id`, `badge`, `title`, `subtitle`, `description`, `cta_label`, `cta_link`, `secondary_label`, `secondary_link`, `image_url`, `sort_order`, `is_active`, `created_at`) VALUES (3, 'TELECOM & INFRASTRUCTURE', 'IP Network System', 'โครงข่ายสื่อสารความเร็วสูง PoE+ Switch, Fiber Optic และระบบเครือข่ายสำหรับอาคารและโรงงาน', 'ออกแบบและจัดจำหน่ายอุปกรณ์โครงสร้างพื้นฐานด้านเครือข่าย Telecom Network รองรับการส่งสัญญาณภาพ เสียง และข้อมูลความเร็วสูงอย่างมีเสถียรภาพ ต่อเนื่อง 24 ชั่วโมง', 'ดูโซลูชัน IP Network', '/products?category=ip-network-system', 'ติดต่อฝ่ายขาย', '/contact', '/images/hero-network.jpg', 3, 1, '2026-10-31 22:36:12');
INSERT INTO `banners` (`id`, `badge`, `title`, `subtitle`, `description`, `cta_label`, `cta_link`, `secondary_label`, `secondary_link`, `image_url`, `sort_order`, `is_active`, `created_at`) VALUES (4, 'SMART ENTERPRISE INTEGRATION', 'IT Solution & Electronic Components', 'เทคโนโลยีครบวงจรสำหรับองค์กร หน่วยงานภาครัฐ และภาคเอกชน ในงบประมาณที่คุ้มค่า', 'บริษัท ซีเอสเอฟ จำกัด มุ่งมั่นคัดสรรสินค้าภายใต้แบรนด์ชั้นนำ จัดส่งรวดเร็วตรงตามกำหนดการ พร้อมบริการหลังการขายที่เป็นรากฐานสำคัญของธุรกิจคุณ', 'รู้จัก CSF Technology Touch', '/about', 'ขอใบเสนอราคาด่วน', '/contact', '/images/hero-it.jpg', 4, 1, '2026-10-31 22:36:12');

-- Data for table `products`
DELETE FROM `products`;
INSERT INTO `products` (`id`, `sku`, `slug`, `name`, `subtitle`, `brand`, `category_id`, `description`, `specs_json`, `price_display`, `price_amount`, `image_url`, `datasheet_url`, `stock_status`, `is_featured`, `is_active`, `views_count`, `created_at`, `updated_at`) VALUES (1, 'DSP501', 'dsp501-ceiling-speaker', 'DSP501 — 3W-6W Commercial Ceiling Speaker', 'ลำโพงติดเพดาน 4.5 นิ้ว สำหรับระบบเสียงประกาศอาคาร สำนักงาน และโรงแรม', 'DSPPA Audio', 1, 'ลำโพงติดเพดานคุณภาพสูง รองรับแรงดันสายสัญญาณ 100V (3W, 6W) และ 70V (1.5W, 3W, 5W) หน้ากากตะแกรงอะลูมิเนียมปลอดสนิม พร้อมโครง ABS แข็งแรง ติดตั้งสะดวกรวดเร็วด้วยคลิปล็อกสปริง ให้เสียงคมชัดเป็นธรรมชาติ', '["แรงดันสายสัญญาณ: 100V (3W, 6W) / 70V (1.5W, 3W, 5W)","ขนาดดอกลำโพง: 4.5 นิ้ว พร้อมตะแกรง Aluminum Grille และขอบ ABS Baffle","ความดังสูงสุด (Max. SPL): 96±2dB","การตอบสนองความถี่: 75Hz – 20kHz","ขนาดเจาะฝ้าเพดาน (Cutout Size): Ø154mm – Ø164mm ติดตั้งง่ายด้วย Spring Clip"]', 'ขอใบเสนอราคา (ราคาส่งโครงการ)', 890, '/images/prod-speaker.jpg', '', 'มีสินค้าพร้อมส่ง', 1, 1, 0, '2026-10-31 22:36:12', '2026-10-31 22:36:12');
INSERT INTO `products` (`id`, `sku`, `slug`, `name`, `subtitle`, `brand`, `category_id`, `description`, `specs_json`, `price_display`, `price_amount`, `image_url`, `datasheet_url`, `stock_status`, `is_featured`, `is_active`, `views_count`, `created_at`, `updated_at`) VALUES (2, 'WA124', 'wa124-5w-ceiling-speaker', 'WA124 — 5W High-Sensitivity Ceiling Speaker', 'ลำโพงติดเพดานขนาด 6.5 นิ้ว ความไวสูง เสียงคมชัดครอบคลุมพื้นที่กว้าง', 'DSPPA Audio', 1, 'ลำโพงติดเพดานดอกลำโพงขนาด 6.5 นิ้ว กำลังขับพิกัด 5W (รองรับ 100V 5W/10W และ 70V 2.5W/5W) ค่าความไวสูงถึง 93±2dB ให้ความดังสูงสุด 100±2dB ผลิตจากพลาสติกวิศวกรรมคุณภาพสูง เหมาะสำหรับอาคารสำนักงาน ห้างสรรพสินค้า และสถานศึกษา', '["รองรับระบบสาย: 100V (5W, 10W) และ 70V (2.5W, 5W)","กำลังขับปกติ (Rated Power): 5W","ความดังสูงสุด (Max SPL): 100±2dB / ความไว (Sensitivity): 93±2dB","ดอกลำโพงขนาด: 6.5 นิ้ว x 1 ยูนิต","ย่านความถี่ตอบสนอง: 130Hz – 18kHz","ตัวถังผลิตจาก High Quality Engineering Plastic น้ำหนักเบา ทนทาน"]', 'ขอใบเสนอราคา (ราคาส่งโครงการ)', 950, '/uploads/products/wa124.jpg', '', 'มีสินค้าพร้อมส่ง', 0, 1, 0, '2026-10-31 22:36:12', '2026-10-31 22:36:12');
INSERT INTO `products` (`id`, `sku`, `slug`, `name`, `subtitle`, `brand`, `category_id`, `description`, `specs_json`, `price_display`, `price_amount`, `image_url`, `datasheet_url`, `stock_status`, `is_featured`, `is_active`, `views_count`, `created_at`, `updated_at`) VALUES (3, 'DSP255II', 'dsp255ii-waterproof-column-speaker', 'DSP255II — 30W Waterproof Column Speaker with Power Tap', 'ลำโพงคอลัมน์อะลูมิเนียมอัลลอยกันน้ำ 30W สำหรับติดตั้งทั้งภายในและภายนอกอาคาร', 'DSPPA Audio', 1, 'ลำโพงคอลัมน์ดีไซน์เพรียวบางตัวถังอะลูมิเนียมอัลลอยแข็งแรงทนทานกันน้ำ กันสนิม ติดตั้งได้ทั้งกลางแจ้งและในร่ม มาพร้อมดอกลำโพง Woofer ขนาด 3 นิ้ว 2 ดอก และ Tweeter 1 นิ้ว 1 ดอก ให้มิติเสียงชัดเจน พร้อมสวิตช์ปรับ Power Tap เลือกกำลังขับได้ตามพื้นที่ใช้งาน', '["การออกแบบกันน้ำ (Outdoor Waterproof Design) เหมาะทั้ง Indoor และ Outdoor","ดอกลำโพง: 2 x 3\\" Woofer + 1 x 1\\" Tweeter ให้คุณภาพเสียงพูดและดนตรีที่ยอดเยี่ยม","กำลังขับสูงสุด: 30W พร้อม Power Tap ปรับเลือกโหมดกำลังขับได้อิสระ","วัสดุตัวถัง: Solid Aluminum Alloy Housing ทนทาน ไม่เป็นสนิม","ดีไซน์กะทัดรัด กลมกลืนกับงานตกแต่งสถาปัตยกรรมทุกประเภท"]', 'ขอใบเสนอราคา (ราคาส่งโครงการ)', 3450, '/images/prod-speaker.jpg', '', 'มีสินค้าพร้อมส่ง', 1, 1, 0, '2026-10-31 22:36:12', '2026-10-31 22:36:12');
INSERT INTO `products` (`id`, `sku`, `slug`, `name`, `subtitle`, `brand`, `category_id`, `description`, `specs_json`, `price_display`, `price_amount`, `image_url`, `datasheet_url`, `stock_status`, `is_featured`, `is_active`, `views_count`, `created_at`, `updated_at`) VALUES (4, 'MP60U', 'mp60u-digital-mixer-amplifier', 'MP60U — 60W Mini USB/Tuner/Bluetooth Digital Mixer Amplifier', 'เครื่องขยายเสียงมิกเซอร์ดิจิทัล 60W รองรับ Bluetooth, USB, FM และระบบประกาศฉุกเฉิน', 'DSPPA Audio', 1, 'เครื่องขยายเสียงดิจิทัลมิกเซอร์ขนาดกะทัดรัด กำลังขับ 60W ครบครันด้วยช่องสัญญาณ 3 MIC, 2 AUX Line และ 1 EMC Input สำหรับสัญญาณเตือนภัยฉุกเฉิน รองรับการต่อลำโพงทั้งแบบ 100V/70V และ 4Ω–16Ω พร้อมฟังก์ชันเล่นเพลงผ่าน USB, FM Radio, Bluetooth และรีโมทคอนโทรล', '["ช่องสัญญาณเข้า: 3 MIC / 2 AUX Line / 1 EMC Emergency Input","ช่องสัญญาณออก: 1 AUX Line Output","รองรับโหลดลำโพงทั้งระบบ 100V/70V และความต้านทานต่ำ 4Ω–16Ω","รองรับการเชื่อมต่อไร้สาย Bluetooth, เครื่องเล่น USB MP3 และจูนเนอร์วิทยุ FM","มาพร้อมรีโมทคอนโทรลอินฟราเรดควบคุมระยะไกล"]', 'ขอใบเสนอราคา (ราคาส่งโครงการ)', 5900, '/images/prod-amplifier.jpg', '', 'มีสินค้าพร้อมส่ง', 1, 1, 0, '2026-10-31 22:36:12', '2026-10-31 22:36:12');
INSERT INTO `products` (`id`, `sku`, `slug`, `name`, `subtitle`, `brand`, `category_id`, `description`, `specs_json`, `price_display`, `price_amount`, `image_url`, `datasheet_url`, `stock_status`, `is_featured`, `is_active`, `views_count`, `created_at`, `updated_at`) VALUES (5, 'DSP6606', 'dsp6606-active-passive-wall-speaker', 'DSP6606 — 2x30W Stereo Active + Passive Speaker System', 'ชุดลำโพงสเตอริโอแอคทีฟพร้อมหน่วยความจำ 4GB และแอมป์ดิจิทัล Hi-Fi ในตัว', 'DSPPA Audio', 1, 'ชุดลำโพงคู่ (1 Active + 1 Passive) กำลังขับ 2x30W สเตอริโอ มาพร้อมแอมป์ดิจิทัล Hi-Fi ในตัว หน่วยความจำภายใน 4GB และแบตเตอรี่ RTC สามารถตั้งเวลาทำงานแบบออฟไลน์ได้โดยไม่ต้องพึ่งพาเครื่องแม่ข่าย รองรับการประกาศทางไกลและสัญญาณเตือนภัยฉุกเฉิน', '["กำลังขับสเตอริโอ: 2 x 30W (ลำโพง Active 1 ตู้ + Passive 1 ตู้)","หน่วยความจำในตัว 4GB สำหรับเก็บไฟล์เสียง พร้อม RTC Battery และ Hi-Fi Digital Amplifier","ทำงานแบบ Offline ได้โดยไม่ต้องติดตั้งซอฟต์แวร์หรือเครื่องควบคุมกลาง","พอร์ตเชื่อมต่อ: 1 AUX Input, 1 AUX Output รองรับ Remote Paging & Emergency Alarm","รองรับไฟล์เสียงหลากหลาย: MP3, WMA, WAV, AAC, OGG, APE, FLAC"]', 'ขอใบเสนอราคา (ราคาส่งโครงการ)', 6800, '/images/prod-speaker.jpg', '', 'มีสินค้าพร้อมส่ง', 0, 1, 0, '2026-10-31 22:36:12', '2026-10-31 22:36:12');
INSERT INTO `products` (`id`, `sku`, `slug`, `name`, `subtitle`, `brand`, `category_id`, `description`, `specs_json`, `price_display`, `price_amount`, `image_url`, `datasheet_url`, `stock_status`, `is_featured`, `is_active`, `views_count`, `created_at`, `updated_at`) VALUES (6, 'MINI60-EDU', 'classroom-audio-solution-mini60', 'Classroom Audio Solution — Mini60 Smart Classroom Set', 'ชุดระบบเสียงห้องเรียนอัจฉริยะพร้อมบริการดูแลรักษาสำหรับสถานศึกษาและห้องฝึกอบรม', 'CSF Education Solution', 1, 'โซลูชันระบบกระจายเสียงสำหรับห้องเรียนและห้องบรรยาย ออกแบบให้เสียงพูดของผู้สอนชัดเจนทั่วถึงทุกที่นั่ง ลดอาการล้าของเสียง รองรับการเชื่อมต่อสื่อการสอนมัลติมีเดีย คอมพิวเตอร์ และไมโครโฟนไร้สาย พร้อมบริการหลังการขาย Classroom Audio Maintenance Support โดยทีมช่างผู้เชี่ยวชาญ', '["แอมปลิฟายเออร์คลาส D ประสิทธิภาพสูง ประหยัดพลังงานขนาด 60W","รองรับไมโครโฟนไร้สายสำหรับผู้สอน พร้อมระบบตัดเสียงรบกวนและป้องกันเสียงหอน (Anti-Feedback)","ช่องต่อสัญญาณเสียงจากคอมพิวเตอร์ โปรเจคเตอร์ และกระดานอัจฉริยะครบครัน","กระจายเสียงสม่ำเสมอทั่วห้องเรียนขนาด 40–80 ที่นั่ง","รวมบริการให้คำปรึกษาการติดตั้งและ Classroom Audio Maintenance Support"]', 'ขอใบเสนอราคาโครงการสถานศึกษา', 12500, '/uploads/articles/classroom-support.jpg', '', 'พร้อมจัดส่งและติดตั้ง', 0, 1, 0, '2026-10-31 22:36:12', '2026-10-31 22:36:12');
INSERT INTO `products` (`id`, `sku`, `slug`, `name`, `subtitle`, `brand`, `category_id`, `description`, `specs_json`, `price_display`, `price_amount`, `image_url`, `datasheet_url`, `stock_status`, `is_featured`, `is_active`, `views_count`, `created_at`, `updated_at`) VALUES (7, 'NC3FXX', 'nc3fxx-3-pole-female-xlr-connector', 'NC3FXX — Professional 3-Pole Female XLR Cable Connector', 'หัวต่อสายสัญญาณเสียง XLR ตัวเมีย 3 ขั้ว มาตรฐานสตูดิโอและงานบรอดแคสต์', 'Neutrik / Pro Audio', 1, 'ขั้วต่อสายไมโครโฟนและสัญญาณเสียงสมดุล (Balanced Audio) แบบ 3-Pole Female XLR ตัวถังโลหะหล่อแข็งแรงทนทาน พร้อมบูทยางป้องกันสายหักงอ ให้การนำสัญญาณที่แม่นยำ ไร้เสียงรบกวน', '["ประเภทหัวต่อ: 3-Pole Female XLR Cable Connector","หน้าสัมผัสชุบเงินนำสัญญาณเสียงดีเยี่ยม ค่าความต้านทานต่ำ","ระบบ Strain Relief จับยึดสายแน่นหนาป้องกันสายขาดใน","มีรุ่นคู่กัน: NC3MXX (XLR ตัวผู้), NP2X / NP3X (Phone Plug) และสายสำเร็จรูป 2XLR"]', 'สอบถามราคาปลีก-ส่ง (ยกลัง)', 195, '/uploads/products/nc3fxx.jpg', '', 'มีสต็อกพร้อมส่งทันที', 0, 1, 0, '2026-10-31 22:36:12', '2026-10-31 22:36:12');
INSERT INTO `products` (`id`, `sku`, `slug`, `name`, `subtitle`, `brand`, `category_id`, `description`, `specs_json`, `price_display`, `price_amount`, `image_url`, `datasheet_url`, `stock_status`, `is_featured`, `is_active`, `views_count`, `created_at`, `updated_at`) VALUES (8, 'NL4FX', 'nl4fx-speakon-connector-4-pole', 'NL4FX — Professional 4-Pole Speakon Cable Connector', 'หัวต่อสายลำโพง Speakon 4 ขั้ว ระบบล็อกนิรภัย มาตรฐานงานระบบเสียงมืออาชีพ', 'Pro Audio Interconnect', 1, 'หัวต่อสายลำโพงแบบ Speakon 4 Poles มาตรฐานอุตสาหกรรมระบบเสียงพีเอและบรอดแคสต์ ระบบล็อกแน่นหนา Quick Lock ป้องกันการหลุดขณะใช้งาน รองรับกระแสไฟฟ้าสูงและการนำสัญญาณเสียงที่แม่นยำ', '["ประเภทหัวต่อ: Speakon Cable Connector 4 Poles","ระบบล็อกนิรภัย Twist-Lock ป้องกันสายหลุดโดยไม่ตั้งใจ","รองรับสายลำโพงขนาดมาตรฐานงานติดตั้งและทัวร์ริ่ง","หน้าสัมผัสโลหะนำไฟฟ้าสูง ลดการสูญเสียสัญญาณ","มีสินค้าในตระกูลเดียวกัน: NL2FX, NP3X, NP2X, NC3MXX, NC3FXX และสายสำเร็จรูป 2XLR (1M/2M/3M)"]', 'สอบถามราคาปลีก-ส่ง (ยกลัง)', 240, '/images/prod-connector.jpg', '', 'มีสต็อกพร้อมส่งทันที', 0, 1, 0, '2026-10-31 22:36:12', '2026-10-31 22:36:12');
INSERT INTO `products` (`id`, `sku`, `slug`, `name`, `subtitle`, `brand`, `category_id`, `description`, `specs_json`, `price_display`, `price_amount`, `image_url`, `datasheet_url`, `stock_status`, `is_featured`, `is_active`, `views_count`, `created_at`, `updated_at`) VALUES (9, 'SN-NVR10/08E3/064NSH', 'sn-nvr10-08e3-064nsh-64ch-8hdd-nvr', 'SN-NVR10/08E3/064NSH — 64CH 8HDD Enterprise RAID Network Video Recorder', 'เครื่องบันทึกภาพเครือข่ายระดับองค์กร 64 ช่อง รองรับ 8 HDD สูงสุด 48TB และระบบ RAID 0/1/5/6/10', 'Sunell Security', 2, 'เครื่องบันทึกภาพกล้องวงจรปิด IP ระดับ Enterprise รองรับกล้องสูงสุด 64 ช่องสัญญาณ แบนด์วิดท์ขาเข้าสูงสุด 384Mbps ถอดรหัส H.265/H.264 ความละเอียดแสดงผลและย้อนหลังสูงสุด 12MP รองรับฮาร์ดดิสก์ 8 ลูกพร้อมระบบปกป้องข้อมูล RAID 0/1/5/6/10 และ N+M Hot Standby สำหรับงานที่ต้องการเสถียรภาพสูงสุด', '["รองรับกล้อง IP Camera สูงสุด 64 ช่อง (Max 384Mbps Incoming Bandwidth)","รองรับการบีบอัดวิดีโอ H.265 / H.264 / MPEG4 ประหยัดพื้นที่จัดเก็บ","ความละเอียดการดูสดและย้อนหลังสูงสุดถึง 12 Megapixels","ช่องแสดงผลวิดีโอ 2x HDMI และ VGA แสดงผลพร้อมกัน รองรับการเล่นย้อนหลัง 4/8/16 ช่องพร้อมกัน","รองรับ 8 SATA HDDs ความจุรวมสูงสุด 48TB+ พร้อมระบบ RAID 0/1/5/6/10","รองรับมาตรฐาน ONVIF Version 2.4, Smart Tracking และระบบสำรองฉุกเฉิน N+M Hot Standby"]', 'ขอใบเสนอราคาโครงการ (B2B)', 42900, '/uploads/products/sn-nvr10-08e3-064nsh.jpg', '', 'พร้อมส่ง / สั่งซื้อโครงการ', 1, 1, 0, '2026-10-31 22:36:12', '2026-10-31 22:36:12');
INSERT INTO `products` (`id`, `sku`, `slug`, `name`, `subtitle`, `brand`, `category_id`, `description`, `specs_json`, `price_display`, `price_amount`, `image_url`, `datasheet_url`, `stock_status`, `is_featured`, `is_active`, `views_count`, `created_at`, `updated_at`) VALUES (10, 'SN-NVR10/02E3/016NSE', 'sn-nvr10-02e3-016nse-16ch-2hdd-nvr', 'SN-NVR10/02E3/016NSE — 16CH 2HDD Network Video Recorder', 'เครื่องบันทึกภาพ IP Camera 16 ช่อง ระบบปฏิบัติการ Embedded Linux เสถียรสูง พร้อม Dual Gigabit LAN', 'Sunell Security', 2, 'เครื่องบันทึกภาพ NVR ขนาด 16 ช่องสำหรับสำนักงาน อาคารพาณิชย์ และคลังสินค้า ทำงานบนระบบปฏิบัติการ Embedded Linux ที่มีความเสถียรสูง รองรับฮาร์ดดิสก์ SATA 2 ลูก พอร์ตเครือข่ายคู่ 2x RJ45 Gigabit และแสดงผลภาพคมชัดระดับ 1080P พร้อมกันทั้ง HDMI และ VGA', '["รองรับการเชื่อมต่อกล้อง IP Camera สูงสุด 16 ช่อง ความละเอียด 1080P+","ระบบปฏิบัติการ Embedded Linux Operation System ทำงานต่อเนื่องเสถียรสูง","รองรับฮาร์ดดิสก์ 2x SATA Hard Disk","พอร์ตเครือข่ายคู่ 2x RJ45 10M/100M/1000M Gigabit Network Interface","เอาต์พุตภาพ HDMI และ VGA แสดงผลพร้อมกันความละเอียด 1080P พร้อม 2x USB 2.0 Host"]', 'ขอใบเสนอราคา (ราคาส่งช่าง/องค์กร)', 8500, '/uploads/products/sn-nvr10-02e3-016nse.jpg', '', 'มีสินค้าพร้อมส่ง', 0, 1, 0, '2026-10-31 22:36:12', '2026-10-31 22:36:12');
INSERT INTO `products` (`id`, `sku`, `slug`, `name`, `subtitle`, `brand`, `category_id`, `description`, `specs_json`, `price_display`, `price_amount`, `image_url`, `datasheet_url`, `stock_status`, `is_featured`, `is_active`, `views_count`, `created_at`, `updated_at`) VALUES (11, 'SN-IPV57/41UDR/Z', 'sn-ipv57-41udr-z-4mp-motorized-vandal-ir-dome', 'SN-IPV57/41UDR/Z — 4MP Motorized Vandal-Proof Network IR Dome', 'กล้องโดมเครือข่าย 4 ล้านพิกเซล เลนส์ซูมมอเตอร์ 2.7-12mm กันน้ำ IP67 กันกระแทก IK10', 'Sunell Security', 2, 'กล้องวงจรปิดทรงโดมความละเอียด 4MP (2592x1520 @30fps) มาพร้อมเลนส์ซูมปรับโฟกัสอัตโนมัติ Motorized 2.7–12mm อินฟราเรดอัจฉริยะ Smart IR ระยะ 30 เมตร ภาพคมชัดแม้แสงน้อย พร้อมฟังก์ชัน WDR, 3D DNR, Defog, HLC และตัวถังนิรภัยมาตรฐานกันน้ำ IP67 และกันทุบทำลาย IK10', '["เซนเซอร์รับภาพ 1/3\\" Progressive Scan CMOS ความละเอียด 4MP (2592×1520 @25/30fps)","เลนส์ปรับซูมมอเตอร์ไฟฟ้า Motorized Lens 2.7–12mm ปรับมุมมองผ่านระบบได้ทันที","รองรับ Triple Streams และ Smart IR ระยะส่องสว่างกลางคืนสูงสุด 30 เมตร","เทคโนโลยีปรับแต่งภาพครบครัน: WDR, 3D DNR (S/N Ratio 52dB), ROI, Defog, HLC, Corridor Mode, DIS","มาตรฐานความทนทานระดับอุตสาหกรรม IP67 กันน้ำกันฝุ่น และ IK10 ป้องกันการทุบทำลาย"]', 'ขอใบเสนอราคาโครงการ (B2B)', 5400, '/uploads/products/sn-ipv57-41udr-z.jpg', '', 'มีสินค้าพร้อมส่ง', 1, 1, 0, '2026-10-31 22:36:12', '2026-10-31 22:36:12');
INSERT INTO `products` (`id`, `sku`, `slug`, `name`, `subtitle`, `brand`, `category_id`, `description`, `specs_json`, `price_display`, `price_amount`, `image_url`, `datasheet_url`, `stock_status`, `is_featured`, `is_active`, `views_count`, `created_at`, `updated_at`) VALUES (12, 'SN-IPV57/20UDR/Z', 'sn-ipv57-20udr-z-starlight-motorized-ir-dome', 'SN-IPV57/20UDR/Z — 1080P Starlight Motorized Network IR Dome', 'กล้องโดมเทคโนโลยี Starlight ภาพสีชัดเจนในที่แสงน้อย พร้อมเลนส์มอเตอร์ 2.7-12mm IP67/IK10', 'Sunell Security', 2, 'กล้องโดมเครือข่าย Starlight เซนเซอร์ 1/2.8" Progressive Scan CMOS ให้ประสิทธิภาพภาพในสภาวะแสงน้อยยอดเยี่ยมเป็นพิเศษ เลนส์ Motorized 2.7–12mm ความละเอียด 1080P@30fps รองรับ Triple Streams ประหยัดแบนด์วิดท์ พร้อมมาตรฐาน IP67 และ IK10', '["เซนเซอร์ 1/2.8\\" Progressive Scan CMOS เทคโนโลยี Starlight ประสิทธิภาพแสงน้อยยอดเยี่ยม","เลนส์ Motorized 2.7–12mm ความละเอียด Full HD 1080P @30fps","รองรับ Triple Streams และ Smart IR ส่องสว่างไกล 30 เมตร","รองรับ WDR, 3D DNR, ROI, Defog, HLC, Corridor Mode และระบบกันสั่น DIS","ตัวถังโลหะทนทานมาตรฐาน IP67 และกันกระแทก IK10"]', 'ขอใบเสนอราคาโครงการ (B2B)', 4900, '/images/prod-dome-cam.jpg', '', 'มีสินค้าพร้อมส่ง', 0, 1, 0, '2026-10-31 22:36:12', '2026-10-31 22:36:12');
INSERT INTO `products` (`id`, `sku`, `slug`, `name`, `subtitle`, `brand`, `category_id`, `description`, `specs_json`, `price_display`, `price_amount`, `image_url`, `datasheet_url`, `stock_status`, `is_featured`, `is_active`, `views_count`, `created_at`, `updated_at`) VALUES (13, 'SN-IPS57/30BDN/ZSD30', 'sn-ips57-30bdn-zsd30-high-speed-dome-30x', 'SN-IPS57/30BDN/ZSD30 — 3.0MP 30X Optical Zoom Network High Speed Dome', 'กล้อง PTZ High Speed Dome ซูมออปติคอล 30 เท่า สำหรับเฝ้าระวังพื้นที่บริเวณกว้างและโรงงานอุตสาหกรรม', 'Sunell Security', 2, 'กล้องหมุนส่ายก้มเงยความเร็วสูง (PTZ Speed Dome) ความละเอียด 3.0MP (2048x1536 @30fps) ซูมเลนส์ Optical แท้ได้ถึง 30 เท่า และ Digital Zoom 16 เท่า เหมาะสำหรับตรวจการณ์พื้นที่ลานจอดรถ คลังสินค้า ท่าเรือ นิคมอุตสาหกรรม และโครงการสมาร์ทซิตี้', '["เซนเซอร์ 1/2.8\\" Progressive Scan CMOS ความละเอียด 3.0MP (2048×1536 @30fps)","กำลังขยายซูม 30X Optical Zoom และ 16X Digital Zoom คมชัดทุกระยะ","รองรับการส่งสัญญาณภาพแบบ Multiple Streams อัตราบิตเรตต่ำ ประหยัดแบนด์วิดท์","ระบบลดสัญญาณรบกวน 3D DNR และ ICR ปรับโหมดกลางวัน-กลางคืนอัตโนมัติ","รองรับขายึดติดตั้งครบชุด อาทิ SN-CBK624 (Wall), SN-CBK626 (Corner), SN-CBK627 (Pole Mount)"]', 'ขอใบเสนอราคาโครงการ (B2B)', 19800, '/uploads/products/sn-ips56-30bdr-zsd30.jpg', '', 'พร้อมส่ง / สั่งซื้อโครงการ', 1, 1, 0, '2026-10-31 22:36:12', '2026-10-31 22:36:12');
INSERT INTO `products` (`id`, `sku`, `slug`, `name`, `subtitle`, `brand`, `category_id`, `description`, `specs_json`, `price_display`, `price_amount`, `image_url`, `datasheet_url`, `stock_status`, `is_featured`, `is_active`, `views_count`, `created_at`, `updated_at`) VALUES (14, 'SN-IPV56/60HDR', 'sn-ipv56-60hdr-6mp-fisheye-camera', 'SN-IPV56/60HDR — 6MP Panoramic 360° Fisheye Network Camera', 'กล้องวงจรปิดมุมมองรอบทิศทาง 360 องศา ความละเอียด 6 ล้านพิกเซล พร้อมระบบคลี่ภาพ De-warping', 'Sunell Security', 2, 'กล้อง Fisheye มุมมองพาโนรามา 360 องศา ความละเอียดสูง 6MP เซนเซอร์ขนาดใหญ่ 1/1.8" Progressive Scan CMOS มาพร้อมเทคโนโลยี Unique De-warping แปลงภาพมุมกว้างให้ดูแยกส่วนได้เสมือนติดกล้องหลายตัว ลดจุดอับสายตาในห้องประชุม โถงต้อนรับ และพื้นที่ค้าปลีก', '["เซนเซอร์ 1/1.8\\" Progressive Scan CMOS ความละเอียดสูง 6 Megapixels","เทคโนโลยี Unique De-warping Image คลี่ภาพมุมมองรอบทิศทางได้อย่างเป็นธรรมชาติ","ให้ภาพคมชัดในสภาวะแสงน้อย อัตราการใช้แบนด์วิดท์ต่ำ","ฟีเจอร์ปรับสภาพแสง 3D DNR, dWDR, ICR, HLC","อินฟราเรด Smart IR ระยะครอบคลุมรอบตัว 10 เมตร"]', 'ขอใบเสนอราคาโครงการ (B2B)', 9200, '/uploads/products/sn-ipv56-60hdr.jpg', '', 'มีสินค้าพร้อมส่ง', 0, 1, 0, '2026-10-31 22:36:12', '2026-10-31 22:36:12');
INSERT INTO `products` (`id`, `sku`, `slug`, `name`, `subtitle`, `brand`, `category_id`, `description`, `specs_json`, `price_display`, `price_amount`, `image_url`, `datasheet_url`, `stock_status`, `is_featured`, `is_active`, `views_count`, `created_at`, `updated_at`) VALUES (15, 'SN-CBK624', 'sn-cbk624-wall-mount-bracket', 'SN-CBK624 — Heavy-Duty Speed Dome Wall Mount Bracket', 'ขายึดกล้อง Speed Dome ติดผนังอะลูมิเนียมอัลลอยมาตรฐานงานภายนอกอาคาร', 'Sunell Security', 2, 'ขายึดผนัง (Wall Mount Bracket) สำหรับกล้อง PTZ Speed Dome ผลิตจากอะลูมิเนียมอัลลอยเคลือบสีกันสนิม รองรับการร้อยสายภายในตัวขาอย่างเรียบร้อย ใช้ร่วมกับอุปกรณ์เสริม SN-CBK625 (Pendant Cap), SN-CBK626 (Corner Mount) และ SN-CBK627 (Pole Mount)', '["วัสดุ Aluminum Alloy แข็งแรงทนทาน รองรับสภาพอากาศกลางแจ้ง","ออกแบบช่องเดินสายไฟและสายแลนซ่อนภายในตัวขายึดปลอดภัย","รองรับการใช้งานร่วมกับชุดยึดมุมเสา SN-CBK626 และชุดรัดเสากลม SN-CBK627"]', 'สอบถามราคาโครงการ', 1150, '/uploads/products/sn-cbk624.jpg', '', 'มีสินค้าพร้อมส่ง', 0, 1, 0, '2026-10-31 22:36:12', '2026-10-31 22:36:12');
INSERT INTO `products` (`id`, `sku`, `slug`, `name`, `subtitle`, `brand`, `category_id`, `description`, `specs_json`, `price_display`, `price_amount`, `image_url`, `datasheet_url`, `stock_status`, `is_featured`, `is_active`, `views_count`, `created_at`, `updated_at`) VALUES (16, 'CSF-SW24G-POE370', 'csf-managed-24port-gigabit-poe-switch', 'CSF-SW24G-POE370 — 24-Port Gigabit L2+ Managed PoE+ Switch (4x SFP)', 'สวิตช์จ่ายไฟผ่านสายแลน 24 พอร์ต กำลังไฟรวม 370W พร้อมพอร์ต Fiber SFP 4 ช่องสำหรับงาน CCTV และ Wi-Fi องค์กร', 'CSF Telecom Network', 3, 'สวิตช์เครือข่ายระดับองค์กร L2+ Managed Gigabit PoE+ จำนวน 24 พอร์ต รองรับมาตรฐาน IEEE 802.3af/at จ่ายไฟรวมสูงสุด 370W สำหรับกล้อง IP Camera, โทรศัพท์ IP Phone และ Access Point พร้อมพอร์ตอัปลิงก์ 4x Gigabit SFP เชื่อมต่อโครงข่ายใยแก้วนำแสงระยะไกลอย่างมั่นคง', '["พอร์ตเชื่อมต่อ: 24x 10/100/1000Mbps RJ45 PoE+ Ports + 4x 1000Mbps SFP Fiber Slots","กำลังไฟ PoE Budget รวมสูงสุด 370W (สูงสุด 30W ต่อพอร์ต มาตรฐาน IEEE 802.3af/at)","รองรับฟีเจอร์เครือข่ายองค์กร: 802.1Q VLAN, QoS, IGMP Snooping, STP/RSTP และ Link Aggregation","โหมด AI PoE Watchdog รีบูตกล้องหรืออุปกรณ์ปลายทางอัตโนมัติเมื่อค้าง","ตัวถังโลหะมาตรฐานเข้าตู้แร็ค 19 นิ้ว 1U พร้อมระบบป้องกันไฟกระชาก 6kV"]', 'ขอใบเสนอราคาโครงการ (B2B)', 11900, '/images/hero-network.jpg', '', 'มีสินค้าพร้อมส่ง', 1, 1, 0, '2026-10-31 22:36:12', '2026-10-31 22:36:12');
INSERT INTO `products` (`id`, `sku`, `slug`, `name`, `subtitle`, `brand`, `category_id`, `description`, `specs_json`, `price_display`, `price_amount`, `image_url`, `datasheet_url`, `stock_status`, `is_featured`, `is_active`, `views_count`, `created_at`, `updated_at`) VALUES (17, 'CSF-UPS3000-RT', 'csf-smart-online-ups-3kva-rack-tower', 'CSF-UPS3000-RT — 3kVA / 2700W True Online Double-Conversion Rack/Tower UPS', 'เครื่องสำรองไฟระบบ True Online สำหรับเซิร์ฟเวอร์ เครื่องบันทึก NVR ตู้สาขา และอุปกรณ์ห้องควบคุม', 'CSF IT Power Solution', 4, 'เครื่องสำรองไฟเทคโนโลยี True Online Double-Conversion ขนาด 3kVA (2700W) จ่ายกระแสไฟ Pure Sine Wave นิ่งสนิทไร้ช่วงสลับไฟ (Zero Transfer Time) ปกป้องระบบเซิร์ฟเวอร์ เครื่องบันทึกภาพ NVR 64CH และอุปกรณ์ระบบเสียงบรอดแคสต์จากปัญหาไฟตก ไฟกระชาก และไฟดับได้อย่างสมบูรณ์', '["กำลังไฟพิกัด: 3000VA / 2700W (Power Factor 0.9) ระบบ True Online Double-Conversion","เวลาโอนย้ายแหล่งจ่ายไฟ 0 ms (Zero Transfer Time) ป้องกันอุปกรณ์รีสตาร์ท 100%","ติดตั้งได้ทั้งแบบวางตั้ง (Tower) และเข้าตู้แร็คมาตรฐาน 19 นิ้ว (2U Rackmount)","หน้าจอ LCD แสดงสถานะโหลด แรงดันไฟ และระดับแบตเตอรี่แบบเรียลไทม์","รองรับการ์ด SNMP เสริมสำหรับแจ้งเตือนสถานะไฟฟ้าเข้าสู่ระบบเครือข่ายหรือ LINE OA"]', 'ขอใบเสนอราคาโครงการ (B2B)', 21500, '/images/hero-it.jpg', '', 'พร้อมส่งและบริการติดตั้ง', 1, 1, 0, '2026-10-31 22:36:12', '2026-10-31 22:36:12');

-- Data for table `articles`
DELETE FROM `articles`;
INSERT INTO `articles` (`id`, `slug`, `title`, `excerpt`, `content`, `category`, `cover_image`, `author_name`, `is_published`, `published_at`, `views_count`, `created_at`, `updated_at`) VALUES (1, 'classroom-audio-maintenance-support', 'Classroom Audio Maintenance Support — แนวทางดูแลรักษาระบบเสียงห้องเรียนและห้องประชุมให้พร้อมใช้งานต่อเนื่อง', 'เทคนิคการตรวจสอบ บำรุงรักษา และยืดอายุการใช้งานชุดเครื่องเสียงห้องเรียน ไมโครโฟนไร้สาย และลำโพงประกาศ เพื่อความต่อเนื่องในการเรียนการสอนและการทำงานขององค์กร', 'บริษัท ซีเอสเอฟ จำกัด (CSF Technology Touch) ให้ความสำคัญอย่างยิ่งกับการบริการหลังการขายและการดูแลรักษาระบบให้พร้อมใช้งานอย่างต่อเนื่อง โดยเฉพาะระบบเสียงในห้องเรียน (Classroom Audio) และห้องประชุมองค์กรที่ต้องใช้งานเป็นประจำทุกวัน\n\n### 1. การตรวจสอบระดับสัญญาณและป้องกันอาการเสียงหอน (Acoustic Feedback)\nการตั้งค่า Gain ของเครื่องขยายเสียง เช่นรุ่น MP60U หรือชุด Mini60 ควรกำหนดระดับอ้างอิงที่เหมาะสมกับขนาดห้อง และจัดวางตำแหน่งลำโพงคอลัมน์หรือลำโพงเพดาน (เช่น DSP501 / WA124) ไม่ให้ยิงเสียงเข้าหาหัวไมโครโฟนโดยตรง จะช่วยลดเสียงหอนและถนอมดอกลำโพงในระยะยาว\n\n### 2. การดูแลสายสัญญาณและหัวต่อมาตรฐาน (XLR & Speakon)\nปัญหาเสียงขาดหายหรือมีเสียงจี่รบกวนกว่า 70% มักเกิดจากจุดเชื่อมต่อที่หลวมหรือเกิดคราบออกไซด์ การเลือกใช้หัวต่อมาตรฐานอย่าง Speakon 4-Pole (NL4FX) และสายสัญญาณ XLR คุณภาพสูง พร้อมตรวจสอบความแน่นหนาทุกภาคการศึกษา จะช่วยลดเวลาหยุดชะงักได้มาก\n\n### 3. บริการตรวจสอบและให้คำปรึกษาโดยทีมงาน CSF\nสำหรับโรงเรียน มหาวิทยาลัย และหน่วยงานองค์กรที่ต้องการปรับปรุงระบบเสียงเดิมหรือต้องการอะไหล่ทดแทนที่ได้มาตรฐาน สามารถส่งภาพหน้างานหรือรุ่นอุปกรณ์ผ่าน LINE Official Account ของ CSF เพื่อให้ทีมวิศวกรประเมินและจัดทำใบเสนอราคาได้อย่างรวดเร็ว', 'Product Support', '/uploads/articles/classroom-support.jpg', 'ฝ่ายบริการเทคนิค CSF Technology Touch', 1, '2026-09-15 10:00:00', 0, '2026-10-31 22:36:12', '2026-10-31 22:36:12');
INSERT INTO `articles` (`id`, `slug`, `title`, `excerpt`, `content`, `category`, `cover_image`, `author_name`, `is_published`, `published_at`, `views_count`, `created_at`, `updated_at`) VALUES (2, 'enterprise-ip-cctv-nvr-raid-design-guide', 'คู่มือเลือกเครื่องบันทึก NVR และออกแบบระบบจัดเก็บข้อมูล RAID สำหรับกล้องวงจรปิดองค์กร', 'วิธีคำนวณแบนด์วิดท์ ความจุฮาร์ดดิสก์ และการเลือกใช้ระบบ RAID 5 / RAID 6 บนเครื่องบันทึก 64CH เพื่อให้ข้อมูลภาพสำคัญขององค์กรปลอดภัยสูงสุด', 'ในการออกแบบระบบรักษาความปลอดภัยกล้องวงจรปิด IP CCTV สำหรับอาคารสำนักงาน โรงงานอุตสาหกรรม หรือคลังสินค้าขนาดใหญ่ สิ่งสำคัญไม่แพ้ความคมชัดของตัวกล้อง คือความเสถียรของเครื่องบันทึกภาพเครือข่าย (NVR)\n\n### ทำไมองค์กรขนาดใหญ่ควรเลือก NVR ที่รองรับ RAID และ Hot Standby?\nสำหรับโครงการที่มีกล้องตั้งแต่ 16 ถึง 64 ตัวขึ้นไป การบันทึกภาพความละเอียด 4MP–6MP ตลอด 24 ชั่วโมง จะสร้างปริมาณข้อมูลมหาศาล เครื่องบันทึกระดับองค์กรอย่าง **SN-NVR10/08E3/064NSH** จึงถูกออกแบบให้รองรับฮาร์ดดิสก์ถึง 8 ลูก พร้อมเทคโนโลยี **RAID 0/1/5/6/10** ซึ่งช่วยให้ข้อมูลวิดีโอไม่สูญหายแม้ฮาร์ดดิสก์ลูกใดลูกหนึ่งเกิดขัดข้องกะทันหัน\n\n### การจับคู่กับสวิตช์ PoE+ และการสำรองไฟ\nเพื่อให้ระบบบันทึกภาพทำงานได้ต่อเนื่องแม้เกิดเหตุไฟดับ แนะนำให้เชื่อมต่อกล้องผ่าน Managed Gigabit PoE+ Switch ที่มีระบบ PoE Watchdog และสำรองไฟตู้แร็คกลางด้วย True Online UPS ทีมงาน CSF ยินดีช่วยคำนวณพื้นที่จัดเก็บข้อมูล (Storage Calculator) ย้อนหลัง 30/60/90 วันให้ฟรีสำหรับทุกโครงการ', 'Technology Knowledge', '/images/hero-cctv.jpg', 'ทีมวิศวกรโซลูชัน CSF', 1, '2026-10-08 14:30:00', 0, '2026-10-31 22:36:12', '2026-10-31 22:36:12');
INSERT INTO `articles` (`id`, `slug`, `title`, `excerpt`, `content`, `category`, `cover_image`, `author_name`, `is_published`, `published_at`, `views_count`, `created_at`, `updated_at`) VALUES (3, 'commercial-pa-100v-line-speaker-selection', 'เข้าใจระบบลำโพง 100V Line สำหรับงานระบบเสียงประกาศอาคาร สำนักงาน และพื้นที่กลางแจ้ง', 'ทำความรู้จักความแตกต่างระหว่างระบบลำโพง 100V Line กับลำโพงความต้านทานต่ำ (8 โอห์ม) เพื่อการเดินสายระยะไกลโดยไม่สูญเสียกำลังเสียง', 'หลายองค์กรที่กำลังวางระบบเสียงตามสาย (Public Address System) หรือเสียงเพลงคลอเบาๆ (Background Music) ในอาคารหลายชั้น มักสงสัยว่าทำไมจึงต้องใช้ลำโพงและแอมป์ระบบ **70V / 100V Line**\n\n### ข้อดีของระบบ 100V Line ในงานอาคาร\n1. **เดินสายได้ไกลหลายร้อยเมตร** โดยกำลังเสียงตกลงน้อยมากเมื่อเทียบกับระบบ 4–8 โอห์มทั่วไป\n2. **พ่วงลำโพงหลายจุดบนสายเส้นเดียวได้อย่างยืดหยุ่น** เพียงนำค่าวัตต์ (Power Tap) ของลำโพงแต่ละตัว เช่น ลำโพงเพดาน **DSP501 (3W/6W)** หรือลำโพงคอลัมน์กันน้ำ **DSP255II (30W)** มารวมกันไม่ให้เกินประมาณ 80% ของกำลังขับแอมป์ เช่น **MP60U (60W)**\n3. **ปรับความดังแยกโซนได้ง่าย** เช่น โถงต้อนรับใช้ 6W ห้องทำงานใช้ 3W และลานจอดรถกึ่งกลางแจ้งใช้คอลัมน์กันน้ำ 30W\n\nต้องการให้ทีมงาน CSF ช่วยวางผังจุดติดตั้งลำโพงตามแปลนอาคาร สามารถติดต่อฝ่ายขายได้ทันทีทั้งทางโทรศัพท์ อีเมล และ LINE OA', 'Technology Knowledge', '/images/hero-av.jpg', 'ทีมวิศวกรระบบเสียง CSF', 1, '2026-10-22 09:15:00', 0, '2026-10-31 22:36:12', '2026-10-31 22:36:12');

-- Data for table `site_settings`
DELETE FROM `site_settings`;
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `updated_at`) VALUES ('site_logo', '/uploads/brand/csf_logo.png', 'brand', '2026-10-31 22:36:12');
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `updated_at`) VALUES ('site_url', 'https://uat.csf.co.th', 'general', '2026-10-31 22:36:12');
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `updated_at`) VALUES ('line_oa_add_url', '', 'social', '2026-10-31 22:36:12');
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `updated_at`) VALUES ('ga4_measurement_id', '', 'tracking', '2026-10-31 22:36:12');
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `updated_at`) VALUES ('gtm_container_id', '', 'tracking', '2026-10-31 22:36:12');
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `updated_at`) VALUES ('facebook_pixel_id', '', 'tracking', '2026-10-31 22:36:12');
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `updated_at`) VALUES ('custom_head_scripts', '', 'tracking', '2026-10-31 22:36:12');
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `updated_at`) VALUES ('custom_body_start_scripts', '', 'tracking', '2026-10-31 22:36:12');
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `updated_at`) VALUES ('custom_body_end_scripts', '', 'tracking', '2026-10-31 22:36:12');
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `updated_at`) VALUES ('company_name_th', 'บริษัท ซีเอสเอฟ จำกัด', 'company', '2026-10-31 22:36:12');
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `updated_at`) VALUES ('company_name_en', 'CSF Co., Ltd. — CSF Technology Touch', 'company', '2026-10-31 22:36:12');
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `updated_at`) VALUES ('brand_tagline', 'ผู้นำเข้าและจัดจำหน่ายอุปกรณ์ IT Solution, Telecom Network, Audio/Video, Broadcasting & CCTV ครบวงจร', 'company', '2026-10-31 22:36:12');
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `updated_at`) VALUES ('tax_id', '0105560106452 (สำนักงานใหญ่)', 'company', '2026-10-31 22:36:12');
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `updated_at`) VALUES ('history_text', 'บริษัท ซีเอสเอฟ จำกัด ก่อตั้งขึ้นเพื่อดำเนินธุรกิจในการนำเข้าและจัดจำหน่ายอุปกรณ์ที่เกี่ยวข้องกับเทคโนโลยีในแขนงต่างๆ เช่น IT Solution, Telecom Network, Audio/Video, Broadcasting, CCTV และ Electronic Component โดยมีเจตนารมณ์ที่จะสรรหาสินค้าภายใต้ยี่ห้อชั้นนำของกลุ่มอุตสาหกรรมด้านต่างๆ และจัดจำหน่ายให้ตรงกับความต้องการของผู้ใช้งานภายในงบประมาณที่เหมาะสม อีกทั้งยังมุ่งเน้นการบริการที่รวดเร็ว ตั้งแต่การนำเสนอสินค้า การเสนอราคาที่ต้องการ รวมถึงการบริการหลังการขายที่ถือเป็นเรื่องสำคัญอย่างยิ่งสำหรับองค์กรต่างๆ ที่ต้องการความต่อเนื่องในการใช้งานและแก้ไขปัญหาอย่างรวดเร็ว ภายใต้นโยบาย "การบริการที่ดี คือรากฐานสำคัญของธุรกิจ" ดังนั้นสินค้าที่ดีต้องมาพร้อมกับการบริการที่ยอดเยี่ยมและราคาที่เหมาะสม ซึ่งเป็นองค์ประกอบสำคัญในการดำเนินธุรกิจของเรา', 'company', '2026-10-31 22:36:12');
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `updated_at`) VALUES ('vision_intro', 'เรามุ่งเน้นในการเป็นผู้ให้บริการในการจัดหาสินค้าที่ตอบสนองความต้องการของกลุ่มลูกค้า บริษัทฯ, ห้างร้าน, องค์กร, หน่วยงานภาครัฐและเอกชน โดยมีองค์ประกอบหลัก 4 ประการดังนี้', 'company', '2026-10-31 22:36:12');
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `updated_at`) VALUES ('vision_pillars', '[{"title":"คุณภาพมาตรฐานตรงตามการใช้งาน","desc":"คัดสรรสินค้าที่มีคุณภาพดี จากผู้ผลิตและแบรนด์ชั้นนำ เหมาะสมกับลักษณะงานจริงที่ลูกค้าแต่ละองค์กรต้องการ"},{"title":"ราคาคุ้มค่าตามงบประมาณ","desc":"นำเสนอโซลูชันและอุปกรณ์ในราคาที่เหมาะสม โปร่งใส สอดคล้องกับงบประมาณของทั้งภาคเอกชนและภาครัฐ"},{"title":"จัดส่งรวดเร็ว กำหนดการชัดเจน","desc":"บริหารจัดการสต็อกและโลจิสติกส์อย่างเป็นระบบ จัดส่งรวดเร็วและแจ้งกำหนดการส่งมอบที่แน่นอนเชื่อถือได้"},{"title":"บริการหลังการขายและให้คำปรึกษาไว","desc":"ดูแลหลังการขายร่วมกับผู้ผลิต/ผู้นำเข้าโดยตรง พร้อมทีมให้คำปรึกษาทางเทคนิคและแก้ไขปัญหาอย่างสะดวกรวดเร็ว"}]', 'company', '2026-10-31 22:36:12');
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `updated_at`) VALUES ('address_th', '481/78 หมู่บ้านซื่อตรงพรีเมี่ยม พระราม 2 ถนนแสมดำ แขวงแสมดำ เขตบางขุนเทียน กรุงเทพมหานคร 10150', 'contact', '2026-10-31 22:36:12');
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `updated_at`) VALUES ('address_en', '481/78 Suetrong Premium Rama2 Village, Samae Dam Road, Samae Dum Sub-area, Bang Khun Thian Area, Bangkok 10150', 'contact', '2026-10-31 22:36:12');
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `updated_at`) VALUES ('phone_primary', '081-308-9678', 'contact', '2026-10-31 22:36:12');
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `updated_at`) VALUES ('email_sales', 'sales@csf.co.th', 'contact', '2026-10-31 22:36:12');
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `updated_at`) VALUES ('email_info', 'info@csf.co.th', 'contact', '2026-10-31 22:36:12');
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `updated_at`) VALUES ('email_alt', 'csf8889@gmail.com', 'contact', '2026-10-31 22:36:12');
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `updated_at`) VALUES ('working_hours', 'จันทร์ – ศุกร์ เวลา 09:00 – 17:00 น.', 'contact', '2026-10-31 22:36:12');
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `updated_at`) VALUES ('google_maps_embed', 'https://maps.google.com/maps?q=Suetrong+Premium+Rama+2+Samae+Dam+Bang+Khun+Thian+Bangkok+10150&t=&z=14&ie=UTF8&iwloc=&output=embed', 'contact', '2026-10-31 22:36:12');

-- Data for table `social_integrations`
DELETE FROM `social_integrations`;
INSERT INTO `social_integrations` (`id`, `platform`, `display_name`, `handle_or_url`, `channel_id`, `channel_secret`, `access_token`, `verify_token`, `target_recipient_id`, `qr_code_url`, `pixel_id`, `auto_reply_enabled`, `notify_on_inquiry`, `auto_publish_content`, `welcome_message`, `is_enabled`, `updated_at`) VALUES (1, 'line_oa', 'CSF Technology Touch Official', '@csf.co.th', '2006481920', '', '', 'csf_line_webhook_2026', '', '', '', 1, 1, 1, 'สวัสดีครับ ยินดีต้อนรับสู่ บริษัท ซีเอสเอฟ จำกัด (CSF Technology Touch) สามารถพิมพ์รหัสสินค้า เช่น DSP501, MP60U, SN-NVR10 เพื่อดูสเปก หรือแจ้งรายการขอใบเสนอราคาได้ทันทีครับ', 1, '2026-10-31 22:36:12');
INSERT INTO `social_integrations` (`id`, `platform`, `display_name`, `handle_or_url`, `channel_id`, `channel_secret`, `access_token`, `verify_token`, `target_recipient_id`, `qr_code_url`, `pixel_id`, `auto_reply_enabled`, `notify_on_inquiry`, `auto_publish_content`, `welcome_message`, `is_enabled`, `updated_at`) VALUES (2, 'facebook', 'CSF Technology Touch Thailand', 'https://www.facebook.com/csf.co.th', '10849203948102', '', '', 'csf_fb_verify_2026', '', '', '', 1, 1, 1, 'ขอบคุณที่ทักแชทเพจ CSF Technology Touch ครับ ทีมฝ่ายขายพร้อมดูแลเรื่องสเปกสินค้าและใบเสนอราคาในเวลาทำการ จ.-ศ. 09:00-17:00 น. หรือฝากเบอร์ติดต่อกลับไว้ได้เลยครับ', 1, '2026-10-31 22:36:12');

-- Data for table `inquiries`
DELETE FROM `inquiries`;
INSERT INTO `inquiries` (`id`, `ref_code`, `customer_name`, `company_name`, `email`, `phone`, `line_id`, `subject`, `message`, `product_id`, `product_sku`, `attachments_json`, `source_channel`, `status`, `admin_notes`, `notified_line`, `notified_facebook`, `created_at`, `updated_at`) VALUES (1, 'RFQ-202610-001', 'คุณกิตติพงศ์ วัฒนากูล', 'บริษัท สยามลอจิสติกส์ พาร์ค จำกัด', 'kittipong@siamlogistics-example.co.th', '089-412-7788', '@kittipong.w', 'ขอใบเสนอราคาเครื่องบันทึก SN-NVR10/08E3/064NSH พร้อมกล้องโดม 32 จุด', 'ต้องการขอใบเสนอราคาโครงการปรับปรุงระบบ CCTV คลังสินค้าพระราม 2 จำนวน 32 จุด พร้อมเครื่องบันทึก 64CH รองรับ RAID 5 และสวิตช์ PoE+ 24 พอร์ต 2 ตัวครับ', NULL, 'SN-NVR10/08E3/064NSH', NULL, 'website', 'in_progress', 'ส่งสเปกเบื้องต้นทางอีเมลและแจ้งเตือนเข้ากลุ่มฝ่ายขาย LINE OA แล้ว', 1, 0, '2026-10-31 22:36:12', '2026-10-31 22:36:12');
INSERT INTO `inquiries` (`id`, `ref_code`, `customer_name`, `company_name`, `email`, `phone`, `line_id`, `subject`, `message`, `product_id`, `product_sku`, `attachments_json`, `source_channel`, `status`, `admin_notes`, `notified_line`, `notified_facebook`, `created_at`, `updated_at`) VALUES (2, 'RFQ-202610-002', 'อาจารย์สุพรรณี ศรีวิชัย', 'วิทยาลัยเทคโนโลยีอาชีวศึกษาธนบุรี', 'supannee@techcollege-example.ac.th', '081-775-2090', 'supannee_edu', 'สอบถามชุดระบบเสียงห้องเรียน DSP501 + แอมป์ MP60U จำนวน 12 ห้อง', 'รบกวนทำใบเสนอราคาลำโพงเพดาน DSP501 ห้องละ 4 ตัว คู่กับเครื่องขยายเสียง MP60U สำหรับอาคารเรียนใหม่ 12 ห้องเรียน ขอราคาหน่วยงานการศึกษาค่ะ', NULL, 'MP60U', NULL, 'line_oa', 'new', '', 1, 0, '2026-10-31 22:36:12', '2026-10-31 22:36:12');

SET FOREIGN_KEY_CHECKS = 1;
