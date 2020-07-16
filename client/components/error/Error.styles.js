import { container } from "assets/jss/nextjs-material-kit.js";
const errorStyles = {
	container,
	root: {
		...container,
		flexGrow: 1,
		display: "flex",
		marginTop: "20vh",
	},
	code: { fontSize: "14rem", textAlign: "center" },
	message: { textAlign: "center", marginBottom: "3rem" },
	home: {
		textAlign: "center",
	},
};

export default errorStyles;
