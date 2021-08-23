import twilio from "twilio";

const accountSid = <string>process.env.TWILIO_ACCOUNT_SID;
const authToken = <string>process.env.TWILIO_AUTH_TOKEN;
const fromNumber = <string>process.env.TWILIO_FROM_NUMBER;
const client = twilio(accountSid, authToken);

async function SendText(code: number, toNumber: string) {
   try {
      const msg = {
         body: `Here is your Darkstar verification code: ${code}`,
         from: fromNumber,
         to: toNumber,
      };
      await client.messages.create(msg);
      return;
   } catch (err) {
      throw Error(err.message);
   }
}

export default SendText;
