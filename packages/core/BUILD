package(
  default_visibility = ["//visibility:public"],
)

load("@build_bazel_rules_typescript//:defs.bzl", "ts_library")
load("@build_bazel_rules_nodejs//:defs.bzl", "rollup_bundle")

# load("@karma//:index.bzl", "karma_test")

# TODO: pull these from the local package.json, rather than the root.
deps = [
  "@npm//fast-deep-equal",
  "@npm//indefinite-observable",
  "@npm//symbol-observable",
  "@npm//wobble",
]


ts_library(
  name = "core",
  module_name = "material-motion",
  module_root = "src",
  srcs = glob(
    include = ["src/**/*.ts"],
    exclude = ["**/__tests__/*"],
  ),
  tsconfig = "//:tsconfig.json",
  deps = deps + [
    "@npm//@types",
    "@npm//tslib",
  ],
)

rollup_bundle(
  name = "bundle",
  deps = [":core"] + deps,
  entry_point = "packages/core/src/index",
)
# karma_test(
#   name = "test",
#   deps = glob(["src/__tests__/*"]) + [
#     ":core",
#     # FIXME(alexeagle): doesn't belong here
#     "@karma//internal/karma_concat_js",
#   ],
# )
