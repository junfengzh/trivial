import fs from "fs";
import turndown from "turndown";

(async () => {
    let tagToProblems = {};
    const problemFiles = fs.readdirSync('data/tagged')
        .filter(x => x.endsWith('.json'));
    for (let i = 0; i < problemFiles.length; i++) {
        const file = problemFiles[i];
        let problems = JSON.parse(fs.readFileSync(`data/tagged/${file}`));
        for (let name in problems) {
            let problem = problems[name];
            problem['tags'].forEach(x => {
                if (!(x in tagToProblems)) {
                    tagToProblems[x] = [];
                }
                tagToProblems[x].push(name);
            });
        }
    }
    // let freq = Object.keys(tagToProblems).map(x => tagToProblems[x].length);
    // freq.sort((a, b) => b - a);
    // console.log(freq);
    Object.keys(tagToProblems).forEach(x => {
        const freq = tagToProblems[x].length;
        if (freq > 700 || freq < 16) {
            delete tagToProblems[x];
        }
    });
    fs.writeFileSync('data/tagtoproblems.json',
        JSON.stringify(tagToProblems, undefined, 2));
})()
