import React from "react";
import Viewer from "components/viewer";
import Landing from "components/landing";
import { DesignContext } from "components/common/Context";

export default function Index(props) {
	const { design } = React.useContext(DesignContext);
	if (design) {
		return <Viewer />;
	} else {
		return <Landing />;
	}
}
