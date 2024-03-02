/// <reference types="cypress" />
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
// login
Cypress.Commands.add('login', (email, password) => {
  // Visitamos la página de inicio de sesión
  cy.visit('http://localhost:4200/login')

  // Enviamos credenciales correctas
  cy.get('[data-test-id="emailField"]').type(email)
  cy.get('[data-test-id="passwordField"]').type(password)
  cy.get('[data-test-id="submitButton"]').click()
})
// registro
Cypress.Commands.add('registerUser', (userData) => {
  // Visitar la página de registro
  cy.visit('http://localhost:4200/register')

  // Completar el formulario de registro con los datos proporcionados
  cy.get('[data-test-id="userNameField"]').type(userData.userName)
  cy.get('[data-test-id="emailField"]').type(userData.email)
  cy.get('[data-test-id="passwordField"]').type(userData.password)
  cy.get('[data-test-id="confirmPasswordField"]').type(userData.password)
  cy.get('[data-test-id="submitButton"]').click()
})
