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
}
export interface AccountApplicationProps {
  fetchCrmObjectProperties: FetchCrmObjectPropertiesAction;
  context: Context;
  runServerless: ServerlessFuncRunner;
  sendAlert: AddAlertAction;
}
