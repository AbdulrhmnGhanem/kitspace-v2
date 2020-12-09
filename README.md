# Kitspace Using a Gitea Backend

_work in progress_

Re-writing [Kitspace](https://github.com/kitspace/kitspace) to use [Gitea](https://github.com/go-gitea/gitea) as a Git and authentication service.

## Goals
Allow people to:
1. Add projects without knowing Git/Github
2. Still import/sync external Git repositories
3. Edit/make improvements and propose these changes to project creators


## Development

### Set Up
0. Get all the source code
```
git clone https://github.com/kitspace/kitspace-using-gitea
cd kitspace-using-gitea
git submodule update --init
```

1. Install [Docker](https://www.docker.com/get-started) and [docker-compose](https://pypi.org/project/docker-compose/) (on Ubuntu: `snap install docker` and `apt install docker-compose`)
2. Add the following to `/etc/hosts` (or your platform's equivalent)

```
127.0.0.1	kitspace.test
127.0.0.1	gitea.kitspace.test
```

3. Copy the example .env

```
cp .env.example .env
```
4. Build and run the docker containers
```
docker-compose up
```

5. Go to [gitea.kitspace.test:3000/install](http://gitea.kitspace.test:3000/install) and complete the install (everything should already be filled in correctly). Create a new user and login.

6. Make sure to close any proxy service you have, otherwise you won't be able to access the site.

7. Making edits on the code in `frontend/` should auto compile and hot-reload at [kitspace.test:3000](http://kitspace.test:3000).
    
8. If you add a dependency to `frontent/package.json`, rebuild the frontend image using `docker-compose build --no-cache frontend`.

# Running Integration Tests
1. Make sure the frontend is being served at [http://kitspace.test:3000](http://kitspace.test:3000); by following the `Set Up` steps.
 
2. navigate to `frontend`: `cd frontend/`.

3. Source the `.env` file with `set -a && source ../.env && set +a`

4. Start the testing client with the `npx cypress open` command.

5. The Cypress GUI should pop up.

6. To run all tests, press `Run all specs`.
