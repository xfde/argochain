# argochain

Welcome to argochain, a PoS blockchain based on ethereum model with a VRF lottery validator mechanism.

# How to run

### RUNNING THE BLOCK EXPLORER

To run the block explorer navigate into `./block_exporer` and run `yarn install` or `npm install`
Then just run `yarn start` or `npm run start`

### RUNNING THE NODES FOR THE BLOCKCHAIN

### With docker

# WARNING : DOCKER IS NOT STABLE ON THE LATEST VERSION

Make sure you have [docker](https://docs.docker.com/get-docker/) installed. Then while in the root directory of the project run the follwing to build the image.

```
docker build . -t <user>/node
```

Then run the image with:

```
docker run -p 5001:5001 -d <user>/node
```

### Without docker

You can run the application without docker by just using [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

Install the dependecies

```
npm i
```

Then run the porject locally with:

```
npm run production
```

For the production envirionment or

```
npm run dev
```

For the development environment

### Multiple instances

For first node:

```
set P2P_PORT=5001 && set HTTP_PORT=3001 && npm run dev

```

For second node:

```
set P2P_PORT=5002 && set HTTP_PORT=3002 &&set PEERS=ws://localhost:5001 && npm run dev
```

### Structure
...

### Blockchain

...

### P2P network layer

...

### Transaction Layer and Validation

...
