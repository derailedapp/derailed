# Contribution Guide

A guide on how to effectively contribute to Derailed.

## Submitting an Issue or Bug Report

- Don't Repeat Issues; If someone already made the issue you have, don't make a new one.
- Give the full report; Give us as much as you can to help us debug the issue for you, like machine specs, version of Derailed used, a full traceback (although redactions are fine,) etc.
- Give us a general message of what you're facing. This should include at least:
    - Summary; to deduct the simplest parts of your issue.
    - Possible Solutions; what you think may fix it.
    - Reproduction; how did you produce it subsequently?
    - Expected Result; what should've happened?
    - Give good information; "it doesn't work" and "it fails" are pieces of bad information. Try to convey it in a more friendly and detailed way.

If an issue doesn't meet these requirements, it will either be manually modified, or closed.

## Submitting a Pull Request

### Stay on Topic

Every pull request made should stick to its purpose and no more. If you add a feature,
only make changes related to that feature.

Any changes unrelated to the pull request will be removed in reviews if found.

### Make it work

Before submitting your pull request to Derailed, you should test the code, or at least
review any CI to see whether you've made any critical issues.

### Make understandable commits

Commits have a lot of guidelines to follow:

- Should be completely lower-case, unless its mentioning code, in which case, \`\` should be wrapped around it.
- Should be descriptive. (i.e. Not `added feature`, instead `[api] add support for animated usernames`.)
- Should at least have one of these topics:
    - `api`
    - `gateway`
    - `app`
    - `hazel`
    - `docs`
    - `core`
    - `style`
- If a commit is related to multiple topics a `/` should be used to separate them. (i.e. `[app/gateway] add anime girls`.)
- Should be under 72 characters.
- Use present tense (i.e. `add something` not `added something`)
