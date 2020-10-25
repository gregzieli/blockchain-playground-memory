const { assert } = require("chai");

/* eslint-disable no-undef */
const MemoryToken = artifacts.require("./MemoryToken.sol");

require("chai")
  .use(require("chai-as-promised"))
  .should();

contract("Memory Token", accounts => {
  let token;

  before(async () => {
    token = await MemoryToken.deployed();
  });

  describe("deployment", async () => {
    it("deploys successfully", async () => {
      const address = token.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, "");
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });

    it("has a name", async () => {
      const name = await token.name();
      assert.equal(name, "Memory Token");
    });

    it("has a symbol", async () => {
      const symbol = await token.symbol();
      assert.equal(symbol, "MEMORY");
    });
  });

  describe("token distribution", async () => {
    it("mints tokens", async () => {
      const userAccount = accounts[2];

      await token.mint(userAccount, "https://www.token-uri.com/nft");

      const supply = await token.totalSupply();
      assert.equal(supply.toString(), "1", "total supply is correct");

      const balance = await token.balanceOf(userAccount);
      assert.equal(balance.toString(), "1", "account balance is correct");

      const owner = await token.ownerOf("1");
      assert.equal(owner.toString(), userAccount.toString(), "owner is correct");

      const tokenIds = [];
      for (let i = 0; i < balance; i++) {
        const id = await token.tokenOfOwnerByIndex(userAccount, i);
        tokenIds.push(id.toString());
      }
      assert.equal(tokenIds.toString(), ["1"].toString(), "tokenIds are correct ");

      const uri = await token.tokenURI("1");
      assert.equal(uri, "https://www.token-uri.com/nft");
    });
  });
});
