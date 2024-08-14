import type {
  AddAlertAction,
  Context,
  FetchCrmObjectPropertiesAction,
  ServerlessFuncRunner
} from '@hubspot/ui-extensions';

//Personal profile properties
export interface PersonalProperties {
  firstname: string;
  middlename: string;
  lastname: string;
  phone: string;
  mobilephone: string;
  email: string;
  date_of_birth: number;
  marital_status_options: string;
  secondary_first_name: string;
  spouse_middle_name: string;
  spouse_last_name: string;
  country_address: string;
  address: string;
  city: string;
  province__state: string;
  postal_code___zip_code: string;
  number_of_dependants: number;
  employment_status_spouse: string;
  employer_name_spouse: string;
  occupation_spouse: string;
  not_employed_reason_spouse: string;
  not_employed_reason_other_spouse: string;
  years_until_retirement_spouse: string;
  mailing_address_country: ArrayProps;
}

//Associated spouse record properties
export interface SpouseProperties {
  hs_object_id: number;
  firstname: string;
  middlename: string;
  lastname: string;
  employment_status: Array<ArrayProps>;
  employer_name: string;
  occupation: string;
  not_employed_reason: Array<ArrayProps>;
  not_employed_reason_other: string;
  years_until_retirement: number;
}

//Employment profile properties
export interface EmploymentProperties {
  employment_status: string;
  employer_name: string;
  occupation: string;
  is_this_account_a_pro_account_: string;
  is_the_client_considered_a_reporting_insider_: string;
  foreign_politically_exposed_person: string;
  domestic_politically_exposed_person: number;
  head_of_an_international_organization: string;
  not_employed_reason: string;
  not_employed_reason_other: string;
  name_of_foreign_pep: string;
  name_of_domestic_pep: string;
  name_of_international_organization: string;
  relationship_to_pep_foreign: string;
  relationship_to_pep_domestic: string;
  relationship_to_international_organization: string;
  wealth_pep_foreign: string;
  wealth_pep_domestic: string;
  wealth_international_organization: string;
  reporting_insider_symbol: string;
  reporting_insider_company: string;
  name_of_individual_cro: string;
  employer_name_cro: string;
  years_until_retirement: number;
}

//Financial profile properties
export interface FinancialProperties {
  employment_income: number;
  disability_or_ei: number;
  company_pension: number;
  cpp_income: number;
  oas_income: number;
  bank_withdrawals: number;
  investment_withdrawals: number;
  other_income: number;
  source_of_other_income: string;
  cash: number;
  registered_investments: number;
  non_registered_investments: number;
  fixed_assets: number;
  mortgages_and_other_liabilities: number;
  other_assets: string;
  financial_institution: string;
  other_investments: number;
  type_of_other_investments: string;
}

// Financial Information Form Properties
export interface FinancialFormProperties {
  employment_income: number;
  disability_or_ei: number;
  company_pension: number;
  cpp_income: number;
  oas_income: number;
  bank_withdrawals: number;
  investment_withdrawals: number;
  other_income: number;
  source_of_other_income: string;
  cash: number;
  registered_investments: number;
  non_registered_investments: number;
  fixed_assets: number;
  mortgages_and_other_liabilities: number;
  other_assets: string;
  financial_institution: string;
  other_investments: number;
  type_of_other_investments: string;
}

//Tax Residency profile properties
export interface TaxResidencyProperties {
  canadian_citizen: string;
  canadian_resident: string;
  sin: string;
  us_citizen: string;
  us_resident: string;
  ssn: string;
  other_citizen: string;
  resident_of_other_country: string;
  country_of_residency: string;
  has_tin: string;
  tin: string;
  reason_for_no_tin: string;
  citizenship: string;
}

//Tax Residency form properties
export interface TaxFormProperties {
  canadian_citizen: string;
  canadian_resident: string;
  sin: string;
  us_citizen: string;
  us_resident: string;
  ssn: string;
  other_citizen: string;
  resident_of_other_country: string;
  country_of_residency: string;
  has_tin: string;
  tin: string;
  reason_for_no_tin: string;
  citizenship: string;
}

// Financial Information Form Properties
export interface InvestorProperties {
  investment_knowledge: string;
  investment_experience: string;
  vulnerable_client_: string;
  vulnerable_client_details: string;
  trusted_contact_person: string;
  trusted_contact_first_name: string;
  trusted_contact_last_name: string;
  trusted_contact_email: string;
  trusted_contact_phone: string;
  trusted_contact_address: string;
  trusted_contact_city: string;
  trusted_contact_province: string;
  trusted_contact_postal_code: string;
}

// Financial Information Form Properties
export interface ApplicationFormProperties {
  application_type: string;
  root: string;
  account_type_cad: string;
  account_type_us: string;
  rep_id: string;
  new_or_existing_client_id: string;
  hs_pipeline_stage: string;
  hs_pipeline: string;
  hubspot_owner_id: string;
  subject: string;
  transition_pm: string; //matches property name on tickets
  advising_representative: string; //matches property name on tickets, kyc, and contact
}

