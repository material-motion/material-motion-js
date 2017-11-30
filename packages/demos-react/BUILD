load("@build_bazel_rules_typescript//:defs.bzl", "ts_devserver", "ts_library")

ts_devserver(
  name = "devserver",
  deps = [
    "//packages/core",
    "//packages/views-dom",
    "//packages/views-react",
  ],
  serving_path = "/dist/bundle.js",
  static_files = ["site/index.html"],
)
