'use strict';

const core = require('@actions/core');
const github = require('@actions/github');

const token = core.getInput('github_token') || process.env.GITHUB_TOKEN;

const octokit = github.getOctokit(token);

const PR = github.context.payload.number || process.env.PULL_NUMBER;
const pull_number = parseInt(PR, 10);

console.info(`PR #${pull_number} (from ${PR}, repo ${github.context.repo.owner}/${github.context.repo.repo})`);

octokit.rest.pulls.get({
	...github.context.repo,
	pull_number,
}).then(({ data }) => {
	core.debug(data);
	core.debug(`data.maintainer_can_modify: ${data.maintainer_can_modify}`);
	core.debug(`data.head.repo.full_name: ${data.head.repo.full_name}`);
	core.debug(`github.context.repo: ${github.context.repo.owner}/${github.context.repo.repo}`);

	const allowsEdits = data.maintainer_can_modify || data.head.repo.full_name === `${github.context.repo.owner}/${github.context.repo.repo}`;
	core.setOutput('maintainer_can_modify', allowsEdits);

	if (!allowsEdits) {
		core.setFailed('This pull request must have the “allow edits” checkbox checked.');
	}
}).catch((error) => {
	core.error('Error fetching PR data:');
	core.error(error.message);
	core.error(error.stack);
	core.setFailed(error || 'Unknown error');
});
