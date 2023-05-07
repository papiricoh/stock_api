# STOCK_API

A aplication program interface for a game stock application, it can control buy and sell shares and create companies, using MySQL.

## IMPORTANT

All API calls begin with a `/api/` folowing the method.
Example: `localhost:8080/api/user/withdraw` (Calling withdraw post method)

### Get Requests

* `/users/:id`:
  * Introducing a `id` will check user in the database if the user not exists a wallet register will be created
* `/company/:label`:
  * Returns the company with the introduced `label`
* `/companies`:
  * Returns a company list with price and current shares avariability

### Post Requests

* `/newcompany`:
  * Creates a new company
  * Post parameters are: `name, label, owner_id, total_shares, initial_money, percentage_sold`
* `/shares/buy`:
  * Buys a number of shares of a existing company
  * Post parameters are: `company_label, player_id, quantity`
* `/shares/sell`:
  * Sells a number of shares of a existing company
  * Post parameters are: `company_label, player_id, quantity`
* `/user/deposit`:
  * Buys a number of shares of a existing company
  * Post parameters are: `player_id, deposit`
* `/user/withdraw`:
  * Buys a number of shares of a existing company
  * Post parameters are: `player_id, withdraw`

## Development installation and use

Add SQL file to your mySQL/MariaSQL database `sql/stock_market.sql`
Using node.js install the dependencies:

````Console
npm install
````

Run the API

````Console
node app
````
