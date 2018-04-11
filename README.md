# Abstract Master Sketch File Copy/Sync
Watches an Abstract project for changes, copies latest master commit Sketch file(s) to a destination of your choice.

## Why?
I created this out of the need to copy our Design System's `master` Sketch file(s) outside of Abstract (like on Dropbox, etc) frequently (for various reasons).

I wanted to automate this, so it just happens. There is probably an easier way todo this, but this seems to work good for basic needs.

## Workflow
1.  `mv .env.sample .env`
2.  Change the `REPO_ID`, `FILE_ID`, and `DEST_DIR` variables
3.  `npm install`
4.  `npm start`
5.  Make sure to open the Sketch file(s) via Abstract at least once for it to generate file(s) that we can copy. Opening them untracked does the trick.
6.  Check your `DEST_DIR` for the output

## Example output
```
Listening...
Sketch file(s) changed...
Found: latest commit (3c7f1a8) by Bryan Berger
Copied: antd-ga.sketch
Created: commit log here /Users/bryanberger/Desktop/commit.json
```
