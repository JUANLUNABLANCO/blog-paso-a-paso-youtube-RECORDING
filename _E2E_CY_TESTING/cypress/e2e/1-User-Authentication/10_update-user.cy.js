/// <reference types="cypress" />

// ANOTACIONES este 10_update-user.cy se diferencia del anterior 09_user-profile.cy en que ahora si tenemos la interfaz, es bueno ver como se hace en ambos casos 
// por si en un futuro tuvieras que implemntar pruebas de backend solo, sin e2e

// import 'cypress-file-upload': // WARNING con interfaz puedes usar este plugin haciendo:
// cy.get('[cy-data-file="file-upload"]').atachFile(yourPathFile);

import { USERS } from '../../utilities/faker-data';

// import "cypress-localstorage-commands";

context('Teniendo ualgunos registros creados, vamos a subir una imagen para uno de ellos y ver que accediendo a la página del perfil de ese usuario, tenemos todos sus datos de perfil', () => {
  // ESTO es suceptible de convertirse en un comando, ya que es muy usado, averigualo y aprovecha para crear los comandos pertinentes
  
  before('1. Limpiar base de datos, 2. crear 25 usuarios aleatorios, 3. create one knowed user, 4. login with this user', ()=>{
    // ## 1
    cy.task("queryDb", "DELETE from user_entity").then(results => {
      cy.log(results)
    })

    // ## 2
    USERS.forEach(( user )=>{
      cy.request({
        method:"POST",
        url: 'http://localhost:3000/api/users',
        form: false,
        body: user
      }).then((resp)=> {
        expect(resp.status).to.eq(201)  // recurso creado
        expect(resp.body).to.have.property('role', 'user')
        // console.log('## DATA: ', resp.body)
      });
    });

    // ## 3
    cy.visit('http://localhost:4200/register');
    cy.get('[data-test-id="nameField"]').type('test2');
    cy.get('[data-test-id="emailField"]').type('test2@gmail.com');
    cy.get('[data-test-id="passwordField"]').type('test12345678');
    cy.get('[data-test-id="confirmPasswordField"]').type('test12345678');
    cy.get('[data-test-id="submitButton"]').should('not.be.disabled').click();

    // # 4
    cy.visit('http://localhost:4200/login');
    localStorage.clear(); // limpiamos por si acaso quedan restos de otras pruebas
    cy.get('[data-test-id="emailField"]').type('test2@gmail.com');
    cy.get('[data-test-id="passwordField"]').type('test12345678');
    cy.get('[data-test-id="submitButton"]').click()
      .then((resp) =>{
        cy.wrap(localStorage)
          .invoke('getItem', 'access_token')
          .should('exist')
    });
  });
  
  // Tenemos interfaz para actualizar el nombre del usuario, vamos a realizar el correspondiente test
  it('1. Obtener el token del usuario y el id, 2. Ir a la vista de actualización del usuario, 3. update profile name, 4. comprobar actualización', ()=>{
    // los pasos son los siguientes:
    // # 1. Obtener token e id
    // # 3. dirigirnos al usuario en cuetión para comprobar el cambio, para ello necesitamos su id, lo sacaremos del token registrado en el localStorage
    Cypress.env('token', localStorage.getItem('access_token'));

    const token = Cypress.env('token');

    console.log('## token: ', token);

    // DECODIFICADOR JWT
    const decodeJWT = (token) => {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    }
    // DECODIFICADOR JWT

    const payload = decodeJWT(token);
    const idUser = payload.user.id;

    // # 2. dirigirnos a la vista que actualiza el usuario desde ng
    cy.visit('http://localhost:4200/update-profile');

    // # 3. Rellenar el formulario con un nombre nuevo y enviarlo
    cy.get('[data-test-id="nameField"]').type('updatedName');
    cy.get('[data-test-id="submitButton"]').click();

    
    // # 4. comprobaciones
    cy.visit(`http://localhost:4200/users/${idUser}`);
    cy.get('[data-test-id="nameField"]').should(($data)=>{
      expect($data).to.contain('updatedName');
    });

  });

});
