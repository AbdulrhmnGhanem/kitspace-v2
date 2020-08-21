import React from 'react'
import { Button, Container, Form, Grid, Header, Icon, Segment, Tab } from 'semantic-ui-react'
import TitleBar from '../components/TitleBar'


const panes = [
  {
    menuItem: 'login',
    render: () => {
      return <>
        <Header as='h2' color='teal' textAlign='center'>Login</Header>
        <Form size="large">
          <Segment stacked>
            <Form.Input fluid
                        icon='user'
                        iconPosition='left'
                        placeholder='username'
                        style={{ marginBottom: 20 }}/>
            <Form.Input fluid
                        icon='lock'
                        iconPosition='left'
                        placeholder='Password'
                        type='password'
                        style={{ marginBottom: 20 }}/>

            <Button color='green' fluid size='large'>Login</Button>
          </Segment>
        </Form>
        <Header as='h3' textAlign='center'>Or with</Header>
        <Grid columns={3} divied>
          <Grid.Row>
            <Grid.Column>
              <Button color='twitter'>
                <Icon name='twitter'/> Twitter
              </Button>
            </Grid.Column>
             <Grid.Column>
              <Button color='github'>
                <Icon name='github'/> GitHub
              </Button>
            </Grid.Column>
            <Grid.Column>
              <Button color='blue'>
                <Icon name='google'/> Google
              </Button>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </>
    },
  },
  { menuItem: 'sign up', render: () => <Tab.Pane>sign up exists here</Tab.Pane> },
]


export default function() {
  return <>
    <TitleBar route='/auth/'/>
    <Container style={{ marginTop: 30 }}>
      <Grid textAlign='center' verticalAlign='middle'>
        <Grid.Column style={{ maxWidth: 450 }}>
          <Tab panes={panes}/>
        </Grid.Column>
      </Grid>
    </Container>
  </>
}