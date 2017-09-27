load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")

git_repository(
  name = "build_bazel_rules_nodejs",
  remote = "https://github.com/bazelbuild/rules_nodejs.git",
  tag = "0.1.7",
)

local_repository(
  name = "karma",
  path = "node_modules/rules_karma",
)

load("@build_bazel_rules_nodejs//:defs.bzl", "node_repositories")

node_repositories(
  package_json = ["//:package.json"],
)

local_repository(
  name = "build_bazel_rules_typescript",
  path = "node_modules/@bazel/typescript",
)
