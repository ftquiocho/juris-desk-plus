import type { TrustTransaction, Client } from "../types";

export function clientTrustBalance(
  transactions: TrustTransaction[],
  clientId: string
): number {
  return transactions
    .filter((t) => t.clientId === clientId)
    .reduce((sum, t) => sum + t.credit - t.debit, 0);
}

export function lowBalanceClients(
  transactions: TrustTransaction[],
  clients: Client[],
  threshold: number
): { client: Client; balance: number }[] {
  return clients
    .map((c) => ({
      client: c,
      balance: clientTrustBalance(transactions, c.id),
    }))
    .filter((x) => x.balance > 0 && x.balance < threshold)
    .sort((a, b) => a.balance - b.balance);
}