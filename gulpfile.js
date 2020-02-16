const {watch, src, dest, task, series, parallel} = require('gulp');//include gulp
const less = require("gulp-less");//compiler code less to css
const sourcepams = require('gulp-sourcemaps');//record source code js or sass to map
const concat = require('gulp-concat');//file concatenation into one
const uglify = require('gulp-uglify');//js code minimization
const del = require('del');//plugin for cleaning build folder
const pipeline = require('readable-stream').pipeline;//merging all .pipe into pipeline
const cleanCSS = require('gulp-clean-css');//write css in one line
const browserSync = require('browser-sync').create();//local server
const autoprefixer = require('gulp-autoprefixer');//Add prefix for new properties
const bable = require('gulp-babel');//compiler js ES6 into ES5
const imagemin = require('gulp-imagemin');


function images() {
    return pipeline (
        src('./app/images/*'),
        imagemin(),
        dest('./build/images')
    )
}

function addStyles(paths, outputFilename) {
    return pipeline(
        src(paths),
        sourcepams.init(),
        less(),
        concat(outputFilename),
        autoprefixer('last 10 versions', 'ie 9'),
        cleanCSS(),
        sourcepams.write('./'),
        dest('./build/css'),
        browserSync.stream()
    )
}

function styles() {
    return addStyles([
        './node_modules/normalize.css/normalize.css',
        './app/styles/index.less',
        './app/styles/media.less',
    ],'index.css')
}

function scripts() {
    return pipeline(
        src(['./app/scripts/*.js']),
        sourcepams.init(),
        bable({
            presets: [
                ['@babel/env', {
                    modules: false
                }]
            ]
        }),
        concat('index.js'),
        uglify(),
        sourcepams.write('./'),
        dest('./build/js'),
        browserSync.stream()
    )
}

function clean() {
    return del(['build/*'])
}

function watcher() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });

    watch('./app/**/*.less', styles);
    watch('./app/**/*.js', scripts);
    watch("/*.html").on('change', browserSync.reload);
}//tracking all files that can be changed for hot reload with Browser Sync

task('images', images);
task('styles', styles);
task('scripts', scripts);
task('del', clean);
task('watch', watcher);
task('build', series(clean, parallel(images, styles, scripts)));
task('dev', series('build', watcher));