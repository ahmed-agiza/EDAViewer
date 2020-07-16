import React from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";
import styles from "./PageChange.style";

const useStyles = makeStyles(styles);

export default function PageChange(props) {
	const classes = useStyles();
	const { text } = props;

	return (
		<div className={props.className || ""}>
			<div className={classes.wrapperDiv}>
				<div className={classes.iconWrapper}>
					<CircularProgress className={classes.progress} />
				</div>
				<h4 className={classes.title}>{text || "Loading.."}</h4>
			</div>
		</div>
	);
}
