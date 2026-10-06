# Analysis of Issue #99: Harmony One Wallet Import Account Bug

## Problem Summary
When importing a wallet using a 12-word mnemonic seed phrase, the extension generates a different wallet address instead of restoring the original one. This affects all common derivation paths.

## Root Cause
The `importMnemonic` function in `src/shared/utils/crypto.ts` only supports BIP-44 derivation path (`m/44'/1023'/0'/0/0`), but users may have created their original wallet using different derivation paths:
- **BIP-44** (`m/44'/1023'/0'/0/0`) — used by newer wallets
- **BIP-49** (`m/49'/1023'/0'/0/0`) — legacy nested SegWit
- **BIP-84** (`m/84'/1023'/0'/0/0`) — native SegWit

When the user originally created their wallet on another platform (or a different version of the extension), it likely used BIP-49 or BIP-84. The import function then derives a completely different address from the same seed using BIP-44, resulting in a zero-balance wallet.

## Fix
Modify `src/shared/utils/crypto.ts` to try multiple derivation paths when importing a mnemonic, then return the first account that has a non-zero balance on-chain. If no account has a balance, fall back to BIP-44.

## Files to Modify
1. `src/shared/utils/crypto.ts` — Update `importMnemonic` to try multiple paths
2. Potentially update UI to show which path was matched

Now let me fetch and read the actual source files.
