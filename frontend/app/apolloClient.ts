import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
    // TODO: replace with website domain soon
    // make sure users CANNOT access /graphql.
  uri: 'http://localhost:8000/graphql',
  cache: new InMemoryCache()
});

export default client;
