const axios = require('axios');
const tesseract = require("node-tesseract-ocr")
const vision = require('@google-cloud/vision');


exports.getDataOCR = async (imageUrl) => {

  const config = {
    lang: "tha+eng",
    oem: 1,
    psm: 3,
  }

  const docResponse = await tesseract.recognize(imageUrl, config)
  console.log("docResponse -> ", docResponse);
  return docResponse
};

exports.getCurrencyOCR = async (responseOCR) => {
  const dataOCR = responseOCR.replace(/[\r\n]/gm, '|').split(' ')
  let currency = 0
  dataOCR.forEach(element => {
    const elementSplit = element.split('|')
    elementSplit.forEach(doc => {
      if (doc) {
        var regex = /(?=.*\d)^\$?(([1-9]\d{0,2}(,\d{3})*)|0)?(\.\d{1,2})?$/;
        if (regex.test(doc) && doc.includes(".")) {
          const number = parseFloat(doc.replace(',', ''));
          if (!isNaN(number) && number < 10001) {
            currency += number

          }
        }
      }
    });

  });

  return currency
};

exports.getTimeOCR = async (responseOCR) => {
  const dataOCR = responseOCR.replace(/[\r\n]/gm, '|').split('|')
  let time = ''
  dataOCR.forEach(element => {
    const elementSplit = element.split('|')
    elementSplit.forEach(doc => {
      if (doc) {
        const regex = /\b([01][0-9]|2[0-3]):([0-5][0-9])\b/;
        if (regex.test(doc) && doc.includes(":")) {
          time = doc
        }
      }
    });
  });

  return time
};

exports.formatCurrency = async (number) => {
  const formatter = new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB'
  });

  return formatter.format(number);
};

exports.analyzeImageAzuerAI = async (imageUrl) => {

  let data = JSON.stringify({
    "url": imageUrl
  });

  const response = await axios.request({
    method: 'post',
    maxBodyLength: Infinity,
    url: process.env.AZURE_COGITIVE_SERVICES_ENDPOINT,
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': process.env.AZURE_COGITIVE_SERVICES_SUBSCRIPTION_KEY
    },
    data: data
  })
  let docResponse = []
  doc = response.data.regions
  doc.forEach(element => {
    element.lines.forEach(element => {
      element.words.forEach(element => {
        docResponse.push(element.text)
      });
    });
  });
  console.log("docResponse -> ", docResponse);
  return docResponse
};

exports.processImageGoogleVision = async (imageURL) => {
  const clientVision = new vision.ImageAnnotatorClient({
    keyFilename: 'config-vision.json'
  });
  const response = await axios.get(imageURL, {
    responseType: 'arraybuffer'
  });
  const imageBuffer = response.data;
  const [result] = await clientVision.textDetection(imageBuffer);
  const docResponse = result.textAnnotations[0].description
  console.log("docResponse -> ", docResponse.replace(/[\r\n]/gm, '|'));
  return docResponse
};