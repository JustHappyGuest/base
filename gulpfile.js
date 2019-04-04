let gulp          = require("gulp");
let sass          = require("gulp-sass");
let clean         = require("gulp-clean");
let autoprefixer  = require("gulp-autoprefixer");
let rename        = require("gulp-rename");
let cleanCSS      = require("gulp-clean-css");
let browserSync   = require("browser-sync");
let gulpif        = require("gulp-if");
let replace       = require("gulp-replace");
let uglify        = require("gulp-uglify-es").default;
let imagemin      = require("gulp-imagemin");
let concat        = require("gulp-concat");

let build = false;

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: "./dist/"
    },
    port: 8080,
    open: true,
    notify: false
  });
});

function onBuild(cb){
  build = true;
  cb();
}

gulp.task("clean", function(){
  return gulp.src("./dist/**/", {read : false})
      .pipe(clean());
});

gulp.task("views", function(){
  return gulp.src("./app/*.html")
      .pipe(gulpif(build, replace("style.css", "style.min.css")))
      .pipe(gulpif(build, replace("main.js", "main.min.js")))
      .pipe(gulpif(build, replace("libs.js", "libs.min.js")))
      .pipe(gulp.dest("./dist/"))
      .pipe(browserSync.stream());
})

gulp.task("styles", function(){
  return gulp.src("./app/scss/**/*.scss")
      .pipe(sass().on("error", sass.logError))
      .pipe(autoprefixer(["last 12 versions", "> 1%", "ie 8", "ie 7"]))
      .pipe(gulpif(build, cleanCSS()))
      .pipe(gulpif(build, rename({suffix : ".min"})))
      .pipe(gulp.dest("./dist/css"))
      .pipe(browserSync.stream());
});

gulp.task("scripts", function(){
  return gulp.src(["./app/js/**/*.js"])
      .pipe(concat("main.js"))
      .pipe(gulpif(build, uglify()))
      .pipe(gulpif(build, rename({suffix : ".min"})))
      .pipe(gulp.dest("./dist/js/"))
      .pipe(browserSync.stream());
});

gulp.task("libs", function(){
  return gulp.src(["./app/libs/**/*.js"])
      .pipe(concat("libs.js"))
      .pipe(gulpif(build, uglify()))
      .pipe(gulpif(build, rename({suffix : ".min"})))
      .pipe(gulp.dest("./dist/libs/"))
      .pipe(browserSync.stream());
});

gulp.task("images", function(){
  return gulp.src("./app/img/**/*.{jpg,jpeg,png,gif,svg}")
      .pipe(gulpif(build, imagemin()))
      .pipe(gulp.dest("./dist/img/"));
});

gulp.task("fonts", function(){
  return gulp.src("./app/fonts/**/*.{otf,ttf,woff,woff2}")
      .pipe(gulp.dest("./dist/fonts/"));
});

gulp.task("watches", function(){
  gulp.watch("app/scss/**/*.scss", gulp.series("styles"));
  gulp.watch("app/**/*.html", gulp.series("views"));
  gulp.watch("app/js/**/*.js", gulp.series("scripts"));
  gulp.watch("app/libs/**/*.js", gulp.series("libs"));
  gulp.watch("app/img/**/*.{jpg,jpeg,png,gif,svg}", gulp.series("images"));
  gulp.watch("app/fonts/**/*.{otf,ttf,woff,woff2}", gulp.series("fonts"));
});


exports.default = gulp.series("clean", gulp.parallel("views", "styles", "scripts", "libs", "images", "fonts"), gulp.parallel("watches", "browserSync"))

exports.build = gulp.series(onBuild, "clean", "views", "styles", "scripts", "libs", "images", "fonts");
