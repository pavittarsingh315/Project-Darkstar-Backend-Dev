import sendgrid from "@sendgrid/mail";

const apiKey = <string>process.env.SENDGRID_API_KEY;
const sender = <string>process.env.SENDGRID_SENDER;
sendgrid.setApiKey(apiKey);

async function SendMail(receiverEmail: string, receiverName: string) {
   try {
      const msg = {
         to: receiverEmail,
         from: sender,
         templateId: "d-bccd2db8db3e4699b3e636b78bddb90e",
         dynamicTemplateData: {
            full_name: receiverName,
            verification_code: "945865",
         },
      };
      await sendgrid.send(msg);
      return;
   } catch (err) {
      throw Error(err.message);
   }
}

export default SendMail;
