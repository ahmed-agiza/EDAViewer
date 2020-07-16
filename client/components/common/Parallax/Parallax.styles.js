import { primaryColor } from "assets/jss/nextjs-material-kit.js";

const parallaxStyle = (theme) => ({
	parallax: {
		height: "95vh",
		maxHeight: "1000px",
		overflow: "hidden",
		position: "relative",
		backgroundPosition: "center top",
		backgroundSize: "cover",
		margin: "0",
		padding: "0",
		border: "0",
		display: "flex",
		alignItems: "center",
		backgroundColor: primaryColor,
	},
	filter: {
		"&:before": {
			background: "rgba(0, 0, 0, 0.5)",
		},
		"&:after,&:before": {
			position: "absolute",
			zIndex: "1",
			width: "100%",
			height: "100%",
			display: "block",
			left: "0",
			top: "0",
			content: "''",
		},
	},
	small: {
		height: "380px",
	},
	parallaxResponsive: {
		[theme.breakpoints.down("md")]: {
			minHeight: "660px",
		},
	},
});

export default parallaxStyle;
