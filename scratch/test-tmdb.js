const TMDB_API_KEY = "3d0bde4988f84b7534a36babfd85287c";
const QUERY = "Dune";

async function testTMDB() {
  console.log("--- TMDB DIAGNOSTIC START ---");
  console.log(`Testing with API KEY: ${TMDB_API_KEY.slice(0, 5)}...`);

  // Test 1: Simple Movie Search
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(QUERY)}&language=en-US&page=1&include_adult=false`;
  
  try {
    console.log(`Fetching: ${url.replace(TMDB_API_KEY, "HIDDEN")}`);
    const res = await fetch(url);
    const data = await res.json();

    if (res.ok) {
      console.log("SUCCESS: Search returned results.");
      console.log(`Result Count: ${data.results?.length || 0}`);
      if (data.results && data.results.length > 0) {
        console.log(`First Result: ${data.results[0].title} (${data.results[0].release_date})`);
      }
    } else {
      console.error(`FAILURE: API returned ${res.status}`);
      console.error(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("CRITICAL ERROR: Fetch failed entirely.");
    console.error(error);
  }
  console.log("--- TMDB DIAGNOSTIC END ---");
}

testTMDB();
