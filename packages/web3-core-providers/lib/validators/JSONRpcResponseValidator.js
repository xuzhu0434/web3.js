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
 * @file JSONRpcResponseValidator.js
 * @authors: Samuel Furter <samuel@ethereum.org>
 * @date 2018
 */

"use strict";

var JSONRpcResponseValidator = {};

/**
 * Executes JSON-RPC response validation
 *
 * @method isValid
 *
 * @param {Object} response
 *
 * @returns {Boolean} true if response is valid, otherwise false
 */
JSONRpcResponseValidator.isValid = function (response) {
    if (Array.isArray(response)) {
        return response.every(this.validateSingleMessage)
    }

    return this.validateSingleMessage(response);
};

/**
 * Checks if jsonrpc response is valid
 *
 * @method validateSingleMessage
 *
 * @param {Object} response
 *
 * @returns {Boolean} true if response is valid, otherwise false
 */
JSONRpcResponseValidator.validateSingleMessage = function (response) {
    return !!response &&
        !response.error &&
        response.jsonrpc === '2.0' &&
        (typeof response.id === 'number' || typeof response.id === 'string') &&
        response.result !== undefined;
};

module.exports = JSONRpcResponseValidator;
