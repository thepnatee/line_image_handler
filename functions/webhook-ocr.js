const line = require('./line.util');
const util = require('./util');
const firebase = require('./firebase.util');
const messages = require('./message');
const functions = require("firebase-functions");

/* 1. Webhook tesseract OCR */
exports.tesseractOCR = functions.region("asia-northeast1").https.onRequest(async (req, res) => {


    if (req.method !== "POST") {
        return res.send(req.method);
    }

    if (!line.verifySignature(req.headers["x-line-signature"], req.body)) {
        return res.status(401).send("Unauthorized");
    }

    const events = req.body.events
    for (const event of events) {
        /* Using LINE Group Only */
        if (event.source.type !== "group") {
            return res.end();
        }

        /*🔥 1. Join to Chat Group 🔥
        https://developers.line.biz/en/reference/messaging-api/#join-event
        */
        if (event.type === "join") {
            await line.reply(event.replyToken, [messages.welcomeMessage()])
            return res.end();
        }


        /* 🔥 2. Member Joined to Chat Group 🔥
        https://developers.line.biz/en/reference/messaging-api/#member-joined-event
        }*/
        if (event.type === "memberJoined") {
            for (let member of event.joined.members) {
                if (member.type === "user") {
                    /* ✅ 2.1 [memberJoined] reply util.reply(event.replyToken,[messages.welcomeMessage()]) */
                    await line.reply(event.replyToken, [messages.memberJoinedMessage(profile.data.displayName, event.source.groupId)])
                }
            }
            return res.end();
        }


        /* 🔥 3. Event Message is image 🔥
       https://developers.line.biz/en/reference/messaging-api/#webhook-event-objects
        }*/
        if (event.type === "message" && event.message.type === 'image') {

            /* ✅ 3.1 Get Content By API  
            https://developers.line.biz/en/reference/messaging-api/#get-content
            */
            const binary = await line.getContent(event.message.id)


            /* ✅ 3.2 Upload Firebase Storage Bucket -> Convert binary  to Medie file  */
            const publicUrl = await firebase.saveImageToStorage(event.message, event.source.groupId, binary)

            /* ✅ 3.3 Get Content OCR  */
            const responseOCR = await util.getDataOCR(publicUrl)

            console.log("--")
            console.log(responseOCR)
            console.log("--")

            /* Demo Get Time and Currency  */
            const time = await util.getTimeOCR(responseOCR)
            const sum = await util.getCurrencyOCR(responseOCR)
            const textSlip = "วันที่ : " + time + "\n ยอดเงิน: " + await util.formatCurrency(sum)

            /* ✅ 3.3 Insert Object to Firestore  */
            await firebase.insertImageGroup(event.source.groupId, event.message.id, publicUrl)

            // /* ✅ 3.4 Reply View album  */
            await line.reply(event.replyToken, [messages.imageView(textSlip, event.message.id, publicUrl)])

            return res.end();
        }


        /* 🔥 4. Leave From Chat Group 🔥
        https://developers.line.biz/en/reference/messaging-api/#leave-event
        */
        if (event.type === "leave") {
            await firebase.deleteGroup(event.source.groupId)
            return res.end();
        }


    }

    return res.send(req.method);
});

/* 2. azure cognitiveservices-computervision */
exports.azureComputerVision = functions.region("asia-northeast1").https.onRequest(async (req, res) => {


    if (req.method !== "POST") {
        return res.send(req.method);
    }


    if (!line.verifySignature(req.headers["x-line-signature"], req.body)) {
        return res.status(401).send("Unauthorized");
    }

    const events = req.body.events
    for (const event of events) {
        /* Using LINE Group Only */
        if (event.source.type !== "group") {
            return res.end();
        }

        /*🔥 1. Join to Chat Group 🔥
        https://developers.line.biz/en/reference/messaging-api/#join-event
        */
        if (event.type === "join") {
            await line.reply(event.replyToken, [messages.welcomeMessage()])
            return res.end();
        }


        /* 🔥 2. Member Joined to Chat Group 🔥
        https://developers.line.biz/en/reference/messaging-api/#member-joined-event
        }*/
        if (event.type === "memberJoined") {
            for (let member of event.joined.members) {
                if (member.type === "user") {
                    /* ✅ 2.1 [memberJoined] reply util.reply(event.replyToken,[messages.welcomeMessage()]) */
                    await line.reply(event.replyToken, [messages.text(JSON.stringify(responseOCR)), messages.memberJoinedMessage(profile.data.displayName, event.source.groupId)])
                }
            }
            return res.end();
        }


        /* 🔥 3. Event Message is image 🔥
       https://developers.line.biz/en/reference/messaging-api/#webhook-event-objects
        }*/
        if (event.type === "message" && event.message.type === 'image') {

            /* ✅ 3.1 Get Content By API  
            https://developers.line.biz/en/reference/messaging-api/#get-content
            */
            const binary = await line.getContent(event.message.id)


            /* ✅ 3.2 Upload Firebase Storage Bucket -> Convert binary  to Medie file  */
            const publicUrl = await firebase.saveImageToStorage(event.message, event.source.groupId, binary)
            /* ✅ 3.3 Get Content OCR  */
            const responseOCR = await util.analyzeImageAzuerAI(publicUrl)
            console.log("--")
            console.log(responseOCR)
            console.log("--")

            /* ✅ 3.4 Insert Object to Firestore  */
            await firebase.insertImageGroup(event.source.groupId, event.message.id, publicUrl)

            /* ✅ 3.5 Reply View album  */
            await line.reply(event.replyToken, [messages.text(JSON.stringify(responseOCR))])

            return res.end();
        }


        /* 🔥 4. Leave From Chat Group 🔥
        https://developers.line.biz/en/reference/messaging-api/#leave-event
        */
        if (event.type === "leave") {
            await firebase.deleteGroup(event.source.groupId)
            return res.end();
        }


    }

    return res.send(req.method);
});

