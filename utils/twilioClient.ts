import twilioClient from '../config/twilio-config';

const smsMessage = async (mobile_number: string, message: string) => {
  const config = await twilioClient();
  const phoneNumber = process.env.TWILIO_PHONE_NO;

  await config.messages.create({
    body: message,
    from: phoneNumber,
    to: mobile_number,
  });
};

export default smsMessage;
