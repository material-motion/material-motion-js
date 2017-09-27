load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")

git_repository(
  name = "build_bazel_rules_nodejs",
  remote = "https://github.com/bazelbuild/rules_nodejs.git",
  tag = "0.1.7",
)

git_repository(
  name = "build_bazel_rules_karma",
  remote = "https://github.com/alexeagle/rules_karma.git",
  commit = "1688b6229cb76edc8607ba5593d706d29600f067",
)

load("@build_bazel_rules_nodejs//:defs.bzl", "node_repositories")

node_repositories(package_json = ["//:package.json"])

local_repository(
  name = "build_bazel_rules_typescript",
  path = "node_modules/@bazel/typescript",
)
