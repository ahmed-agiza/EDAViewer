import {
	primaryColor,
	infoColor,
	title,
} from "assets/jss/nextjs-material-kit.js";
import { fade } from "@material-ui/core/styles";

const componentsStyle = (theme) => ({
	grow1: {
		flexGrow: 2.7,
	},
	grow2: {
		flexGrow: 1,
	},
	designName: {
		fontSize: "1.3rem",
		fontWeight: "bold",
		margin: "0",
	},
	defViewer: {
		backgroundColor: "white",
		padding: "2rem",
	},
	defViewerCanvas: {},
	nested: {
		paddingLeft: theme.spacing(4),
		"& .MuiListItemText-primary": {
			fontSize: "0.875rem",
		},
	},
	componentsCollapse: {},
	listItem: {
		height: "40px",
	},
	panelSeperator: {},
	panelLayers: {
		borderLeft: `1px solid ${primaryColor}`,
		overflowY: "auto",
	},
	panelComponents: { borderLeft: `1px solid ${primaryColor}` },
	componentDialog: {
		"& .MuiDialogContent-root": {
			paddingTop: 0,
			paddingBottom: 0,
		},
		"& .MuiDialogContentText-root": {
			marginBottom: 0,
		},
	},
	designStats: {
		fontSize: "1.02rem",
		margin: "0",
	},
	menuButton: {
		marginRight: theme.spacing(2),
	},
	componentsExplorerHeader: {
		display: "flex",
		justifyContent: "space-between",
	},
	componentsExplorerSearch: {
		display: "flex",
		paddingLeft: "12px",
		paddingRight: "12px",
	},
	componentsExplorerSearchField: {
		width: "100%",
	},
	toolbarButton: {
		paddingLeft: "1rem",
		paddingRight: "1rem",
		boxShadow: "unset",
	},
	toolbarText: {
		boxShadow: "unset",
		margin: "0",
		width: "300px",
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	title: {
		display: "none",
		[theme.breakpoints.up("sm")]: {
			display: "block",
		},
	},
	menuItem: {
		fontSize: "14px",
		paddingTop: "0",
		paddingBottom: "0",
		"& .MuiListItemIcon-root": {
			minWidth: "36px",
		},
	},
	search: {
		position: "relative",
		borderRadius: theme.shape.borderRadius,
		backgroundColor: fade(theme.palette.common.white, 0.15),
		"&:hover": {
			backgroundColor: fade(theme.palette.common.white, 0.25),
		},
		marginRight: theme.spacing(2),
		marginLeft: 0,
		width: "100%",
		[theme.breakpoints.up("sm")]: {
			marginLeft: theme.spacing(3),
			width: "auto",
		},
	},
	searchIcon: {
		padding: theme.spacing(0, 2),
		height: "100%",
		position: "absolute",
		pointerEvents: "none",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	inputRoot: {
		color: "inherit",
	},
	inputInput: {
		padding: theme.spacing(1, 1, 1, 0),
		paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
		transition: theme.transitions.create("width"),
		width: "100%",
		[theme.breakpoints.up("md")]: {
			width: "20ch",
		},
	},
	sectionDesktop: {
		display: "none",
		[theme.breakpoints.up("md")]: {
			display: "flex",
		},
	},
	sectionMobile: {
		display: "flex",
		[theme.breakpoints.up("md")]: {
			display: "none",
		},
	},
	infoIcon: {
		opacity: 0.6,
	},
	visiblityListItem: {
		paddingTop: 0,
		paddingBottom: 0,
	},
	viewerToolBar: {
		maxHeight: "64px",
	},
	visiblityListCheckbox: {},
	root: {
		flexGrow: 1,
		height: "100%",
		backgroundColor: "#e5e5e5",
		"& .MuiTypography-root": {
			marginRight: "1rem",
		},
	},
	viewer: {
		height: "100vh",
		overflow: "hidden",
	},
	menuButton: {
		marginRight: theme.spacing(2),
	},
	title: {
		flexGrow: 1,
	},
	viewerProgressBar: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#000000",
		opacity: "0.9",
		position: "absolute",
	},
	progress: {
		color: infoColor,
		width: "6rem !important",
		height: "6rem !important",
	},
	progressTitle: {
		...title,
		color: "#FFFFFF",
	},
	appBar: {
		backgroundColor: primaryColor,
		paddingTop: "1px",
		paddingBottom: "1px",
		minWidth: "100%",
	},
});

export default componentsStyle;
