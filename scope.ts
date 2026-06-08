const KITESCAN = "https://kitescan.ai/api/v2";

type Tx = {
  result: string;
  status: string;
  hash: string;
  from: { hash: string } | null;
  to: { hash: string } | null;
  timestamp?: string;
};

async function getTransactions(address: string): Promise<Tx[]> {
  const res = await fetch(`${KITESCAN}/addresses/${address}/transactions`);
  if (!res.ok) throw new Error(`KiteScan returned ${res.status}`);
  const data = await res.json();
  return data.items ?? [];
}

async function getAddressInfo(address: string) {
  const res = await fetch(`${KITESCAN}/addresses/${address}`);
  if (!res.ok) throw new Error(`KiteScan returned ${res.status}`);
  return res.json();
}

function successRate(txs: Tx[]): number {
  if (txs.length === 0) return 0;
  const ok = txs.filter((t) => t.result === "success").length;
  return Math.round((ok / txs.length) * 100);
}

function uniqueCounterparties(txs: Tx[], self: string): number {
  const others = new Set<string>();
  for (const t of txs) {
    if (t.from?.hash && t.from.hash.toLowerCase() !== self.toLowerCase())
      others.add(t.from.hash.toLowerCase());
    if (t.to?.hash && t.to.hash.toLowerCase() !== self.toLowerCase())
      others.add(t.to.hash.toLowerCase());
  }
  return others.size;
}

async function main() {
  const address = "0xe1844c5D63a9543023008D332Bd3d2e6f1FE1043";

  const txs = await getTransactions(address);
  const info = await getAddressInfo(address);

  console.log("Address:           ", address);
  console.log("Total txs (recent): ", txs.length);
  console.log("Success rate:       ", successRate(txs) + "%");
  console.log("Unique counterparties:", uniqueCounterparties(txs, address));
  console.log("Is contract:        ", info.is_contract);
  console.log("Tx count (all-time):", info.transactions_count ?? "n/a");
}

main().catch(console.error);