// Financial Information Form Properties
export interface ContactKycProperties {
  investment_knowledge: string;
  investment_experience: string;
  employment_status: string;
  employer_name: string;
  occupation: string;
  hubspot_owner_id: string; // kyc_owner
  assigned_pm_test: string; //transition_pm
  advising_representative: string; // AR
  not_employed_reason: string;
  not_employed_reason_other: string;
  firstname: string;
  middlename: string;
  lastname: string;
  date_of_birth: number;
  phone: string; // phone_number
  mobilephone: string; // mobile_phone
  email: string;
  marital_status_options: string;
  number_of_dependants: number;
  secondary_first_name: string;
  spouse_middle_name: string;
  spouse_last_name: string;
  address: string; // street_address
  city: string;
  province__state: string; // province___state
  postal_code___zip_code: string;
  country_address: string;
  is_this_account_a_pro_account_: string;
  is_the_client_considered_a_reporting_insider_: string;
  foreign_politically_exposed_person: string;
  domestic_politically_exposed_person: string;
  head_of_an_international_organization: string;
  employment_income: number;
  disability_or_ei: number;
  company_pension: number;
  cpp_income: number;
  oas_income: number;
  bank_withdrawals: number;
  investment_withdrawals: number;
  other_income: number;
  source_of_other_income: string;
  cash: number;
  registered_investments: number;
  non_registered_investments: number;
  fixed_assets: number;
  mortgages_and_other_liabilities: number;
  other_assets: string;
  financial_institution: string;
  other_investments: number;
  type_of_other_investments: string;
  vulnerable_client: string;
  trusted_contact_person: string;
  trusted_contact_first_name: string;
  trusted_contact_last_name: string;
  trusted_contact_phone: string;
  trusted_contact_email: string;
  trusted_contact_address: string;
  trusted_contact_city: string;
  trusted_contact_province: string;
  trusted_contact_postal_code: string;
  canadian_citizen: string;
  canadian_resident: string;
  sin: string;
  us_citizen: string;
  us_resident: string;
  ssn: string;
  other_citizen: string;
  resident_of_other_country: string;
  citizenship: string;
  country_of_residency: string;
  tin: string;
  years_until_retirement: number;
  employment_status_spouse: string;
  employer_name_spouse: string;
  occupation_spouse: string;
  not_employed_reason_spouse: string;
  not_employed_reason_other_spouse: string;
  years_until_retirement_spouse: number;
}

// Financial Information Form Properties
export interface JointContactKycProperties {
  investment_knowledge: string;
  investment_experience: string;
  employment_status: string;
  employer_name: string;
  occupation: string;
  hubspot_owner_id: string; // kyc_owner
  assigned_pm_test: string; //transition_pm
  advising_representative: string; // AR
  not_employed_reason: string;
  not_employed_reason_other: string;
  firstname: string;
  middlename: string;
  lastname: string;
  date_of_birth: number;
  phone: string; // phone_number
  mobilephone: string; // mobile_phone
  email: string;
  marital_status_options: string;
  number_of_dependants: number;
  secondary_first_name: string;
  spouse_middle_name: string;
  spouse_last_name: string;
  address: string; // street_address
  city: string;
  province__state: string; // province___state
  postal_code___zip_code: string;
  country_address: string;
  is_this_account_a_pro_account_: string;
  is_the_client_considered_a_reporting_insider_: string;
  foreign_politically_exposed_person: string;
  domestic_politically_exposed_person: string;
  head_of_an_international_organization: string;
  employment_income: number;
  disability_or_ei: number;
  company_pension: number;
  cpp_income: number;
  oas_income: number;
  bank_withdrawals: number;
  investment_withdrawals: number;
  other_income: number;
  source_of_other_income: string;
  cash: number;
  registered_investments: number;
  non_registered_investments: number;
  fixed_assets: number;
  mortgages_and_other_liabilities: number;
  other_assets: string;
  financial_institution: string;
  other_investments: number;
  type_of_other_investments: string;
  trusted_contact_person: string;
  trusted_contact_first_name: string;
  trusted_contact_last_name: string;
  trusted_contact_phone: string;
  trusted_contact_email: string;
  trusted_contact_address: string;
  trusted_contact_city: string;
  trusted_contact_province: string;
  trusted_contact_postal_code: string;
  canadian_citizen: string;
  canadian_resident: string;
  sin: string;
  us_citizen: string;
  us_resident: string;
  ssn: string;
  other_citizen: string;
  resident_of_other_country: string;
  citizenship: string;
  country_of_residency: string;
  tin: string;
  years_until_retirement: number;
  employment_status_spouse: string;
  employer_name_spouse: string;
  occupation_spouse: string;
  not_employed_reason_spouse: string;
  not_employed_reason_other_spouse: string;
  years_until_retirement_spouse: number;
  // secondary props
  investment_knowledge__secondary_account_holder_: string;
  investment_experience__secondary_account_holder_: string;
  employment_status__secondary_account_holder_: string;
  employer_name__secondary_account_holder_: string;
  occupation__secondary_account_holder_: string;
  not_employed_reason_secondary: string;
  not_employed_reason_other_secondary: string;
  firstname_secondary: string;
  lastname_secondary: string;
  date_of_birth__secondary_account_holder_: number;
  phone_number__secondary_account_holder_: string; // phone_number
  mobile_phone_number__secondary_account_holder_: string; // mobile_phone
  email__secondary_account_holder_: string;
  marital_status_options_secondary: string;
  number_of_dependants__secondary_account_holder_: number;
  spouse_first_name_secondary: string;
  spouse_last_name_secondary: string;
  street_address__secondary_account_holder_: string; // street_address
  city__secondary_account_holder_: string;
  province___state__secondary_account_holder_: string; // province___state
  postal_code___zip_code__secondary_account_holder_: string;
  country__secondary_account_holder_: string;
  is_this_account_a_pro_account___secondary_account_holder_: string;
  is_the_client_considered_a_reporting_insider___secondary_account_holder_: string;
  foreign_politically_exposed_person__secondary_account_holder_: string;
  domestic_politically_exposed_person__secondary_account_holder_: string;
  head_of_an_international_organization__secondary_account_holder_: string;
  employment_income_secondary: number;
  disability_or_ei_secondary: number;
  company_pension_secondary: number;
  cpp_income_secondary: number;
  oas_income_secondary: number;
  bank_withdrawals_secondary: number;
  investment_withdrawals_secondary: number;
  cash_secondary: number;
  investable_assets_secondary: number;
  fixed_assets_secondary: number;
  mortgages_and_other_liabilities_secondary: number;
  vulnerable_client: string;
  trusted_contact_person_secondary: string;
  trusted_contact_first_name_secondary: string;
  trusted_contact_last_name_secondary: string;
  trusted_contact_phone_secondary: string;
  trusted_contact_email_secondary: string;
  trusted_contact_address_secondary: string;
  trusted_contact_city_secondary: string;
  trusted_contact_province_secondary: string;
  trusted_contact_postal_code_secondary: string;
  canadian_citizen_secondary: string;
  canadian_resident_secondary: string;
  sin__secondary_account_holder_: string;
  us_citizen_secondary: string;
  us_resident_secondary: string;
  ssn_secondary: string;
  other_citizen_secondary: string;
  other_resident_secondary: string;
  citizenship__secondary_account_holder_: string;
  country_of_residency_secondary: string;
  tin_secondary: string;
  years_until_retirement_secondary: number;
  employment_status_spouse__secondary_account_holder_: string;
  employer_name_spouse__secondary_account_holder_: string;
  occupation_spouse__secondary_account_holder_: string;
  not_employed_reason_spouse_secondary: string;
  not_employed_reason_other_spouse_secondary: string;
  years_until_retirement_spouse_secondary: number;
}

