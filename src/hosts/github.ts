import { Octokit } from "@octokit/core";
import fs from 'fs';
import child_process from 'child_process';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function getRepoList(username: string, token: string | undefined) {
    let result: any[] = [];

    let done = false;
    let page = 1;

    while (!done) {
        const request = !token
            ? `GET /users/${username}/repos?per_page=100&page=${page}&sort=full_name&visibility=all`
            : `GET /user/repos?per_page=100&page=${page}&sort=full_name&visibility=all`;

        const response = await octokit.request(request);

        if (response.status == 200) {
            result = result.concat(response.data);
            if (response.data.length == 0) {
                done = true;
                break;
            }
        } else {
            done = true;
            return undefined;
        }

        page++;
    }

    return result;
}

export async function cloneOrPullRepo(username: string, token: string | undefined, fullName: string, outputDir: string) {
    process.stdout.write(`${fullName} - `);
    if (!fs.existsSync(`${outputDir}/github/${fullName}`)) {
        console.log("Clone");
        child_process.execSync(`git clone https://${username}${token ? ":" + token : ""}@github.com/${fullName}.git ${outputDir}/github/${fullName}`);
    } else {
        console.log("Pull");
        child_process.execSync(`cd ${outputDir}/github/${fullName} && git reset --hard && git clean -fd && git pull --all`);
    }
}