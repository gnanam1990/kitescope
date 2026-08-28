# kitescope

Transparent on-chain reliability scoring for [Kite](https://gokite.ai) addresses.

Most reputation scores are a single opaque number. kitescope shows you every
component that went into it, so you can disagree with the weighting instead of
trusting it blindly.

## Score breakdown

An address is scored out of 100 across five signals:

| Signal | Max | How it is measured |
| :--- | ---: | :--- |
| Success rate | 40 | Share of the address's transactions with `result == "success"` |
| Recent activity | 25 | Transaction count, saturating at 50 txs |
| Counterparty diversity | 20 | Distinct addresses transacted with, 2 pts each |
| Verified | 10 | Contract source verified on KiteScan |
| Clean reputation | 5 | Not flagged as scam, reputation `ok` |

Every row is printed with its own `points/max`, so a low total always tells you
*which* signal dragged it down.

## Usage

```bash
npm install
npx tsx scope.ts 0xe1844c5D63a9543023008D332Bd3d2e6f1FE1043
```

Real output for that address:

```text
=================================
Address:     0xe1844c5D63a9543023008D332Bd3d2e6f1FE1043
Name:        ReceiveUln302
Is contract: true | Verified: true
---------------------------------
RELIABILITY SCORE: 82/100
---------------------------------
  Success rate             40/40
  Recent activity          25/25
  Counterparty diversity   2/20
  Verified                 10/10
  Clean reputation         5/5
=================================
```

With no argument it falls back to a default address.

## Balance check

`check.ts` is a minimal balance/nonce probe against the Kite RPC, useful for
confirming the chain config is reachable:

```bash
npx tsx check.ts 0xe1844c5D63a9543023008D332Bd3d2e6f1FE1043
```

## Data sources

- **KiteScan API v2** (`https://kitescan.ai/api/v2`) — transactions and address metadata
- **Kite RPC** (`https://rpc.gokite.ai`, chain ID `2366`) — balances and nonces, via [viem](https://viem.sh)

No API key required. Both endpoints are public and read-only; kitescope never
signs or sends a transaction.

## Caveats

- KiteScan returns only the most recent page of transactions, so "recent
  activity" is capped by that page size rather than lifetime history.
- Counterparty diversity counts both directions, so an address that only ever
  receives from one sender scores low even if it is perfectly healthy.
- The weightings are a starting point, not a standard. They live in
  `reliabilityScore()` in `scope.ts` — change them.

## License

MIT
