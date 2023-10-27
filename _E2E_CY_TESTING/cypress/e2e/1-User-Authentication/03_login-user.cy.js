/// <reference types="cypress" />

context('Login User', ()=>{
  it('acceder al endpoint "/login" check password, hay que enviar email + password y deben ser válidas. Enviando desde botón usuario preestablecido por angular en el login component',()=>{
    // borrar la tabla
    cy.task("queryDb", "DELETE from user_entity").then(results => {
      cy.log(results)
    })
    // crear usuario
    cy.request({
      method:"POST",
      url: 'http://localhost:3000/api/users',
      form: false,
      body: {
          name: "test",
          email: "test@gmail.com",
          password:"test12345678",
          role: 'admin'
      }
    }).then(()=> {
      cy.visit('http://localhost:4200/login')
      localStorage.clear(); // limpiamos por si acaso quedan restos de otras pruebas
      cy.get('[data-test-id="emailField"]').type('test@gmail.com');
      cy.get('[data-test-id="passwordField"]').type('test12345678');
      cy.get('[data-test-id="submitButton"]').click()
        .then((resp) =>{
          cy.wrap(localStorage)
            .invoke('getItem', 'access_token')
            .should('exist')
      });
    })
  });

  it('acceder al endpoint "/login" enviando datos del login desde cypress',()=>{
      // visitemos la página y borremos el token
      cy.visit('http://localhost:4200/login').then(()=>{
      localStorage.clear();
      // enviamos un usuario para crearlo primero
      cy.request({
        method:"POST",
        url: 'http://localhost:3000/api/users',
        form: false,
        body: {
            name: "test",
            email: "test@gmail.com",
            password:"test12345678",
            role: 'admin'
        }
      }).then(()=> {
        // ahora enviaremos una petición de login
        cy.request({
          method:"POST",
          url: 'http://localhost:3000/api/users/login',
          form: false,
          body: {
              email: "test@gmail.com",
              password:"test12345678"
          }
        }).then((resp) => {
          // observa como ahora en cypress el token no está por ningún lado, si no visitamos la página y hacemos click, porque internamente en nuestra app, el comportamiento está desde angular n odesde cypress
          expect(resp.status).to.eq(201);
          localStorage.setItem('access_token', resp.body); // por esto lo grabamos nosotros
          cy.wrap(localStorage)
              .invoke('getItem', 'access_token')
              .should('exist');
        });
      });
    });
  });
});