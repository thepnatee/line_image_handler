const text = (text) => ({
  "type": "text",
  "text": text,
})

const welcomeMessage = () => ({
  "type": "text",
  "text": "สวัสดี ทุกคนมาเริ่มเก็บรูปด้วยน้อง ถังรูป กันเถอะะ \r\n\r\n เพียงแค่ส่งรูปและรอสักครู่น้องจะ เก็บรูป และ generate url ให้ ",
})

const memberJoinedMessage = (displayName) => ({
  "type": "text",
  "text": "สวัสดี " + displayName + " ผมชื่อน้องถังรูปนะ ขณะนี้ ผมกำลังรวมรูปภายในกลุ่ม \n\r\n\r เพียงแค่ส่งรูปและรอสักครู่ผมจะ เก็บรูป และ generate url ให้ ",
})

const imageView = (textSlip,publicUrl, imageId) => ({
  "type": "flex",
  "altText": imageId,
  "contents": {
    "type": "carousel",
    "contents": [{
      "type": "bubble",
      "body": {
        "type": "box",
        "layout": "vertical",
        "spacing": "sm",
        "contents": [{
          "type": "box",
          "layout": "baseline",
          "contents": [{
            "type": "text",
            "text": textSlip,
            "wrap": true,
            "weight": "bold",
            "size": "sm",
            "flex": 0
          }]
        }]
      },
      "footer": {
        "type": "box",
        "layout": "vertical",
        "spacing": "sm",
        "contents": [{
          "type": "button",
          "style": "primary",
          "action": {
            "type": "uri",
            "label": "เปิด รูป",
            "uri": `https://liff.line.me/1660794873-E1wxA2v9?groupId=${publicUrl}`
          }
        }]
      }
    }]
  }
})

module.exports = {
  welcomeMessage,
  memberJoinedMessage,
  imageView,
  text,
};