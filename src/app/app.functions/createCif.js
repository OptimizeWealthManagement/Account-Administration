const axios = require("axios");

exports.main = async (context = {}, sendResponse) => {
  const { hs_object_id } = context.propertiesToSend;
  const { ticketId } = context.parameters;

  try {
    const { data } = await createCif(ticketId);

    return data;
  } catch (e) {
    console.log(e);
    return e;
  }
};

const createCif = (properties) => {
  return axios.post(
    `https://ww37qk2ywmnuieffxhzhclawjq0rhwcx.lambda-url.ca-central-1.on.aws/?ticketId=${properties}`,
    {},
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
