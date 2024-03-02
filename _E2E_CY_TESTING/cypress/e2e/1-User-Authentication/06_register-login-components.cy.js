/// <reference types="cypress" />

context('Register Component', () => {
  const userData1 = {
    userName: 'test1',
    email: 'test1@gmail.com',
    password: 'Test_12345678',
  }
  const userData2 = {
    userName: 'test2',
    email: 'test2@gmail.com',
    password: 'Test_12345678',
  }
  // user test
  it('desde la interfaz "http://localhost:4200/register", creando usuario "test1"', () => {
    cy.task('queryDb', 'DELETE from user_entity') // limpiar db

    cy.registerUser(userData1) // registrar usuario 1
  })
  // user test2
  it('desde la interfaz "http://localhost:4200/register", creando usuario "test2"', () => {
    cy.registerUser(userData2) // registrar usuario 2
  })
  // probando la validación del campo email
  it('desde la interfaz "http://localhost:4200/register", creando usuario "test22". Comprobamos validación asíncrona', () => {
    cy.visit('http://localhost:4200/register')

    cy.get('[data-test-id="userNameField"]').type('test22')
    cy.get('[data-test-id="emailField"]').type('test2@g')
    cy.get('[data-test-id="passwordField"]').focus().wait(2000)
    // esto solo se habilitará si el usuario es el ADMIN
    // cy.get('[data-test-id="ErrorEmailUsed"]')
    //   .should('be.visible')
    //   .contains('Ese correo electrónico, ya está siendo usado.')
    //   .wait(2000) // este mensaje podría cambiar y sobre todo si tenemos idiomas en la página, con lo anterior va sobrado
    // corregimos datos
    cy.get('[data-test-id="emailField"]').clear().type('test22@gmail.com')
    cy.get('[data-test-id="passwordField"]').type('Test_12345678')
    cy.get('[data-test-id="confirmPasswordField"]').type('Test_12345678')
    cy.get('[data-test-id="submitButton"]')
      .should('not.be.disabled')
      .click()
      .wait(2000)
    cy.task('queryDb', 'SELECT * from user_entity').then((results) => {
      // cy.log(results);
      console.log(results)
      expect(results.rows.length).to.eq(3)
      expect(results.rows[2]).to.have.property('email', 'test22@gmail.com')
    })
  })
})

context('Login Component', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/login')
  })
  // user test
  it('desde la interfaz "http://localhost:4200/login", hagamos login con nuestro usuario "test22@gmail.com"', () => {
    cy.get('[data-test-id="emailField"]').type('test22@gmail.com')
    cy.get('[data-test-id="passwordField"]').type('Test_12345678')

    cy.get('[data-test-id="submitButton"]')
      .should('not.be.disabled')
      .click()
      .then(() => {
        // console.log('## resp: ', resp);  // es un click de boton no un http response
        cy.wrap(localStorage)
          .invoke('getItem', Cypress.env('JWT_NAME'))
          .should('exist')
      })
  })
})

context('Logout User', () => {
  it('We do logout from the user "test22@gmail.com"', () => {})
})
