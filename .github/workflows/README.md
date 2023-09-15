# GitHub Actions for the Compass Project

## Overview

GitHub Actions is an automation service provided by GitHub, enabling a range of continuous integration (CI) and continuous delivery (CD) capabilities directly within the GitHub repository. This directory contains the workflow configurations for GitHub Actions that automatically build, test, and deploy our project.

## Why GitHub Actions?

- **Automated Testing**: Catch bugs and other issues before they reach production.
- **Build Verification**: Ensure that the code compiles and meets quality checks.
- **Deployment**: Streamline the process to get code from a developer's machine to production.
- **Consistency**: Provides a consistent environment for every build, ensuring that the software behaves the same way in development and in production.

## Files

### `.github/workflows/backend-ci.yml`

This workflow performs the following tasks whenever code is pushed to the repository or a pull request is made:

1. Sets up a Python environment.
2. Installs project dependencies.
3. Runs the Django tests.

### `.github/workflows/frontend-ci.yml`

This workflow performs the following tasks for the Next.js frontend:

1. Sets up a Node.js environment.
2. Installs project dependencies.
3. Builds the Next.js project.
4. Runs the frontend tests.

## How to Use

1. **Adding a New Workflow**: Create a new `.yml` file in the `workflows` directory. Use the existing files as a template.
2. **Modifying an Existing Workflow**: Edit the respective `.yml` file. Make sure to understand the existing steps before making changes.
3. **Running a Workflow Manually**: You can also trigger workflows manually from the GitHub Actions tab on the GitHub website.

## Best Practices

- **Be Specific**: Only run workflows for specific branches or files to avoid unnecessary builds.
- **Keep It Simple**: Workflows should be as simple as possible. Complex tasks should be scripted and stored in the repository.
- **Document**: Any non-trivial steps in the workflow should be clearly documented.

## Further Reading

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Django Testing](https://docs.djangoproject.com/en/3.2/topics/testing/)
- [Next.js Build Features](https://nextjs.org/docs#features)

By understanding and properly utilizing GitHub Actions, we're not just coding — we're developing software in a professional, maintainable manner.
