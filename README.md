# CSF Technology Touch (csf.co.th) — Nuxt JS + MariaDB Enterprise Platform

เว็บไซต์โฉมใหม่สำหรับ **บริษัท ซีเอสเอฟ จำกัด (CSF Technology Touch — csf.co.th)** พัฒนาต่อยอดจากโครงสร้างและเอกลักษณ์เดิมของเว็บไซต์ให้ทันสมัย รวดเร็ว รองรับ SEO และงานจัดซื้อองค์กร (B2B) อย่างครบวงจร ด้วย **Nuxt 3**, **MariaDB** และระบบหลังบ้าน (Backoffice CMS) ที่เชื่อมต่อกับ **LINE Official Account (Messaging API)** และ **Facebook Page / Messenger**

---

## โครงสร้างฟีเจอร์หลัก (Key Features)

1. **หน้าเว็บไซต์หลักโฉมใหม่ (Modernized CSF Brand Experience)**
   - **Hero Slider 4 กลุ่มโซลูชันหลัก**: Audio/Video Products, CCTV Solution Products, IP Network System และ IT Solution & Electronic Components
   - **Product Catalog & Technical Specs**: ค้นหาตามรหัส SKU (เช่น `DSP501`, `MP60U`, `SN-NVR10/08E3/064NSH`, `SN-IPV57/41UDR/Z`) กรองตามหมวดหมู่ พร้อมปุ่มขอใบเสนอราคาอ้างอิงรุ่นทันที
   - **History, Vision & Management Policy**: เนื้อหาประวัติ วิสัยทัศน์ 4 เสาหลัก และข้อมูลนิติบุคคล/เลขผู้เสียภาษีครบถ้วน
   - **Technology Knowledge & Product Support**: คลังบทความเทคนิคและการดูแลรักษาหลังการขาย
   - **Floating Omni-Channel Dock**: ปุ่มลัดแชท LINE OA (สแกน QR / คัดลอกไอดี), Facebook Messenger และฟอร์มขอใบเสนอราคาด่วน

2. **ระบบหลังบ้านจัดการเนื้อหาครบวงจร (`/office`)**
   - **Dashboard ภาพรวม**: สรุปยอดสินค้า บทความ ใบขอราคาใหม่ และกิจกรรมจาก LINE OA / Facebook
   - **จัดการแบนเนอร์สไลด์ (`/office/banners`)**: เพิ่ม/แก้ไข/จัดลำดับ/เปิด-ปิดสไลด์หน้าแรก
   - **จัดการสินค้าและหมวดหมู่ (`/office/products`, `/office/categories`)**: จัดการสเปกสินค้า ราคา B2B สถานะสต็อก และส่ง Broadcast การ์ดสินค้าเข้า LINE OA / โพสต์ขึ้น Facebook ในคลิกเดียว
   - **จัดการบทความ (`/office/articles`)**: เขียนและเผยแพร่บทความความรู้และซัพพอร์ต
   - **คลังรูปภาพ & ดูดไฟล์เข้าเซิร์ฟเวอร์ (`/office/media`)**: จัดเก็บรูปภาพและไฟล์ทั้งหมดในเซิร์ฟเวอร์ (`/uploads/...`) 100% ไม่ลิงก์เว็บต้นทาง พร้อมสำหรับขึ้น `https://uat.csf.co.th` ก่อนสลับขึ้นโดเมนหลัก `www.csf.co.th`
   - **ระบบจัดการใบขอราคา CRM & ไฟล์แนบ (`/office/inquiries`)**: รองรับลูกค้าแนบเอกสาร PDF, JPEG, PNG, Excel, Word, PowerPoint และเชื่อม LINE ID กับ LINE OA บริษัท
   - **ติดโค้ด Analytics & Facebook Tag (`/office/tracking`)**: ตั้งค่า Google Analytics 4 (GA4), Google Tag Manager (GTM), Facebook Pixel และโค้ดสคริปต์กำหนดเองใน `<head>` / `<body>`
   - **ศูนย์ควบคุมความปลอดภัย (`/office/security`)**: ระบบป้องกัน 10 ชั้น (`HttpOnly` JWT Cookie, Brute-Force Lockout, Magic-Byte File Inspection, CSRF Guard, Scanner Trap บล็อก `/admin` & `/wp-admin`), บันทึก Security Audit Logs และฟอร์มเปลี่ยนรหัสผ่าน
   - **ตั้งค่าข้อมูลบริษัท (`/office/settings`)**: แก้ไขชื่อบริษัท เลขผู้เสียภาษี ที่อยู่ เบอร์โทร เวลาทำการ และประวัติบริษัทแบบเรียลไทม์