export interface JointAccountHolder {
  hs_object_id: number;
}

export interface JointAccountArray {
  items: Array<JointAccountHolder>;
}

//New interface for personal profile view
export interface PersonalProfileProps {
  fetchCrmObjectProperties: FetchCrmObjectPropertiesAction;
  context: Context;
  runServerless: ServerlessFuncRunner;
  onClick: () => void;
  onBackClick: () => void;
}

//New interface for personal profile view
export interface PersonalProfileTestProps {
  fetchCrmObjectProperties: FetchCrmObjectPropertiesAction;
  kycs: KycContactProps;
  context: Context;
  runServerless: ServerlessFuncRunner;
  onClick: () => void;
  onBackClick: () => void;
}

//New interface for employment profile view
export interface EmploymentProfileProps {
  fetchCrmObjectProperties: FetchCrmObjectPropertiesAction;
  context: Context;
  runServerless: ServerlessFuncRunner;
  onClick: () => void;
  onBackClick: () => void;
}

//New interface for financial profile view
export interface FinancialProfileProps {
  fetchCrmObjectProperties: FetchCrmObjectPropertiesAction;
  context: Context;
  runServerless: ServerlessFuncRunner;
  onClick: () => void;
  onBackClick: () => void;
}

//New interface for tax residency profile view
export interface TaxResidencyProfileProps {
  fetchCrmObjectProperties: FetchCrmObjectPropertiesAction;
  context: Context;
  runServerless: ServerlessFuncRunner;
  onClick: () => void;
  onBackClick: () => void;
}

//New interface for investor profile view
export interface InvestorProfileProps {
  fetchCrmObjectProperties: FetchCrmObjectPropertiesAction;
  context: Context;
  sendAlert: AddAlertAction;
  runServerless: ServerlessFuncRunner;
  onClick: () => void;
  onBackClick: () => void;
}

//New interface for new individual application view
export interface IndividualApplicationProps {
  fetchCrmObjectProperties: FetchCrmObjectPropertiesAction;
  context: Context;
  runServerless: ServerlessFuncRunner;
  onSubmit: () => void;
  onCancelClick: () => void;
}

//New interface for new joint application view
export interface JointApplicationProps {
  fetchCrmObjectProperties: FetchCrmObjectPropertiesAction;
  context: Context;
  runServerless: ServerlessFuncRunner;
  onSubmit: () => void;
  onCancelClick: () => void;
}

//New interface for new entity application view
export interface EntityApplicationProps {
  fetchCrmObjectProperties: FetchCrmObjectPropertiesAction;
  context: Context;
  runServerless: ServerlessFuncRunner;
  onSubmit: () => void;
  onCancelClick: () => void;
}

// New interface for ticket items of associated account applications
export interface TicketItemProps {
  id: number;
  name: string;
  // price: number;
  // kycs: Array<KYCItemProps>;
}

export interface TicketProps {
  ticket: Array<TicketItemProps>;
  onRemoveClick: (id: number) => void;
}

// New interface for kycs items associated to tickets
export interface KYCItemProps {
  id: number;
  type: string;
  account_type: string;
  currency: string;
}

// Define the interface for the Associated Accounts
export interface Accounts {
  hs_object_id: number;
  account_number: string;
  account_type: Array<AccountArrayProps>;
  currency: Array<AccountArrayProps>;
}

// Define the interface for the Associated Contacts
export interface Contacts {
  hs_object_id: number;
  firstname: string;
  lastname: string;
  phone: string;
  mobilephone: string;
  email: string;
  date_of_birth: number;
  marital_status_options: Array<ArrayProps>;
  secondary_first_name: string;
  spouse_last_name: string;
  employment_status_spouse: Array<ArrayProps>;
  employer_name_spouse: string;
  occupation_spouse: string;
  not_employed_reason_spouse: Array<ArrayProps>;
  not_employed_reason_other_spouse: string;
  years_until_retirement_spouse: number;
  country_address: Array<ArrayProps>;
  address: string;
  city: string;
  province__state: Array<ArrayProps>;
  postal_code___zip_code: string;
  number_of_dependants: number;
  employment_status: Array<ArrayProps>;
  employer_name: string;
  occupation: string;
  is_this_account_a_pro_account_: Array<ArrayProps>;
  is_the_client_considered_a_reporting_insider_: Array<ArrayProps>;
  foreign_politically_exposed_person: Array<ArrayProps>;
  domestic_politically_exposed_person: Array<ArrayProps>;
  head_of_an_international_organization: Array<ArrayProps>;
  not_employed_reason: Array<ArrayProps>;
  not_employed_reason_other: string;
  name_of_foreign_pep: string;
  name_of_domestic_pep: string;
  name_of_international_organization: string;
  relationship_to_pep_foreign: string;
  relationship_to_pep_domestic: string;
  relationship_to_international_organization: string;
  wealth_pep_foreign: string;
  wealth_pep_domestic: string;
  wealth_international_organization: string;
  reporting_insider_symbol: string;
  reporting_insider_company: string;
  name_of_individual_cro: string;
  employer_name_cro: string;
  years_until_retirement: number;
  employment_income: number;
  disability_or_ei: number;
  company_pension: number;
  cpp_income: number;
  oas_income: number;
  bank_withdrawals: number;
  investment_withdrawals: number;
  cash: number;
  investable_assets: number;
  fixed_assets: number;
  mortgages_and_other_liabilities: number;
  investment_knowledge: Array<ArrayProps>;
  investment_experience: Array<ArrayProps>;
  vulnerable_client_: Array<ArrayProps>;
  trusted_contact_person: Array<ArrayProps>;
  trusted_contact_first_name: string;
  trusted_contact_last_name: string;
  trusted_contact_email: string;
  trusted_contact_phone: string;
  trusted_contact_address: string;
  trusted_contact_city: string;
  trusted_contact_province: Array<ArrayProps>;
  trusted_contact_postal_code: string;
  canadian_citizen: Array<ArrayProps>;
  canadian_resident: Array<ArrayProps>;
  sin: number;
  us_citizen: Array<ArrayProps>;
  us_resident: Array<ArrayProps>;
  ssn: number;
  other_citizen: Array<ArrayProps>;
  resident_of_other_country: Array<ArrayProps>;
  country_of_residency: Array<ArrayProps>;
  tin: number;
}

