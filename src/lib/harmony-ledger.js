/*
 * Copyright (c) 2018-2019 Simple Rules Company.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */
import {
    arrayify, hexlify, stripZeros, encode,
} from '@harmony-js/crypto';

const { hexToNumber } = require('@harmony-js/utils');

const CLA = 0xE0;
const CHUNK_SIZE = 255;
const INS = {
    GET_VERSION: 0x01,
    GET_PUBLIC_KEY: 0x02,
    SIGN_STAKING: 0x04,
    SIGN_TX: 0x08,
};
export const SW_ERR = 0x6985;
const CMDS = {
    P1_FIRST: 0x0,
    P1_MORE: 0x80,
    P2_SIGNHASH: 0x01,
    P2_FINISH: 0x02,
};


function hexToBytes(hex) {
    const bytes = [];
    for (let c = 0; c < hex.length; c += 2) {
        if (hex.substr(c, 2) !== '0x') {
            bytes.push(parseInt(hex.substr(c, 2), 16));
        }
    }
    return bytes;
}

function processErrorResponse(response) {
    return {
        signature: Buffer.from('0x0'),
        return_code: SW_ERR,
    };
}

export default class HarmonyApp {
    constructor(transport, scrambleKey = 'CSM') {
        if (typeof transport === 'undefined') {
            throw new Error('Transport has not been defined');
        }
        this.transport = transport;
        transport.decorateAppAPIMethods(
            this,
            [
                'getVersion',
                'publicKey',
                'signTx',
                'signStake',
            ],
            scrambleKey,
        );
    }

    async getVersion() {
        let resp;
        try {
            resp = await this.transport.send(CLA, INS.GET_VERSION, 0, 0);
        } catch (err) {
            return processErrorResponse(resp);
        }
        const errorCodeData = resp.slice(-2);
        const returnCode = errorCodeData[0] * 256 + errorCodeData[1];
        return {
            return_code: returnCode,
            // ///
            test_mode: false,
            major: resp[0],
            minor: resp[1],
            patch: resp[2],
        };
    }

    async publicKey(silentMode) {
        let resp;
        try {
            if (silentMode) {
                resp = await this.transport.send(CLA, INS.GET_PUBLIC_KEY, 0, 1);
            } else {
                resp = await this.transport.send(CLA, INS.GET_PUBLIC_KEY, 0, 0);
            }
        } catch (err) {
            return processErrorResponse(resp);
        }
        const errorCodeData = resp.slice(-2);
        const returnCode = errorCodeData[0] * 256 + errorCodeData[1];

        return {
            one_address: Buffer.from(resp.slice(0, 42)),
            return_code: returnCode,
        };
    }

    async signTx(message) {
        let resp;
        const p = hexToBytes(message);
        try {
            resp = await this.transport.send(CLA, INS.SIGN_TX, 0, 0, Buffer.from(p));
        } catch (err) {
            return processErrorResponse(resp);
        }
        const errorCodeData = resp.slice(-2);
        const returnCode = errorCodeData[0] * 256 + errorCodeData[1];
        return {
            signature: Buffer.from(resp.slice(0, 65)),
            return_code: returnCode,
        };
    }

    async signStake(message) {
        let resp = null;
        const p = hexToBytes(message);
        const buffer = Buffer.from(p);
        const chunks = [];
        for (let i = 0; i < buffer.length; i += CHUNK_SIZE) {
            let end = i + CHUNK_SIZE;
            if (i > buffer.length) {
                end = buffer.length;
            }
            chunks.push(buffer.slice(i, end));
        }

        try {
            for (let i = 0; i < chunks.length; i += 1) {
                const p1 = (i === 0) ? CMDS.P1_FIRST : CMDS.P1_MORE;
                const p2 = (i === chunks.length - 1) ? CMDS.P2_FINISH : CMDS.P2_SIGNHASH;
                // eslint-disable-next-line
                resp = await this.transport.send(CLA, INS.SIGN_STAKING, p1, p2, chunks[i]);
            }
        } catch (err) {
            return processErrorResponse(resp);
        }
        const errorCodeData = resp.slice(-2);
        const returnCode = errorCodeData[0] * 256 + errorCodeData[1];
        return {
            signature: Buffer.from(resp.slice(0, 65)),
            return_code: returnCode,
        };
    }

