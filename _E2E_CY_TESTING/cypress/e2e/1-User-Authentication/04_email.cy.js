/// <reference types="cypress" />

context('Create User Using frontned ng interface', () => {
  it('Sending a successfully form:  send body {email, name and password} and receive a status code 201, response with the same user with an id, whitout password, and the role is "user"', () => {
    cy.task("queryDb", "DELETE from user_entity").then(results => {
      cy.log(results)
    })
    cy.visit('http://localhost:4200/register')
    localStorage.clear(); // limpiamos por si acaso quedan restos de otras pruebas

    cy.intercept('POST', 'http://127.0.0.1:3000/api/users').as('registerRequest');

    cy.get('[data-test-id="nameField"]').type('test2');
    cy.get('[data-test-id="emailField"]').type('test2@gmail.com');
    cy.get('[data-test-id="passwordField"]').type('test12345678');
    cy.get('[data-test-id="confirmPasswordField"]').type('test12345678');
    cy.get('[data-test-id="submitButton"]').click()

    // cy.wait('@registerRequest').its('response.statusCode').should('eq', 201)
    cy.wait('@registerRequest').then((interception) => {
      expect(interception.response.statusCode).to.eq(201)
      expect(interception.response.body).to.have.property('name', 'test2')
      expect(interception.response.body).to.have.property('email', 'test2@gmail.com')
      expect(interception.response.body).to.have.property('role', 'user')
      expect(interception.response.body).to.have.property('id')
      cy.log('## DATA: ', JSON.stringify(interception.response));
    });
  });

  
  it('should have a frontend error in ng UI, beacuse we put in the input type email, the same email than other user', ()=>{
    // No limpiamos la base de datos ahí tenemos el usuario de la prueba anterior
    cy.visit('http://localhost:4200/register')
    cy.get('[data-test-id="nameField"]').type('test2');
    cy.get('[data-test-id="emailField"]').type('test2@gmail.com').blur()
    cy.get('[data-test-id="emailField"]').should('have.class', 'ng-invalid')
    cy.get('[data-test-id="ErrorEmailUsed"]').should('be.visible').should('contain', 'Ese correo electrónico, ya está siendo usado.')
  });
  
});

context('Login User Using frontned ng interface', () => {

  it('debe iniciar sesión con éxito', () => {
    // visit page
    cy.visit('http://localhost:4200/login');

    // Intercepta la solicitud POST a la API de inicio de sesión
    cy.intercept('POST', 'http://127.0.0.1:3000/api/users/login').as('loginRequest');
    
    // Ingresa el correo electrónico y la contraseña
    cy.get('[data-test-id="emailField"]').type('test2@gmail.com');
    cy.get('[data-test-id="passwordField"]').type('test12345678');

    // Envía el formulario
    cy.get('[data-test-id="submitButton"]').click();

    // Espera a que se complete la solicitud de inicio de sesión
    cy.wait('@loginRequest').then((interception) => {
      // Verifica el estado de la solicitud
      expect(interception.response.statusCode).to.eq(201); // Cambia el código de estado según tu API
      // Verifica la respuesta
      expect(interception.response.body).to.have.property('access_token');
      // Puedes agregar más aserciones según la respuesta de tu API
    });

    // Verifica que el usuario haya iniciado sesión correctamente en la interfaz
    // cy.contains('Bienvenido, Usuario'); // Ajusta según tu interfaz
  });


  it('Sending a not successfully form:  send body {email(taken), name and password} and receive a status code 201, but with error message', () => {
    // DONOT clean the DB, because we need the user to be created to test the error
    localStorage.clear(); // limpiamos por si acaso quedan restos de otras pruebas
    // Es necesario enviarlo por debajo, sino como el email está cogido, no se puede enviar, ya que el botón del formulario y el propio onSubmit lo impedirán
    cy.request({
      method:"POST",
      url: 'http://localhost:3000/api/users',
      form: false,
      body: {
          name: "testx",
          email: "test2@gmail.com",
          password:"test12345678"
      }
    })
    .then((resp)=> {
      expect(resp.status).to.eq(201)  // recurso creado
      expect(resp.body).to.have.property('error')
      expect(resp.body.error).to.contains('duplicate key value violates unique constraint')
      console.log('## DATA: ', resp.body)
    });
  });
});




