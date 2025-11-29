export const APEX_TOKENOMICS = {
  totalSupply: 1_000_000_000,
  allocations: {
    team: 0.20,
    investors: 0.15,
    community: 0.40, // Airdrop/Rewards
    treasury: 0.25
  },
  vesting: {
    team: "4 year linear, 1 year cliff",
    investors: "2 year linear, 6 month cliff",
    community: "Unlocked based on activity"
  }
};