// Define the interface for the Associated Accounts
export interface AccountArrayProps {
  label: string;
  value: string;
}

// Define the interface for the Association type
export interface AssociatedAccounts {
  total: number;
  // items: {
  //   hs_object_id: number;
  //   account_number: string;
  //   currency: string;
  //  }[];
  items: Array<Accounts>;
}

// Define the interface for the AssociationsGQL type
export interface AssociationsGQL {
  p_account_object_collection__investment_account_to_contact: AssociatedAccounts;
}

export interface RatingProps {
  value: number;
}

// NEW TICKET SELECTED PROPS
export interface Ticket {
  hs_object_id: number;
  subject: string;
  hs_pipeline_stage: string;
  account_type_cad: Array<ArrayProps>;
  account_type_us: Array<ArrayProps>;
  // Bank account props
  bank_name: string;
  bank_institution_number: string;
  bankaccountnumber: string;
  bank_transit_number: string;
  bank_address: string;
  bank_city: string;
  bank_province: Array<ArrayProps>;
  bank_postal_code: string;
  // Id props
  verification_method: Array<ArrayProps>;
  verified_by: string;
  verification_date: number;
  id_type: Array<ArrayProps>;
  id_number: string;
  id_expiry: number;
  id_province_state: string;
  id_country: string;
  // joint profile props
  ownership_type: Array<ArrayProps>;
  participant_or_estate: string;
  participant_or_estate_allocation: number;
  participant_or_estate_2: string;
  participant_or_estate_allocation_2: number;
}

// NEW TICKET SEARCH PROPS
export interface TicketsSearchProps {
  tickets: Array<Ticket>;
  onTicketClick: (id: number) => void;
  onApplicationClick: (id: number) => void;
}

// NEW TICKET TABLE PROPS
export interface TicketsTableProps {
  pageNumber: number;
  onPageChange: (pageNumber: number) => void;
  searchTerm: string;
  onClick: (id: number) => void;
  tickets: Array<Ticket>;
}

// New ticket item row props
export interface TicketRowProps {
  ticket: Ticket;
  onClick: () => void;
}

// NEW TICKET DETAIL PROPS
export interface TicketDetailProps {
  ticket: Ticket;
  context: Context;
  fetchCrmObjectProperties: FetchCrmObjectPropertiesAction;
  runServerless: ServerlessFuncRunner;
  onBackClick: () => void;
  sendAlert: AddAlertAction;
}

// NEW TFSA PROPS
export interface TfsaProps {
  kyc: Kyc;
  fetchCrmObjectProperties: FetchCrmObjectPropertiesAction;
  context: Context;
  runServerless: ServerlessFuncRunner;
  onBackClick: () => void;
  onSaveClick: () => void;
}

// NEW RRSP PROPS
export interface RrspProps {
  kyc: Kyc;
  fetchCrmObjectProperties: FetchCrmObjectPropertiesAction;
  context: Context;
  runServerless: ServerlessFuncRunner;
  onBackClick: () => void;
  onSaveClick: () => void;
}

// NEW RIF PROPS
export interface RifProps {
  kyc: Kyc;
  fetchCrmObjectProperties: FetchCrmObjectPropertiesAction;
  context: Context;
  runServerless: ServerlessFuncRunner;
  onBackClick: () => void;
  onSaveClick: () => void;
}

// NEW RESP PROPS
export interface RespProps {
  kyc: Kyc;
  fetchCrmObjectProperties: FetchCrmObjectPropertiesAction;
  context: Context;
  runServerless: ServerlessFuncRunner;
  onBackClick: () => void;
  onSaveClick: () => void;
}

// NEW RDSP PROPS
export interface RdspProps {
  kyc: Kyc;
  fetchCrmObjectProperties: FetchCrmObjectPropertiesAction;
  context: Context;
  runServerless: ServerlessFuncRunner;
  onBackClick: () => void;
  onSaveClick: () => void;
}

// NEW GENERAL ARRAY PROPS FOR CRM ENUMERATION PROPERTIES
export interface ArrayProps {
  value: string;
  label: string;
}

export interface KycAssociatedObjectProps {
  hs_object_id: number;
  subject: string;
  relinquishing_account_number: string;
}

export interface TicketsAssociatedToKycs {
  total: number;
  items: Array<TransferProps>;
}

export interface KycAssociatedObjectTypes {
  ticket_collection__kyc_to_ticket: TicketsAssociatedToKycs;
}

// CAMERON
export interface KycContactProps {
  primary_account_holder: Array<PrimaryKycProps>;
  secondary_account_holder: Array<SecondaryKycProps>;
}

export interface PrimaryKycProps {
  hs_object_id: number;
}

export interface SecondaryKycProps {
  hs_object_id: number;
}

