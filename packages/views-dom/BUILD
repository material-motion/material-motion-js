package(
  default_visibility = ["//visibility:public"],
)

load("@build_bazel_rules_typescript//:defs.bzl", "ts_library")
load("@karma//:index.bzl", "karma_test")

ts_library(
  name = "views-dom",
  module_name = "material-motion-views-dom",
  module_root = "src",
  srcs = glob(
    include = ["src/**/*.ts"],
    exclude = ["**/__tests__/*"],
  ),
  deps = ["//packages/core"],
  tsconfig = "//:tsconfig.json",
)

karma_test(
  name = "test",
  deps = glob(["src/__tests__/*"]),
)
