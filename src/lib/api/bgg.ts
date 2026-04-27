import { XMLParser } from "fast-xml-parser";

const BGG_BASE_URL = "https://boardgamegeek.com/xmlapi2";
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

export async function getBGGDetails(ids: string[]) {
  if (ids.length === 0) return [];
  
  try {
    const response = await fetch(`${BGG_BASE_URL}/thing?id=${ids.join(",")}&stats=1`);
    if (!response.ok) return [];
    
    const xml = await response.text();
    const data = parser.parse(xml);
    
    if (!data?.items?.item) return [];
    
    const items = Array.isArray(data.items.item) ? data.items.item : [data.items.item];
    
    return items.map((item: any) => {
      const nameObj = Array.isArray(item.name) ? item.name.find((n: any) => n["@_type"] === "primary") || item.name[0] : item.name;
      
      return {
        id: item["@_id"],
        title: nameObj["@_value"],
        posterUrl: item.image || item.thumbnail || "",
        description: item.description || "",
        year: item.yearpublished?.["@_value"] ? parseInt(item.yearpublished["@_value"]) : null,
        players: `${item.minplayers?.["@_value"]}-${item.maxplayers?.["@_value"]}`,
        playtime: item.playingtime?.["@_value"],
        runtime: item.playingtime?.["@_value"] ? parseInt(item.playingtime["@_value"]) : 0,
        rating: item.statistics?.ratings?.average?.["@_value"] ? parseFloat(item.statistics.ratings.average["@_value"]) / 2 : 0,
      };
    });
  } catch (error) {
    console.error("BGG Details Error:", error);
    return [];
  }
}

export async function searchBGG(query: string) {
  try {
    const response = await fetch(`${BGG_BASE_URL}/search?query=${encodeURIComponent(query)}&type=boardgame`);
    if (!response.ok) return [];
    
    const xml = await response.text();
    const data = parser.parse(xml);

    if (!data?.items?.item) return [];

    const items = data.items.item;
    const results = Array.isArray(items) ? items : [items];
    const topResults = results.slice(0, 10);
    const ids = topResults.map((item: any) => item["@_id"]);

    // Fetch details for images and better data
    const details = await getBGGDetails(ids);

    return details.map((detail: any) => ({
      id: `bgg-${detail.id}`,
      category: "play",
      subType: "board_game",
      title: detail.title,
      slug: detail.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      posterUrl: detail.posterUrl,
      year: detail.year,
      creator: "Board Game", 
      description: detail.description,
      genres: [],
      rating: detail.rating,
      players: detail.players,
      playtime: detail.playtime,
      runtime: detail.runtime,
    }));
  } catch (error) {
    console.error("BGG Search Error:", error);
    return [];
  }
}

export const MOCK_GAMES = [
  {
    id: "bgg-224517",
    category: "play" as const,
    subType: "board_game",
    title: "Brass: Birmingham",
    slug: "brass-birmingham",
    posterUrl: "https://cf.geekdo-images.com/x3zx6qkHpoP0mG9pZ669mg__imagepage/img/9SIn_H_f5is8S63V9P8D7N9I77c=/fit-in/900x600/filters:no_upscale():strip_icc()/pic3490653.jpg",
    year: 2018,
    creator: "Martin Wallace",
    description: "Brass: Birmingham is an economic strategy game sequel to Martin Wallace's 2007 masterpiece, Brass. Birmingham tells the story of competing entrepreneurs in Birmingham during the industrial revolution, between the years of 1770-1870.",
    genres: ["Strategy", "Economic", "Industrial"],
    rating: 4.9,
    players: "2–4",
    playtime: "60–120 Min",
    runtime: 120,
  },
  {
    id: "bgg-167791",
    category: "play" as const,
    subType: "board_game",
    title: "Terraforming Mars",
    slug: "terraforming-mars",
    posterUrl: "https://cf.geekdo-images.com/wg9oOLcsKvDesSUdhtJZvQ__imagepage/img/8u-v3Y96m1m1Y6u1fS6Y6Q1oX-I=/fit-in/900x600/filters:no_upscale():strip_icc()/pic3536616.jpg",
    year: 2016,
    creator: "Jacob Fryxelius",
    description: "In the 2400s, mankind begins to terraform the planet Mars. Giant corporations, sponsored by the World Government on Earth, initiate huge projects to raise the temperature, the oxygen level, and the ocean coverage until the environment is habitable.",
    genres: ["Strategy", "Sci-Fi", "Economic"],
    rating: 4.8,
    players: "1–5",
    playtime: "120 Min",
    runtime: 120,
  },
  {
    id: "bgg-291457",
    category: "play" as const,
    subType: "board_game",
    title: "Gloomhaven: Jaws of the Lion",
    slug: "gloomhaven-jaws-of-the-lion",
    posterUrl: "https://cf.geekdo-images.com/9SOf_mZ9pG9I1t-N9o0u9Q__imagepage/img/9SOf_mZ9pG9I1t-N9o0u9Q=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5055631.jpg",
    year: 2020,
    creator: "Isaac Childres",
    description: "Gloomhaven: Jaws of the Lion is a standalone game that takes place before the events of Gloomhaven.",
    genres: ["Adventure", "Fantasy", "Combat"],
    rating: 4.7,
    players: "1–4",
    playtime: "30–120 Min",
    runtime: 120,
  }
];

export async function getTrendingGames() {
  try {
    const response = await fetch(`${BGG_BASE_URL}/hot?type=boardgame`);
    if (!response.ok) return MOCK_GAMES;

    const xml = await response.text();
    const data = parser.parse(xml);

    if (!data?.items?.item) return MOCK_GAMES;

    const items = data.items.item;
    const results = Array.isArray(items) ? items : [items];

    return results.slice(0, 20).map((item: any) => ({
      id: `bgg-${item["@_id"]}`,
      category: "play" as const,
      subType: "board_game",
      title: item.name["@_value"],
      slug: item.name["@_value"].toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      posterUrl: item.thumbnail?.["@_value"] || "",
      year: item.yearpublished?.["@_value"] ? parseInt(item.yearpublished["@_value"]) : null,
      rating: 0,
      players: "N/A",
      playtime: "N/A",
    }));
  } catch (error) {
    console.error("BGG Trending Error:", error);
    return MOCK_GAMES;
  }
}
