KidsDo Architecture
Project Goal
KidsDo เป็นเว็บไซต์ศูนย์กลางสำหรับสมาชิก ใช้สำหรับ

คลังเพลง
คลังภาพ
คลังเอกสาร
ข่าวสารประชาสัมพันธ์
ปฏิทินกิจกรรม
ระบบสมาชิก
Technology Stack
Google Apps Script
Google Drive
Google Sheets
HTML
CSS
JavaScript
Current Problems
Priority 1 : Home Page Routing
Current Behavior
เมื่อเปิดเว็บไซต์ ระบบจะพาไปหน้า Admin Login ทันที

Expected Behavior
เมื่อเปิดเว็บไซต์

Home Page
↓
Public Website
↓
เลือกเมนูที่ต้องการ
↓
Login เมื่อจำเป็น
Goal
แสดงหน้าเว็บไซต์หลักก่อน
ผู้ใช้ทั่วไปสามารถเข้าชมเนื้อหาได้
Login เฉพาะส่วนสมาชิก
Priority 2 : Multi-Page Structure
Current Behavior
เมนูต่าง ๆ แสดงข้อมูลรวมอยู่ในหน้าเดียว

ตัวอย่าง

หน้าเดียว
├─ ข่าวสาร
├─ เพลง
├─ รูปภาพ
├─ เอกสาร
└─ สมาชิก
Expected Behavior
แยกเป็นหลายหน้าเว็บ

/
/news
/music
/gallery
/documents
/calendar
/member
/contact
Goal
แต่ละเมนูมี URL ของตัวเอง
โหลดเฉพาะข้อมูลที่เกี่ยวข้อง
ใช้งานง่ายขึ้น
รองรับการขยายระบบในอนาคต
File Structure
Code.js
หน้าที่

doGet()
include()
Routing
Entry Point ของระบบ
Auth.js
หน้าที่

login()
logout()
session management
Dashboard.js
หน้าที่

ระบบ Admin
Dashboard สำหรับผู้ดูแล
Files.js
หน้าที่

จัดการไฟล์
Google Drive Integration
Members.js
หน้าที่

จัดการสมาชิก
ข้อมูลสมาชิก
PublicPages.html
หน้าที่

หน้าเว็บไซต์สาธารณะ
หน้าหลักของผู้ใช้งานทั่วไป
Index.html
หน้าที่

Layout หลัก
Menu หลัก
UI หลักของเว็บไซต์
Planned Features
Phase 1
Fix Home Page Routing
Fix Public Website Access
Fix Navigation
Phase 2
Multi-Page Website
URL Routing
Phase 3
Comment System
Reply Comment
Comment History
Phase 4
Member Chat System
Public Chat Room
Private Chat Room
Phase 5
Notification System
New Content Notification
Message Notification
Event Notification
AI Team
AI ที่ช่วยพัฒนาโปรเจกต์

ChatGPT
Gemini
Claude
DeepSeek
Microsoft Copilot
Important Rules
AI ทุกตัวต้องปฏิบัติตาม

ห้ามรื้อโครงสร้าง Apps Script เดิม
แก้เฉพาะส่วนที่เกี่ยวข้องกับปัญหา
พยายามใช้ระบบเดิมให้มากที่สุด
รองรับ Google Drive และ Google Sheets
อธิบายผลกระทบก่อนแก้ไขโค้ดสำคัญ
ต้องสามารถ Commit ขึ้น GitHub ได้
Current Development Status
✅ Git Installed

✅ GitHub Connected

✅ Source Code Backup Completed

✅ README.md Created

✅ PROJECT.md Created

✅ AI_CONTEXT.md Created

✅ ARCHITECTURE.md Created

🔄 Waiting for Home Page Routing Fix