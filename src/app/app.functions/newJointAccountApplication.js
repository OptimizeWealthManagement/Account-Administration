const axios = require("axios");

exports.main = async (context = {}, sendResponse) => {
  const { hs_object_id } = context.propertiesToSend;
  const { formProperties, contactKycProperties, jointAccountId } = context.parameters;
  const PRIVATE_APP_TOKEN = process.env["PRIVATE_APP_ACCESS_TOKEN"];

  try {
    const ticketToContact = await ticketToContactAssociations(hs_object_id, jointAccountId);

    const contact = await createTicket(formProperties, ticketToContact, PRIVATE_APP_TOKEN);

    const ticketId = contact.data.id;

    if (formProperties.account_type_cad !== undefined && formProperties.account_type_cad !== "") {
      const kycToContactTicketCAD = await kycAssociationCAD(
        formProperties.account_type_cad,
        hs_object_id,
        ticketId,
        contactKycProperties,
        jointAccountId
      );

      const kycCAD = await createKYC(kycToContactTicketCAD, PRIVATE_APP_TOKEN);
    }

    if (formProperties.account_type_us !== undefined && formProperties.account_type_us !== "") {
      const kycToContactTicketUS = await kycAssociationUS(
        formProperties.account_type_us,
        hs_object_id,
        ticketId,
        contactKycProperties,
        jointAccountId
      );

      const kycUS = await createKYC(kycToContactTicketUS, PRIVATE_APP_TOKEN);
    }

    return ticketId;
  } catch (e) {
    return e;
  }
};

const createTicket = (properties, associations, token) => {
  return axios.post(
    "https://api.hubapi.com/crm/v3/objects/tickets",
    { properties, associations },
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    }
  );
};

const ticketToContactAssociations = (toId, jointId) => {
  let result = [
    {
      to: {
        id: toId,
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
        id: jointId,
      },
      types: [
        {
          associationCategory: "HUBSPOT_DEFINED",
          associationTypeId: 16,
        },
      ],
    },
  ];

  return result;
};

const kycAssociationCAD = (accounts, contactId, ticketId, existingProperties, jointId) => {
  let list = accounts.split(";");

  let properties = list.map((n) => ({
    properties: {
      ...existingProperties,
      type: "Joint",
      account_type: n,
      currency: "CAD",
    },
    associations: [
      {
        to: {
          id: contactId, // Associate KYCs to contact
        },
        types: [
          {
            associationCategory: "USER_DEFINED",
            associationTypeId: 307,
          },
          {
            associationCategory: "USER_DEFINED",
            associationTypeId: 313,
          },
          {
            associationCategory: "USER_DEFINED",
            associationTypeId: 333,
          },
        ],
      },
      {
        to: {
          id: jointId, // Associate KYCs to contact
        },
        types: [
          {
            associationCategory: "USER_DEFINED",
            associationTypeId: 307,
          },
          {
            associationCategory: "USER_DEFINED",
            associationTypeId: 315,
          },
          {
            associationCategory: "USER_DEFINED",
            associationTypeId: 333,
          },
        ],
      },
      {
        to: {
          id: ticketId, // Associate KYCs to ticket
        },
        types: [
          {
            associationCategory: "USER_DEFINED",
            associationTypeId: 327,
          },
        ],
      },
    ],
  }));

  return properties;
};

const kycAssociationUS = (accounts, contactId, ticketId, existingProperties, jointId) => {
  let list = accounts.split(";");
  let properties = list.map((n) => ({
    properties: {
      ...existingProperties,
      type: "Joint",
      account_type: n,
      currency: "USD",
    },
    associations: [
      {
        to: {
          id: contactId, // Associate KYCs to contact
        },
        types: [
          {
            associationCategory: "USER_DEFINED",
            associationTypeId: 307,
          },
          {
            associationCategory: "USER_DEFINED",
            associationTypeId: 313,
          },
          {
            associationCategory: "USER_DEFINED",
            associationTypeId: 333,
          },
        ],
      },
      {
        to: {
          id: jointId, // Associate KYCs to contact
        },
        types: [
          {
            associationCategory: "USER_DEFINED",
            associationTypeId: 307,
          },
          {
            associationCategory: "USER_DEFINED",
            associationTypeId: 315,
          },
          {
            associationCategory: "USER_DEFINED",
            associationTypeId: 333,
          },
        ],
      },
      {
        to: {
          id: ticketId, // Associate KYCs to ticket
        },
        types: [
          {
            associationCategory: "USER_DEFINED",
            associationTypeId: 327,
          },
        ],
      },
    ],
  }));

  return properties;
};

const createKYC = (properties, token) => {
  return axios.post(
    "https://api.hubapi.com/crm/v3/objects/2-7231836/batch/create",
    { inputs: properties },
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    }
  );
};
