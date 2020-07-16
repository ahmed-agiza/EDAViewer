import React, { Component } from "react";
import Error from "components/error/Error";
export default function ViewerError(props) {
	const { statusCode } = props;
	return <Error statusCode={statusCode} />;
}

function getInitialProps({ res, err }) {
	let statusCode;
	if (res) {
		statusCode = res.statusCode;
	} else if (err) {
		statusCode = err.statusCode;
	} else {
		statusCode = null;
	}
	return { statusCode };
}

ViewerError.getInitialProps = getInitialProps;
