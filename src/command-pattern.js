export default class CommandPattern extends RegExp {
    constructor(pattern) {
        let parsedPattern = `^${pattern}$`;
        super(parsedPattern);
    }
};