    static async getAccountShardNonce(address, shardID, messenger) {
        const nonce = await messenger.send(
            'hmy_getTransactionCount',
            [address, 'latest'],
            messenger.chainPrefix,
            shardID,
        );

        if (nonce.isError()) {
            throw nonce.error.message;
        }
        return Number.parseInt(hexToNumber(nonce.result), 10);
    }

    async signTransaction(txn, chainId, shardId, messenger) {
        // get public address of ledger account
        let response = await this.publicKey(true);
        if (response.return_code !== 0x9000) {
            this.log(`Error [${response.return_code}] ${response.error_message}`);
            return;
        }

        // get nonce for the current account/shardID and set the transaction nonce
        const address = response.one_address.toString();
        const accountNonce = await HarmonyApp.getAccountShardNonce(
            address, shardId, messenger,
        );
        txn.setParams({ ...txn.txParams, nonce: accountNonce });

        // sign RLP encoded raw transaction using ledger private key
        const [unsignedRawTransaction, raw] = txn.getRLPUnsigned();
        response = await this.signTx(unsignedRawTransaction);

        if (response.return_code == SW_ERR) {
            throw new Error('Reject by Leger');
        }

        // update the signature r,s,v field in transaction
        const bytes = response.signature;
        const r = hexlify(bytes.slice(0, 32));
        const s = hexlify(bytes.slice(32, 64));
        let v = bytes[64];
        if (v !== 27 && v !== 28) {
            v = 27 + (v % 2);
        }

        // replace empty r,s,v with signature r,s,v
        raw.pop();
        raw.pop();
        raw.pop();

        v += chainId * 2 + 8;
        raw.push(hexlify(v));
        raw.push(stripZeros(arrayify(r) || []));
        raw.push(stripZeros(arrayify(s) || []));

        const encodedRaw = encode(raw);
        txn.setParams({ ...txn.txParams, rawTransaction: encodedRaw });

        return txn;
    }

    async signStakingTransaction(stakingTxn, chainId, shardId, messenger) {
        // get public address of ledger account
        let response = await this.publicKey(true);
        if (response.return_code !== 0x9000) {
            this.log(`Error [${response.return_code}] ${response.error_message}`);
            return;
        }

        // get nonce for the current account/shardID and set the transaction nonce
        const address = response.one_address.toString();
        let accountNonce = await HarmonyApp.getAccountShardNonce(
            address, shardId, messenger,
        );

        // special handling for 0 as accountNonce so that RLP encoding works
        if (accountNonce === 0) {
            accountNonce = '0x';
        }

        stakingTxn.setNonce(accountNonce);
        stakingTxn.setFromAddress(address);

        const [unsignedRawTransaction, raw] = stakingTxn.encode();
        stakingTxn.setUnsigned(unsignedRawTransaction);

        response = await this.signStake(unsignedRawTransaction);

        if (response.return_code == SW_ERR) {
            throw new Error('Reject by Leger');
        }

        const bytes = response.signature;
        const r = hexlify(bytes.slice(0, 32));
        const s = hexlify(bytes.slice(32, 64));
        let v = bytes[64];
        if (v !== 27 && v !== 28) {
            v = 27 + (v % 2);
        }

        // replace empty r,s,v with signature r,s,v
        raw.pop();
        raw.pop();
        raw.pop();
        v += chainId * 2 + 8;
        raw.push(hexlify(v));
        raw.push(stripZeros(arrayify(r) || []));
        raw.push(stripZeros(arrayify(s) || []));
        const encodedRaw = encode(raw);
        stakingTxn.setRawTransaction(encodedRaw);

        return stakingTxn;
    }
}