/* 3. google vision */
exports.googleVision = functions.region("asia-northeast1").https.onRequest(async (req, res) => {


    if (req.method !== "POST") {
        return res.send(req.method);
    }


    if (!line.verifySignature(req.headers["x-line-signature"], req.body)) {
        return res.status(401).send("Unauthorized");
    }

    const events = req.body.events
    for (const event of events) {
        /* Using LINE Group Only */
        if (event.source.type !== "group") {
            return res.end();
        }

        /*🔥 1. Join to Chat Group 🔥
        https://developers.line.biz/en/reference/messaging-api/#join-event
        */
        if (event.type === "join") {
            await line.reply(event.replyToken, [messages.welcomeMessage()])
            return res.end();
        }


        /* 🔥 2. Member Joined to Chat Group 🔥
        https://developers.line.biz/en/reference/messaging-api/#member-joined-event
        }*/
        if (event.type === "memberJoined") {
            for (let member of event.joined.members) {
                if (member.type === "user") {
                    /* ✅ 2.1 [memberJoined] reply util.reply(event.replyToken,[messages.welcomeMessage()]) */
                    await line.reply(event.replyToken, [messages.text(JSON.stringify(responseOCR)), messages.memberJoinedMessage(profile.data.displayName, event.source.groupId)])
                }
            }
            return res.end();
        }


        /* 🔥 3. Event Message is image 🔥
       https://developers.line.biz/en/reference/messaging-api/#webhook-event-objects
        }*/
        if (event.type === "message" && event.message.type === 'image') {

            /* ✅ 3.1 Get Content By API  
            https://developers.line.biz/en/reference/messaging-api/#get-content
            */
            const binary = await line.getContent(event.message.id)


            /* ✅ 3.2 Upload Firebase Storage Bucket -> Convert binary  to Medie file  */
            const publicUrl = await firebase.saveImageToStorage(event.message, event.source.groupId, binary)

            /* ✅ 3.3 Get Content OCR  */
            const responseOCR = await util.processImageGoogleVision("https://firebasestorage.googleapis.com/v0/b/line-bucket.appspot.com/o/C2a1dcb7e0327cb48bd7fd83bc8dcb683%2F2023-04-23%2FmessageImage_1682837519942.jpg?alt=media&token=3f69b0bb-42f6-47a8-97fc-da98aaa70f0d")
            console.log("--")
            console.log(responseOCR)
            console.log("--")
            const time = await util.getTimeOCR(responseOCR)
            const sum = await util.getCurrencyOCR(responseOCR)

            const textSlip = "วันที่ : " + time + "\n ยอดเงิน: " + await util.formatCurrency(sum)
            /* ✅ 3.4 Insert Object to Firestore  */
            await firebase.insertImageGroup(event.source.groupId, event.message.id, publicUrl)

            // /* ✅ 3.5 Reply View album  */
            await line.reply(event.replyToken, [messages.imageView(textSlip, event.message.id, publicUrl)])


            return res.end();
        }


        /* 🔥 4. Leave From Chat Group 🔥
        https://developers.line.biz/en/reference/messaging-api/#leave-event
        */
        if (event.type === "leave") {
            await firebase.deleteGroup(event.source.groupId)
            return res.end();
        }


    }

    return res.send(req.method);
});