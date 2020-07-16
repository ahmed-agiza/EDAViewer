import PageChange from "components/common/PageChange";
import Router from "next/router";
import { DesignContext } from "components/common/Context";
import Layout from "components/common/Layout";

export default function Example() {
	const { design, setDesign } = React.useContext(DesignContext);
	const [redirected, setRedirected] = React.useState(false);
	if (design && !redirected) {
		Router.push("/");
	}
	React.useEffect(() => {
		if (Router.pathname === "/example") {
			import("assets/sample.json").then(setDesign);
			setRedirected(true);
			Router.push("/");
		}
	}, []);
	return (
		<Layout>
			<PageChange text="Loading example design.." />
		</Layout>
	);
}
