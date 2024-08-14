const axios = require("axios");

exports.main = async (context = {}, sendResponse) => {
  const { hs_object_id } = context.propertiesToSend;
  const { formProperties, oldTicketId, kycId } = context.parameters;
  const PRIVATE_APP_TOKEN = process.env["PRIVATE_APP_ACCESS_TOKEN"];

  try {
    const ticketToContactKycTicket = await ticketToContactKycTicketAssociations(hs_object_id, kycId);

    const bulkData = await getBulkData(formProperties, ticketToContactKycTicket);

    const transfer = await createTransferTicket(bulkData, PRIVATE_APP_TOKEN);

    const transferId = transfer.data.id;

    console.log("Transfer id: ", transferId);

    return transferId;
  } catch (e) {
    return e;
  }
};

const createTransferTicket = (properties, token) => {
  return axios.post(
    "https://api.hubapi.com/crm/v3/objects/tickets/batch/create",
    { inputs: properties },
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    }
  );
};

const getBulkData = (formProperties, ticketToContactKycTicket) => {
  let bulkData = formProperties.map((form) => {
    return {
      properties: {
        ...form,
      },
      associations: ticketToContactKycTicket,
    };
  });

  return bulkData;
};

const ticketToContactKycTicketAssociations = (toContactId, toKycId, toTicketId) => {
  let result = [
    {
      to: {
        id: toContactId,
      },
      types: [
        {
          associationCategory: "HUBSPOT_DEFINED",
          associationTypeId: 16,
        },
      ],
    },
    {
      to: {
        id: toKycId,
      },
      types: [
        {
          associationCategory: "USER_DEFINED",
          associationTypeId: 328,
        },
      ],
    },
  ];

  return result;
};