// NEW KYC PROPERTIES
export interface Kyc {
  hs_object_id: number;
  type: ArrayProps;
  account_type: ArrayProps;
  currency: ArrayProps;
  investment_experience: ArrayProps;
  investment_knowledge: ArrayProps;
  intended_use_of_account: ArrayProps;
  source_of_funds: ArrayProps;
  risk_tolerance: ArrayProps;
  risk_capacity: ArrayProps;
  investment_objective: ArrayProps;
  time_horizon: ArrayProps;
  liquidity_needs: ArrayProps;
  assigned_model: ArrayProps;
  model_suitability: string;
  firstname: string;
  lastname: string;
  does_anyone_other_than_the_client_have_any_financial_interest_in_this_account_: ArrayProps;
  other_than_optimize_inc___does_anyone_other_than_the_client_have_trading_authority_on_this_account_: ArrayProps;
  will_this_account_be_used_by_a_person_other_than_the_client_or_for_the_benefit_of_a_third_party_: ArrayProps;
  does_anyone_other_than_the_client_guarantee_this_account_: ArrayProps;
  do_you_trade_or_intend_to_trade_with_other_investment_firms_: ArrayProps;
  do_you_use_leverage_or_borrowing_to_finance_the_purchase_of_securities_: ArrayProps;
  employment_status: ArrayProps;
  date_of_birth: number;
  employment_income: number; //New
  disability_or_ei: number; //New
  company_pension: number; //New
  cpp_income: number; //New
  oas_income: number; //New
  investment_withdrawals: number; //New
  bank_withdrawals: number; //New
  other_income: number; //New
  cash: number; //New
  registered_investments: number; //New
  non_registered_investments: number; //New
  fixed_assets: number; //New
  mortgages_and_other_liabilities: number; //New
  other_assets: ArrayProps; //New
  other_investments: number; //New
  associations: KycAssociatedObjectTypes;
  beneficiary: string;
  transfers: string;
  firstname_secondary: string;
  lastname_secondary: string;
  investment_experience__secondary_account_holder_: ArrayProps;
  investment_knowledge__secondary_account_holder_: ArrayProps;
  intended_use_of_account__secondary_account_holder_: ArrayProps;
  source_of_funds__secondary_account_holder_: ArrayProps;
  risk_tolerance__secondary_account_holder_: ArrayProps;
  risk_capacity__secondary_account_holder_: ArrayProps;
  investment_objective__secondary_account_holder_: ArrayProps;
  time_horizon__secondary_account_holder_: ArrayProps;
  liquidity_needs__secondary_account_holder_: ArrayProps;
  employment_status__secondary_account_holder_: ArrayProps;
  date_of_birth__secondary_account_holder_: ArrayProps;
  employment_income_secondary: number; //New
  disability_or_ei_secondary: number; //New
  company_pension_secondary: number; //New
  cpp_income_secondary: number; //New
  oas_income_secondary: number; //New
  investment_withdrawals_secondary: number; //New
  bank_withdrawals_secondary: number; //New
  other_income__secondary_account_holder_: number; //New
  cash_secondary: number; //New
  registered_investments__secondary_account_holder_: number; //New
  non_registered_investments__secondary_account_holder_: number; //New
  fixed_assets_secondary: number; //New
  mortgages_and_other_liabilities_secondary: number; //New
  other_assets__secondary_account_holder_: Array<ArrayProps>; //New
  other_investments__secondary_account_holder_: number; //New
  legislation: Array<ArrayProps>;
  pension_fund_source: Array<ArrayProps>;
  model_overridden: Array<ArrayProps>;
  // entity_type: Array<ArrayProps>;
  // entity_type_details: Array<ArrayProps>;
  // entity_name: string;
  // attention: string;
  // nature_of_business: string;
  // business_number: string;
  // date_of_incorporation: number;
  // place_of_incorporation: Array<ArrayProps>;
  // entity_address: string;
  // entity_city: string;
  // entity_province: Array<ArrayProps>;
  // entity_postal_code: string;
  // individual_1_role: Array<ArrayProps>;
  // individual_2_role: Array<ArrayProps>;
  // entity_income: number;
  // entity_cash: number;
  // entity_registered_investments: number;
  // entity_non_registered_investments: number;
  // entity_fixed_assets: number;
  // entity_mortgages_and_other_liabilities: number;
}

export interface JointAccountHolders {


}


// Interface for transfer form ticket props
export interface TransferProps {
  hs_object_id: number;
  relinquishing_institution: string;
  street_address: string;
  city: string;
  province___state: Array<ArrayProps>;
  postal_code___zip_code: string;
  relinquishing_account_number: string;
  transfer_type: Array<ArrayProps>;
  transfer_dollar_or_shares: Array<ArrayProps>;
  amount: number;
  symbol: string;
  security_description: string;
  transfer_details_array: Array<TransferDetailItemsProps>;
  transfer_details: string;
}

export interface KycFormProps {
  intended_use_of_account: string;
  source_of_funds: string;
  risk_tolerance: string;
  risk_capacity: string;
  investment_objective: string;
  time_horizon: string;
  liquidity_needs: string;
  assigned_model: string;
  model_suitability: string;
  does_anyone_other_than_the_client_have_any_financial_interest_in_this_account_: string;
  other_than_optimize_inc___does_anyone_other_than_the_client_have_trading_authority_on_this_account_: string;
  will_this_account_be_used_by_a_person_other_than_the_client_or_for_the_benefit_of_a_third_party_: string;
  does_anyone_other_than_the_client_guarantee_this_account_: string;
  do_you_trade_or_intend_to_trade_with_other_investment_firms_: string;
  do_you_use_leverage_or_borrowing_to_finance_the_purchase_of_securities_: string;
  beneficiary: string;
  firstname_secondary: string;
  lastname_secondary: string;
  investment_experience__secondary_account_holder_: string;
  investment_knowledge__secondary_account_holder_: string;
  intended_use_of_account__secondary_account_holder_: string;
  source_of_funds__secondary_account_holder_: string;
  risk_tolerance__secondary_account_holder_: string;
  risk_capacity__secondary_account_holder_: string;
  investment_objective__secondary_account_holder_: string;
  time_horizon__secondary_account_holder_: string;
  liquidity_needs__secondary_account_holder_: string;
}

export interface ModelFormProps {
  assigned_model: string;
  model_suitability: string;
  model_overridden: string;
}

export interface CancelFormProps {
  hs_pipeline_stage: string;
  cancelled_by: string;
}

// New ticket item row props
export interface KycRowProps {
  kyc: Kyc;
  context: Context;
  runServerless: ServerlessFuncRunner;
  onClick: () => void;
}

// // New ticket item row props
// export interface TransferFormProps {
//   relinquishing_institution: Array<ArrayProps>;
//   street_address: string;
//   city: string;
//   province___state: Array<ArrayProps>;
//   postal_code___zip_code: string;
//   relinquishing_account_number: string;
//   transfer_type: Array<ArrayProps>;
//   transfer_in_cash_or_in_kind: Array<ArrayProps>;
//   transfer_dollar_or_shares: Array<ArrayProps>;
//   amount: number;
//   symbol: string;
//   security_description: string;
// }

