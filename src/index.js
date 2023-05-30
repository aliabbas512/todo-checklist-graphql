import React from 'react';
import ReactDOM from 'react-dom/client'; 
import App from './App';
import { ApolloClient, ApolloProvider, InMemoryCache, createHttpLink} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: "https://heroic-coyote-66.hasura.app/v1/graphql",
});

const authLink = setContext((_, { headers }) => {
  const token = 'Ysu3bov7nGYuDk32Ews5A0778EchS1LoqSSriBMpwFYtsttr2GUOeN3HT4dCkutk';
  return {
    headers: {
      ...headers,
      "x-hasura-admin-secret": token
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
