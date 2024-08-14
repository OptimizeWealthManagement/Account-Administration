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
          p_account_object_collection__joint_account {
            total
            items {
              hs_object_id
              account_number
              account_type
              currency
            }
          }
          contact_collection__contact_to_contact {
            total
            items {
              hs_object_id
              firstname
              lastname
              phone
              mobilephone
              email
              date_of_birth
              marital_status_options
              secondary_first_name
              spouse_last_name
              employment_status_spouse
              employer_name_spouse
              occupation_spouse
              not_employed_reason_spouse
              not_employed_reason_other_spouse
              years_until_retirement_spouse
              country_address
              address
              city
              province__state
              postal_code___zip_code
              number_of_dependants
              employment_status
              employer_name
              occupation
              is_this_account_a_pro_account_
              is_the_client_considered_a_reporting_insider_
              foreign_politically_exposed_person
              domestic_politically_exposed_person
              head_of_an_international_organization
              not_employed_reason
              not_employed_reason_other
              name_of_foreign_pep
              name_of_domestic_pep
              name_of_international_organization
              relationship_to_pep_foreign
              relationship_to_pep_domestic
              relationship_to_international_organization
              wealth_pep_foreign
              wealth_pep_domestic
              wealth_international_organization
              reporting_insider_symbol
              reporting_insider_company
              name_of_individual_cro
              employer_name_cro
              years_until_retirement
              employment_income
              disability_or_ei
              company_pension
              cpp_income
              oas_income
              bank_withdrawals
              investment_withdrawals
              other_income
              source_of_other_income
              cash
              registered_investments
              non_registered_investments
              fixed_assets
              mortgages_and_other_liabilities
              other_assets
              financial_institution
              type_of_other_investments
              other_investments
              investment_knowledge
              investment_experience
              vulnerable_client_
              trusted_contact_person
              trusted_contact_first_name
              trusted_contact_last_name
              trusted_contact_email
              trusted_contact_phone
              trusted_contact_address
              trusted_contact_city
              trusted_contact_province
              trusted_contact_postal_code
              canadian_citizen
              canadian_resident
              sin
              us_citizen
              us_resident
              ssn
              other_citizen
              citizenship
              resident_of_other_country
              country_of_residency
              tin
            }
          }
        }
      }
    }
  }
`;
