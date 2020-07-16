import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

export default function ConfirmationDialog(props) {
	const {
		title,
		message,
		open,
		onAccept,
		onCancel,
		acceptButtonText,
		cancelButtonText,
	} = props;

	return (
		<div>
			<Dialog
				open={open}
				onClose={onCancel}
				aria-labelledby="confirmation-dialog"
				aria-describedby="confirmation-dialog-description"
			>
				<DialogTitle id="confirmation-dialog">{title}</DialogTitle>
				<DialogContent>
					<DialogContentText id="confirmation-dialog-description">
						{message}
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={onCancel} color="primary">
						{cancelButtonText || "Cancel"}
					</Button>
					<Button onClick={onAccept} color="primary" autoFocus>
						{acceptButtonText || "Yes"}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
