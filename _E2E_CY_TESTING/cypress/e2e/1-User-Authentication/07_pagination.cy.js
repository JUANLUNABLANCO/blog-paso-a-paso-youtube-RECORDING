/// <reference types="cypress" />

import { USERS } from '../../utilities/faker-data';

// task-10
context('Pagination, get all Users, without filtering "name" parameter', () => {
  it('Creamos veinticinco usuarios en la base de datos, borrando los que ya había de anteriores tests, tendremos 25 usuarios aleatorios.', () => {
    cy.task("queryDb", "DELETE from user_entity").then(results => {
      cy.log(results)
    })
    // enviamos data ficticia desde Faker 25 usuarios aleatorios
    USERS.forEach(( user )=>{
      cy.request({
        method:"POST",
        url: 'http://localhost:3000/api/users',
        form: false,
        body: user
      }).then((resp)=> {
        expect(resp.status).to.eq(201)  // recurso creado
        expect(resp.body).to.have.property('role', 'user')
        expect(resp.body).to.have.property('name')
        expect(resp.body).to.have.property('email')
        expect(resp.body).to.have.property('id')
        // console.log('## DATA: ', resp.body)
      });
    });
    // paginacion
    cy.request({
      method:"GET",
      url: 'http://localhost:3000/api/users',
      form: false,
    }).then((resp) => {
      expect(resp.body).to.have.property('items')
      // cy.log('### DATA: ', resp.body.items)
      expect(resp.body.items[0]).not.to.be.null
      expect(resp.body.items[24]).not.to.be.null
    })
  });

  it('Paginacion: de 10 en 10 solicito la primera página, sino ponemos parametro en la url, por defecto es la primera página y va de 10 en 10', () => {

  cy.request({
    method:"GET",
    url: 'http://localhost:3000/api/users',
    form: false
    }).then((resp)=> {
      expect(resp.status).to.eq(200)  // recurso creado
      expect(resp.body).to.have.property('items')
      // cy.log('### DATA: ', resp.body.items)
      expect(resp.body.items[0]).not.to.be.null
      expect(resp.body.items[9]).not.to.be.null
      });
  });

  it('Paginacion: de 20 en 20 solicito la segunda página, me debe devolver 5 usuarios', () => {

    cy.request({
      method:"GET",
      url: 'http://localhost:3000/api/users?limit=20&page=2',
      form: false
      }).then((resp)=> {
        expect(resp.status).to.eq(200)  // recurso creado
        expect(resp.body).to.have.property('items')
        // cy.log('### DATA: ', resp.body.items)
        expect(resp.body.items[0]).not.to.be.null
        expect(resp.body.items[4]).not.to.be.null
        });
    });
});

// task-11
context('Pagination, get all Users with filtering name="test"', () => {
  it('Creamos veinticinco usuarios en la base de datos, borrando los que ya había de anteriores tests, tendremos 25 usuarios aleatorios.', () => {
    cy.task("queryDb", "DELETE from user_entity").then(results => {
      cy.log(results)
    })
    // enviamos data ficticia desde Faker 25 usuarios aleatorios
    USERS.forEach(( user )=>{
      cy.request({
        method:"POST",
        url: 'http://localhost:3000/api/users',
        form: false,
        body: user
      }).then((resp)=> {
        expect(resp.status).to.eq(201)  // recurso creado
      });
    });
    // paginacion
    cy.request({
      method:"GET",
      url: 'http://localhost:3000/api/users',
      form: false,
    }).then((resp) => {
      expect(resp.body).to.have.property('items')
      // cy.log('### DATA: ', resp.body.items)
      expect(resp.body.items[0]).not.to.be.null
      expect(resp.body.items[24]).not.to.be.null
    })
  });

  it('creamos dos usuarios más con name="test" y name="test2", respectivamente. Los usaremos para el filtrado', () => {

    const user1 = {
      name: "test",
      email: "test@gamil.com",
      password: "test12345678"
    };
    const user2 = {
      name: "test2",
      email: "test2@gamil.com",
      password: "test12345678"
    };
    cy.request({
      method:"POST",
      url: 'http://localhost:3000/api/users',
      form: false,
      body: user1
    }).then((resp)=>{
        expect(resp.status).to.eq(201)  // recurso creado
        expect(resp.body).to.have.property('name', 'test')
        cy.request({
          method:"POST",
          url: 'http://localhost:3000/api/users',
          form: false,
          body: user2
      }).then((resp)=>{
        expect(resp.status).to.eq(201)  // recurso creado
        expect(resp.body).to.have.property('name', 'test2');
      });
    });
  });

  it('Paginacion: de 10 en 10, solicito la primera página, pero añadimos el "name"="test", devolverá solo dos usuarios coincidentes', () => {

    cy.request({
      method:"GET",
      url: 'http://localhost:3000/api/users?page=0&limit=10&name=test',
      form: false
      }).then((resp)=> {
        expect(resp.status).to.eq(200)  // recurso creado
        cy.log('Data: ', resp.body.items)
        expect(resp.body).to.have.property('items')
        // empieza las comprobaciones, aquí el test inicialmente sin código fallará.
        expect(resp.body.items[0]).not.to.be.null
        expect(resp.body.items[1]).not.to.be.null

        expect(resp.body.items[0]).to.have.property('name', 'test');  // exactamente aquí.
        expect(resp.body.items[1]).to.have.property('name', 'test2');
      });
  });
});

