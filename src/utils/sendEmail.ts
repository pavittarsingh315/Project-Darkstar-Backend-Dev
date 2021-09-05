import sendgrid from "@sendgrid/mail";

const apiKey = <string>process.env.SENDGRID_API_KEY;
const sender = <string>process.env.SENDGRID_SENDER;
sendgrid.setApiKey(apiKey);

export async function SendRegistrationMail(receiverEmail: string, receiverName: string, code: number) {
   try {
      const msg = {
         to: receiverEmail,
         from: sender,
         templateId: "d-bccd2db8db3e4699b3e636b78bddb90e",
         dynamicTemplateData: {
            full_name: receiverName,
            verification_code: code,
         },
      };
      await sendgrid.send(msg);
      return;
   } catch (e) {
      let err = <Error>e;
      throw Error(err.message);
   }
}

export async function SendPasswordResetMail(receiverEmail: string, code: number) {
   try {
      const msg = {
         to: receiverEmail,
         from: sender,
         templateId: "d-7333e78a73e946638808809e4020df8b",
         dynamicTemplateData: {
            verification_code: code,
         },
      };
      await sendgrid.send(msg);
      return;
   } catch (e) {
      let err = <Error>e;
      throw Error(err.message);
   }
}
