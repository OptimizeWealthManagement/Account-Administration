const axios = require("axios");

exports.main = async (context = {}, sendResponse) => {
  const { hs_object_id } = context.propertiesToSend;
  const { kycId } = context.parameters;
  const PRIVATE_APP_TOKEN = process.env["PRIVATE_APP_ACCESS_TOKEN"];

  try {
    const { data } = await refreshKyc(query, PRIVATE_APP_TOKEN, kycId);

    return data;
  } catch (e) {
    return e;
  }
};

const refreshKyc = (query, token, id) => {
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
      ticket(uniqueIdentifier: "id", uniqueIdentifierValue: $id) {
        associations {
          p_kyc_collection__kyc_to_ticket {
            items {
              hs_object_id
              type
              account_type
              currency
              investment_experience
              investment_knowledge
              intended_use_of_account
              source_of_funds
              risk_tolerance
              risk_capacity
              investment_objective
              time_horizon
              liquidity_needs
              assigned_model
              other_than_optimize_inc___does_anyone_other_than_the_client_have_trading_authority_on_this_account_
              will_this_account_be_used_by_a_person_other_than_the_client_or_for_the_benefit_of_a_third_party_
              does_anyone_other_than_the_client_guarantee_this_account_
              do_you_trade_or_intend_to_trade_with_other_investment_firms_
              do_you_use_leverage_or_borrowing_to_finance_the_purchase_of_securities_
              do_you_use_leverage_or_borrowing_to_finance_the_purchase_of_securities_
              employment_status
              date_of_birth
            }
          }
        }
      }
    }
  }
`;
