import { primaryColor } from "assets/jss/nextjs-material-kit.js";
import { infoColor, title } from "assets/jss/nextjs-material-kit.js";

const uploadStyle = {
	uploadPaper: {
		"& .MuiGrid-container": {
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			height: "100%",
		},
	},
	progress: {
		color: infoColor,
		width: "6rem !important",
		height: "6rem !important",
	},
	uploadBox: {
		padding: "20px",
		paddingBottom: "0",
		display: "inline-flex",
		justifyContent: "center",
		width: "100%",
		height: "80%",
	},
	progressTitle: {
		...title,
		color: "#FFFFFF",
	},
	uploadFiles: {
		width: "100%",
	},
	uploadProgressBar: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
	fileitemText: {
		"& span": {
			whiteSpace: "nowrap",
			overflow: "hidden",
			textOverflow: "ellipsis",
			paddingRight: "2px",
		},
	},
	dropzoneText: {
		color: primaryColor,
		padding: "36px",
		fontSize: "1.2rem",
	},
	dropzoneIcon: {
		fontSize: "5rem",
		opacity: "0.5",
		color: primaryColor,
	},
	dropzone: {
		border: "1px dashed" + primaryColor,
		height: "100%",
		width: "100%",
		justifyContent: "center",
		alignItems: "center",
		display: "flex",
		flexDirection: "column",
	},
};

export default uploadStyle;
