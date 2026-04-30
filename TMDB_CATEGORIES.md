# Inkreel Content Categories (via TMDB)

Inkreel transforms raw TMDB metadata into four primary editorial categories. While TMDB only has two fundamental types, Inkreel uses specific attributes to identify specialized content like Anime and Documentaries.

## 1. Primary Categories

| Category | Source Type | Logic / Filters |
| :--- | :--- | :--- |
| **Movie** | `movie` | Standard feature films. |
| **TV Show** | `tv` | Episodic series, miniseries, and talk shows. |
| **Documentary** | `movie` or `tv` | Any item tagged with Genre ID **99**. |
| **Anime** | `movie` or `tv` | Any item with Genre ID **16** (Animation) and Origin Country **JP**. |
| **Standup Special**| `movie` | Items with Comedy ID **35** and Keyword **9716**, or identified via title heuristics. |

---

## 2. Specialized Classifications
Beyond the four main filters, Inkreel can identify these sub-types for better sorting:

- **Miniseries**: TV shows often identified by a single season or specific TMDB `type` flags.
- **TV Movies**: Movies with Genre ID **10770** (often used for specials or made-for-TV films).
- **Reality & Talk**: TV shows with Genre IDs **10764** or **10767**.
- **Video/OVA**: Original Video Animations, often distinguished by their `status` or release format.

---

## 3. The Role of Genres
Genres are used as secondary tags rather than primary categories. For example, a "Sci-Fi" film is categorized as a **Movie** with a "Science Fiction" tag. 

The only genre that doubles as a primary category in Inkreel is **Documentary (99)**, as it fundamentally changes the nature of the content viewing experience.
