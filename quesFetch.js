// quesFetch.js

// Map topic keywords to OpenTDB category IDs
const categoryMap = {
  general: 9,
  books: 10,
  film: 11,
  music: 12,
  theatre: 13,
  television: 14,
  videogames: 15,
  boardgames: 16,
  science: 17,
  computers: 18,
  math: 19,
  mythology: 20,
  sports: 21,
  geography: 22,
  history: 23,
  politics: 24,
  art: 25,
  celebrities: 26,
  animals: 27,
  vehicles: 28,
  comics: 29,
  gadgets: 30,
  anime: 31,
  cartoons: 32
};

export async function fetchQuizFromAPI(config) {
  const base = "https://opentdb.com/api.php";
  const params = new URLSearchParams();

  // amount
  params.append("amount", config.numberOfQuestions);

  // difficulty
  if (config.difficulty) {
    params.append("difficulty", config.difficulty);
  }

  // type
  if (config.questionType) {
    if (config.questionType === "mcq") params.append("type", "multiple");
    if (config.questionType === "truefalse") params.append("type", "boolean");
  }

  // ✅ Match topic to category
  const key = config.topic.toLowerCase().trim();
  if (categoryMap[key]) {
    params.append("category", categoryMap[key]);
  } else {
    console.warn(`Topic "${config.topic}" not found in category map, returning random questions`);
  }

  const url = `${base}?${params.toString()}`;
  console.log("Fetching:", url);

  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`API error: ${resp.status}`);

  const data = await resp.json();
  if (data.response_code !== 0) {
    console.warn("OpenTDB returned response code:", data.response_code);
    return [];
  }

  return data.results;
}

export function decodeHtml(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}
