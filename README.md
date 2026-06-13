# KiteScope

> Small TypeScript scripts for inspecting addresses on the Kite chain — on-chain balances and a transparent reliability score.

## Overview

KiteScope is a pair of standalone TypeScript scripts for looking up information about an address on the Kite network. One script reads on-chain data directly via an RPC node (using viem); the other queries the KiteScan block explorer API and computes a simple, fully transparent reliability score. It is intended as a lightweight exploration/analysis tool, not a packaged library.

## Features

- **On-chain lookup** (`check.ts`): prints an address's native KITE balance and transaction count, read directly from a Kite RPC node.
- **Reliability score** (`scope.ts`): computes a 0–100 score for an address from KiteScan explorer data, printing a full per-component breakdown so the result is auditable. Components:
  - Success rate of recent transactions (up to 40 pts)
  - Recent activity / transaction volume (up to 25 pts)
  - Counterparty diversity (up to 20 pts)
  - Whether the contract is verified (10 pts)
  - Clean reputation, i.e. not flagged as scam (5 pts)

> Note: in both scripts the target address is currently hardcoded near the top of the file. Edit the `address` constant to inspect a different address.

## Tech stack

- TypeScript
- [viem](https://viem.sh) — JSON-RPC client used by `check.ts`
- KiteScan explorer REST API (`https://kitescan.ai/api/v2`) — data source for `scope.ts`
- Kite chain (chain id `2366`, RPC `https://rpc.gokite.ai/`)

## Getting started

### Prerequisites

- Node.js (a current LTS release)
- npm
- A TypeScript runner such as [`tsx`](https://github.com/privatenumber/tsx) or `ts-node` (the scripts are run directly, not compiled)

### Installation

```bash
npm install
```

This installs the only runtime dependency, viem.

### Configuration

No configuration or environment variables are required. The scripts use public endpoints (the Kite RPC URL and the KiteScan API) defined inline. To inspect a specific address, edit the `address` constant in `check.ts` and/or `scope.ts`.

### Running

Run either script with a TypeScript runner. For example, using `tsx` via `npx`:

```bash
# On-chain balance and tx count
npx tsx check.ts

# Transparent reliability score with breakdown
npx tsx scope.ts
```

The equivalent with `ts-node` (`npx ts-node check.ts`) also works.

## Usage

`check.ts` prints the address, its native KITE balance, and its transaction count:

```
Address:      0x...
KITE balance: 0.0
Tx count:     0
```

`scope.ts` prints address metadata, an overall reliability score out of 100, and the points awarded for each component:

```
=================================
Address:     0x...
Name:        (unnamed)
Is contract: false | Verified: false
---------------------------------
RELIABILITY SCORE: 0/100
---------------------------------
  Success rate             0/40
  Recent activity          0/25
  Counterparty diversity   0/20
  Verified                 0/10
  Clean reputation         0/5
=================================
```

## Testing

No tests are defined. The `npm test` script is the default placeholder and exits with an error.

## Status

Early/experimental. The two scripts are functional but minimal: each targets a single hardcoded address, there is no CLI argument parsing, no build step, and no test suite. The reliability score is a simple heuristic intended for exploration, not a security guarantee.

## License

ISC (declared in `package.json`). No `LICENSE` file is present in the repository.
