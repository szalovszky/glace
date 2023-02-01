import dotenv from 'dotenv';

try {
    dotenv.config();
} catch (ex) { }

const outputDir = process.env.OUTPUT_DIR || "./repos";
const platforms = {
    github: {
        username: process.env.GITHUB_USERNAME,
        token: process.env.GITHUB_TOKEN,
    }
};

import * as github from './hosts/github';

async function main() {
    if (platforms.github.username) {
        console.log("Loading repos...");

        const repos = (await github.getRepoList(platforms.github.username, platforms.github.token) || [{}]) as [{ [key: string]: string }];
        console.log(`${repos.length} repo(s) loaded.`);

        // @ts-ignore: TS doesn't know that `platform.github.username` cannot be undefined
        repos.forEach(async (repo) => await github.cloneOrPullRepo(platforms.github.username, platforms.github.token, repo["full_name"], outputDir));
        console.log("GitHub done.");
    }
}

main();