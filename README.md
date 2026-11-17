# Web Game — Image-only Choices Update

ชุดนี้เปลี่ยนตัวเลือกคำตอบจากข้อความเป็นรูปภาพอย่างเดียว โดยคงหน้า Registration, Firebase และการบันทึกคะแนนของโปรเจกต์เดิมไว้

## ไฟล์ที่ต้องแทนที่ใน GitHub

1. `style.css` — แทนที่ไฟล์เดิมที่ Root ของ Repository
2. `js/app.js` — แทนที่ไฟล์เดิมในโฟลเดอร์ `js`

ไม่ต้องแทนที่ `index.html`, `js/firebase.js` หรือ `js/database.js` สำหรับการเปลี่ยนตัวเลือกเป็นรูปภาพ

## เปลี่ยนข้อมูลคำถามใน `js/game.js`

ตัวอย่างโครงสร้างอยู่ใน `examples/game.js.image-choice.example`

ใช้ `answers` เป็นรายการรูปภาพ 4 รูป เช่น:

```js
export const questions = [
  {
    question: "เลือกภาพที่ตรงกับคำตอบ",
    answers: [
      { image: "assets/images/choice-01.png", alt: "ตัวเลือกภาพที่ 1" },
      { image: "assets/images/choice-02.png", alt: "ตัวเลือกภาพที่ 2" },
      { image: "assets/images/choice-03.png", alt: "ตัวเลือกภาพที่ 3" },
      { image: "assets/images/choice-04.png", alt: "ตัวเลือกภาพที่ 4" }
    ],
    correctIndex: 2
  }
];
```

`correctIndex` เริ่มนับจาก 0: 0 คือรูปแรก, 1 คือรูปที่สอง, 2 คือรูปที่สาม และ 3 คือรูปที่สี่

ระบบยังรองรับการเขียน `answers` เป็น path string ได้ด้วย เช่น `"assets/images/choice-01.png"` แต่รูปแบบ object ที่มี `image` และ `alt` แนะนำกว่าเพื่อการเข้าถึง (accessibility)

## เพิ่มรูปภาพเข้า GitHub

สร้างโฟลเดอร์ `assets/images/` ที่ Root ของ Repository แล้วอัปโหลดรูปเข้าไป เช่น:

```text
web-game/
├── index.html
├── style.css
├── assets/
│   └── images/
│       ├── choice-01.png
│       ├── choice-02.png
│       ├── choice-03.png
│       └── choice-04.png
└── js/
    ├── app.js
    ├── database.js
    ├── firebase.js
    └── game.js
```

ข้อควรระวัง:
- ใช้ path แบบ `assets/images/choice-01.png` ไม่ต้องขึ้นต้นด้วย `/` เพื่อให้ทำงานบน GitHub Pages ที่ใช้ชื่อ Repository เป็น path ได้
- ชื่อตัวพิมพ์เล็ก/ใหญ่ต้องตรงกับชื่อไฟล์จริง เช่น `Choice-01.png` ไม่เหมือน `choice-01.png`
- แนะนำไฟล์ PNG, JPG หรือ WebP และปรับขนาดให้เหมาะกับการแสดงผลบนมือถือ
- รูปในตัวเลือกจะไม่มีข้อความกำกับบนหน้าจอ แต่มี `alt` สำหรับโปรแกรมอ่านหน้าจอ

## ติดตั้งบน GitHub

1. สำรองไฟล์เดิมไว้ก่อน
2. แทนที่ `style.css` และ `js/app.js` ตามตำแหน่งเดิม
3. แก้เนื้อหา `js/game.js` ให้ใช้ path รูปตามตัวอย่าง (อย่าแทนที่ไฟล์นี้โดยไม่สำรองคำถามเดิม)
4. อัปโหลดรูปภาพไปที่ `assets/images/`
5. Commit changes และรอ GitHub Pages เผยแพร่
6. เปิดเว็บแล้ว hard refresh ด้วย `Ctrl + Shift + R`

Firestore Rules และ Firebase Configuration ไม่ต้องเปลี่ยนสำหรับฟังก์ชันตัวเลือกแบบรูปภาพนี้
