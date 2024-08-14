const axios = require("axios");

exports.main = async (context = {}, sendResponse) => {
  const { hs_object_id } = context.propertiesToSend;
  const { tId } = context.parameters;
  const PRIVATE_APP_TOKEN = process.env["PRIVATE_APP_ACCESS_TOKEN"];

  const ticket = tId;

  try {
    const { data } = await kycs(query, PRIVATE_APP_TOKEN, ticket);

    return data;
  } catch (e) {
    return e;
  }
};

const kycs = (query, token, id) => {
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
        hs_object_id
        hs_pipeline_stage
        application_type
        bank_name
        bank_institution_number
        bankaccountnumber
        bank_transit_number
        bank_address
        bank_city
        bank_province
        bank_postal_code
        verification_method
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
        verified_by
        verification_date
        id_type
        id_number
        id_expiry
        id_province_state
        id_country
        bank_name_2
        bank_institution_number_2
        bankaccountnumber_2
        bank_transit_number_2
        bank_address_2
        bank_city_2
        bank_province_2
        bank_postal_code_2
        bank_name_entity
        bank_institution_number_entity
        bankaccountnumber_entity
        bank_transit_number_entity
        bank_address_entity
        bank_city_entity
        bank_province_entity
        bank_postal_code_entity
        verification_method_2
        verified_by_2
        verification_date_2
        id_type_2
        id_number_2
        id_expiry_2
        id_province_state_2
        id_country_2
        ownership_type
        participant_or_estate
        participant_or_estate_allocation
        participant_or_estate_2
        participant_or_estate_allocation_2
        entity_type
        entity_type_details
        entity_name
        attention
        nature_of_business
        business_number
        date_of_incorporation
        place_of_incorporation
        entity_address
        entity_city
        entity_province
        entity_postal_code
        individual_1_role
        individual_2_role
        entity_income
        entity_cash
        entity_registered_investments
        entity_non_registered_investments
        entity_fixed_assets
        entity_mortgages_and_other_liabilities
        meeting_type
        meeting_location
        wp_present
        wp_name
        other_attendees_present
        other_attendees
        onboarding_documentation_delivery_method
        disclosures_provided
        family_office_services
        additional_questions_options
        additional_questions
        client_confirmations
        associations {
          p_kyc_collection__kyc_to_ticket {
            items {
              hs_object_id
              firstname
              lastname
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
              model_suitability
              does_anyone_other_than_the_client_have_any_financial_interest_in_this_account_
              other_than_optimize_inc___does_anyone_other_than_the_client_have_trading_authority_on_this_account_
              will_this_account_be_used_by_a_person_other_than_the_client_or_for_the_benefit_of_a_third_party_
              does_anyone_other_than_the_client_guarantee_this_account_
              do_you_trade_or_intend_to_trade_with_other_investment_firms_
              do_you_use_leverage_or_borrowing_to_finance_the_purchase_of_securities_
              employment_status
              date_of_birth
              employment_income
              disability_or_ei
              company_pension
              cpp_income
              oas_income
              investment_withdrawals
              bank_withdrawals
              other_income
              cash
              registered_investments
              non_registered_investments
              fixed_assets
              mortgages_and_other_liabilities
              other_assets
              other_investments
              beneficiary
              transfers
              firstname_secondary
              lastname_secondary
              investment_experience__secondary_account_holder_
              investment_knowledge__secondary_account_holder_
              intended_use_of_account__secondary_account_holder_
              source_of_funds__secondary_account_holder_
              risk_tolerance__secondary_account_holder_
              risk_capacity__secondary_account_holder_
              investment_objective__secondary_account_holder_
              time_horizon__secondary_account_holder_
              liquidity_needs__secondary_account_holder_
              employment_status__secondary_account_holder_
              date_of_birth__secondary_account_holder_
              employment_income_secondary
              disability_or_ei_secondary
              company_pension_secondary
              cpp_income_secondary
              oas_income_secondary
              investment_withdrawals_secondary
              bank_withdrawals_secondary
              other_income__secondary_account_holder_
              cash_secondary
              registered_investments__secondary_account_holder_
              non_registered_investments__secondary_account_holder_
              fixed_assets_secondary
              mortgages_and_other_liabilities_secondary
              other_assets__secondary_account_holder_
              other_investments__secondary_account_holder_
              entity_type
              entity_type_details
              entity_name
              attention
              nature_of_business
              business_number
              date_of_incorporation
              place_of_incorporation
              entity_address
              entity_city
              entity_province
              entity_postal_code
              individual_1_role
              individual_2_role
              entity_income
              entity_cash
              entity_registered_investments
              entity_non_registered_investments
              entity_fixed_assets
              entity_mortgages_and_other_liabilities
              legislation
              pension_fund_source
              model_overridden
              spouse_sin
              spouse_date_of_birth
              minimum_calculated_based_on
              spouse_email
            }
          }
        }
      }
    }
  }
`;
