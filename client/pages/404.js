import React, { Component } from "react";
import Error from "components/error/Error";
export default function ViewerError404(props) {
	return <Error statusCode={404} />;
}
