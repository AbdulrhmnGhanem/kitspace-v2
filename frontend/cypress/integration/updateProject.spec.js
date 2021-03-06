import faker from 'faker'

describe('Updating a project behavior validation', () => {
  const testRepoURL = 'https://github.com/AbdulrhmnGhanem/light-test-repo'
  const username = faker.name.firstName()
  const testRepoName = `${username}/light-test-repo`

  before(() => {
    cy.clearCookies()
    // create a user and sign him in
    const email = faker.internet.email()
    const password = '123456'
    cy.createUser(username, email, password)
    cy.visit('/login?login')
    cy.signIn(username, password)

    // sync the test repo
    cy.visit('/projects/new/')
    cy.get('input[name=url]').type(testRepoURL)
    cy.get('button').contains('Sync').click()
    cy.syncTestRepo()
  })

  it('should render the update page', () => {
    cy.stubUpdateProject(
      true,
      [
        { name: 'test1', size: 1234 },
        { name: 'test2', size: 12345 },
        { name: 'test3', size: 123456 },
      ],
      testRepoName,
    )
    // cy.visit(`projects/update/${testRepoName}`)
  })
})
