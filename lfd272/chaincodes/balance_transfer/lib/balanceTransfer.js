"use strict";

const { Contract } = require("fabric-contract-api");

const accountObjType = "Account";

class BalanceTransfer extends Contract {
  // Helpers
  async _accountExists(ctx, id) {
    const compositeKey = ctx.stub.createCompositeKey(accountObjType, [id]);
    const accountBytes = await ctx.stub.getState(compositeKey);
    return accountBytes && accountBytes.length > 0;
  }

  async _getAccount(ctx, id) {
    const compositeKey = ctx.stub.createCompositeKey(accountObjType, [id]);
    const accountBytes = await ctx.stub.getState(compositeKey);

    if (!accountBytes || accountBytes.length === 0) {
      throw new Error(`the account with id "${id}" does not exist`);
    }
    return JSON.parse(accountBytes.toString());
  }

  async _putAccount(ctx, account) {
    const compositeKey = ctx.stub.createCompositeKey(accountObjType, [id]);
    await ctx.stub.putState(compositeKey, Buffer.from(JSON.stringify(account)));
  }

  _getTxCreatorUID(ctx) {
    return JSON.stringify({
      mspid: ctx.clientIdentity.getMSPID(),
      id: ctx.clientIdentity.getID(),
    });
  }

  async initAccount(ctx, id, balance) {
    const accountBalance = parseFloat(balance);
    if (accountBalance < 0) {
      throw new Error(`acount balance can't be negative`);
    }

    const account = {
      id: id,
      owner: this._getTxCreatorUID(ctx),
      balance: accountBalance,
    };

    if (await this._accountExists(ctx, account.id)) {
      throw new Error(`the account with id: "${account.id}" already exists`);
    }

    await this._putAccount(ctx, account);
  }

  async setBalance(ctx, id, newBalance) {
    newBalance = parseFloat(newBalance);

    // Check if the account exists
    if (!this._accountExists(id)) {
      throw new Error(`cannot set balance\nno account with id "${account.id}"`);
    }

    const account = {
      id: id,
      owner: this._getTxCreatorUID(ctx),
      balance: newBalance,
    };

    // Update balance
    await this._putAccountAccount(ctx, account);
  }

  async transfer(ctx, idFrom, idTo, amount) {
    // Get both accounts
    const fromAccount = this._getAccount(ctx, idFrom);
    const toAccount = this._getAccount(ctx, idTo);

    // Subtract from fromAccount, add to toAccount
    fromAccount.balance -= amount;
    toAccount.balance += amount;

    // Use setBalance function
    await this.setBalance(ctx, fromAccount.id, fromAccount.balance);
    await this.setBalance(ctx, toAccount.id, toAccount.balance);
  }

  async listAccounts(ctx) {
    queryString = "";

    const iteratorPromise = ctx.stub.getQueryResult(queryString);

    let results = [];
    for await (const res of iteratorPromise) {
      results.push(JSON.parse(res.value.toString()));
    }

    return JSON.stringify(results);
  }
}

module.exports = BalanceTransfer;
