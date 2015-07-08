import gulp from "gulp";
import babel from "gulp-babel";
import plumber from "gulp-plumber";
import notifier from "node-notifier";
import minimist from "minimist";
import watch from "gulp-watch";

const PATHS = {
	DESTINATION: "lib",
	SOURCES: "src/**/*"
}

const argv = minimist(process.argv, {
	boolean: ["watch"],
	alias: {
		w: "watch"
	}
});

gulp.task("transpile", () => {
	let src = gulp.src(PATHS.SOURCES);

	if (argv.watch) {
		src = src.pipe(watch(PATHS.SOURCES))
	}

	src
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

	return src;
});

gulp.task("default", ["transpile"]);
