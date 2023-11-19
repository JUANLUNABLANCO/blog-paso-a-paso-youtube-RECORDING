/// <reference types="cypress" />

context('Register Component', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/register');
  })
  // user test
  it('desde la interfaz "http://localhost:4200/register", creando usuario "test"', () => {
    cy.task("queryDb", "DELETE from user_entity"); // limpiar db

    cy.get('[data-test-id="nameField"]').type('test');
    cy.get('[data-test-id="emailField"]').type('test@gmail.com');
    cy.get('[data-test-id="passwordField"]').type('test12345678');
    cy.get('[data-test-id="confirmPasswordField"]').type('test12345678');
    cy.get('[data-test-id="submitButton"]').should('not.be.disabled').click();
  });
  // user test2
  it('desde la interfaz "http://localhost:4200/register", creando usuario "test2"', () => {
    cy.get('[data-test-id="nameField"]').type('test2');
    cy.get('[data-test-id="emailField"]').type('test2@gmail.com');
    cy.get('[data-test-id="passwordField"]').type('test12345678');
    cy.get('[data-test-id="confirmPasswordField"]').type('test12345678');
    cy.get('[data-test-id="submitButton"]').should('not.be.disabled').click();
  });
  // probando la validación del campo email
  it('desde la interfaz "http://localhost:4200/register", creando usuario "test22". Comprobamos validación asíncrona', () => {
    cy.get('[data-test-id="nameField"]').type('test22');
    cy.get('[data-test-id="emailField"]').type('test2@g');
    cy.get('[data-test-id="passwordField"]').focus().wait(2000);
    cy.get('[data-test-id="ErrorEmailUsed"]').should('be.visible')
      .contains('Ese correo electrónico, ya está siendo usado.').wait(2000); // este mensaje podría cambiar y sobre todo si tenemos idiomas en la página, con lo anterior va sobrado
    // corregimos datos
    cy.get('[data-test-id="emailField"]').clear().type('test22@gmail.com');
    cy.get('[data-test-id="passwordField"]').type('test12345678');
    cy.get('[data-test-id="confirmPasswordField"]').type('test12345678');
    cy.get('[data-test-id="submitButton"]').should('not.be.disabled').click().wait(2000); // este mensaje podría cambiar y sobre todo si tenemos idiomas en la página, con lo anterior va sobrado
    // llamemos a la base de datos a ver cuantos usuarios hay
    cy.task("queryDb", "SELECT * from user_entity").then(results => {
      // cy.log(results);
      console.log(results);
      expect(results.rows.length).to.eq(3);
      expect(results.rows[2]).to.have.property('email', 'test22@gmail.com');
    })
  })
});

context('Login Component', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/login');
  })
  // user test
  it('desde la interfaz "http://localhost:4200/login", hagamos login con nuestro usuario "test22@gmail.com"', () => {

    cy.get('[data-test-id="emailField"]').type('test22@gmail.com');
    cy.get('[data-test-id="passwordField"]').type('test12345678');

    cy.get('[data-test-id="submitButton"]').should('not.be.disabled').click().then(() => {
      // console.log('## resp: ', resp);  // es un click de boton no un http response
      cy.wrap(localStorage)
          .invoke('getItem', 'access_token')
          .should('exist');
    });
  });
});
