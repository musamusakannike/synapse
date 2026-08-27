import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Course, { ICourse } from '../models/course.model';
import Chapter from '../models/chapter.model';
import Topic, { ITopicContent } from '../models/topic.model';
import Flashcard from '../models/flashcard.model';
import MCQ from '../models/mcq.model';
import { connectDB } from '../config/db.config';

interface TopicSeed {
  title: string;
  description: string;
  contents: ITopicContent[];
  flashcards: { question: string; answer: string }[];
  mcqs: { question: string; options: { text: string; isCorrect: boolean }[]; explanation: string }[];
}

export const gitCourseSeed: { course: Partial<ICourse>; topics: TopicSeed[] } = {
  course: {
    title: 'Git & GitHub for Beginners',
    description: 'Master version control, repository management, branching, merging, and team collaboration with Git & GitHub.',
    longDescription:
      'A complete, hands-on guide to mastering version control from scratch. Learn how to track code changes, manage branches, resolve merge conflicts, collaborate on GitHub via Pull Requests, and use advanced tools like Stash, Rebase, and Reflog to manage real-world software projects with confidence.',
    category: 'Programming',
    difficulty: 'beginner',
    whatYouWillLearn: [
      'Understand version control concepts and configure Git on your system',
      'Track changes, stage files, and record clean commit messages',
      'Branch, merge, and resolve complex merge conflicts step-by-step',
      'Connect local repositories to GitHub using SSH and HTTPS',
      'Collaborate in teams using the GitHub Flow, Pull Requests, and Code Reviews',
      'Utilize advanced commands like git stash, interactive rebase, and git reflog',
    ],
    isPublished: true,
    order: 3,
    isFree: true,
    price: 0,
  },
  topics: [
    {
      title: 'Module 1: Introduction to Version Control & Git Setup',
      description: 'Understand why version control is essential, how Git works under the hood, and configure Git on your system.',
      contents: [
        {
          type: 'text',
          title: 'What is Version Control?',
          content:
            'Imagine you are working on a paper or code project. Without version control, you end up with files like `script.js`, `script_v2.js`, `script_final.js`, and `script_final_REALLY_FINAL.js`. When something breaks, you have no easy way to figure out what changed or revert back.\n\nA Version Control System (VCS) is like a time machine for your codebase. It records every change made to your files over time in snapshots called **commits**, letting you review history, revert mistakes, and collaborate seamlessly with other developers.',
        },
        {
          type: 'text',
          title: 'Centralized vs. Distributed Version Control',
          content:
            'Git is a **Distributed Version Control System (DVCS)**. Unlike legacy centralized systems (like Subversion) where every action requires connecting to a central server, Git gives every developer a full, independent copy of the entire repository and its history locally on their machine.\n\nKey Benefits of Git:\n- **Speed**: Almost all operations run locally in milliseconds.\n- **Offline Capability**: You can commit, inspect history, and branch without an internet connection.\n- **Data Integrity**: Every file and commit is cryptographically secured with SHA-1/SHA-256 hashes.',
        },
        {
          type: 'code',
          title: 'Configuring Your Git Identity',
          content:
            '# Set your global username and email (used to sign your commits)\ngit config --global user.name "Your Name"\ngit config --global user.email "your.email@example.com"\n\n# Set the default branch name for new repositories to main\ngit config --global init.defaultBranch main\n\n# Verify your settings\ngit config --list',
          language: 'bash',
        },
        {
          type: 'quiz',
          title: 'Quick Check: Git Configuration',
          content: 'Quiz',
          quiz: {
            question: 'Which Git command sets the default email address attached to your future commits globally?',
            options: [
              { text: 'git config --global user.email "email@domain.com"', isCorrect: true },
              { text: 'git set email "email@domain.com"', isCorrect: false },
              { text: 'git init --email "email@domain.com"', isCorrect: false },
              { text: 'git user --email "email@domain.com"', isCorrect: false },
            ],
            explanation: 'The `git config --global user.email` command stores your email address in ~/.gitconfig for global use.',
          },
        },
        {
          type: 'code',
          title: 'Initializing Your First Repository',
          content:
            '# Create a project directory\nmkdir my-first-repo\ncd my-first-repo\n\n# Initialize a new Git repository\ngit init\n\n# Inspect hidden files (notice the newly created .git directory)\nls -la',
          language: 'bash',
        },
        {
          type: 'text',
          title: 'What is inside the .git directory?',
          content:
            'When you run `git init`, Git creates a hidden `.git` folder in your project directory. This folder contains all the metadata, objects database, pointers, and configuration that power Git. If you delete the `.git` folder, you remove all Git history and turn the folder back into a regular directory.',
        },
      ],
      flashcards: [
        { question: 'What does DVCS stand for?', answer: 'Distributed Version Control System.' },
        { question: 'What command sets your global Git username?', answer: 'git config --global user.name "Your Name"' },
        { question: 'What hidden directory stores all Git repository metadata and history?', answer: '.git' },
        { question: 'What command initializes a new Git repository in the current folder?', answer: 'git init' },
      ],
      mcqs: [
        {
          question: 'What is the main advantage of a Distributed Version Control System like Git over a Centralized System?',
          options: [
            { text: 'Every developer has a complete copy of the full repository history on their local machine', isCorrect: true },
            { text: 'Git requires a continuous internet connection to make commits', isCorrect: false },
            { text: 'Git only runs inside web browsers', isCorrect: false },
            { text: 'Centralized systems are faster at offline branching', isCorrect: false },
          ],
          explanation: 'In DVCS, every clone contains the full history locally, allowing fast offline operations.',
        },
        {
          question: 'What happens if you delete the hidden .git directory from your project?',
          options: [
            { text: 'You delete the entire Git revision history, turning it back into an unversioned folder', isCorrect: true },
            { text: 'Your source code files are immediately erased', isCorrect: false },
            { text: 'Your GitHub account is deleted', isCorrect: false },
            { text: 'Nothing happens because history is stored on GitHub servers', isCorrect: false },
          ],
          explanation: 'The `.git` directory contains all local commit history, branches, and tags for that repository.',
        },
      ],
    },
    {
      title: 'Module 2: The Three Trees & Tracking Changes',
      description: 'Master Git\'s three architecture states (Working Directory, Staging Area, Repository) and record clean commits.',
      contents: [
        {
          type: 'text',
          title: 'Git Architecture: The Three States',
          content:
            'Git operates across three main areas:\n\n1. **Working Directory**: The actual files you see and edit on your computer.\n2. **Staging Area (Index)**: A intermediate preview buffer where you select and organize specific changes you want to package into your next commit.\n3. **Repository (HEAD)**: The permanent database of committed snapshots stored inside `.git`.\n\nFile Lifecycle:\n- **Untracked**: New files that Git is not yet watching.\n- **Staged**: Modified or new files marked to go into the next commit snapshot.\n- **Committed**: Changes safely recorded in the local repository database.',
        },
        {
          type: 'code',
          title: 'Checking Status and Staging Files',
          content:
            '# Check which files have changed or are untracked\ngit status\n\n# Create a new sample file\necho "# My Project" > README.md\n\n# Stage a single file\ngit add README.md\n\n# Stage all modified and new files in the current folder\ngit add .',
          language: 'bash',
        },
        {
          type: 'quiz',
          title: 'Quick Check: The Staging Area',
          content: 'Quiz',
          quiz: {
            question: 'Why does Git have a Staging Area between the Working Directory and the Repository?',
            options: [
              { text: 'It allows developers to selectively pick and group specific changes into clean, atomic commits', isCorrect: true },
              { text: 'It automatically uploads code to GitHub', isCorrect: false },
              { text: 'It encrypts source code before saving', isCorrect: false },
              { text: 'It compresses images in your project', isCorrect: false },
            ],
            explanation: 'The staging area (index) gives you control over which file changes belong in each commit.',
          },
        },
        {
          type: 'code',
          title: 'Creating Commits and Viewing Logs',
          content:
            '# Create a commit with a clear, descriptive message\ngit commit -m "feat: initialize project with README.md"\n\n# View your commit history\ngit log\n\n# View condensed single-line history\ngit log --oneline',
          language: 'bash',
        },
        {
          type: 'text',
          title: 'Best Practices for Commit Messages',
          content:
            'A good commit message explains **what** changed and **why**.\n- Use the imperative mood: `"feat: add user login API"` (not `"added user login API"`).\n- Keep the first summary line under 50 characters.\n- Common conventional commit prefixes:\n  - `feat:` New user feature\n  - `fix:` Bug fix\n  - `docs:` Documentation updates\n  - `style:` Formatting, missing semi-colons (no code logic change)\n  - `refactor:` Code change that neither fixes a bug nor adds a feature',
        },
      ],
      flashcards: [
        { question: 'What are the three main areas in Git architecture?', answer: 'Working Directory, Staging Area (Index), and Repository (HEAD).' },
        { question: 'What command displays the state of working directory and staged files?', answer: 'git status' },
        { question: 'What command stages all file changes in the current directory tree?', answer: 'git add .' },
        { question: 'What command saves staged changes into a new commit snapshot?', answer: 'git commit -m "message"' },
      ],
      mcqs: [
        {
          question: 'Which stage moves changes from the Working Directory into the Staging Area?',
          options: [
            { text: 'git add', isCorrect: true },
            { text: 'git commit', isCorrect: false },
            { text: 'git push', isCorrect: false },
            { text: 'git checkout', isCorrect: false },
          ],
          explanation: '`git add` stages changes ready to be committed.',
        },
        {
          question: 'What is a conventional commit prefix used for bug fixes?',
          options: [
            { text: 'fix:', isCorrect: true },
            { text: 'bug:', isCorrect: false },
            { text: 'error:', isCorrect: false },
            { text: 'patch:', isCorrect: false },
          ],
          explanation: '`fix:` is the standard conventional commit prefix for bug fixes.',
        },
      ],
    },
    {
      title: 'Module 3: Inspecting History & Diffing',
      description: 'Learn to inspect commit logs, view file differences across revisions, and filter historical changes.',
      contents: [
        {
          type: 'text',
          title: 'Navigating Commit History with git log',
          content:
            'The `git log` command displays commit history starting from the most recent commit. As repositories grow, formatting and filtering log output becomes essential for tracking down changes.',
        },
        {
          type: 'code',
          title: 'Advanced Log Filtering & Formatting',
          content:
            '# Display compact one-line log with commit graph\ngit log --oneline --graph --all\n\n# Limit log output to the last 3 commits\ngit log -n 3\n\n# Filter commits by author\ngit log --author="Alice"\n\n# Filter commits by date range\ngit log --since="2026-01-01" --until="2026-08-01"\n\n# View commits that modified a specific file\ngit log -p src/app.js',
          language: 'bash',
        },
        {
          type: 'text',
          title: 'Comparing Changes with git diff',
          content:
            '`git diff` shows line-by-line differences between file versions in standard unified diff format:\n- `-` Red lines indicate deleted content.\n- `+` Green lines indicate inserted content.',
        },
        {
          type: 'code',
          title: 'Using git diff Options',
          content:
            '# Compare Working Directory changes against Staging Area\ngit diff\n\n# Compare Staged changes against the last commit (HEAD)\ngit diff --staged\n\n# Compare changes between two branches or commit hashes\ngit diff main feature/login\n\n# Compare a specific file between two commits\ngit diff 8a3f1b2 4e9c2d1 -- index.html',
          language: 'bash',
        },
        {
          type: 'quiz',
          title: 'Quick Check: git diff',
          content: 'Quiz',
          quiz: {
            question: 'Which command shows differences between changes staged in the Index and your last commit?',
            options: [
              { text: 'git diff --staged', isCorrect: true },
              { text: 'git diff', isCorrect: false },
              { text: 'git diff --working', isCorrect: false },
              { text: 'git log --diff', isCorrect: false },
            ],
            explanation: '`git diff --staged` (or `--cached`) shows what changes are ready in staging versus HEAD.',
          },
        },
      ],
      flashcards: [
        { question: 'What command shows compact one-line commit summaries with visual branching graph?', answer: 'git log --oneline --graph --all' },
        { question: 'What command compares working directory edits against staged files?', answer: 'git diff' },
        { question: 'What command compares staged changes against the last commit (HEAD)?', answer: 'git diff --staged' },
      ],
      mcqs: [
        {
          question: 'Which flag formats git log output to show branch graphs visually in terminal?',
          options: [
            { text: '--graph', isCorrect: true },
            { text: '--tree', isCorrect: false },
            { text: '--visual', isCorrect: false },
            { text: '--branch-map', isCorrect: false },
          ],
          explanation: '`--graph` draws an ASCII graph representation of commit history.',
        },
      ],
    },
    {
      title: 'Module 4: Undoing Changes & Recovering History',
      description: 'Safely discard uncommitted edits, unstage files, amend commits, and reset or revert revisions.',
      contents: [
        {
          type: 'text',
          title: 'Undoing Mistakes in Git',
          content:
            'Every developer makes mistakes — typing invalid code, staging the wrong file, or realizing a feature was built wrong. Git provides multiple ways to undo changes safely depending on where the changes live.',
        },
        {
          type: 'code',
          title: 'Discarding Working Edits & Unstaging Files',
          content:
            '# Discard uncommitted changes in a specific file (revert to HEAD)\ngit restore index.html\n\n# Discard ALL uncommitted changes in working directory\ngit restore .\n\n# Unstage a file (keep local file changes, but remove from staging area)\ngit restore --staged index.html',
          language: 'bash',
        },
        {
          type: 'code',
          title: 'Amending the Most Recent Commit',
          content:
            '# If you forgot to include a file or made a typo in the commit message:\ngit add forgotten-file.js\ngit commit --amend -m "feat: complete login flow with forgotten file"',
          language: 'bash',
        },
        {
          type: 'text',
          title: 'Reset vs. Revert: Knowing the Difference',
          content:
            'Understanding when to use `git reset` vs `git revert` is critical:\n\n- **`git revert <commit>`**: Creates a NEW commit that undoes the changes introduced by a past commit. **Safe for public/shared branches** because it doesn\'t overwrite published history.\n- **`git reset`**: Moves the branch pointer backwards in time. **Use primarily on local un-pushed branches**.\n  - `--soft`: Moves HEAD back, but leaves changes staged.\n  - `--mixed` (default): Moves HEAD back, unstages changes, keeps working directory intact.\n  - `--hard`: Moves HEAD back AND erases working directory changes. (Use with caution!)',
        },
        {
          type: 'code',
          title: 'Reset and Revert Examples',
          content:
            '# Safely undo a past commit on shared branches\ngit revert a1b2c3d\n\n# Undo last local commit, keep changes staged\ngit reset --soft HEAD~1\n\n# Completely discard last local commit and edits\ngit reset --hard HEAD~1',
          language: 'bash',
        },
        {
          type: 'quiz',
          title: 'Quick Check: Reset vs Revert',
          content: 'Quiz',
          quiz: {
            question: 'Why should you use `git revert` instead of `git reset` when undoing a commit that was already pushed to GitHub?',
            options: [
              { text: 'git revert creates a new commit that safely preserves public commit history for collaborators', isCorrect: true },
              { text: 'git reset doesn\'t work when internet is connected', isCorrect: false },
              { text: 'git revert deletes the remote branch automatically', isCorrect: false },
              { text: 'git reset is slower than revert', isCorrect: false },
            ],
            explanation: '`git revert` adds a new commit to invert changes without rewriting existing public history.',
          },
        },
      ],
      flashcards: [
        { question: 'What command modifies the most recent commit message or staged files?', answer: 'git commit --amend' },
        { question: 'What command removes a file from the Staging Area without deleting working edits?', answer: 'git restore --staged <file>' },
        { question: 'What is the key difference between git reset and git revert?', answer: 'Reset rewinds history (rewriting commits), while Revert appends a new inverse commit.' },
      ],
      mcqs: [
        {
          question: 'Which git reset mode moves the HEAD pointer backwards while keeping modified files staged in Index?',
          options: [
            { text: '--soft', isCorrect: true },
            { text: '--hard', isCorrect: false },
            { text: '--mixed', isCorrect: false },
            { text: '--keep', isCorrect: false },
          ],
          explanation: '`--soft` resets the commit pointer without touching index staging or working directory.',
        },
      ],
    },
    {
      title: 'Module 5: Branching & Merging Fundamentals',
      description: 'Create, switch, merge branches, and resolve merge conflicts step-by-step.',
      contents: [
        {
          type: 'text',
          title: 'Why Branching is Git\'s Superpower',
          content:
            'In Git, a **branch** is simply a lightweight moveable pointer to a specific commit. Branching allows you to work on new features, bug fixes, or experiments in complete isolation without affecting the main production codebase (`main`).',
        },
        {
          type: 'code',
          title: 'Creating and Switching Branches',
          content:
            '# List all local branches\ngit branch\n\n# Create a new feature branch\ngit branch feature/user-auth\n\n# Switch to the new branch\ngit switch feature/user-auth\n\n# Shortcut: Create AND switch in one command\ngit checkout -b feature/user-auth   # (or: git switch -c feature/user-auth)',
          language: 'bash',
        },
        {
          type: 'text',
          title: 'Merging Branches: Fast-Forward vs. 3-Way Merge',
          content:
            'When integrating changes from one branch into another (`git merge`):\n\n1. **Fast-Forward Merge**: If no new commits were added to `main` since you branched off, Git simply moves the `main` pointer forward to your feature branch commit.\n2. **3-Way Merge**: If both `main` and your feature branch have new diverging commits, Git combines the tip of both branches and their common ancestor into a new **Merge Commit**.',
        },
        {
          type: 'code',
          title: 'Performing a Merge',
          content:
            '# 1. Switch to the target destination branch\ngit switch main\n\n# 2. Merge feature branch into main\ngit merge feature/user-auth\n\n# 3. Delete the feature branch once merged\ngit branch -d feature/user-auth',
          language: 'bash',
        },
        {
          type: 'text',
          title: 'Understanding and Resolving Merge Conflicts',
          content:
            'A **Merge Conflict** occurs when Git cannot automatically reconcile changes because two branches edited the exact same lines of code in conflicting ways.\n\nConflict Markers in Code:\n```\n<<<<<<< HEAD (Current Branch / main)\nconst port = 5000;\n=======\nconst port = 8080;\n>>>>>>> feature/user-auth (Incoming Branch)\n```\n\nResolution Steps:\n1. Open conflicting files.\n2. Manually edit the file to keep desired code and remove conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`).\n3. Stage resolved files: `git add .`\n4. Complete the merge commit: `git commit`',
        },
        {
          type: 'quiz',
          title: 'Quick Check: Merge Conflict Resolution',
          content: 'Quiz',
          quiz: {
            question: 'After manually resolving conflict markers in your editor, what is the next step to finish the merge?',
            options: [
              { text: 'Stage resolved files with `git add .` and run `git commit`', isCorrect: true },
              { text: 'Run `git reset --hard`', isCorrect: false },
              { text: 'Delete the repository', isCorrect: false },
              { text: 'Run `git init` again', isCorrect: false },
            ],
            explanation: 'Staging the resolved files signals to Git that conflicts are settled; `git commit` creates the merge commit.',
          },
        },
      ],
      flashcards: [
        { question: 'What is a Git branch under the hood?', answer: 'A lightweight, moveable pointer to a commit hash.' },
        { question: 'What command creates and switches to a new branch in a single command?', answer: 'git checkout -b <branch-name> or git switch -c <branch-name>' },
        { question: 'What conflict markers appear when Git encounters a merge conflict?', answer: '<<<<<<< HEAD, =======, and >>>>>>> branch-name' },
      ],
      mcqs: [
        {
          question: 'What occurs during a fast-forward merge?',
          options: [
            { text: 'Git advances the target branch pointer directly to the source commit without creating a merge commit', isCorrect: true },
            { text: 'Git creates a 3-way merge commit automatically', isCorrect: false },
            { text: 'Git rebases all commits to origin', isCorrect: false },
            { text: 'Git prompts for password verification', isCorrect: false },
          ],
          explanation: 'When no diverging commits exist on the target branch, Git fast-forwards the pointer.',
        },
      ],
    },
    {
      title: 'Module 6: Connecting to GitHub & Remote Repositories',
      description: 'Link local repositories to GitHub, manage SSH authentication, push code, and fetch/pull updates.',
      contents: [
        {
          type: 'text',
          title: 'What is GitHub?',
          content:
            'While **Git** is the local command-line tool managing version control, **GitHub** is a cloud-hosted platform that hosts Git repositories online, adding tools for pull requests, issue tracking, CI/CD pipelines, and code reviews.',
        },
        {
          type: 'code',
          title: 'Setting Up Authentication & Adding Remotes',
          content:
            '# Generate a secure SSH key pair\nssh-keygen -t ed25519 -C "your.email@example.com"\n\n# Display public key to copy into GitHub Settings -> SSH Keys\ncat ~/.ssh/id_ed25519.pub\n\n# Link your local repo to GitHub remote\ngit remote add origin git@github.com:username/my-repo.git\n\n# Verify registered remotes\ngit remote -v',
          language: 'bash',
        },
        {
          type: 'code',
          title: 'Pushing, Fetching, and Pulling',
          content:
            '# Push local main branch to GitHub and set tracking upstream (-u)\ngit push -u origin main\n\n# Download remote changes WITHOUT merging\ngit fetch origin\n\n# Download AND merge remote changes into current branch\ngit pull origin main',
          language: 'bash',
        },
        {
          type: 'text',
          title: 'Ignoring Files with .gitignore',
          content:
            'Never commit secrets (API keys, passwords), dependencies (`node_modules`), or build output folders (`dist/`, `.env`) to GitHub.\n\nCreate a `.gitignore` file in your root folder:\n```\n# Dependencies\nnode_modules/\n\n# Environment secrets\n.env\n.env.local\n\n# Build artifacts\ndist/\nbuild/\n\n# OS files\n.DS_Store\n```',
        },
        {
          type: 'quiz',
          title: 'Quick Check: Fetch vs Pull',
          content: 'Quiz',
          quiz: {
            question: 'What is the main operational difference between `git fetch` and `git pull`?',
            options: [
              { text: '`git fetch` downloads remote objects without modifying working files; `git pull` fetches AND merges immediately', isCorrect: true },
              { text: '`git fetch` deletes local branches', isCorrect: false },
              { text: '`git pull` only works over SSH', isCorrect: false },
              { text: 'There is no difference', isCorrect: false },
            ],
            explanation: '`git pull` is effectively `git fetch` followed by `git merge`.',
          },
        },
      ],
      flashcards: [
        { question: 'What command lists all configured remote server links?', answer: 'git remote -v' },
        { question: 'What does the -u flag do in git push -u origin main?', answer: 'Sets origin/main as the default upstream tracking branch for future git push/pull calls.' },
        { question: 'Which file specifies patterns of untracked files Git should ignore?', answer: '.gitignore' },
      ],
      mcqs: [
        {
          question: 'Which file must you NEVER commit to a public GitHub repository?',
          options: [
            { text: '.env containing secret API credentials and passwords', isCorrect: true },
            { text: 'README.md', isCorrect: false },
            { text: 'package.json', isCorrect: false },
            { text: 'index.html', isCorrect: false },
          ],
          explanation: 'Committed secrets like `.env` leak keys publicly and pose severe security risks.',
        },
      ],
    },
    {
      title: 'Module 7: Collaborative Workflows & Pull Requests',
      description: 'Master GitHub Flow, Forking, Code Reviews, and Pull Requests in modern development teams.',
      contents: [
        {
          type: 'text',
          title: 'The GitHub Flow Workflow',
          content:
            'GitHub Flow is a lightweight branch-based workflow used by software teams worldwide:\n\n1. **Create a Branch**: Branch off `main` with a descriptive feature name (`feature/dark-mode`).\n2. **Make Commits**: Work locally, stage, and commit changes.\n3. **Open a Pull Request (PR)**: Push branch to GitHub and open a PR for team feedback.\n4. **Code Review**: Peers inspect diffs, test changes, and comment.\n5. **Merge**: Once approved, merge PR into `main` and deploy.',
        },
        {
          type: 'code',
          title: 'Creating a Feature Branch & Pushing for PR',
          content:
            '# Create feature branch\ngit checkout -b feature/dark-mode\n\n# Make edits and commit\ngit add .\ngit commit -m "feat: add dark mode theme toggle"\n\n# Push feature branch to GitHub\ngit push -u origin feature/dark-mode',
          language: 'bash',
        },
        {
          type: 'text',
          title: 'Anatomy of a Great Pull Request',
          content:
            'Opening a clear PR speeds up code reviews:\n- **Clear Title**: Summarize the intent (`feat(ui): add dark mode toggle button`).\n- **Description**: Explain problem, solution, and testing steps.\n- **Link Issues**: Use keywords like `Closes #15` or `Fixes #24` to automatically close linked issues when merged.',
        },
        {
          type: 'quiz',
          title: 'Quick Check: Pull Requests',
          content: 'Quiz',
          quiz: {
            question: 'How do you configure GitHub to automatically close issue #42 when a Pull Request is merged?',
            options: [
              { text: 'Include "Closes #42" or "Fixes #42" in the PR body description', isCorrect: true },
              { text: 'Delete issue #42 before opening the PR', isCorrect: false },
              { text: 'Name the branch "issue-42-close"', isCorrect: false },
              { text: 'Email GitHub support', isCorrect: false },
            ],
            explanation: 'GitHub automatically closes linked issues when keywords like `Closes #42` appear in merged PRs.',
          },
        },
      ],
      flashcards: [
        { question: 'What is a Pull Request (PR)?', answer: 'A web notification/proposal on GitHub asking maintainers to review and merge code from one branch to another.' },
        { question: 'What keyword auto-closes GitHub Issue #10 when PR merges?', answer: 'Closes #10 or Fixes #10.' },
        { question: 'What is the first step in the GitHub Flow model?', answer: 'Create a feature branch from main.' },
      ],
      mcqs: [
        {
          question: 'Why are branch protection rules applied to the main branch in professional repositories?',
          options: [
            { text: 'To mandate Pull Request reviews and passing automated tests before merging to main', isCorrect: true },
            { text: 'To prevent users from viewing open-source code', isCorrect: false },
            { text: 'To restrict Git commands to Windows users only', isCorrect: false },
            { text: 'To charge developers for commits', isCorrect: false },
          ],
          explanation: 'Branch protection ensures code quality and prevents unreviewed changes from breaking production.',
        },
      ],
    },
    {
      title: 'Module 8: Advanced Git Tools & Troubleshooting',
      description: 'Learn Stashing, Interactive Rebasing, Cherry-Picking, and fixing common Git emergencies with Reflog.',
      contents: [
        {
          type: 'text',
          title: 'Shelving Temporary Work with git stash',
          content:
            'Suppose you are in the middle of building a feature and your team needs an urgent hotfix on `main`. You don\'t want to commit incomplete broken code. `git stash` temporarily saves your uncommitted working changes on a stack so you can switch branches cleanly.',
        },
        {
          type: 'code',
          title: 'Git Stash Commands',
          content:
            '# Save uncommitted working edits to stash stack\ngit stash -u   # (-u includes untracked files)\n\n# List stashed items\ngit stash list\n\n# Re-apply most recent stash and remove it from stack\ngit stash pop\n\n# Apply specific stash without removing from stack\ngit stash apply stash@{0}',
          language: 'bash',
        },
        {
          type: 'text',
          title: 'Cleaning Commit History with Interactive Rebase',
          content:
            'Interactive rebase (`git rebase -i`) lets you rewrite, combine, reorder, or delete local commits before sharing your branch.\n\nKeywords:\n- `pick`: Use commit as is.\n- `reword`: Change commit message.\n- `squash`: Combine commit into previous commit.\n- `drop`: Delete commit.',
        },
        {
          type: 'code',
          title: 'Interactive Rebase & Cherry-Pick Examples',
          content:
            '# Start interactive rebase for last 3 commits\ngit rebase -i HEAD~3\n\n# Cherry-pick a specific commit from another branch into current branch\ngit cherry-pick b7e41a9',
          language: 'bash',
        },
        {
          type: 'text',
          title: 'Emergency Recovery with git reflog',
          content:
            'If you accidentally ran `git reset --hard` or deleted a branch by mistake, don\'t panic! `git reflog` tracks every movement of HEAD on your local machine. You can find lost commit hashes and recover them easily.',
        },
        {
          type: 'code',
          title: 'Recovering Lost Commits using Reflog',
          content:
            '# View safety log of HEAD movements\ngit reflog\n\n# Restore repository back to state before accidental reset\ngit reset --hard HEAD@{1}',
          language: 'bash',
        },
        {
          type: 'quiz',
          title: 'Quick Check: Git Reflog',
          content: 'Quiz',
          quiz: {
            question: 'Which tool allows you to find commit hashes for deleted branches or accidental hard resets?',
            options: [
              { text: 'git reflog', isCorrect: true },
              { text: 'git status', isCorrect: false },
              { text: 'git remote', isCorrect: false },
              { text: 'git push', isCorrect: false },
            ],
            explanation: '`git reflog` records all local HEAD updates, acting as a safety net for lost commits.',
          },
        },
      ],
      flashcards: [
        { question: 'What command temporarily shelves uncommitted working changes?', answer: 'git stash' },
        { question: 'What does squash do in an interactive rebase?', answer: 'Combines a commit with its parent commit into a single commit.' },
        { question: 'What command records every HEAD movement locally for disaster recovery?', answer: 'git reflog' },
        { question: 'What command applies a single specific commit from another branch?', answer: 'git cherry-pick <commit-hash>' },
      ],
      mcqs: [
        {
          question: 'If you ran `git reset --hard` by mistake and lost unpushed commits, how can you recover them?',
          options: [
            { text: 'Use `git reflog` to locate the lost commit hash, then `git reset --hard <hash>` to recover', isCorrect: true },
            { text: 'Re-install Git', isCorrect: false },
            { text: 'Commit history is permanently unrecoverable', isCorrect: false },
            { text: 'Contact GitHub support', isCorrect: false },
          ],
          explanation: '`git reflog` tracks all local HEAD updates, allowing you to restore HEAD to any previous commit hash.',
        },
      ],
    },
  ],
};