// New Transfer Details Row Props
export interface TransferDetailItemsProps {
  transfer_in_cash_or_in_kind: string;
  transfer_dollar_or_shares: string;
  amount: number;
  symbol: string;
  security_description: string;
}


// New ticket item row props
export interface TransferFormProps {
  relinquishing_institution: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  relinquishing_account_number: string;
  transfer_type: string;
  instruction_type: string;
  amount_type: string;
  description: string;
  amount: number;
  quantity: number;
  instruction_type_2: string;
  amount_type_2: string;
  description_2: string;
  amount_2: number;
  quantity_2: number;
  instruction_type_3: string;
  amount_type_3: string;
  description_3: string;
  amount_3: number;
  quantity_3: number;
  instruction_type_4: string;
  amount_type_4: string;
  description_4: string;
  amount_4: number;
  quantity_4: number;
}

// NEW RESP APPLICATION
export interface RespFormProps {
  firstname: string;
  lastname: string;
  gender: string;
  sin: string;
  date_of_birth: number;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  relationship: string;
  parent_firstname: string;
  parent_lastname: string; // parent_or_pcg_last_name
  resp_parent_firstname: string; // parent_or_pcg_first_name
  beneficiaries_are_siblings: string; // siblings Y/N
  resp_distribution: number; // distribution #
  beneficiary_same_address: string; // same_address Y/N
  beneficiary_grants: string; // grants Y/N
  parent_or_legal_guardian: string; // parent_or_legal_guardian (Y, N)
  pcg_or_spouse: string; // pcg_or_spouse Y/N
  name_of_agency: string; // name_of_agency
  name_of_agency_representative: string; // name_of_agency_representative
  agency_bn: string; // agency_bn
  agency_pcg: string; // agency_pcg
  beneficiary: string; // final string to save the beneficiary data in
}

// NEW RESP APPLICATION
export interface RespBeneficiaryFormProps {
  beneficiary: string; // final string to save the beneficiary data in
}

// NEW RESP APPLICATION
export interface Transfers {
  transfers: string; // final string to save the beneficiary data in
}

// NEW RDSP APPLICATION
export interface RdspBeneficiaryFormProps {
  beneficiary: string; // final string to save the beneficiary data in
}

// NEW RDSP APPLICATION
export interface OtherBeneficiaryFormProps {
  beneficiary: string; // final string to save the beneficiary data in
}

// NEW LOCKED IN APPLICATION
export interface LockedInFormProps {
  account_type: string;
  legislation: string; // final string to save the legislation data in
  pension_fund_source: string; // to save pension fund source for LIF accounts only
}

// NEW SPOUSAL APPLICATION
export interface SpousalApplicationFormProps {
  spouse_sin: string;
  spouse_email: string;
}

// NEW RIF APPLICATION
export interface RifApplicationFormProps {
  minimum_calculated_based_on: ArrayProps;
  spouse_date_of_birth: number;
}

// NEW RDSP APPLICATION
export interface OtherBeneficiaryProps {
  beneficiary_type: string;
  firstname: string; //
  lastname: string; //
  date_of_birth: number; //
  relationship: string;
}

// NEW RDSP APPLICATION
export interface InTrustBeneficiaryProps {
  firstname: string; //
  lastname: string; //
  date_of_birth: number; //
  sin: string;
}



// NEW RDSP APPLICATION
export interface RdspFormProps {
  rdsp_type: string;
  firstname: string; //
  lastname: string; //
  gender: string; //
  sin: string; //
  date_of_birth: string; //
  relationship: string;
  address: string; //
  city: string; //
  province: string; //
  postal_code: string; //
  pcg_firstname: string;
  pcg_lastname: string;
  pcg_sin: string;
  pcg_agency_name: string;
  pcg_agency_representative: string;
  pcg_bn: string;
  pcg_address: string;
  pcg_city: string;
  pcg_province: string;
  pcg_postal_code: string;
  rdsp_grant: string;
  number_of_holders: number;
  beneficiary_same_address: string;
  pcg_is_agency: string;
}

// NEW BENEFICIARY FOR REGISTERED ACCOUNTS APPLICATION
export interface BeneficiaryProps {
  beneficiary_lastname: string;
  beneficiary_firstname: string;
  beneficiary_gender: string;
  beneficiary_relationship: string;
  beneficiary_street_address: string;
  beneficiary_city: string;
  beneficiary_province: string;
  beneficiary_postal_code: string;
  beneficiary_sin: string;
  beneficiary_date_of_birth: string;
  primary_caregiver_lastname: string;
  primary_caregiver_firstname: string;
  primary_caregiver_street_address: string;
  primary_caregiver_city: string;
  primary_caregiver_province: string;
  primary_caregiver_postal_code: string;
  beneficiary_same_address: string;
  rdsp_grants: string;
  rdsp_primary_caregiver: string;
  name_of_agency: string; // in case of a child care agency
  name_of_agency_representative: string; // in case of a child care agency
  agency_business_number: string;
  public_primary_caregiver: string;
  number_of_account_holders: number;
  rdsp_refusal: string;
  primary_caregiver_sin: string;
  primary_caregiver_date_of_birth: string;
}

// New resp beneficiary component properties
export interface RespApplicationProps {
  kyc: Kyc,
  ticketId: number;
  runServerless: ServerlessFuncRunner;
  onCancelClick: () => void;
  onSaveClick: () => void;
}

// New resp beneficiary component properties
export interface ModelProps {
  ticketId: number;
  kyc: Kyc;
  runServerless: ServerlessFuncRunner;
  onCancelClick: () => void;
  onSaveClick: () => void;
}

// New resp beneficiary component properties
export interface CancelProps {
  ticket: Ticket;
  kycs: Array<Kyc>;
  runServerless: ServerlessFuncRunner;
  onCancelClick: () => void;
  onSaveClick: () => void;
}

