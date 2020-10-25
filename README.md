# Memory

Simple React Memory game with ERC-721 NFT tokens.

Done with Dapp University: <https://www.youtube.com/watch?v=x-6ruqmNS3o>

```js
// After deploying the contract, open truffle console
truffle console

// Get the token
token = await MemoryToken.deployed();

// You can access its properties like so:
token.address
token.name()
```

## Tests

Truffle comes in bundled with the Mocha testing library.

```sh
truffle compile
truffle test
truffle migrate --reset
```
