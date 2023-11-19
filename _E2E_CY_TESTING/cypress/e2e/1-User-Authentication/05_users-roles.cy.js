/// <reference types="cypress" />

context('Create User', () => {
  it('endpoint: http://localhost:3000/api/users POST --> create(). Crear varios usuarios con diferentes roles y ver si siempre devuelve role="user" ', () => {
    cy.task("queryDb", "DELETE from user_entity").then(results => {
      cy.log(results)
    })
    // enviamos role='admin', recibimos role='user'
    cy.request({
      method:"POST",
      url: 'http://localhost:3000/api/users',
      form: false,
      body: {
          name: "user1",
          email: "user1@GMail.com",  // debe ser unico y lo convierte a minusculas
          password:"test12345678",
          role: 'admin'
      }
    }).then((resp)=> {
      expect(resp.status).to.eq(201)  // recurso creado
      expect(resp.body).to.have.property('role', 'user')  // 
      // console.log('## DATA: ', resp.body)
    });
    // enviamos role='user', recibimos role='user'
    cy.request({
      method:"POST",
      url: 'http://localhost:3000/api/users',
      form: false,
      body: {
          name: "user2",
          email: "user2@GMail.com",  // debe ser unico y lo convierte a minusculas
          password:"test12345678",
          role: 'user'
      }
    }).then((resp)=> {
      expect(resp.status).to.eq(201)  // recurso creado
      expect(resp.body).to.have.property('role', 'user')  // 
      // console.log('## DATA: ', resp.body)
    });
    // enviamos role='editor', recibimos role='user'
    cy.request({
      method:"POST",
      url: 'http://localhost:3000/api/users',
      form: false,
      body: {
          name: "user3",
          email: "user3@GMail.com",  // debe ser unico y lo convierte a minusculas
          password:"test12345678",
          role: 'editor'
      }
    }).then((resp)=> {
      expect(resp.status).to.eq(201)  // recurso creado
      expect(resp.body).to.have.property('role', 'user')  // 
      // console.log('## DATA: ', resp.body)
    });
    // enviamos ningún role, recibimos role='user'
    cy.request({
      method:"POST",
      url: 'http://localhost:3000/api/users',
      form: false,
      body: {
          name: "user4",
          email: "user4@GMail.com",  // debe ser unico y lo convierte a minusculas
          password:"test12345678"
      }
    }).then((resp)=> {
      expect(resp.status).to.eq(201)  // recurso creado
      expect(resp.body).to.have.property('role', 'user')  // 
      // console.log('## DATA: ', resp.body)
    });

    cy.request({
      method:"POST",
      url: 'http://localhost:3000/api/users',
      form: false,
      body: {
          name: "userAdmin",
          email: "admin@admin.com",  // debe ser unico y lo convierte a minusculas
          password:"test12345678"
      }
    }).then((resp)=> {
      expect(resp.status).to.eq(201)  // recurso creado
      expect(resp.body).to.have.property('role', 'admin')  // 
      // console.log('## DATA: ', resp.body)
    });
  });
});