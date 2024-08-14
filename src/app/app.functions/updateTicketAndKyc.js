const axios = require("axios");

exports.main = async (context = {}, sendResponse) => {
  const { hs_object_id } = context.propertiesToSend;
  const { formProperties, ticketId, kycIds } = context.parameters;
  const PRIVATE_APP_TOKEN = process.env["PRIVATE_APP_ACCESS_TOKEN"];

  try {
    const updateTicket = await updateTicketProperties(formProperties, ticketId, PRIVATE_APP_TOKEN);

    const kycProperties = await kycArray(kycIds, formProperties);

    const updateKyc = await updateKycProperties(kycProperties, PRIVATE_APP_TOKEN);

    return updateKyc.data;
  } catch (e) {
    return e;
  }
};

const updateTicketProperties = (properties, id, token) => {
  return axios.patch(
    `https://api.hubapi.com/crm/v3/objects/tickets/${id}`,
    { properties: properties },
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    }
  );
};

const updateKycProperties = (properties, token) => {
  return axios.post(
    "https://api.hubapi.com/crm/v3/objects/2-7231836/batch/update",
    { inputs: properties },
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    }
  );
};

const kycArray = (kycIds, existingProperties) => {
  let properties = kycIds.map((n) => ({
    properties: {
      ...existingProperties,
    },
    id: n,
  }));

  return properties;
};
