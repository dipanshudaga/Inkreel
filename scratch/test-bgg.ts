import { searchBGG } from "./src/lib/api/bgg";

async function test() {
  const results = await searchBGG("Catan");
  console.log("Catan Results:", JSON.stringify(results, null, 2));
}

test();