// New delete view properties
export interface DeleteViewProps {
  ticketId: number;
  kyc: Kyc;
  runServerless: ServerlessFuncRunner;
  onCancelClick: () => void;
  onSaveClick: () => void;
}

// New bank account details props
export interface BankAccountFormProps {
  bank_name: string;
  bank_institution_number: string;
  bankaccountnumber: string;
  bank_transit_number: string;
  bank_address: string;
  bank_city: string;
  bank_province: string;
  bank_postal_code: string;
  bank_name_2: string;
  bank_institution_number_2: string;
  bankaccountnumber_2: string;
  bank_transit_number_2: string;
  bank_address_2: string;
  bank_city_2: string;
  bank_province_2: string;
  bank_postal_code_2: string;
  bank_name_entity: string;
  bank_institution_number_entity: string;
  bankaccountnumber_entity: string;
  bank_transit_number_entity: string;
  bank_address_entity: string;
  bank_city_entity: string;
  bank_province_entity: string;
  bank_postal_code_entity: string;
}

// Meeting details form props
export interface MeetingDetailsProps {
  meeting_type: Array<ArrayProps>;
  meeting_location: string;
  wp_present: Array<ArrayProps>;
  wp_name: string;
  other_attendees_present: Array<ArrayProps>;
  other_attendees: string;
  onboarding_documentation_delivery_method: string;
  disclosures_provided: Array<ArrayProps>;
  family_office_services: Array<ArrayProps>;
  additional_questions_options: Array<ArrayProps>;
  additional_questions: string;
  client_confirmations: Array<ArrayProps>;
}

// Meeting details form props
export interface MeetingDetailsFormProps {
  meeting_type: string;
  meeting_location: string;
  wp_present: string;
  wp_name: string;
  other_attendees_present: string;
  other_attendees: string;
  onboarding_documentation_delivery_method: string;
  disclosures_provided: string;
  family_office_services: string;
  additional_questions_options: string;
  additional_questions: string;
  client_confirmations: string;
  meeting_detail_note: string;
}

// New bank account details props
export interface AdditionalQuestionFormProps {
  show_location: string;
  show_wp_details: string;
  show_additional_questions: string;
  additional_questions: string;
}

// New bank account details props
export interface JointAccountFormProps {
  ownership_type: string;
  participant_or_estate: string;
  participant_or_estate_allocation: number;
  participant_or_estate_2: string;
  participant_or_estate_allocation_2: number;
}

// New bank account details props
export interface EntityInformationFormProps {
  entity_type: string;
  entity_type_details: string;
  entity_name: string;
  attention: string;
  nature_of_business: string;
  business_number: string;
  date_of_incorporation: number;
  place_of_incorporation: string;
  entity_address: string;
  entity_city: string;
  entity_province: string;
  entity_postal_code: string;
  individual_1_role: string;
  individual_2_role: string;
  entity_income: number;
  entity_cash: number;
  entity_registered_investments: number;
  entity_non_registered_investments: number;
  entity_fixed_assets: number;
  entity_mortgages_and_other_liabilities: number;
}

export interface ApplicationLevelProps {
  application_type: Array<ArrayProps>;
  hs_pipeline_stage: string;
  bank_name: string;
  bank_institution_number: string;
  bankaccountnumber: string;
  bank_transit_number: string;
  bank_address: string;
  bank_city: string;
  bank_province: Array<ArrayProps>;
  bank_postal_code: string;
  verification_method: Array<ArrayProps>;
  verified_by: string;
  verification_date: number;
  id_type: Array<ArrayProps>;
  id_number: string;
  id_expiry: number;
  id_province_state: string;
  id_country: string;
  bank_name_2: string;
  bank_institution_number_2: string;
  bankaccountnumber_2: string;
  bank_transit_number_2: string;
  bank_address_2: string;
  bank_city_2: string;
  bank_province_2: Array<ArrayProps>;
  bank_postal_code_2: string;
  bank_name_entity: string;
  bank_institution_number_entity: string;
  bankaccountnumber_entity: string;
  bank_transit_number_entity: string;
  bank_address_entity: string;
  bank_city_entity: string;
  bank_province_entity: Array<ArrayProps>;
  bank_postal_code_entity: string;
  verification_method_2: Array<ArrayProps>;
  verified_by_2: string;
  verification_date_2: number;
  id_type_2: Array<ArrayProps>;
  id_number_2: string;
  id_expiry_2: number;
  id_province_state_2: string;
  id_country_2: string;
  ownership_type: Array<ArrayProps>;
  participant_or_estate: string;
  participant_or_estate_allocation: number;
  participant_or_estate_2: string;
  participant_or_estate_allocation_2: number;
  entity_type: Array<ArrayProps>;
  entity_type_details: Array<ArrayProps>;
  entity_name: string;
  attention: string;
  nature_of_business: string;
  business_number: string;
  date_of_incorporation: number;
  place_of_incorporation: Array<ArrayProps>;
  entity_address: string;
  entity_city: string;
  entity_province: Array<ArrayProps>;
  entity_postal_code: string;
  individual_1_role: Array<ArrayProps>;
  individual_2_role: Array<ArrayProps>;
  entity_income: number;
  entity_cash: number;
  entity_registered_investments: number;
  entity_non_registered_investments: number;
  entity_fixed_assets: number;
  entity_mortgages_and_other_liabilities: number;
  // meeting details props FIX!!!!
  meeting_type: Array<ArrayProps>;
  meeting_location: string;
  wp_present: Array<ArrayProps>;
  wp_name: string;
  other_attendees_present: Array<ArrayProps>;
  other_attendees: string;
  onboarding_documentation_delivery_method: Array<ArrayProps>;
  disclosures_provided: Array<ArrayProps>;
  family_office_services: Array<ArrayProps>;
  additional_questions_options: Array<ArrayProps>;
  additional_questions: string;
  client_confirmations: Array<ArrayProps>;
  second_id_type : string;
  second_id_type_2: string;
  secondary_verified_by : string;
  secondary_verified_by_2: string;
  secondary_verification_method: string;
  secondary_verification_method_2: string;
  secondary_verification_date : number;
  secondary_verification_date_2: number;
  secondary_id_number: string;
  secondary_id_number_2: string;
  secondary_id_expiry: number;
  secondary_id_expiry_2: number;
  secondary_id_province_state: string;
  secondary_id_province_state_2: string;
  secondary_id_country: string;
  secondary_id_country_2: string;
}

