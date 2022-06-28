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

//Buscar o extrato bancário do cliente - como precisa buscar a informação completa(todos os dados) precisa usar o find() - O some() é quando precisa retornar existe e não existe.

app.get('/statement/', (request, response) => {
   /* const { cpf } = request.params; */
   const { cpf } = request.headers;

   const customer = customers.find((customer) => customer.cpf === cpf);

   // !customer - se não existir o cliente
   if (!customer) {
      return response.status(400).json({ error: 'Customer Not Found!' });
   }

   return response.json(customer.statement);
});

app.get('/', (request, response) => {
   return response.json({ message: 'Hello, world, Dev!' });
});

//localhost:3333/
app.listen(3333);
