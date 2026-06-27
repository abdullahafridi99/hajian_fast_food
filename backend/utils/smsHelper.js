const https = require('https');
const querystring = require('querystring');

/**
 * Formats a Pakistani phone number to E.164 format for Twilio (e.g. 03001234567 -> +923001234567)
 * @param {string} phone - The 11-digit Pakistani phone number
 * @returns {string} The formatted phone number
 */
const formatPhoneForTwilio = (phone) => {
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
 * Sends an OTP SMS via Twilio if environment variables are set.
 * Falls back to console simulation if variables are missing.
 * @param {string} toPhone - Recipient phone number (e.g. 03001234567)
 * @param {string} otp - The 6-digit OTP code to send
 * @returns {Promise<boolean>}
 */
const sendSMS = async (toPhone, otp) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.TWILIO_PHONE_NUMBER;

  const formattedTo = formatPhoneForTwilio(toPhone);
  const messageBody = `Your Hajian Foods verification code is: ${otp}. Valid for 5 minutes.`;

  // Check if Twilio is configured
  if (!accountSid || !authToken || !fromPhone) {
    console.log(`\n-----------------------------------------------\n[SMS SIMULATION] Sent OTP: ${otp} to ${toPhone} (${formattedTo})\n(To send real messages, add TWILIO credentials to backend .env file)\n-----------------------------------------------\n`);
    return true;
  }

  return new Promise((resolve) => {
    const postData = querystring.stringify({
      To: formattedTo,
      From: fromPhone,
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
          console.log(`[SMS SUCCESS] Twilio sent OTP ${otp} to ${formattedTo}`);
          resolve(true);
        } else {
          console.error(`[SMS ERROR] Twilio failed with status ${res.statusCode}: ${data}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.error(`[SMS ERROR] Native HTTPS request failed: ${err.message}`);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
};

module.exports = { sendSMS };