const run = async (): Promise<void> => {
  try {
    await connectDB();

    console.log('Searching for existing Git & GitHub course in database...');
    let existingCourse = await Course.findOne({
      $or: [
        { title: { $regex: /git/i } },
        { category: 'Programming', title: { $regex: /git/i } },
      ],
    });

    if (existingCourse) {
      console.log(`Found existing course "${existingCourse.title}" (ID: ${existingCourse._id}). Cleaning up old topics, flashcards, and MCQs...`);
      const existingTopics = await Topic.find({ course: existingCourse._id });
      const existingTopicIds = existingTopics.map((t) => t._id);

      await Promise.all([
        Flashcard.deleteMany({ topic: { $in: existingTopicIds } }),
        MCQ.deleteMany({ topic: { $in: existingTopicIds } }),
        Topic.deleteMany({ course: existingCourse._id }),
        Course.deleteOne({ _id: existingCourse._id }),
      ]);
      console.log('Old course data deleted successfully.');
    }

    console.log(`Creating fresh "${gitCourseSeed.course.title}" course...`);
    const course = await Course.create(gitCourseSeed.course);

    // Create 3 structured Chapters for the curriculum
    const chapters = await Chapter.create([
      {
        course: course._id,
        title: 'Foundations of Git & Configuration',
        description: 'Learn why version control is critical, configure Git, and make your first commits.',
        order: 0,
      },
      {
        course: course._id,
        title: 'Branching, Merging & Remote Workflows',
        description: 'Master branch strategies, merge conflict resolution, and syncing with GitHub.',
        order: 1,
      },
      {
        course: course._id,
        title: 'Advanced Collaboration & Best Practices',
        description: 'Work with pull requests, code reviews, rebasing, and emergency recovery with reflog.',
        order: 2,
      },
    ]);

    let totalTopics = 0;
    let totalFlashcards = 0;
    let totalMcqs = 0;

    for (let i = 0; i < gitCourseSeed.topics.length; i++) {
      const topicSeed = gitCourseSeed.topics[i];
      // Distribute topics among the 3 chapters (0-2 in Ch 1, 3-5 in Ch 2, 6-7 in Ch 3)
      const chapterId = i < 3 ? chapters[0]._id : i < 6 ? chapters[1]._id : chapters[2]._id;

      const topic = await Topic.create({
        course: course._id,
        chapter: chapterId,
        title: topicSeed.title,
        description: topicSeed.description,
        contents: topicSeed.contents,
        order: i + 1,
        xp: 50,
        isPublished: true,
      });
      totalTopics++;

      if (topicSeed.flashcards.length > 0) {
        await Flashcard.insertMany(topicSeed.flashcards.map((f) => ({ topic: topic._id, question: f.question, answer: f.answer })));
        totalFlashcards += topicSeed.flashcards.length;
      }

      if (topicSeed.mcqs.length > 0) {
        await MCQ.insertMany(topicSeed.mcqs.map((m) => ({ topic: topic._id, question: m.question, options: m.options, explanation: m.explanation })));
        totalMcqs += topicSeed.mcqs.length;
      }
    }

    console.log('\n========================================');
    console.log('Git & GitHub Course seeded successfully!');
    console.log('========================================');
    console.log(`Course Title: ${course.title}`);
    console.log(`Course ID:    ${course._id}`);
    console.log(`Topics:       ${totalTopics}`);
    console.log(`Flashcards:   ${totalFlashcards}`);
    console.log(`MCQs:         ${totalMcqs}`);
    console.log('========================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Git & GitHub course:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  run();
}
