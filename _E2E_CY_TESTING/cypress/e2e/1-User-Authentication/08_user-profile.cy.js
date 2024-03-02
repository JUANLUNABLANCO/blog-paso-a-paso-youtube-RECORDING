/// <reference types="cypress" />

// import 'cypress-file-upload': // WARNING con interfaz puedes usar este plugin haciendo:
// cy.get('[cy-data-file="file-upload"]').atachFile(yourPathFile);

import { USERS } from '../../utilities/faker-data'

// import "cypress-localstorage-commands";

context(
  'Teniendo ualgunos registros creados, vamos a subir una imagen para uno de ellos y ver que accediendo a la página del perfil de ese usuario, tenemos todos sus datos de perfil',
  () => {
    // ESTO es suceptible de convertirse en un comando, ya que es muy usado
    beforeEach(
      '1. Limpiar base de datos, 2. crear 25 usuarios aleatorios, 3. create one knowed user, 4. login with this user',
      () => {
        // ## 1
        cy.task('queryDb', 'DELETE from user_entity').then((results) => {
          cy.log(results)
        })

        // ## 2
        USERS.forEach((user) => {
          cy.request({
            method: 'POST',
            url: `${Cypress.env('API_URL')}/api/users`,
            form: false,
            body: user,
          }).then((resp) => {
            expect(resp.status).to.eq(201) // recurso creado
            expect(resp.body).to.have.property('role', 'user')
            // console.log('## DATA: ', resp.body)
          })
        })

        // ## 3
        cy.visit('http://localhost:4200/register')
        cy.get('[data-test-id="nameField"]').type('test')
        cy.get('[data-test-id="emailField"]').type('test@gmail.com')
        cy.get('[data-test-id="passwordField"]').type('test12345678')
        cy.get('[data-test-id="confirmPasswordField"]').type('test12345678')
        cy.get('[data-test-id="submitButton"]')
          .should('not.be.disabled')
          .click()

        // ## 4
        // WARNING si lo haces por interfaz a través de ng, perfecto el access_token será guardado autmáticamente por angular tras recibir la respuesta del servidor, y eso es lo
        // malo, tienes que interceptar esa respuesta porque es un proceso asíncrono, no vale acceder al localStorage después de hacer clic en el botón de envío del formulario
        // del login, pues primero deberá acceder al backend, después hacer las comprobaciones en base de datos, desencriptando la contraseña por último tras comprobar si si
        // o si no, enviará una respuesta y por último NG recogerá esa respuesta y lo grabará en el localStorage esto puede tardar unos segundos o décimas incluso más
        // en servidores remotos...
        // O puedes hacer un beforEach() cada proceso it() es asincrono, por tanto cuando comiences uno nuevo el localStorage ya tendrá ese access_token
        // ########################################################################################################################################################################
        cy.visit('http://localhost:4200/login')
        localStorage.clear() // limpiamos por si acaso quedan restos de otras pruebas
        cy.get('[data-test-id="emailField"]').type('test@gmail.com')
        cy.get('[data-test-id="passwordField"]').type('test12345678')
        cy.get('[data-test-id="submitButton"]')
          .click()
          .then((resp) => {
            cy.wrap(localStorage)
              .invoke('getItem', Cypress.env('JWT_NAME'))
              .should('exist')
          })
      },
    )

    it('Guardamos el access_token. Vamos a actualizar este usuario subiendo una imagen de perfil de ejemplo, comprobaremos la imagen', () => {
      // ## 5
      // WARNING tras el login (lo habíamos hecho sin interfaz, debes hacerlo a través de la interfaz, para que sea e2e test y para que el access_token
      // se guarde en el localStorage), es importante hacer el beforeEach() después del login porque los it() no son asíncronos.
      // Pero cuidado si pones otro it(), generarás usuarios nuevos
      // #################################################################################################################
      console.log(
        '## access_token: ',
        localStorage.getItem(Cypress.env('JWT_NAME')),
      ) // ahora si existe
      Cypress.env('token', localStorage.getItem(Cypress.env('JWT_NAME')))

      // posteriormente enviaremos el fichero imageProfile
      const token = Cypress.env('token')
      const authorization = `bearer ${token}`
      console.log('## token: ', token)
      console.log('## auth: ', authorization)

      // DECODIFICADOR JWT
      const decodeJWT = (token) => {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(
          window
            .atob(base64)
            .split('')
            .map(function (c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            })
            .join(''),
        )
        return JSON.parse(jsonPayload)
      }
      // DECODIFICADOR JWT

      const payload = decodeJWT(token)
      const idUser = payload.user.id
      console.log('## Payload: ', payload) // user: { id: , email: ...}
      console.log('## idUser: ', idUser) // user: { id: , email: ...}

      // Subir un fichero tipo imagen perfil .jpg .png, hay que añadir el token a la cabecera de la petición y suministrar el fichero

      // SININTERFAZ -- DIFICIL -- no existía documentación clara para esto y excasos o nulos ejemplos en internet
      const fileName = 'imageExampleProfile.png' // COLOCADO DENTRO DE ./fixtures
      const method = 'POST'
      const url = 'http://localhost:3000/api/users/upload'
      const headers = { authorization }
      // const mimeType = 'image/png';
      // const expectedAnswer = '{"msg":"file uploaded"}';

      cy.fixture(fileName, 'binary')
        .then((binary) => Cypress.Blob.binaryStringToBlob(binary))
        .then((blob) => {
          const formData = new FormData()
          formData.set('file', blob)

          cy.request({
            method: method,
            url: url,
            headers: headers,
            // encoding: 'base64',
            form: false,
            body: formData,
          }).then((resp) => {
            console.log(resp.body)
          })
        })

      // CONINTERFAZ -- FACIL --
      // si existe la interfaz de ng para subir el fichero
      // cy.get('input[type="file"]').as('fileInput'); // obtenemos el input de tipo fichero o '[data-test-id="inputFileField"]'
      // cy.fixture('example.png').then(fileContent => {
      //   cy.get('@fileInput').attachFile({
      //   fileContent: fileContent.toString(),
      //   fileName: 'imageExampleProfile.png',
      //   mimeType: 'image/png'
      //   });
      // });

      // const fileName = 'imageExampleProfile.png'; // COLOCADO DENTRO DE ./fixtures
      // const method = 'POST';
      // const url = 'http://localhost:3000/api/users/upload';
      // const fileType = 'image/png';
      // const inputContent2 = 'input_content2';
    })

    it('Entrar en el perfil del usuario y ver que la imagen se corresponde a la que teníamos previamente', () => {
      console.log(
        'queda pendiente hasta que averiüemos como hacer esta comprobación',
      )
    })
  },
)

// it('Paginacion: de 50 en 505, y hacemos click en el último de ellos, para comprobar su perfil, el item 26', () => {

// cy.request({
//   method:"GET",
//   url: 'http://localhost:3000/api/users?page=1&limit=50',
//   form: false
//   }).then((resp)=> {
//     expect(resp.status).to.eq(200)  // recurso creado
//     expect(resp.body).to.have.property('items')
//     // cy.log('### DATA: ', resp.body.items)
//     expect(resp.body.items[0]).not.to.be.null
//     expect(resp.body.items[25]).not.to.be.null
//     });
// });
