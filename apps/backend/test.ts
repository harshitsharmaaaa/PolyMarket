import { prisma } from "db"; // adjust path if needed

async function seed() {
  try {
    // Create users
    const user1 = await prisma.user.create({
      data: {
        address: "0xuser1",
        usdBalance: 100000,
      },
    });

    const user2 = await prisma.user.create({
      data: {
        address: "0xuser2",
        usdBalance: 50000,
      },
    });

    console.log("Users created:", user1.id, user2.id);

    // Create market
    const market = await prisma.market.create({
      data: {
        title: "Will BTC cross $150k in 2026?",
        description: "Prediction market for BTC price.",
        resolutionDescription:
          "Resolves YES if BTC trades above $150k before Dec 31, 2026.",
        yesOrderBook: {},
        noOrderBook: {},
        totalQty: 0,
      },
    });

    console.log("Market created:", market.id);

    // Create positions
    await prisma.position.createMany({
      data: [
        {
          userId: user1.id,
          marketId: market.id,
          type: "Yes",
        },
        {
          userId: user2.id,
          marketId: market.id,
          type: "No",
        },
      ],
    });

    console.log("Positions created");

    // Create orders
    await prisma.orderHistory.createMany({
      data: [
        {
          userId: user1.id,
          marketId: market.id,
          orderType: "Buy",
          qty: 10,
          price: 60,
        },
        {
          userId: user2.id,
          marketId: market.id,
          orderType: "Sell",
          qty: 5,
          price: 65,
        },
      ],
    });

    console.log("Orders created");

    // Read everything back
    const users = await prisma.user.findMany({
      include: {
        positions: true,
        orders: true,
      },
    });

    const markets = await prisma.market.findMany({
      include: {
        positions: true,
        orders: true,
      },
    });

    console.log("\n===== USERS =====");
    console.dir(users, { depth: null });

    console.log("\n===== MARKETS =====");
    console.dir(markets, { depth: null });

  } catch (err) {
    console.error("Seed failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();