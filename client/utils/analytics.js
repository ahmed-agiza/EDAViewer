import ReactGA from "react-ga";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();

export const initGA = () => {
	const analytics = publicRuntimeConfig.analytics;
	if (analytics) {
		ReactGA.initialize(analytics);
	}
};
export const logPageView = () => {
	const analytics = publicRuntimeConfig.analytics;
	if (analytics) {
		ReactGA.set({ page: window.location.pathname });
		ReactGA.pageview(window.location.pathname);
	}
};
export const logEvent = (category = "", action = "") => {
	const analytics = publicRuntimeConfig.analytics;
	if (analytics && category && action) {
		ReactGA.event({ category, action });
	}
};
export const logException = (description = "", fatal = false) => {
	const analytics = publicRuntimeConfig.analytics;
	if (analytics) {
		if (description) {
			ReactGA.exception({ description, fatal });
		}
	}
};
