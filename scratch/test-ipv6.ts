import postgres from "postgres";

async function test() {
  const url = "postgresql://postgres:y8jkYz8dnq8aqS2R@[2406:da18:243:7428:1e5a:3e19:f461:bfbb]:5432/postgres";
  console.log("Connecting to IPv6 directly...");
  const sql = postgres(url, { connect_timeout: 5 });
  try {
    const res = await sql`SELECT 1 as result`;
    console.log("Success:", res);
    process.exit(0);
  } catch (err) {
    console.error("Failed:", err);
    process.exit(1);
  }
}

test();
