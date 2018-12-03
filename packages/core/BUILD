package(
  default_visibility = ["//visibility:public"],
)

load("@build_bazel_rules_typescript//:defs.bzl", "ts_library")
# load("@karma//:index.bzl", "karma_test")

ts_library(
  name = "core",
  module_name = "material-motion",
  module_root = "src",
  srcs = glob(
    include = ["src/**/*.ts"],
    exclude = ["**/__tests__/*"],
  ),
  tsconfig = "//:tsconfig.json",
  deps = [
    "@npm-core//@types",
    "@npm-core//deep-equal",
    "@npm-core//indefinite-observable",
    "@npm-core//symbol-observable",
    # "@npm-core//tslib",
    "@npm-core//wobble",
  ],
)

# karma_test(
#   name = "test",
#   deps = glob(["src/__tests__/*"]) + [
#     ":core",
#     # FIXME(alexeagle): doesn't belong here
#     "@karma//internal/karma_concat_js",
#   ],
# )
