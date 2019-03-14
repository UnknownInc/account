const Router = require('express').Router;

//import controllers
import userController from '../controllers/userController.js';

const routes = Router();
//routes.get('/', SomeController.getSomeThings);
//routes.get('/:id', SomeController.getSomeThing);
routes.post('/:company/register', userController.register);
routes.post('/:company/verify', userController.verify);

module.exports = routes;
