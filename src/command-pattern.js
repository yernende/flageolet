export default class CommandPattern extends RegExp {
    constructor(pattern) {
        let parsedPattern = `^${(
            pattern.replace(/<.+?>/g, String.raw`\S+`)
        )}$`;
        super(parsedPattern);
    }
};
