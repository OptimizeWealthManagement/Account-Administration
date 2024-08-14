import React from 'react';
import { hubspot } from '@hubspot/ui-extensions';
import { Home } from './components/Home';

hubspot.extend<'crm.record.tab'>(
  ({ context, runServerlessFunction, actions }) => (
    <Home
      fetchCrmObjectProperties={actions.fetchCrmObjectProperties}
      context={context}
      runServerless={runServerlessFunction}
      sendAlert={actions.addAlert}
      actions={actions}
    />
  )
);
