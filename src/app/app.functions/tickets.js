const axios = require("axios");

exports.main = async (context = {}, sendResponse) => {
  const { hs_object_id } = context.propertiesToSend;
  const PRIVATE_APP_TOKEN = process.env["PRIVATE_APP_ACCESS_TOKEN"];

  try {
    const { data } = await tickets(query, PRIVATE_APP_TOKEN, hs_object_id);

    return data;
  } catch (e) {
    return e;
  }
};

const tickets = (query, token, id) => {
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
          ticket_collection__contact_to_ticket(limit: 1000, filter: {hs_pipeline__eq: "50936872", hs_pipeline_stage__neq: "103949237"}) {
            items {
              hs_object_id
              subject
              hs_pipeline_stage
              account_type_cad
              account_type_us
              bank_name
              bank_institution_number
              bankaccountnumber
              bank_transit_number
              bank_address
              bank_city
              bank_province
              bank_postal_code
              verification_method
              verified_by
              verification_date
              id_type
              id_number
              id_expiry
              id_province_state
              id_country
              second_id_type
              second_id_type_2
              secondary_verified_by
              secondary_verified_by_2
              secondary_verification_method
              secondary_verification_method_2
              secondary_verification_date
              secondary_verification_date_2
              secondary_id_number
              secondary_id_number_2
              secondary_id_expiry
              secondary_id_expiry_2
              secondary_id_province_state
              secondary_id_province_state_2
              secondary_id_country
              secondary_id_country_2
              ownership_type
              participant_or_estate
              participant_or_estate_allocation
              participant_or_estate_2
              participant_or_estate_allocation
              entity_type
              entity_type_details
            }
          }
          p_kyc_collection__individual_account_kyc(limit: 100) {
            items {
              hs_object_id
            }
          }
          p_kyc_collection__primary_account_holder_kyc(limit: 100) {
            items {
              hs_object_id
            }
          }
          p_kyc_collection__secondary_account_holder_kyc(limit: 100) {
            items {
              hs_object_id
            }
          }
        }
      }
    }
  }
`;
