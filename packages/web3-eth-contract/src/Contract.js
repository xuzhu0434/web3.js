/*
 This file is part of web3.js.

 web3.js is free software: you can redistribute it and/or modify
 it under the terms of the GNU Lesser General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 web3.js is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Lesser General Public License for more details.

 You should have received a copy of the GNU Lesser General Public License
 along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * @file Contract.js
 * @author Samuel Furter <samuel@ethereum.org>
 * @date 2018
 */

"use strict";

var AbstractWeb3Object = require('web3-core-package').AbstractWeb3Object;

/**
 * @param {AbstractProviderAdapter} provider
 * @param {ProvidersPackage} providersPackage
 * @param {MethodController} methodController
 * @param {BatchRequestPackage} batchRequestPackage
 * @param {ContractPackageFactory} contractPackageFactory
 * @param {PromiEventPackage} promiEventPackage
 * @param {ABICoder} abiCoder
 * @param {Utils} utils
 * @param {Object} formatters
 * @param {Accounts} accounts
 * @param {ABIMapper} abiMapper
 * @param {Array} abi
 * @param {String} address
 * @param {Object} options
 *
 * @constructor
 */
function Contract(
    provider,
    providersPackage,
    methodController,
    batchRequestPackage,
    contractPackageFactory,
    promiEventPackage,
    abiCoder,
    utils,
    formatters,
    accounts,
    abiMapper,
    abi,
    address,
    options,
) {
    if (!(this instanceof Contract)) {
        throw new Error('Please use the "new" keyword to instantiate a web3.eth.contract() object!');
    }

    if (!abi || !(Array.isArray(abi))) {
        throw new Error('You must provide the json interface of the contract when instantiating a contract object.');
    }

    this.provider = provider;
    this.providersPackage = providersPackage;
    this.methodController = methodController;
    this.batchRequestPackage = batchRequestPackage;
    this.contractPackageFactory = contractPackageFactory;
    this.abiCoder = abiCoder;
    this.utils = utils;
    this.formatters = formatters;
    this.accounts = accounts;
    this.abiMapper = abiMapper;
    this.options = options;
    this.promiEventPackage = promiEventPackage;

    AbstractWeb3Object.call(
        this,
        this.provider,
        this.providersPackage,
        null,
        null,
        this.batchRequestPackage
    );

    this.defaultBlock = 'latest';
    address = this.utils.toChecksumAddress(this.formatters.inputAddressFormatter(address));

    var self = this,
        abiModel = abiMapper.map(abi),
        defaultAccount = null;

    /**
     * Defines accessors for contract address
     */
    Object.defineProperty(this.options, 'address', {
        set: function (value) {
            if (value) {
                address = self.utils.toChecksumAddress(self.formatters.inputAddressFormatter(value));
            }
        },
        get: function () {
            return address;
        },
        enumerable: true
    });

    /**
     * Defines accessors for jsonInterface
     */
    Object.defineProperty(this.options, 'jsonInterface', {
        set: function (value) {
            abiModel = self.abiMapper.map(value);
            self.methods.abiModel = abiModel;
            self.events.abiModel = abiModel;
        },
        get: function () {
            return abiModel;
        },
        enumerable: true
    });

    /**
     * Defines accessors for defaultAccount
     */
    Object.defineProperty(this, 'defaultAccount', {
        get: function () {
            if (!defaultAccount) {
                return this.options.from;
            }

            return defaultAccount;
        },
        set: function (val) {
            if (val) {
                defaultAccount = self.utils.toChecksumAddress(self.formatters.inputAddressFormatter(val));
            }

        },
        enumerable: true
    });

    this.methods = contractPackageFactory.createMethodsProxy(
        this,
        abiModel,
        this.methodController,
        this.promiEventPackage
    );

    this.events = contractPackageFactory.createEventSubscriptionsProxy(
        this,
        abiModel,
        this.methodController
    );
}

/**
 * Adds event listeners and creates a subscription, and remove it once its fired.
 *
 * @method once
 *
 * @param {String} eventName
 * @param {Object} options
 * @param {Function} callback
 *
 * @callback callback callback(error, result)
 * @returns {undefined}
 */
Contract.prototype.once = function (eventName, options, callback) {
    if (!callback) {
        throw new Error('Once requires a callback.');
    }

    if (options) {
        delete options.fromBlock;
    }

    var eventSubscription = this.events[event](options, callback);

    eventSubscription.on('data', function() {
        eventSubscription.unsubscribe();
    });

    return undefined;
};

Contract.prototype.getPastEvents = function () {
    // var subOptions = this._generateEventOptions.apply(this, arguments);
    //
    // var getPastLogs = new Method({
    //     name: 'getPastLogs',
    //     call: 'eth_getLogs',
    //     params: 1,
    //     inputFormatter: [formatters.inputLogFormatter],
    //     outputFormatter: this._decodeEventABI.bind(subOptions.event)
    // });
    // getPastLogs.setRequestManager(this._requestManager);
    // var call = getPastLogs.buildCall();
    //
    // getPastLogs = null;
    //
    // return call(subOptions.params, subOptions.callback);
};

Contract.prototype.deploy = function () {

};

/**
 * Return an new instance of the Contract object
 *
 * @method clone
 *
 * @returns {Contract}
 */
Contract.prototype.clone = function () {
    return new this.constructor(
        this.provider,
        this.providersPackage,
        this.methodController,
        this.batchRequestPackage,
        this.contractPackageFactory,
        this.promiEventPackage,
        this.abiCoder,
        this.utils,
        this.formatters,
        this.accounts,
        this.abiMapper,
        this.options.jsonInterface,
        this.options.address,
        this.options
    );
};

Contract.prototype = Object.create(AbstractWeb3Object.prototype);
Contract.prototype.constructor = Contract;

module.exports = Contract;
