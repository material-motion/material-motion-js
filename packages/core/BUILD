package(default_visibility=["//visibility:public"])
load("@build_bazel_rules_typescript//:defs.bzl", "ts_library")

ts_library(
  name = "material-motion",
  srcs = glob(
    include = ["src/**/*.ts"],
    exclude = ["**/__tests__/*"],
  ),
  tsconfig = "//:tsconfig.json",
)
