"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var csso = require("gulp-csso");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var rename = require("gulp-rename");
var svgstore = require("gulp-svgstore");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var del = require("del");

gulp.task("css", function () {
  return gulp.src("src/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"));
});

gulp.task("html", function () {
  return gulp.src("src/*.html")
  .pipe(posthtml([
    include()
  ]))
  .pipe(gulp.dest("build"));
});

gulp.task("image", () =>
  gulp.src("src/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3})
    ]))
    .pipe(gulp.dest("build/img"))
);

gulp.task("webp", () =>
    gulp.src("src/img/**/*.webp")
      .pipe(webp({quality: 90}))
      .pipe(gulp.dest("build/img"))
);

gulp.task("sprite", function () {
  return gulp.src("src/img/icon-*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});

gulp.task("copy", function () {
  return gulp.src([
    "src/fonts/**/*.{woff,woff2}",
    "src/img/**",
    "src/js/**",
    "src/*.ico"
  ], {
    base: "src"
  })
  .pipe(gulp.dest("build"));
});

gulp.task("clean", function () {
  return del("build");
});

gulp.task("refresh", function (done) {
  server.reload();
  done();
});

gulp.task("server", function () {
  server.init({
    server: "build/"
});

gulp.watch("src/sass/**/*.{scss,sass}", gulp.series("css", "refresh"));
gulp.watch("src/img/icon-*.svg", gulp.series("sprite", "html", "refresh"));
gulp.watch("src/*.html", gulp.series("html", "refresh"));
});

gulp.task("images", gulp.series("image", "webp"));
gulp.task("build", gulp.series(
  "clean",
  "copy",
  "css",
  "sprite",
  "html"
));
gulp.task("start", gulp.series("build", "server"));
