const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(express.json());

//banco de dados fake
const customers = [];

//Middleware para verificar se o cliente existe / Middleware precisa de 3 parâmetros
function verifyIfExistsAccountCPF(request, response, next) {
   /* const { cpf } = request.params; */
   const { cpf } = request.headers;

   const customer = customers.find((customer) => customer.cpf === cpf);

   // !customer - se não existir o cliente
   if (!customer) {
      return response.status(400).json({ error: 'Customer Not Found!' });
   }

   //passando as informações do middleware para a próxima rotas
   request.customer = customer;

   return next();
}

//receber o statement da conta, que armazena o extrato da conta
//.reduce() -> transforma todas os valores passado em um único valor - no caso o que entrou - o que saiu.
//operation é o que está sendo adicionado ou removendo dentro do objeto.
function getBalance(statement) {
   const balance = statement.reduce((acc, operation) => {
      if (operation.type === 'credit') {
         return acc + operation.amount;
      } else {
         return acc - operation.amount;
      }
   }, 0);

   return balance;
}

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

//usar dessa forma quando eu quiser que todas as minhas rotas tenha acesso ao middleware
//app.use(verifyIfExistsAccountCPF);

//método para buscar o extrato bancário
app.get('/statement', verifyIfExistsAccountCPF, (request, response) => {
   //recuperando informações do cliente - request.customers desse middleware
   const { customer } = request;

   return response.json(customer.statement);
});

//método para realizar um depósito
app.post('/deposit', verifyIfExistsAccountCPF, (request, response) => {
   const { description, amount } = request.body;

   const { customer } = request;

   const statementOperation = {
      description,
      amount,
      created_at: new Date(),
      type: 'credit',
   };

   customer.statement.push(statementOperation);

   return response.status(201).send();
});

//método para sacar dinheiro - regra de negocio saldo não pode ser menor que 0
app.post('/withdraw', verifyIfExistsAccountCPF, (request, response) => {
   const { amount } = request.body;
   const { customer } = request;

   //onde fica as nossas operações
   const balance = getBalance(customer.statement);

   //se nao tiver saldo suficiente enviara um erro
   if (balance < amount) {
      return response.status(400).json({ error: 'Insufficient Funds!' });
   }

   //se tiver saldo suficiente
   const statementOperation = {
      amount,
      created_at: new Date(),
      type: 'debit',
   };

   //adicionando a operação no extrato
   customer.statement.push(statementOperation);

   //retornando o extrato
   return response.status(201).send();
});

//localhost:3333/
app.listen(3333);
