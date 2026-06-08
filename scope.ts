const KITESCAN = "https://kitescan.ai/api/v2";

type Tx = {
  result: string;
  status: string;
  hash: string;
  from: { hash: string } | null;
  to: { hash: string } | null;
};

type AddressInfo = {
  name: string | null;
  is_contract: boolean;
  is_verified: boolean;
  is_scam: boolean;
  reputation: string | null;
  coin_balance: string;
};

async function getTransactions(address: string): Promise<Tx[]> {
  const res = await fetch(`${KITESCAN}/addresses/${address}/transactions`);
  if (!res.ok) throw new Error(`KiteScan returned ${res.status}`);
  const data = await res.json();
  return data.items ?? [];
}

async function getAddressInfo(address: string): Promise<AddressInfo> {
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

// The reliability score — fully transparent. Each part shown to the user.
function reliabilityScore(txs: Tx[], info: AddressInfo) {
  const breakdown: { label: string; points: number; max: number }[] = [];

  // 1. Success rate: up to 40 pts
  const sr = successRate(txs);
  breakdown.push({ label: "Success rate", points: Math.round((sr / 100) * 40), max: 40 });

  // 2. Activity: up to 25 pts (more recent txs = more active)
  const activity = Math.min(25, Math.round((txs.length / 50) * 25));
  breakdown.push({ label: "Recent activity", points: activity, max: 25 });

  // 3. Counterparty diversity: up to 20 pts
  const cp = uniqueCounterparties(txs, info.hash ?? "");
  const diversity = Math.min(20, cp * 2);
  breakdown.push({ label: "Counterparty diversity", points: diversity, max: 20 });

  // 4. Verified contract: 10 pts
  breakdown.push({ label: "Verified", points: info.is_verified ? 10 : 0, max: 10 });

  // 5. Clean reputation: 5 pts (0 if flagged scam)
  const clean = !info.is_scam && info.reputation === "ok" ? 5 : 0;
  breakdown.push({ label: "Clean reputation", points: clean, max: 5 });

  const total = breakdown.reduce((s, b) => s + b.points, 0);
  return { total, breakdown };
}

async function main() {
  const address = "0xe1844c5D63a9543023008D332Bd3d2e6f1FE1043";

  const txs = await getTransactions(address);
  const info = await getAddressInfo(address);
  (info as any).hash = address;

  const score = reliabilityScore(txs, info);

  console.log("=================================");
  console.log("Address:    ", address);
  console.log("Name:       ", info.name ?? "(unnamed)");
  console.log("Is contract:", info.is_contract, "| Verified:", info.is_verified);
  console.log("---------------------------------");
  console.log("RELIABILITY SCORE:", score.total + "/100");
  console.log("---------------------------------");
  for (const b of score.breakdown) {
    console.log(`  ${b.label.padEnd(24)} ${b.points}/${b.max}`);
  }
  console.log("=================================");
}

main().catch(console.error);
