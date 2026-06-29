const https = require('https');
const querystring = require('querystring');

/**
 * Formats a phone number for Twilio E.164 (e.g. 03001234567 -> +923001234567)
 */
const formatPhoneForWhatsApp = (phone) => {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  if (cleanPhone.startsWith('0')) {
    return '+92' + cleanPhone.substring(1);
  }
  if (!cleanPhone.startsWith('+')) {
    return '+' + cleanPhone;
  }
  return cleanPhone;
};

/**
 * Sends a WhatsApp notification using Twilio WhatsApp API
 */
const sendWhatsAppNotification = async (order) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromWhatsApp = process.env.TWILIO_WHATSAPP_FROM || `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`;

  const formattedTo = formatPhoneForWhatsApp(order.phoneNumber);
  
  // Format items text
  const itemsText = order.items
    .map(item => `- ${item.name} (x${item.quantity}) - Rs. ${item.price}`)
    .join('\n');

  const messageBody = `🔔 *HAJIAN FOODS - Order Placed!*

Dear *${order.customerName}*, your order has been received and is being processed.

*📋 Order Details:*
- *Order ID:* ${order._id}
- *Items:* 
${itemsText}
- *Total Amount:* Rs. ${order.totalAmount}
- *Payment Method:* ${order.paymentMethod}
- *Delivery Address:* ${order.address}

We are preparing your hot meal. You can track your order status on our website!
📞 WhatsApp Support: wa.me/923001234567
Thank you for choosing Hajian Foods! 🍔🍕`;

  if (!accountSid || !authToken || !fromWhatsApp || fromWhatsApp === 'whatsapp:undefined') {
    console.log(`\n-----------------------------------------------\n[WHATSAPP SIMULATION] Sent Notification to ${order.phoneNumber} (whatsapp:${formattedTo})\nMessage:\n${messageBody}\n(To send real WhatsApp messages, add TWILIO credentials and TWILIO_WHATSAPP_FROM to backend .env file)\n-----------------------------------------------\n`);
    return true;
  }

  return new Promise((resolve) => {
    const postData = querystring.stringify({
      To: `whatsapp:${formattedTo}`,
      From: fromWhatsApp.startsWith('whatsapp:') ? fromWhatsApp : `whatsapp:${fromWhatsApp}`,
      Body: messageBody
    });

    const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const options = {
      hostname: 'api.twilio.com',
      port: 443,
      path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log(`[WHATSAPP SUCCESS] Twilio sent WhatsApp message to whatsapp:${formattedTo}`);
          resolve(true);
        } else {
          console.error(`[WHATSAPP ERROR] Twilio WhatsApp failed with status ${res.statusCode}: ${data}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.error(`[WHATSAPP ERROR] WhatsApp request failed: ${err.message}`);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
};

module.exports = { sendWhatsAppNotification };
