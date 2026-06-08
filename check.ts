import { createPublicClient, http, formatEther } from "viem";

const kite = {
  id: 2366,
  name: "Kite",
  nativeCurrency: { name: "KITE", symbol: "KITE", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.gokite.ai/"] } },
} as const;

const client = createPublicClient({ chain: kite, transport: http() });

const address = "0xe1844c5D63a9543023008D332Bd3d2e6f1FE1043" as const;

async function main() {
  const balance = await client.getBalance({ address });
  const txCount = await client.getTransactionCount({ address });

  console.log("Address:     ", address);
  console.log("KITE balance:", formatEther(balance));
  console.log("Tx count:    ", txCount);
}

main().catch(console.error);
