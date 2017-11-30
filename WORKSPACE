load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")

git_repository(
  name = "build_bazel_rules_nodejs",
  remote = "https://github.com/bazelbuild/rules_nodejs.git",
  tag = "0.2.3",
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

http_archive(
  name = "io_bazel_rules_go",
  url = "https://github.com/bazelbuild/rules_go/releases/download/0.7.1/rules_go-0.7.1.tar.gz",
  sha256 = "341d5eacef704415386974bc82a1783a8b7ffbff2ab6ba02375e1ca20d9b031c",
)

load("@io_bazel_rules_go//go:def.bzl", "go_rules_dependencies", "go_register_toolchains")

go_rules_dependencies()

go_register_toolchains()
