# STORE SERVER
A express.js api implemented with node.js for a generic web aplication of ecommerce.

## Technologies:
-   Brcypt.js -> A powerfull cryptography library
-   Node.js -> Proyect manager and code builder
-   Express.js -> A powerfull JavaScript API library

## Instalation:
-   Add [Store.sql](./sql/Store.sql) to your sql server instance.
-   Clone [this repository](.) to the main server.
-   Install dependencies with `npm install`
-   Start the api with `node app.js`

### Inplemented calls so far:
-   `/api/users/:id` (GET) : Where id is the id of the user in database | Returns full user
-   `/api/login` (POST) : Arguments `name, password` | Returns user `identifier` if found
-   `/api/register` (POST) : Arguments `name, email, password` | Returns user-generated `identifier, name, email` if user not exists and creates a register