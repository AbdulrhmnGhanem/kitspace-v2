/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * stub all request to the Gitea `/user/kitspace/sign_up`
     * @example
     * cy.stubSignUpReq(true, { email, ActiveCodeLives: duration })
     */
    stubSignUpReq(ok: boolean, response: ObjectLike): Chainable<any>
  }

  interface Chainable<Subject>{
    /**
     * Creat a user into Gitea
     * @example
     * cy.signUp(username, email, password)
     */
    signUp(username: string, email: string, password: string): Chainable<any>
  }
}