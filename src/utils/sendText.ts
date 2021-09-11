import twilio from "twilio";

const accountSid = <string>process.env.TWILIO_ACCOUNT_SID;
const authToken = <string>process.env.TWILIO_AUTH_TOKEN;
const fromNumber = <string>process.env.TWILIO_FROM_NUMBER;
const client = twilio(accountSid, authToken);

export async function SendRegistrationText(code: number, toNumber: string) {
   try {
      const msg = {
         body: `Here is your Darkstar verification code: ${code}. Code expires in 5 minutes!`,
         from: fromNumber,
         to: toNumber,
      };
      await client.messages.create(msg);
      return;
   } catch (e) {
      let err = <Error>e;
      throw Error(err.message);
   }
}

export async function SendPasswordResetText(code: number, toNumber: string) {
   try {
      const msg = {
         body: `Here is your Darkstar password reset code: ${code}. Code expires in 5 minutes!`,
         from: fromNumber,
         to: toNumber,
      };
      await client.messages.create(msg);
      return;
   } catch (e) {
      let err = <Error>e;
      throw Error(err.message);
   }
}
