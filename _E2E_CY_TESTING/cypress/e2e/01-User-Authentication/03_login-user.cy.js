/// <reference types="cypress" />

context('Login User', () => {
  // esta prueba es a través de la interfaz de angular
  it('acceder al endpoint "/login" check password, hay que enviar email + password y deben ser válidas. Enviando desde botón usuario preestablecido por angular en el login component', () => {
    // borrar la tabla
    cy.task('queryDb', 'DELETE from user_entity').then((results) => {
      cy.log(results)
    })
    // crear usuario
    cy.request({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/users',
      form: false,
      body: {
        userName: 'test',
        email: Cypress.env('DEFAULT_EMAIL'),
        password: Cypress.env('DEFAULT_PASSWORD'),
        role: 'admin',
      },
    }).then(() => {
      localStorage.clear() // limpiamos por si acaso quedan restos de otras pruebas
      // cy.visit('http://localhost:4200/#/login')
      cy.loginByInterfaz(
        Cypress.env('DEFAULT_EMAIL'),
        Cypress.env('DEFAULT_PASSWORD'),
      ).then(() => {
        // cy.window()
        //   .its('localStorage')
        //   .invoke('getItem', Cypress.env('JWT_NAME'))
        //   .should('exist')
        // OTRA forma de hacerlo
        cy.wrap(localStorage)
          .invoke('getItem', Cypress.env('JWT_NAME'))
          .should('exist')
      })
    })
  })
  // esta prueba es independiente de la interfaz es como usar postman, pero automatizado
  it('acceder al endpoint "/login" enviando datos del login desde cypress', () => {
    // visitemos la página y borremos el token
    // borrar la tabla
    cy.task('queryDb', 'DELETE from user_entity').then((results) => {
      cy.log(results)
    })
    localStorage.clear() // limpiamos por si acaso quedan restos de otras pruebas
    // crear usuario
    cy.request({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/users',
      form: false,
      body: {
        userName: 'test',
        email: Cypress.env('DEFAULT_EMAIL'),
        password: Cypress.env('DEFAULT_PASSWORD'),
        role: 'admin',
      },
    }).then(() => {
      localStorage.clear() // limpiamos por si acaso quedan restos de otras pruebas
      // ahora enviaremos una petición de login
      cy.request({
        method: 'POST',
        url: 'http://127.0.0.1:3000/api/users/login',
        form: false,
        body: {
          email: Cypress.env('DEFAULT_EMAIL'),
          password: Cypress.env('DEFAULT_PASSWORD'),
        },
      }).then((resp) => {
        // observa como ahora en cypress el token no está por ningún lado, si no visitamos la página y hacemos click, porque internamente en nuestra app, el comportamiento está desde angular n odesde cypress
        expect(resp.status).to.eq(201)
        // Comprobar si el access_token existe y no está vacío
        expect(resp.body).to.have.property(Cypress.env('JWT_NAME')).that.is.not
          .empty
        localStorage.setItem(
          Cypress.env('JWT_NAME'),
          resp.body[Cypress.env('JWT_NAME')],
        ) // por esto lo grabamos nosotros
        cy.wrap(localStorage)
          .invoke('getItem', Cypress.env('JWT_NAME'))
          .should('exist')
      })
    })
  })
  // enviamos credenciales incorrectas para ver el manejo de errores
  it('should return an error when invalid credentials are provided', () => {
    // Borramos cualquier usuario existente en la base de datos
    cy.task('queryDb', 'DELETE from user_entity').then((results) => {
      cy.log(results)
    })
    // Creamos un usuario en la base de datos
    cy.request({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/users',
      form: false,
      body: {
        userName: 'test',
        email: Cypress.env('DEFAULT_EMAIL'),
        password: Cypress.env('DEFAULT_PASSWORD'),
        role: 'admin',
      },
    })
    // Visitamos la página de inicio de sesión
    cy.visit('http://localhost:4200/#/login')
    // Limpiamos cualquier token que pueda estar en el localStorage
    localStorage.clear()
    // Interceptamos la solicitud de inicio de sesión y capturamos su respuesta
    cy.intercept('POST', 'http://127.0.0.1:3000/api/users/login').as(
      'loginRequest',
    )
    // Enviamos credenciales incorrectas al formulario de inicio de sesión, a través del comando login
    cy.loginByInterfaz(Cypress.env('DEFAULT_EMAIL'), 'wrong_password')
    // Esperamos a que se complete la solicitud de inicio de sesión
    cy.wait('@loginRequest').then((interception) => {
      // cy.log('## DATA: ', JSON.stringify(interception.response))
      // Accedemos a la respuesta del backend
      const response = interception.response
      // Verificamos la respuesta del backend
      expect(response.statusCode).to.eq(401) // Esperamos un código de estado 401 Wrong Credentials
      expect(response.body).to.have.property('message') // Esperamos que la respuesta tenga una propiedad message
    })
  })
})
