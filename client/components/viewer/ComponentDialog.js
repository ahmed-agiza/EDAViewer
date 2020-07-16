import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { makeStyles } from "@material-ui/core/styles";
import styles from "./Viewer.styles.js";

const useStyles = makeStyles(styles);

export default function ComponentDialog(props) {
	const { open, title, body, onCancel } = props;
	const classes = useStyles();

	return (
		<div>
			<Dialog
				open={open}
				onClose={onCancel}
				className={classes.componentDialog}
				aria-labelledby="component-dialog"
				aria-describedby="component-dialog-description"
			>
				<DialogTitle id="component-dialog">{title}</DialogTitle>
				<DialogContent>{body}</DialogContent>
				<DialogActions>
					<Button onClick={onCancel} color="primary">
						Close
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
