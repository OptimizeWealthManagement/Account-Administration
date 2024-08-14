const axios = require("axios");
const hubspot = require("@hubspot/api-client");

function convertToPropertiesFormat(inputObject) {
  const propertiesArray = [];

  for (const key in inputObject) {
    if (inputObject.hasOwnProperty(key)) {
      propertiesArray.push({
        name: key,
        value: inputObject[key],
      });
    }
  }
  return { properties: propertiesArray };
}

exports.main = async (context = {}, sendResponse) => {
  try {
    const { hs_object_id } = context.propertiesToSend || {};
    const { form } = context.parameters || {};
    const { kycs } = context.parameters || {};
    const PRIVATE_APP_TOKEN = process.env["PRIVATE_APP_ACCESS_TOKEN"];
    var output = "";

    const conForm = convertToPropertiesFormat(form);

    // Check if there are any changes made to the form values and then update contact
    const hubspotClient = new hubspot.Client({ accessToken: PRIVATE_APP_TOKEN });
    const contactId = hs_object_id;

    try {
      const apiResponse = await hubspotClient.crm.contacts.basicApi.update(contactId, conForm);
      console.log(JSON.stringify(apiResponse, null, 2));
    } catch (e) {
      e.message === "HTTP request failed" ? console.error(JSON.stringify(e.response, null, 2)) : console.error(e);
    }

    // Check if there are any primary owner kycs and then update the kycs
    if (kycs.primary_account_holder.length >= 1) {
      output = output + "Yes Primary";
    }

    // Check if there are any secondary owner kycs and then update the kycs
    if (kycs.secondary_account_holder.length >= 1) {
      output = output + " Yes Secondary";
    }

    // Log the value of form
    return "output: " + JSON.stringify(conForm);
  } catch (error) {
    // If an error occurs, handle it and send an appropriate response
    return { status: "FAILURE", message: error.message };
  }
};
