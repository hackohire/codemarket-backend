# platformapi

NodeJS + Serverless + MongoDB + Mongoose + GraphQL Boilerplate

### Getting started

```bash
$ git clone
$ npm i
$ cp config-example.js config.js
$ npm start
```

> Replase MONGODB_URL in config.js to point to your database.

### Features

- Uses `mongoose` for connecting to mongodb and defining models.
- Uses `GraphQL` to serve data to client.
- Pagination while fetching data.
- `async/await` syntax.
- Uses `eslint` and `prettier` for linting and formatting.

### Deploying

```bash
$ npm run deploy
```
