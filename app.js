const express = require('express');
const app = express();
const routes = require('./app/routes');
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Configuración de middlewares y otros ajustes de la aplicación

app.use(cors());
app.use('/api', routes);

// Configuración del puerto y inicio del servidor

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Servidor en ejecución en el puerto ${port}`);
});