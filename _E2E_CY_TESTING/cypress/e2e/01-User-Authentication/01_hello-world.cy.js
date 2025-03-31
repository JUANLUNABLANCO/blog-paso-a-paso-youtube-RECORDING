/// <reference types="cypress" />

context('Hello world!', () => {
  beforeEach(() => {
    cy.visit(`${Cypress.env('API_URL')}/api`)
  })
  it(`You connect with the api in ${Cypress.env(
    'API_URL',
  )}/api, and you must to see the message "Hello World!"`, () => {
    cy.contains('Hello World!')
  })
  // Ejemplo de un test de inicio de sesión con Cypress
})
