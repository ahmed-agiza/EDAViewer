import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

export default function ExportDesignDialog(props) {
	const { open, type, onExport, onCancel } = props;

	return (
		<div>
			<Dialog
				open={open}
				onClose={onCancel}
				aria-labelledby="confirmation-dialog"
				aria-describedby="confirmation-dialog-description"
			>
				<DialogTitle id="confirmation-dialog">Export Image</DialogTitle>
				<DialogContent>
					<DialogContentText id="confirmation-dialog-description">
						Are you sure you want to export the current view as{" "}
						{(type || "png").toUpperCase()} image?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={onCancel} color="primary">
						Cancel
					</Button>
					<Button onClick={onExport} color="primary" autoFocus>
						Yes
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
