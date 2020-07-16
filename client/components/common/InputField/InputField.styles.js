import {
	primaryColor,
	dangerColor,
	successColor,
	defaultFont,
} from "assets/jss/nextjs-material-kit.js";

const inputStyle = {
	disabled: {
		"&:before": {
			borderColor: "transparent !important",
		},
	},
	underline: {
		"&:hover:not($disabled):before,&:before": {
			borderColor: "#D2D2D2 !important",
			borderWidth: "1px !important",
		},
		"&:after": {
			borderColor: primaryColor,
		},
	},
	underlineError: {
		"&:after": {
			borderColor: dangerColor,
		},
	},
	underlineSuccess: {
		"&:after": {
			borderColor: successColor,
		},
	},
	whiteUnderline: {
		"&:hover:not($disabled):before,&:before": {
			borderColor: "#FFFFFF",
		},
		"&:after": {
			borderColor: "#FFFFFF",
		},
	},
	labelRoot: {
		...defaultFont,
		color: "#AAAAAA !important",
		fontWeight: "400",
		fontSize: "16px",
		lineHeight: "1.42857",
		top: "10px",
		letterSpacing: "unset",
		"& + $underline": {
			marginTop: "0px",
		},
	},
	labelRootError: {
		color: dangerColor + " !important",
	},
	labelRootSuccess: {
		color: successColor + " !important",
	},
	formControl: {
		margin: "0 0 0 0",
		paddingTop: "0px",
		position: "relative",
		"& svg,& .fab,& .far,& .fal,& .fas,& .material-icons": {
			color: "#495057",
		},
	},
	input: {
		color: "#495057",
		height: "unset",
		"&,&::placeholder": {
			fontSize: "16px",
			fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
			fontWeight: "400",
			lineHeight: "1.42857",
			opacity: "1",
		},
		"&::placeholder": {
			color: primaryColor,
			opacity: "0.6",
		},
	},
	whiteInput: {
		"&,&::placeholder": {
			color: "#FFFFFF",
			opacity: "1",
		},
	},
};

export default inputStyle;
