const axios = require("axios");

exports.main = async (context = {}, sendResponse) => {
  const { hs_object_id } = context.propertiesToSend;
  const { formProperties, ticketId } = context.parameters;
  const PRIVATE_APP_TOKEN = process.env["PRIVATE_APP_ACCESS_TOKEN"];

  try {
    const updateTicket = await updateTicketProperties(formProperties, ticketId, PRIVATE_APP_TOKEN);

    return updateTicket.data;
  } catch (e) {
    return formProperties;
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
