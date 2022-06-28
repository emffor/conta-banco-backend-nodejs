const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(express.json());

//banco de dados fake
const customers = [];

/*
 * cpf = string
 * nome = string
 * id = uuid
 * statement []
 */

//método criar uma conta
app.post('/account', (request, response) => {
   const { cpf, name } = request.body;

   //fazer uma buscar with .some() para verificar se o cpf já existe.
   const customerAlreadyExists = customers.some(
      (customer) => customer.cpf === cpf
   );

   if (customerAlreadyExists) {
      return response.status(400).json({ error: 'Customer Already Exists!' });
   }

   //inserir dados dentro do array customers - banco de dados fake
   customers.push({
      cpf,
      name,
      id: uuidv4(),
      statement: [],
   });

   return response.status(201).send();
});

app.get('/', (request, response) => {
   return response.json({ message: 'Hello, world, Dev!' });
});

//localhost:3333/
app.listen(3333);
