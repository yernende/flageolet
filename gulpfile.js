import gulp from "gulp";
import babel from "gulp-babel";
import changed from "gulp-changed";
import plumber from "gulp-plumber";
import notifier from "node-notifier";

const PATHS = {
    DESTINATION: "./lib",
    SOURCES: "./src/**/*"
}

gulp.task("transpile", () => {
    gulp.src(PATHS.SOURCES)
        .pipe(changed(PATHS.DESTINATION))
        .pipe(plumber({
            errorHandler: (error) => {
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

gulp.task("watch", () => {
    gulp.watch(PATHS.SOURCES, ["transpile"]);
});

gulp.task("default", ["watch"]);
