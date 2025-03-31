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
Cypress.Commands.add('loginByInterfaz', (email, password) => {
  // Visitamos la página de inicio de sesión
  cy.visit('http://localhost:4200/login')

  // Enviamos credenciales correctas
  cy.get('[data-test-id="emailField"]').type(email)
  cy.get('[data-test-id="passwordField"]').type(password)
  cy.get('[data-test-id="submitButton"]').click()
})
// registro
Cypress.Commands.add('registerUserByInterfaz', (userData) => {
  // Visitar la página de registro
  cy.visit('http://localhost:4200/register')

  // Completar el formulario de registro con los datos proporcionados
  cy.get('[data-test-id="userNameField"]').type(userData.userName)
  cy.get('[data-test-id="emailField"]').type(userData.email)
  cy.get('[data-test-id="passwordField"]').type(userData.password)
  cy.get('[data-test-id="confirmPasswordField"]').type(userData.password)
  cy.get('[data-test-id="submitButton"]').click()
})
// login `admin`
Cypress.Commands.add('createAdminTokenSave', () => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('API_URL')}/api/users`,
    form: false,
    body: {
      userName: 'Admin',
      email: Cypress.env('ADMIN_EMAIL'),
      password: 'Test_12345678',
      // confirmPassword: 'Test_12345678'
    },
  }).then((resp) => {
    // observa como ahora en cypress el token no está por ningún lado, si no visitamos la página y hacemos click, porque internamente en nuestra app, el comportamiento está desde angular n odesde cypress
    expect(resp.status).to.eq(201)
    cy.log('token ', resp.body.access_token)
    localStorage.setItem(`${Cypress.env('JWT_NAME')}`, resp.body.access_token)
  })
})
