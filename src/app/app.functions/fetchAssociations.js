const axios = require("axios");

exports.main = async (context = {}, sendResponse) => {
  const { hs_object_id } = context.propertiesToSend;
  const PRIVATE_APP_TOKEN = process.env["PRIVATE_APP_ACCESS_TOKEN"];

  try {
    const { data } = await fetchAssociations(query, PRIVATE_APP_TOKEN, hs_object_id);

    return data;
  } catch (e) {
    return e;
  }
};

const fetchAssociations = (query, token, id) => {
  const body = {
    operationName: "data",
    query,
    variables: { id: id },
  };

  return axios.post("https://api.hubapi.com/collector/graphql", JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
};

const query = `
  query data ($id: String!) {
    CRM {
      contact(uniqueIdentifier: "id", uniqueIdentifierValue: $id) {
        associations {
          p_account_object_collection__individual_account {
            total
            items {
              hs_object_id
              account_number
              account_type
              currency
            }
          }
        }
      }
    }
  }
`;
