import { container, title } from "assets/jss/nextjs-material-kit.js";
import { textAlign } from "@material-ui/system";

const componentsStyle = {
	section: {
		padding: "35px 0px",
	},
	textCenter: {
		textAlign: "center",
	},
	sharingArea: {
		marginTop: "80px",
	},
	socials: {
		maxWidth: "24px",
		marginTop: "0",
		width: "100%",
		transform: "none",
		left: "0",
		top: "0",
		height: "100%",
		fontSize: "20px",
		marginRight: "4px",
	},
	title: {
		...title,
		marginTop: "50px",
		marginBottom: "50px",
		minHeight: "32px",
		textDecoration: "none",
		textAlign: "center",
	},
	feature: {
		paddingTop: "10px",
		paddingBottom: "10px",
		marginBottom: "0px",
		height: "100%",
		"& .MuiGrid-item": {
			display: "flex",
			flexDirection: "column",
			justifyContent: "center",
			alignItems: "center",
			paddingTop: "0px",
			"& svg": {
				fontSize: "5rem",
			},
			"& div": {
				fontSize: "1.3rem",
				paddingLeft: "15px",
				paddingRight: "15px",
			},
		},
	},
	featuresSection: {
		textAlign: "center",
	},
	container,
	featuresInnerContainer: {
		...container,
		display: "inline-flex",
		alignItems: "stretch",
		textAlign: "center",
	},
	featuresContainer: {
		...container,
		"& .MuiGrid-root": {
			display: "inline-flex",
			paddingBottom: "5px",
			paddingTop: "5px",
		},
	},
	featureGrid: {
		display: "inline-flex",
	},
	screenshotTitle: {
		fontSize: "3.6rem",
		fontWeight: "600",
		position: "relative",
	},
	screenshot: {
		marginTop: "5rem",
		textAlign: "center",
	},
	screenshotImg: {
		width: "80%",
		maxWidth: "1200px",
		height: "auto",
		border: "1px solid",
	},
	brand: {
		color: "#FFFFFF",
		textAlign: "left",
		marginRight: "1rem",
	},
	brandTitle: {
		paddingRight: "1rem",
		fontSize: "3.6rem",
		fontWeight: "600",
		display: "inline-block",
		position: "relative",
		marginBottom: "3rem",
		textAlign: "center",
		"@media (max-width: 768px)": {
			fontSize: "3.5rem",
			marginRight: "30px",
		},
		"@media (max-width: 576px)": {
			fontSize: "2.0rem",
			textAlign: "center",
			width: "100%",
			marginBottom: "40px",
			marginTop: "30px",
		},
		"@media (max-width: 320px)": {
			fontSize: "1.5rem",
			textAlign: "center",
			width: "100%",
			marginBottom: "10px",
		},
	},
	title: {
		fontSize: "3.6rem",
		fontWeight: "600",
		display: "inline-block",
		position: "relative",
		marginBottom: "3rem",
		textAlign: "center",
		"@media (max-width: 768px)": {
			fontSize: "3.5rem",
			marginRight: "30px",
		},
		"@media (max-width: 576px)": {
			fontSize: "2.0rem",
			textAlign: "center",
			width: "100%",
			marginBottom: "40px",
			marginTop: "30px",
		},
		"@media (max-width: 320px)": {
			fontSize: "1.5rem",
			textAlign: "center",
			width: "100%",
			marginBottom: "10px",
		},
	},
	subtitle: {
		fontSize: "1.313rem",
		margin: "10px 0 0",
		textAlign: "center",
		"@media (max-width: 768px)": {
			marginRight: "30px",
		},
		"@media (max-width: 576px)": {
			display: "none",
		},
	},
	main: {
		background: "#FFFFFF",
		position: "relative",
		zIndex: "3",
	},
	mainRaised: {
		margin: "0px 30px 0px",
		borderRadius: "6px",
		boxShadow:
			"0 16px 24px 2px rgba(0, 0, 0, 0.14), 0 6px 30px 5px rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(0, 0, 0, 0.2)",
		"@media (max-width: 830px)": {
			marginLeft: "10px",
			marginRight: "10px",
		},
	},
	link: {
		textDecoration: "none",
	},
	textCenter: {
		textAlign: "center",
	},
	exampleDesign: {
		textAlign: "center",
		fontSize: "1.3rem",
		cursor: "pointer",
		paddingTop: "20px",
		"& a": {
			"& svg": {
				width: "1em",
				height: "1em",
				marginRight: "5px",
			},
			color: "inherit",
			position: "relative",
			padding: "0.9375rem",
			fontWeight: "400",
			fontSize: "1.2rem",
			textTransform: "uppercase",
			borderRadius: "3px",
			lineHeight: "20px",
			textDecoration: "none",
			margin: "0px",
			display: "inline-flex",
			"&:hover,&:focus": {
				color: "inherit",
				background: "rgba(200, 200, 200, 0.2)",
			},
		},
	},
	grid: {
		marginRight: "-15px",
		marginLeft: "-15px",
		width: "auto",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
	},
	gridItem: {
		position: "relative",
		width: "100%",
		minHeight: "1px",
		paddingRight: "15px",
		paddingLeft: "15px",
		flexBasis: "auto",
		textAlign: "center",
	},
};

export default componentsStyle;
