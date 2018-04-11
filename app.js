require('dotenv').config()

const os                = require('os')
const fs                = require('fs-extra')
const git               = require('nodegit')
const glob              = require('glob')
const watch             = require('node-watch')

// User Defined
const REPO_ID           = process.env.REPO_ID
const FILE_ID           = process.env.FILE_ID
const DEST_DIR          = process.env.DEST_DIR

// Derived
const ABSTRACT_ROOT     = `${os.homedir()}/Library/Application Support/Abstract/`
const PROJECT_DIR       = `${ABSTRACT_ROOT}/repos/${REPO_ID}/`
const SKETCH_FILE_DIR   = `${ABSTRACT_ROOT}/Documents/com.bohemiancoding.sketch3/Edits/`
const FILE_MASTER_DIR   = `${FILE_ID}/master/`
const COMMIT_JSON       = `${DEST_DIR}commit.json`
const REGEX             = /( \([^\)]+\))/

watch(SKETCH_FILE_DIR + FILE_MASTER_DIR, { recursive: true, filter: /\.sketch$/ }, function(e, name) {
  console.log('Sketch file(s) changed...')

  if(name) {
    main()
  }
})

console.log('Listening...')

function main() {
  // Open the repository directory.
  git.Repository.open(PROJECT_DIR)
    // Open the master branch.
    .then(function(repo) {
      return repo.getMasterCommit()
    })
    // Display information about commits on master.
    .then(function(firstCommitOnMaster) {

      // Create a new history event emitter.
      var history = firstCommitOnMaster.history()

      // Create a counter to only show up to 9 entries.
      var count = 0

      // Listen for commit events from the history.
      history.on('commit', function(commit) {
        // Disregard all but the latest commit.
        if (++count > 1) {
          return
        }

        // Shorthand sha
        var sha = commit.sha().substr(0, 7)

        console.log(`Found: latest commit (${sha}) by ${commit.author().name()}`)

        // Build the source directory str
        var source_dir = `${SKETCH_FILE_DIR}${FILE_MASTER_DIR}${sha}/`

        // Find Sketch files
        glob('**/*.sketch', { cwd: source_dir }, function (err, files) {
          if(err) {
            console.error(err)
            return
          }

          if(files.length > 0) {
            files.map(function(file) {
              try {
                // Rename file (drop the everything inside the parens)
                var filename_rewrite = file.replace(REGEX, '')

                // Copy the file to our destination
                fs.copySync(`${source_dir}${file}`, `${DEST_DIR}${filename_rewrite}`)

                console.log(`Copied: ${filename_rewrite}`)

                // Write a commit.json file next to it with some infos
                fs.writeJsonSync(COMMIT_JSON, {
                  date:    commit.date(),
                  author:  commit.author(),
                  message: commit.message(),
                  sha:     commit.sha()
                })

                console.log(`Created: commit log here ${COMMIT_JSON}`)

              } catch (err) {
                console.error(err)
              }
            })
          } else {
            console.error('No Sketch file(s) found for this commit. Make sure to open the Sketch file(s) via Abstract at least once for it to generate file(s) that we can copy. Opening them untracked does the trick.')
            return
          }
        })
      })

      // Start emitting events.
      history.start()
    })

} // END MAIN
