import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import CloudUpload from "@material-ui/icons/CloudUpload";
import PropTypes from "prop-types";
import { useDropzone } from "react-dropzone";
import styles from "./Upload.styles.js";

const useStyles = makeStyles(styles);

export default function UploadDragAndDrop(props) {
	const classes = useStyles();
	const { onFilesAdded } = props;
	const onDrop = React.useCallback(onFilesAdded, []);
	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		maxSize: 100 * 1024 * 1024, //100MBs
	});
	return (
		<div className={classes.dropzone} {...getRootProps()} style={{}}>
			<input {...getInputProps()} />
			<CloudUpload
				className={classes.dropzoneIcon}
				style={{
					fontSize: "8rem",
				}}
			/>
			<div className={classes.dropzoneText}>
				Drag and drop design LEF/DEF files or <br />{" "}
				<b>click to choose from your computer</b>
			</div>
		</div>
	);
}

UploadDragAndDrop.propTypes = {
	onFilesAdded: PropTypes.func.isRequired,
};
