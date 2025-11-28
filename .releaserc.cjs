/**
 * Semantic Release Configuration for ApexOS
 *
 * Provides automated versioning, CHANGELOG generation, and GitHub releases.
 */

const currentBranch = process.env.GITHUB_REF_NAME ||
    process.env.GIT_BRANCH ||
    (process.env.GITHUB_REF && process.env.GITHUB_REF.replace('refs/heads/', '')) ||
    require('child_process')
        .execSync('git rev-parse --abbrev-ref HEAD')
        .toString()
        .trim();

console.error(`[semantic-release] Branch: ${currentBranch}`);

const config = {
    branches: ['main'],
    plugins: [
        [
            '@semantic-release/commit-analyzer',
            {
                preset: 'conventionalcommits',
                releaseRules: [
                    { type: 'docs', scope: 'README', release: 'patch' },
                    { type: 'refactor', release: 'patch' },
                    { type: 'style', release: 'patch' },
                    { type: 'perf', release: 'patch' }
                ]
            }
        ],
        [
            '@semantic-release/release-notes-generator',
            {
                preset: 'conventionalcommits',
                presetConfig: {
                    types: [
                        { type: 'feat', section: '🚀 Features' },
                        { type: 'fix', section: '🐞 Bug Fixes' },
                        { type: 'docs', section: '📚 Documentation' },
                        { type: 'style', section: '💄 Styles' },
                        { type: 'refactor', section: '♻️ Code Refactoring' },
                        { type: 'perf', section: '⚡ Performance' },
                        { type: 'test', section: '✅ Tests' },
                        { type: 'build', section: '🏗️ Build' },
                        { type: 'ci', section: '👷 CI/CD' }
                    ]
                }
            }
        ],
        [
            '@semantic-release/changelog',
            {
                changelogFile: 'CHANGELOG.md'
            }
        ],
        [
            '@semantic-release/npm',
            {
                npmPublish: false
            }
        ],
        [
            '@semantic-release/github',
            {
                assets: [
                    { path: 'CHANGELOG.md', label: 'Changelog' }
                ]
            }
        ],
        [
            '@semantic-release/git',
            {
                assets: ['CHANGELOG.md', 'package.json', 'package-lock.json'],
                message: 'chore(release): ${nextRelease.version} [skip ci]\\n\\n${nextRelease.notes}'
            }
        ]
    ]
};

console.error(`[semantic-release] Using main branch config`);

module.exports = config;
