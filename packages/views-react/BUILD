package(
  default_visibility = ["//visibility:public"],
)

load("@build_bazel_rules_typescript//:defs.bzl", "ts_library")
load("@karma//:index.bzl", "karma_test")

ts_library(
  name = "views-react",
  module_name = "material-motion-views-react",
  module_root = "src",
  srcs = glob(
    include = [
      "src/**/*.ts",
      "src/**/*.tsx",
    ],
    exclude = ["**/__tests__/*"],
  ),
  deps = [
    "//packages/core",
    "//packages/views-dom",
  ],
  tsconfig = "//:tsconfig.json",
)

karma_test(
  name = "test",
  deps = glob(["src/__tests__/*"]),
)
