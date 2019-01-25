workflow "Test, Build and Deploy" {
  on = "push"
  resolves = ["Test", "Publish"]
}

action "Install Dependencies" {
  uses = "actions/npm@de7a3705a9510ee12702e124482fad6af249991b"
  args = "install"
}

action "Lint" {
  uses = "actions/npm@de7a3705a9510ee12702e124482fad6af249991b"
  needs = ["Install Dependencies"]
  args = "lint"
}

action "Test" {
  uses = "actions/npm@de7a3705a9510ee12702e124482fad6af249991b"
  needs = ["Install Dependencies"]
  args = "test"
}

action "Build" {
  uses = "actions/npm@de7a3705a9510ee12702e124482fad6af249991b"
  needs = ["Lint", "Test"]
  args = "build"
}

action "Publish" {
  uses = "actions/npm@de7a3705a9510ee12702e124482fad6af249991b"
  needs = ["Build"]
  args = "publish --access public"
  secrets = ["NPM_AUTH_TOKEN"]
}