// task-12
context('Pagination, Real Time Server Side User Search with Pagination', () => {
  it('Creamos veinticinco usuarios en la base de datos, borrando los que ya había de anteriores tests, tendremos 25 usuarios aleatorios.', () => {
    cy.task("queryDb", "DELETE from user_entity").then(results => {
      cy.log(results)
    })
    // enviamos data ficticia desde Faker 25 usuarios aleatorios
    USERS.forEach(( user )=>{
      cy.request({
        method:"POST",
        url: 'http://localhost:3000/api/users',
        form: false,
        body: user
      }).then((resp)=> {
        expect(resp.status).to.eq(201)  // recurso creado
      });
    });
    // paginacion
    cy.request({
      method:"GET",
      url: 'http://localhost:3000/api/users',
      form: false,
    }).then((resp) => {
      expect(resp.body).to.have.property('items')
      // cy.log('### DATA: ', resp.body.items)
      expect(resp.body.items[0]).not.to.be.null
      expect(resp.body.items[24]).not.to.be.null
    })
  });

  it('creamos dos usuarios más con name="test" y name="test2", respectivamente. Los usaremos para el filtrado', () => {

    const user1 = {
      name: "test",
      email: "test@gamil.com",
      password: "test12345678"
    };
    const user2 = {
      name: "test2",
      email: "test2@gamil.com",
      password: "test12345678"
    };
    cy.request({
      method:"POST",
      url: 'http://localhost:3000/api/users',
      form: false,
      body: user1
    }).then((resp)=>{
        expect(resp.status).to.eq(201)  // recurso creado
        expect(resp.body).to.have.property('name', 'test')
        cy.request({
          method:"POST",
          url: 'http://localhost:3000/api/users',
          form: false,
          body: user2
      }).then((resp)=>{
        expect(resp.status).to.eq(201)  // recurso creado
        expect(resp.body).to.have.property('name', 'test2');
      });
    });
  });

  // debemos ir escribiendo el nombre a buscar y nos debe devolver una respuesta en tiempo real
  it('Escribiremos dentro del formulario de busqueda, campo [data-test-id]="searchNameField"', () =>{
    cy.visit('http://localhost:4200/users') // http://localhost:4200/users
    cy.get('[data-test-id="searchNameField"]').focus().type('test');  // el focus es importante para que desaparezca el mat-label que está encima
    cy.get('[data-test-id="usersTable"]').get('mat-row').eq(0).get('mat-cell').eq(1).contains('test');  // accedemos a la tabla row[0] (registro 1) cell[1] columna name
    cy.get('[data-test-id="usersTable"]').get('mat-row').eq(1).get('mat-cell').eq(1).contains('test');  // accedemos a la tabla row[1] (registro 2) cell[1] columna name 
  });

});
