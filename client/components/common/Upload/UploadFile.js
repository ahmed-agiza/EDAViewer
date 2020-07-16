import React from "react";
import { ListItemText } from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import IconButton from "@material-ui/core/IconButton";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemAvatar";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import { makeStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import DeleteIcon from "@material-ui/icons/Delete";
import InsertDriveFileOutlinedIcon from "@material-ui/icons/InsertDriveFileOutlined";
import styles from "./Upload.styles.js";

const useStyles = makeStyles(styles);

function UploadFile(props) {
	const classes = useStyles();
	const {
		file,
		onFileDelete,
		libraryTechCheckbox,
		designCheckbox,
		onSetLibraryFile,
		onSetTechFile,
		isTech,
	} = props;
	return (
		<ListItem>
			<ListItemIcon style={{ minWidth: "32px" }}>
				<InsertDriveFileOutlinedIcon />
			</ListItemIcon>
			<ListItemText
				className={classes.fileitemText}
				title={file.filename}
				primary={file.filename}
			></ListItemText>
			<ListItemSecondaryAction style={{ minWidth: "0" }}>
				<FormGroup row>
					{designCheckbox && (
						<FormControlLabel
							control={
								<Switch
									checked={true}
									disabled
									name="Design File"
									color="primary"
								/>
							}
							label="Design File"
							disabled
						/>
					)}
					{libraryTechCheckbox && (
						<FormControlLabel
							control={
								<Switch
									checked={file.isLibrary}
									onChange={(evt) =>
										onSetLibraryFile
											? onSetLibraryFile(file, evt)
											: null
									}
									name="Library"
									color="primary"
								/>
							}
							label="Library"
						/>
					)}
					{libraryTechCheckbox && (
						<FormControlLabel
							control={
								<Switch
									checked={isTech}
									onChange={(evt) =>
										onSetTechFile
											? onSetTechFile(file, evt)
											: null
									}
									name="Technology"
									color="primary"
								/>
							}
							label="Technology"
						/>
					)}
					<IconButton
						onClick={(evt) =>
							onFileDelete ? onFileDelete(file, evt) : null
						}
						edge="end"
						size="small"
						aria-label="delete"
					>
						<DeleteIcon />
					</IconButton>
				</FormGroup>
			</ListItemSecondaryAction>
		</ListItem>
	);
}

// UploadFile.propTypes = {
// 	file: PropTypes.object.isRequired,
// 	onSetTechFile: PropTypes.function,
// 	isTech: PropTypes.bool,
// 	onSetLibraryFile: PropTypes.function,
// 	onFileDelete: PropTypes.function,
// 	libraryTechCheckbox: PropTypes.bool,
// 	designCheckbox: PropTypes.bool,
// };

export default UploadFile;
