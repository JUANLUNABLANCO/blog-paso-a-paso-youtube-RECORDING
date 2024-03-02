/// <reference types="cypress" />

context('Create User Using frontned ng interface', () => {
  it('Sending a successfully form:  send body {email, userName and password} and receive a status code 201, response with the same user with an id, whitout password, and the role is "user"', () => {
    cy.task('queryDb', 'DELETE from user_entity').then((results) => {
      cy.log(results)
    })
    localStorage.clear() // limpiamos por si acaso quedan restos de otras pruebas

    cy.intercept('POST', 'http://127.0.0.1:3000/api/users').as(
      'registerRequest',
    )

    const userData = {
      userName: 'test2',
      email: 'test2@gmail.com',
      password: 'Test_12345678',
    }
    cy.registerUser(userData)
    // cy.wait('@registerRequest').its('response.statusCode').should('eq', 201)
    cy.wait('@registerRequest').then((interception) => {
      expect(interception.response.statusCode).to.eq(201)
      expect(interception.response.body.user).to.have.property(
        'userName',
        'test2',
      )
      expect(interception.response.body.user).to.have.property(
        'email',
        'test2@gmail.com',
      )
      expect(interception.response.body.user).to.have.property('role', 'user')
      expect(interception.response.body.user).to.have.property('id')
      cy.log('## DATA: ', JSON.stringify(interception.response))
    })
  })

  it('should have a frontend error in ng UI, beacuse we put in the input type email, the same email than other user', () => {
    // No limpiamos la base de datos ahí tenemos el usuario de la prueba anterior
    cy.visit('http://localhost:4200/register')
    cy.get('[data-test-id="userNameField"]').type('test2')
    cy.get('[data-test-id="emailField"]').type('test2@gmail.com').blur()
    cy.get('[data-test-id="emailField"]').should('have.class', 'ng-invalid')
    cy.get('[data-test-id="ErrorEmailUsed"]')
      .should('be.visible')
      .should('contain', 'Ese correo electrónico, ya está siendo usado.')
  })
})

context('Login User Using frontend ng interface', () => {
  it('debe iniciar sesión con éxito', () => {
    // Intercepta la solicitud POST a la API de inicio de sesión
    cy.intercept('POST', 'http://127.0.0.1:3000/api/users/login').as(
      'loginRequest',
    )
    // login
    cy.login('test2@gmail.com', 'Test_12345678')

    // Espera a que se complete la solicitud de inicio de sesión
    cy.wait('@loginRequest').then((interception) => {
      // Verifica el estado de la solicitud
      expect(interception.response.statusCode).to.eq(201) // Cambia el código de estado según tu API
      // Verifica la respuesta
      expect(interception.response.body).to.have.property(
        Cypress.env('JWT_NAME'),
      )
      // Puedes agregar más aserciones según la respuesta de tu API
    })

    // Verifica que el usuario haya iniciado sesión correctamente en la interfaz
    // cy.contains('Bienvenido, Usuario'); // Ajusta según tu interfaz
  })

  it('Sending a not successfully form:  send body {email(taken), userName and password} and receive a status code 406, with message', () => {
    // DONOT clean the DB, because we need the user to be created to test the error
    localStorage.clear() // limpiamos por si acaso quedan restos de otras pruebas
    // Es necesario enviarlo por debajo, sino como el email está cogido, no se puede enviar, ya que el botón del formulario y el propio onSubmit lo impedirán
    cy.visit('http://localhost:4200/register')
    cy.request({
      method: 'POST',
      url: `${Cypress.env('API_URL')}/api/users`,
      failOnStatusCode: false, // Esto permite que la prueba no falle por un código de estado diferente a 2xx
      body: {
        // Aquí puedes enviar datos incompletos o incorrectos, nos falta el userName
        email: 'test2@gmail.com',
        password: 'Test_12345678',
      },
    }).then((resp) => {
      expect(resp.status).to.eq(406) // recurso creado
      expect(resp.body).to.have.property('message') // Esperamos que el cuerpo de la respuesta contenga un mensaje de error
      expect(resp.body).to.have.property('statusCode', 406) // Esperamos que el código de estado sea

      console.log('## DATA: ', resp.body)
    })
  })
})
