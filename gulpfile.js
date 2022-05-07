let project_folder = "dist";
let source_folder = "src";
let fs = require("fs");

let path = {
  build: {
    html: project_folder + "/",
    styles: project_folder + "/styles/",
    scripts: project_folder + "/scripts/",
    img: project_folder + "/img/",
    fonts: project_folder + "/fonts/",
  },

  src: {
    html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
    styles: source_folder + "/styles/style.scss",
    scripts: source_folder + "/scripts/main.js",
    img: source_folder + "/img/**/*.{jpg,png,svg,webp,gif,icon,ico,xml,json}",
    fonts: source_folder + "/fonts/*.{ttf}",
  },

  watch: {
    html: source_folder + "/**/*.html",
    styles: source_folder + "/styles/**/*.scss",
    scripts: source_folder + "/scripts/**/*.js",
    img: source_folder + "/img/**/*.{jpg,png,svg,webp,gif,icon,ico,xml,json}",
  },

  clean: "./" + project_folder + "/",
};

let { src, dest } = require("gulp"),
  gulp = require("gulp"),
  browsersync = require("browser-sync").create(),
  fileinclude = require("gulp-file-include"),
  del = require("del"),
  sass = require("gulp-sass")(require("sass")),
  plumber = require("gulp-plumber"),
  sourcemaps = require("gulp-sourcemaps"),
  autoprefixer = require("gulp-autoprefixer"),
    htmlmin = require("gulp-htmlmin"),
  group_media = require("gulp-group-css-media-queries"),
  clean_css = require("gulp-clean-css"),
  rename = require("gulp-rename"),
  uglify = require("gulp-uglify-es").default,
  imagemin = require("gulp-imagemin"),
  webp = require("gulp-webp"),
  webp_html = require("gulp-webp-html"),
  webp_css = require("gulp-webpcss"),
  svgSprite = require("gulp-svgstore"),
  ttf2woff = require("gulp-ttf2woff"),
  ttf2woff2 = require("gulp-ttf2woff2"),
  fonter = require("gulp-fonter");

function browserSync() {
  browsersync.init({
    server: {
      baseDir: "./" + project_folder + "/",
    },
    port: 3000,
    notify: false,
  });
}

function html() {
  return src(path.src.html)
    .pipe(fileinclude())
      .pipe(htmlmin())
    .pipe(webp_html())
      .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
}

function css() {
  return src(path.src.styles)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        outputStyle: "expanded",
      })
    )
    .pipe(group_media())
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 5 versions"],
        cascade: true,
      })
    )
    .pipe(
      webp_css({
        webpClass: ".webp",
        noWebpClass: ".no-webp",
      })
    )
    .pipe(dest(path.build.styles))
    .pipe(clean_css())
    .pipe(
      rename({
        extname: ".min.css",
      })
    )
    .pipe(sourcemaps.write("."))
    .pipe(dest(path.build.styles))
    .pipe(browsersync.stream());
}

function js() {
  return src(path.src.scripts)
    .pipe(fileinclude())
    .pipe(dest(path.build.scripts))
    .pipe(uglify())
    .pipe(
      rename({
        extname: ".min.js",
      })
    )
    .pipe(dest(path.build.scripts))
    .pipe(browsersync.stream());
}

function images() {
  return src(path.src.img)
    .pipe(
      webp({
        quality: 80,
      })
    )
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 80, progressive: true }),
        imagemin.optipng({ optimizationLevel: 3 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream());
}

function fonts() {
  src([source_folder + "/fonts/*.ttf"])
    .pipe(ttf2woff())
    .pipe(dest(path.build.fonts));
  return src([source_folder + "/fonts/*.ttf"])
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts));
}

gulp.task("otf2ttf", function () {
  return gulp
    .src([source_folder + "/fonts/*.otf"])
    .pipe(
      fonter({
        formats: ["ttf"],
      })
    )
    .pipe(dest(source_folder + "/fonts/"));
});

gulp.task("sprite", function () {
  return gulp
    .src([source_folder + "/img/**/icon-*.svg"])
    .pipe(svgSprite())
    .pipe(rename("sprite.svg"))
    .pipe(dest(path.build.img));
});

function fontsStyle(cb) {
  let file_content = fs.readFileSync(source_folder + "/styles/fonts.scss");
  if (file_content == "") {
    fs.writeFile(source_folder + "/styles/fonts.scss", "", cb);
    return fs.readdir(path.build.fonts, function (err, items) {
      if (items) {
        let c_fontname;
        for (var i = 0; i < items.length; i++) {
          let fontname = items[i].split(".");
          fontname = fontname[0];
          if (c_fontname != fontname) {
            fs.appendFile(
              source_folder + "/styles/fonts.scss",
              '@include font("' +
                fontname +
                '", "' +
                fontname +
                '", "400", "normal");\r\n',
              cb
            );
          }
          c_fontname = fontname;
        }
      }
    });
  }
  cb();
}

function watchFiles() {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.styles], css);
  gulp.watch([path.watch.scripts], js);
  gulp.watch([path.watch.img], images);
}

function clean() {
  return del(path.clean);
}

let build = gulp.series(
  clean,
  gulp.parallel(js, css, html, images, fonts),
  gulp.parallel(fontsStyle, browserSync)
);
let watch = gulp.parallel(build, watchFiles);

exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
