import twilio from 'twilio';

const getTwilioConfig = async () => {
  const accountSID = process.env.TWILIO_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  const twilio_client = new twilio.Twilio(accountSID, authToken);

  return twilio_client;
};

export default getTwilioConfig;
