# argochain

Welcome to argochain, a PoS blockchain based on ethereum model with a VRF lottery validator mechanism.

# How to run

### With docker
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
npm run dev
```

# Structure

### Blockchain
...
### P2P network layer
...
### Transaction Layer and Validation
...
