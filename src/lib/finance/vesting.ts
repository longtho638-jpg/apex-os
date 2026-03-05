export function calculateVesting(
  totalAmount: number,
  purchaseDate: Date,
): { claimed: number; claimable: number; locked: number } {
  const now = new Date();
  const tgeDate = new Date(purchaseDate); // Assuming TGE is purchase date for simplicity

  // 10% TGE Unlock
  const tgeUnlock = totalAmount * 0.1;

  // Linear 12 months for remaining 90%
  const monthsPassed = (now.getTime() - tgeDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
  const vestingPerMonth = (totalAmount * 0.9) / 12;

  let vested = tgeUnlock + monthsPassed * vestingPerMonth;
  if (vested > totalAmount) vested = totalAmount;

  // Mock claimed amount (store in DB in real app)
  const claimed = 0;

  return {
    claimed,
    claimable: Math.max(0, vested - claimed),
    locked: Math.max(0, totalAmount - vested),
  };
}