export interface AccountHolder {
  id: number;
  name: string;
}

export interface AccountHolderAssociation {
  items: Array<AccountHolder>;
}

export interface AccountHoldersProps {
  contact_collection__primary_account_holder_kyc: AccountHolderAssociation;
  contact_collection__secondary_account_holder_kyc: AccountHolderAssociation;
}



// // New bank account details props
// export interface EntityAccountFormProps {
//   ownership_type: string;
//   participant_or_estate: string;
//   participant_or_estate_allocation: number;
//   participant_or_estate_2: string;
//   participant_or_estate_allocation_2: number;
// }

// New bank account details form props
export interface BankAccountProps {
  ticket: Ticket;
  clients: Array<AccountHolder>;
  runServerless: ServerlessFuncRunner;
  onCancelClick: () => void;
  onSaveClick: () => void;
}

// New bank account details form props
export interface AdditionalQuestions {
  ticket: Ticket;
  clients: Array<AccountHolder>;
  kycs: Array<Kyc>;
  context: Context;
  runServerless: ServerlessFuncRunner;
  onCancelClick: () => void;
  onSaveClick: () => void;
  sendAlert: AddAlertAction;
}

// New joint account profile props
export interface JointAccountProfileProps {
  ticket: Ticket;
  clients: Array<AccountHolder>;
  runServerless: ServerlessFuncRunner;
  onCancelClick: () => void;
  onSaveClick: () => void;
}

// New entity account profile props
export interface EntityAccountProfileProps {
  ticket: Ticket;
  clients: Array<AccountHolder>;
  kycs: Array<Kyc>;
  runServerless: ServerlessFuncRunner;
  onCancelClick: () => void;
  onSaveClick: () => void;
}

// New id verification props
export interface IdVerificationProps {
  ticket: Ticket;
  clients: Array<AccountHolder>;
  runServerless: ServerlessFuncRunner;
  onCancelClick: () => void;
  onSaveClick: () => void;
}

// New id verification props
export interface IdVerificationFormProps {
  verification_method: string;
  verified_by: string;
  verification_date: number;
  id_type: string;
  id_number: string;
  id_expiry: number;
  id_province_state: string;
  id_country: string;
  verification_method_2: string;
  verified_by_2: string;
  verification_date_2: number;
  id_type_2: string;
  id_number_2: string;
  id_expiry_2: number;
  id_province_state_2: string;
  id_country_2: string;
  client_name:string;
  client_name_secondary:string;
  second_id_type : string;
  second_id_type_2: string;
  secondary_verified_by : string;
  secondary_verified_by_2: string;
  secondary_verification_method: string;
  secondary_verification_method_2: string;
  secondary_verification_date : number;
  secondary_verification_date_2: number;
  secondary_id_number: string;
  secondary_id_number_2: string;
  secondary_id_expiry: number;
  secondary_id_expiry_2: number;
  secondary_id_province_state: string;
  secondary_id_province_state_2: string;
  secondary_id_country: string;
  secondary_id_country_2: string;
}



// New rdsp beneficiary component properties
export interface RdspApplicationProps {
  kyc: Kyc,
  ticketId: number;
  runServerless: ServerlessFuncRunner;
  onCancelClick: () => void;
  onSaveClick: () => void;
}

// New rrsp beneficiary component properties
export interface OtherBeneficiaryApplicationProps {
  kyc: Kyc,
  ticketId: number;
  runServerless: ServerlessFuncRunner;
  onCancelClick: () => void;
  onSaveClick: () => void;
}

// New locked in legislation view
export interface LockedInApplicationProps {
  kyc: Kyc;
  ticketId: number;
  runServerless: ServerlessFuncRunner;
  onCancelClick: () => void;
  onSaveClick: () => void;
}

// New spousal application view
export interface SpousalApplicationProps {
  kyc: Kyc,
  ticketId: number;
  tickets: Ticket;
  fetchCrmObjectProperties: FetchCrmObjectPropertiesAction;
  runServerless: ServerlessFuncRunner;
  onCancelClick: () => void;
  onSaveClick: () => void;
}

// NEW RESP PROPS
export interface RespProps {
  kyc: Kyc;
  fetchCrmObjectProperties: FetchCrmObjectPropertiesAction;
  context: Context;
  runServerless: ServerlessFuncRunner;
  onBackClick: () => void;
  onSaveClick: () => void;
}

// New ticket item row props
export interface TransferForm {
  kyc: Kyc;
  ticketId: number;
  runServerless: ServerlessFuncRunner;
  onCancelClick: () => void;
  onSaveClick: () => void;
}

// New KYC Question Properties
export interface KycQuestionProps {
  kyc: Kyc;
  clients: Array<AccountHolder>;
  runServerless: ServerlessFuncRunner;
  onCancelClick: () => void;
  onSaveClick: () => void;
}

// New Model and Suitability Properties
export interface ModelProps {
  kyc: Kyc;
  clients: Array<AccountHolder>;
  runServerless: ServerlessFuncRunner;
  onCancelClick: () => void;
  onSaveClick: () => void;
}
export interface AccountDetailProps {
  kyc: Kyc;
  ticketId: number;
  context: Context;
  tickets: Ticket;
  clients: Array<AccountHolder>;
  runServerless: ServerlessFuncRunner;
  fetchCrmObjectProperties: FetchCrmObjectPropertiesAction;
  onBackClick: () => void;
  onSaveClick: () => void;
}

export interface HomeProps {
  fetchCrmObjectProperties: FetchCrmObjectPropertiesAction;
  context: Context;
  runServerless: ServerlessFuncRunner;
  sendAlert: AddAlertAction;
  actions: any;
}

//New
export interface ProfileHomeProps {
  fetchCrmObjectProperties: FetchCrmObjectPropertiesAction;
  context: Context;
  runServerless: ServerlessFuncRunner;
  sendAlert: AddAlertAction;
  onBackClick: () => void;
  onClick: () => void;
}
