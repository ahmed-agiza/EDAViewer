import { infoColor, title } from "assets/jss/nextjs-material-kit.js";

const pageChangeStyle = {
	progress: {
		color: infoColor,
		width: "6rem !important",
		height: "6rem !important",
	},
	wrapperDiv: {
		height: "100%",
		position: "absolute",
		width: "100%",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		maxWidth: "inherit",
		marginTop: "0",
		backgroundColor: "#393e46",
		flexDirection: "column",
	},
	iconWrapper: {
		display: "block",
	},
	title: {
		...title,
		color: "#FFFFFF",
	},
};
export default pageChangeStyle;
