const axios = require("axios");

exports.main = async (context = {}, sendResponse) => {
  const { hs_object_id } = context.propertiesToSend;
  const { formProperties, kycId } = context.parameters;
  const PRIVATE_APP_TOKEN = process.env["PRIVATE_APP_ACCESS_TOKEN"];

  try {
    const updateKyc = await updateKycProperties(formProperties, kycId, PRIVATE_APP_TOKEN);

    return formProperties;
  } catch (e) {
    return e;
  }
};

const updateKycProperties = (properties, id, token) => {
  return axios.patch(
    `https://api.hubapi.com/crm/v3/objects/2-7231836/${id}`,
    { properties: properties },
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    }
  );
};
