/// <reference types="cypress" />

context('Hello world!', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/api');
  });
  it('You connect with the api in localhost:3000/api, and you must to see the message "Hello World!"', () => {
    cy.contains('Hello World!');
  });
});