/// <reference types="cypress" />

context(
  'Create Admin, create user, login admin and update role of user: ',
  () => {
    it('endpoint:  ', () => {
      cy.task('queryDb', 'DELETE from user_entity').then((results) => {
        cy.log(results)
      })
      // create admnin
      cy.request({
        method: 'POST',
        url: `${Cypress.env('API_URL')}/api/users`,
        form: false,
        body: {
          userName: 'admin',
          email: Cypress.env('ADMIN_EMAIL'),
          password: Cypress.env('DEFAULT_PASSWORD'),
          role: 'admin',
        },
      }).then((resp) => {
        expect(resp.status).to.eq(201) // recurso creado
        expect(resp.body.user).to.have.property('userName', 'admin')
        expect(resp.body.user).to.have.property(
          'email',
          Cypress.env('ADMIN_EMAIL'),
        )
        expect(resp.body.user).to.have.property('role', 'admin')
        expect(resp.body.user).to.have.property('id')
        // console.log('## DATA: ', resp.body)
      })
      // create user role user
      cy.request({
        method: 'POST',
        url: `${Cypress.env('API_URL')}/api/users`,
        form: false,
        body: {
          userName: 'user',
          email: 'user@gmail.com',
          password: 'test12345678',
        },
      }).then((resp) => {
        expect(resp.status).to.eq(201) // recurso creado
        expect(resp.body.user).to.have.property('userName', 'user')
        expect(resp.body.user).to.have.property('email', 'user@gmail.com')
        expect(resp.body.user).to.have.property('role', 'user')
        expect(resp.body.user).to.have.property('id')
        // console.log('## DATA: ', resp.body)
        // anotamos su id
        Cypress.env('id', resp.body.user.id)
        cy.log('############# id', resp.body.id)
      })
      // user admin login and receive access_token
      cy.request({
        method: 'POST',
        url: 'http://localhost:3000/api/users/login',
        form: false,
        body: {
          email: Cypress.env('ADMIN_EMAIL'),
          password: Cypress.env('DEFAULT_PASSWORD'),
        },
      }).then((resp) => {
        // observa como ahora en cypress el token no está por ningún lado, si no visitamos la página y hacemos click, porque internamente en nuestra app, el comportamiento está desde angular n odesde cypress
        expect(resp.status).to.eq(201)
        cy.log('token ', resp.body[Cypress.env('JWT_NAME')])
        localStorage.setItem(
          Cypress.env('JWT_NAME'),
          resp.body[Cypress.env('JWT_NAME')],
        )

        cy.wrap(localStorage)
          .invoke('getItem', Cypress.env('JWT_NAME'))
          .should('exist')
        // enviar token en la cabecera para poder operar como admin // admin update user.role='editor'
        // Cypress.env('token', resp.body);
        // const authorization = `bearer ${Cypress.env('token')}`; // usar esta forma cuando son requests diferentes
        const authorization = `Bearer ${localStorage.getItem(
          Cypress.env('JWT_NAME'),
        )}`

        cy.request({
          method: 'PUT',
          url: `http://localhost:3000/api/users/${Cypress.env('id')}/role`,
          form: false,
          headers: { authorization },
          body: {
            role: 'editor',
          },
        }).then((resp) => {
          expect(resp.status).to.eq(200)
          // comprobemos que el usuario ha sido actualizado, podemos encontrarlo por su id  y por su email
          cy.request({
            method: 'POST',
            url: 'http://localhost:3000/api/users/email',
            form: false,
            body: {
              email: 'user@gmail.com',
            },
          }).then((resp) => {
            expect(resp.status).to.eq(201)
            expect(resp.body.user).to.have.property('role', 'editor')
          })
        })
      })
    })
  },
)
