"use strict";

let gulp = require("gulp");
let babel = require("gulp-babel");
let changed = require("gulp-changed");
let plumber = require("gulp-plumber");
let notifier = require("node-notifier");

const PATHS = {
    DESTINATION: "./lib",
    SOURCES: "./src/**/*"
}

gulp.task("transpile", function() {
    gulp.src(PATHS.SOURCES)
        .pipe(changed(PATHS.DESTINATION))
        .pipe(plumber({
            errorHandler: function(error) {
                console.log(`${error.name}: ${error.message}`);
                console.log(error.codeFrame);

                notifier.notify({
                    title: `${error.name} in babel`,
                    message: error.message
                });
            }
        }))
        .pipe(babel({
            blacklist: [
                "es6.classes",
                "es6.blockScoping",
                "es6.constants",
                "es6.forOf",
                "es6.templateLiterals",
                "es6.properties.computed",
                "es6.properties.shorthand",
                "regenerator"
            ]
        }))
        .pipe(plumber.stop())
        .pipe(gulp.dest(PATHS.DESTINATION));
});

gulp.task("watch", function() {
    gulp.watch(PATHS.SOURCES, ["transpile"]);
});

gulp.task("default", ["watch"]);
