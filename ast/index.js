"use strict";
var esprima = require('esprima')

function getAST(text, options) {
	try {
		var ast = esprima.parse(text, {
			sourceType: 'module',
			comment: true,
			attachComment: true
		})
	}
	catch (err) {
		if (err.message.indexOf('strict mode') !== -1) {
			// retry as normal mode again
			var ast = esprima.parse(text, {
				comment: true,
				attachComment: true
			})
		}
		else {
			// JSON file?
			try {
				JSON.parse(text)
				var fixed_text = '(' + text + ')'
				var ast = esprima.parse(fixed_text)
			}
			catch (_) {

			}
		}
	}
	return ast
}
module.exports = exports = {getAST};
