"use strict";
exports.handler = (event, context, callback) => {
	const request = event.Records[0].cf.request;

	let params = "";
	if ("querystring" in request && request.querystring.length > 0) {
		params = "?" + request.querystring;
	}

	const uriPath = request.uri.replace(/(\/[\w\-_]+)$/, "$1/");
	const rewritten =
		request.origin.custom.customHeaders["x-env-baseurl"][0].value +
		uriPath +
		params;

	const response = {
		status: "301",
		statusDescription: "Permanently moved",
		headers: {
			location: [
				{
					key: "Location",
					value: rewritten,
				},
			],
		},
	};
	return callback(null, response);
};
