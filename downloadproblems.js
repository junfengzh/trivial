import fetch, { fileFrom } from "node-fetch";
import fs from "fs";

(async () => {
  const apiEndpoint = "https://artofproblemsolving.com/wiki/api.php";
  let pages = JSON.parse(fs.readFileSync('data/allproblems.json', 'utf8'));
  pages.sort();
  let problems = {};
  let lastProblemSet = '';
  for (let i = 0; i < pages.length; i++) {
    const problemSet = pages[i].split('/')[0];
    if (fs.existsSync(`data/problems/${problemSet}.json`)) {
      continue;
    }
    if (problemSet != lastProblemSet) {
      if (lastProblemSet.length > 0) {
        console.log('save', lastProblemSet);
        const data = JSON.stringify(problems, undefined, 2);
        fs.writeFileSync(`data/problems/${lastProblemSet}.json`, data);
      }
      lastProblemSet = problemSet;
      problems = {};
    }
    const page = encodeURIComponent(pages[i]);
    const params = `action=parse&format=json&origin=*&page=${page}`;
    const url = `${apiEndpoint}?${params}`;
    console.log('fetch', pages[i]);
    const response = await fetch(url);
    const json = await response.json();
    problems[pages[i]] = json;
  }
  console.log('save', lastProblemSet);
  const data = JSON.stringify(problems, undefined, 2);
  fs.writeFileSync(`data/problems/${lastProblemSet}.json`, data);
})();
