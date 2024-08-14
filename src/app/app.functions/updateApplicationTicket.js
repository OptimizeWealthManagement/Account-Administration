const axios = require("axios");

exports.main = async (context = {}, sendResponse) => {
  const { hs_object_id } = context.propertiesToSend;
  const { ticketId, ticketStatus } = context.parameters;
  const PRIVATE_APP_TOKEN = process.env["PRIVATE_APP_ACCESS_TOKEN"];

  const properties = {
    hs_pipeline_stage: ticketStatus,
    ticket_status_options: "Pending AR Review",
  };

  try {
    const { data } = await updateApplicationTicket(properties, ticketId, PRIVATE_APP_TOKEN);

    return data;
  } catch (e) {
    return e;
  }
};

const updateApplicationTicket = (properties, id, token) => {
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
