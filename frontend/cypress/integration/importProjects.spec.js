import faker from 'faker'

describe('Importing a project behavior validation', () => {
  const username = faker.name.firstName()
  const email = faker.internet.email()
  const password = '123456'

  before(() => {
    cy.clearCookies()
    cy.createUser(username, email, password)
    cy.visit('/login')
    cy.signIn(username, password)
  })

  it('should sync a repo on gitea', () => {
    const syncedRepoUrl = 'https://github.com/AbdulrhmnGhanem/light-test-repo'
    const repoName = 'light-test-repo'

    cy.visit('/projects/new')
    cy.get('input:first').type(syncedRepoUrl)
    cy.get('button').contains('Sync').click()
    cy.syncTestRepo()

    cy.visit(`http://gitea.kitspace.test:3000/${username}`)
    cy.get('.ui.repository.list').children().get('.header').contains(repoName)
    cy.visit('/projects/mine')
  })

  it("should redirect to upload page if there's no conflict", () => {
    const fixtureFile = 'example.json'

    cy.visit('/projects/new')
    cy.get('.dropzone').attachFile(fixtureFile, { subjectType: 'drag-n-drop' })
  })
})
