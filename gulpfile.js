import gulp from "gulp";
import babel from "gulp-babel";
import plumber from "gulp-plumber";
import notifier from "node-notifier";

const PATHS = {
	DESTINATION: "./lib",
	SOURCES: "./src/**/*"
}

gulp.task("transpile", () => {
	gulp.src(PATHS.SOURCES)
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
		.pipe(babel())
		.pipe(plumber.stop())
		.pipe(gulp.dest(PATHS.DESTINATION));
});

gulp.task("default", ["transpile"]);
