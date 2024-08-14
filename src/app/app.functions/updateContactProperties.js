const axios = require("axios");

exports.main = async (context = {}, sendResponse) => {
  const { hs_object_id } = context.propertiesToSend;
  const { formProperties } = context.parameters;
  const PRIVATE_APP_TOKEN = process.env["PRIVATE_APP_ACCESS_TOKEN"];

  try {
    const update = await updateProperties(formProperties, hs_object_id, PRIVATE_APP_TOKEN);

    return update.data;
  } catch (e) {
    return e;
  }
};

const updateProperties = (properties, id, token) => {
  return axios.patch(
    `https://api.hubapi.com/crm/v3/objects/contacts/${id}`,
    { properties: properties },
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    }
  );
};