3. **การเชื่อมต่อ LINE Official Account & Facebook (`/office/integrations`)**
   - **LINE Messaging API Webhook (`POST /api/webhooks/line`)**: รองรับการตรวจสอบ `X-Line-Signature` (HMAC-SHA256), ตอบกลับสเปกสินค้าอัตโนมัติในรูปแบบ **LINE Flex Message** เมื่อลูกค้าพิมพ์รหัส SKU, บันทึก Lead เข้า CRM และส่งแจ้งเตือนเข้ากลุ่มฝ่ายขายเมื่อมีลูกค้าขอใบเสนอราคาหน้าเว็บ
   - **Facebook Page & Messenger (`GET/POST /api/webhooks/facebook`)**: รองรับ `hub.verify_token` และ `X-Hub-Signature-256`, รับข้อความจาก Messenger เข้าสู่ระบบ CRM, โพสต์สินค้า/บทความขึ้นเพจผ่าน Graph API และรองรับ Facebook Pixel ID
   - **Interactive Webhook Simulator**: เครื่องมือจำลองการยิงข้อความลูกค้าและดูตัวอย่างการ์ดตอบกลับได้ทันทีในหน้าหลังบ้าน

---

## การติดตั้งขึ้นเซิร์ฟเวอร์จริง / UAT (`uat.csf.co.th` & `www.csf.co.th` + MariaDB `pacific_csfnuxt`)

1. **สร้างไฟล์ `.env` ที่โฟลเดอร์รากของโปรเจกต์บนเซิร์ฟเวอร์** *(ไฟล์ `.env` ถูกตั้งค่า `.gitignore` ไว้เพื่อไม่ให้รหัสผ่านฐานข้อมูลหลุดขึ้น GitHub)*:
```bash
cp .env.example .env
# แก้ไขค่า DB_PASSWORD ในไฟล์ .env โดยใส่เครื่องหมาย Single Quote '...' ครอบรหัสผ่านเพื่อรองรับอักขระพิเศษ (^ และ !)
```

2. **ติดตั้งแพ็กเกจ, เตรียมฐานข้อมูล MariaDB (`pacific_csfnuxt`), Build และรันด้วย PM2**:
```bash
npm install
npm run db:init      # สร้างตาราง 10 ตาราง และนำเข้าข้อมูลเริ่มต้นลงฐานข้อมูล pacific_csfnuxt อัตโนมัติ
npm run media:sync   # (ทางเลือก) ตรวจสอบ/ซิงก์ไฟล์มีเดียให้ครบในเครื่อง 100%
npm run build
pm2 start ecosystem.config.cjs
pm2 save
```
*(หมายเหตุ: สามารถ Import ไฟล์ `database/seed.sql` เข้าสู่ฐานข้อมูล `pacific_csfnuxt` ผ่าน phpMyAdmin ได้โดยตรงเช่นกัน เพราะตัดคำสั่ง `CREATE DATABASE` ออกแล้ว รองรับสิทธิ์ User ของ Hosting ทุกประเภท)*

## การรันในโหมดพัฒนา (Local Development)

```bash
npm install
# หากมีเซิร์ฟเวอร์ MariaDB รันอยู่แล้ว สามารถรันคำสั่งสร้างตารางได้ด้วย:
npm run db:init

# รัน Nuxt Dev Server (หากยังไม่เชื่อม MariaDB ระบบจะสลับใช้ SQL Compatibility Store ให้อัตโนมัติ และสามารถกดส่งออกไฟล์ .sql สำหรับ MariaDB ได้จากหน้า /office/database)
npm run dev
```
