const axios = require("axios");

exports.main = async (context = {}, sendResponse) => {
  const { hs_object_id } = context.propertiesToSend;
  const { ticketId, kycIds } = context.parameters;
  const PRIVATE_APP_TOKEN = process.env["PRIVATE_APP_ACCESS_TOKEN"];

  try {
    const ticketProperties = await ticketArray();

    const updateTicket = await cancelTicket(ticketProperties, ticketId, PRIVATE_APP_TOKEN);

    const kycProperties = await kycArray(kycIds);

    const updateKyc = await deleteKyc(kycProperties, PRIVATE_APP_TOKEN);

    return updateKyc.data;
  } catch (e) {
    return e;
  }
};

const cancelTicket = (properties, id, token) => {
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

const deleteKyc = (properties, token) => {
  return axios.post(
    "https://api.hubapi.com/crm/v3/objects/2-7231836/batch/archive",
    { inputs: properties },
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    }
  );
};

const kycArray = (kycIds) => {
  let properties = kycIds.map((n) => ({
    id: n,
  }));

  return properties;
};

const ticketArray = () => {
  let properties = {
    hs_pipeline_stage: "103949237",
    ticket_status_options: "Cancelled",
    cancelled_by: "147544330",
  };

  return properties;
};
