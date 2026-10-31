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
