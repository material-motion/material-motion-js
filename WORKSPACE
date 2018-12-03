load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")

# Have to manually load all the transitive dependencies, otherwise `bazel build`
# fails with `ERROR: Failed to load Starlark extension '@…'.`
git_repository(
  name = "bazel_skylib",
  remote = "https://github.com/bazelbuild/bazel-skylib.git",
  tag = "0.6.0",
)

git_repository(
  name = "bazel_gazelle",
  remote = "https://github.com/bazelbuild/bazel-gazelle.git",
  tag = "0.14.0",
)

git_repository(
  name = "io_bazel_rules_go",
  remote = "https://github.com/bazelbuild/rules_go.git",
  tag = "0.15.1",
)

git_repository(
  name = "io_bazel_rules_webtesting",
  remote = "https://github.com/bazelbuild/rules_webtesting.git",
  tag = "0.2.1",
)


git_repository(
  name = "build_bazel_rules_nodejs",
  remote = "https://github.com/bazelbuild/rules_nodejs.git",
  tag = "0.16.2",
)

git_repository(
  name = "build_bazel_rules_typescript",
  remote = "https://github.com/bazelbuild/rules_typescript.git",
  tag = "0.21.0",
)

load("@build_bazel_rules_nodejs//:package.bzl", "rules_nodejs_dependencies")
load("@build_bazel_rules_nodejs//:defs.bzl", "check_bazel_version", "node_repositories", "rollup_bundle", "yarn_install")

node_repositories()

yarn_install(
  name = "npm",
  package_json = "//:package.json",
  yarn_lock = "//:yarn.lock",
)

yarn_install(
  name = "npm_core",
  package_json = "//packages/core:package.json",
  yarn_lock = "//:yarn.lock",
)

load("@build_bazel_rules_typescript//:defs.bzl", "ts_setup_workspace", "check_rules_typescript_version")
check_rules_typescript_version("0.21.0")
ts_setup_workspace()
