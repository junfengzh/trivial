import fs from "fs";
import turndown from "turndown";


async function categorize(problem, topics) {
    const apiKey = process.env.OPENAI_API_KEY;
    const apiUrl = "https://api.openai.com/v1/chat/completions";
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
    };
    const promptText = `
You are given a math problem and its solutions in Markdown format: \`\`\`markdown
${problem}
\`\`\`
You are given a list of math topics in JSON format: \`\`\`json
${JSON.stringify(topics.map(x => x.name))}
\`\`\`
Identify up to 3 topics from the given list that match the given problem.
Output the selected topics as a JSON array with no explanation.`;
    const body = JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{
            role: 'user', content: promptText.trim()
        }],
        temperature: 0.0
    });
    const response = await fetch(apiUrl, {
        method: "POST",
        headers: headers,
        body: body
    });
    const result = await response.json();
    return result.choices[0].message.content;
}

(async () => {
    const turndownService = new turndown();
    let topics = JSON.parse(fs.readFileSync('data/topics.json'));
    const problemFiles = fs.readdirSync('data/problems')
        .filter(x => x.endsWith('.json'));
    for (let i = 0; i < problemFiles.length; i++) {
        const file = problemFiles[i];
        console.log('tagging', file);
        let problems = JSON.parse(fs.readFileSync(`data/problems/${file}`));
        for (let name in problems) {
            let problem = problems[name];
            const html = problem.parse.text['*'];
            const markdown = turndownService.turndown(html);
            let tagsStr = await categorize(markdown, topics);
            tagsStr = tagsStr.replaceAll('```json', '').replaceAll('```', '');
            const tags = JSON.parse(tagsStr);
            problem['tags'] = tags;
        }
        fs.writeFileSync(`data/tagged/${file}`,
            JSON.stringify(problems, undefined, 2));
    }
})()
