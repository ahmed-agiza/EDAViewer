import React from "react";
import { initGA, logPageView } from "utils/analytics";

export default function Layout(props) {
	const disableTracking = !!props.disableTracking;

	React.useEffect(() => {
		if (!window.GA_INITIALIZED) {
			initGA();
			window.GA_INITIALIZED = true;
		}
		if (!disableTracking) {
			logPageView();
		}
	}, []);
	return <React.Fragment>{props.children}</React.Fragment>;
}
