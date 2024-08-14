const axios = require("axios");

exports.main = async (context = {}, sendResponse) => {
  const { hs_object_id } = context.propertiesToSend;
  const { email } = context.parameters;
  const PRIVATE_APP_TOKEN = process.env["PRIVATE_APP_ACCESS_TOKEN"];

  try {
    // Fetch associations
    const { data } = await validateEmail(query, PRIVATE_APP_TOKEN, email);

    // Send the response data
    return data;
  } catch (e) {
    return e;
  }
};

const validateEmail = (query, token, email) => {
  const body = {
    operationName: "data",
    query,
    variables: { email: email },
  };

  return axios.post("https://api.hubapi.com/collector/graphql", JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
};

const query = `
  query data ($email: String!) {
    CRM {
      contact_collection(filter: {email__contains: $email}) {
        items {
          hs_object_id
        }
      }
    }
  }
`;
