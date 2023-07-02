const firebase = require('./firebase.util');
const functions = require("firebase-functions");


 /* 1. API Get Image list  */
 exports.getImage = functions.region("asia-northeast1").https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        const doc = await firebase.getImage(req.query.groupId)
        return res.json(doc);
    })
});