import React from "react";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import Alert from "@material-ui/lab/Alert";
import Button from "components/common/Button";
import PropTypes from "prop-types";
import styles from "./Upload.styles.js";
import UploadDragAndDrop from "./UploadDragAndDrop";
import UploadFile from "./UploadFile";
import { DesignContext } from "components/common/Context";
import CircularProgress from "@material-ui/core/CircularProgress";
import { logEvent, logException } from "utils/analytics";
import { upload } from "utils/api";
const useStyles = makeStyles(styles);

export default function Upload(props) {
	const classes = useStyles();

	const [alertMessageOpen, setAlertMessageOpen] = React.useState("");
	const [isUploading, setIsUploading] = React.useState(false);
	const [uploadFiles, setUploadFiles] = React.useState({
		nextID: 0,
		files: [],
		techID: -1,
	});
	const { setDesign } = React.useContext(DesignContext);

	if (isUploading) {
		return (
			<div className={classes.uploadProgressBar}>
				<CircularProgress className={classes.progress} />
			</div>
		);
	}

	const onAlertMessageClose = (event, reason) => {
		if (reason === "clickaway") {
			return;
		}
		setAlertMessageOpen(false);
	};

	const onFilesAdded = (uploadedFiles) => {
		setUploadFiles((prev) => {
			let newState = { ...prev, files: prev.files.slice() };
			let hasDef = false;
			let hasTech = false;
			prev.files.forEach((file) => {
				if (hasDef && hasTech) {
					return;
				}
				if (file.type == "def") {
					hasDef = true;
				} else if (prev.techID == file.id) {
					hasTech = true;
				}
			});
			for (let i = 0; i < uploadedFiles.length; i++) {
				const filename = uploadedFiles[i].name.toLowerCase();
				if (filename.endsWith(".def")) {
					if (hasDef) {
						setAlertMessageOpen(
							"Only one DEF file can be uploaded."
						);
						return prev;
					}
					newState.files.push({
						id: newState.nextID,
						type: "def",
						isLibrary: false,
						filename: uploadedFiles[i].name,
						file: uploadedFiles[i],
					});
					hasDef = true;
				} else if (filename.endsWith(".lef")) {
					newState.files.push({
						id: newState.nextID,
						type: "lef",
						isLibrary: true,
						filename: uploadedFiles[i].name,
						file: uploadedFiles[i],
					});
					if (!hasTech) {
						newState.techID = newState.nextID;
						hasTech = true;
					}
				} else {
					setAlertMessageOpen(
						"Only design LEF/DEF files can be uploaded."
					);
					return prev;
				}
				if (newState.files.length > 10) {
					setAlertMessageOpen(
						"You can only upload up to 10 files per design."
					);
					return prev;
				}
				newState.nextID++;
			}
			setAlertMessageOpen(false);
			return newState;
		});
	};
	const onUploadStart = () => {
		setUploadFiles((prev) => {
			let hasDef = false;
			let hasTech = false;
			let hasLibrary = false;
			const idMap = {};
			prev.files.forEach((file, ind) => {
				idMap[file.id] = ind;
				if (file.type == "def") {
					if (hasDef) {
						setAlertMessageOpen(
							"Only one DEF file can be uploaded."
						);
						return prev;
					}
					hasDef = true;
				}
				if (prev.techID == file.id) {
					if (hasTech) {
						setAlertMessageOpen(
							"Only one LEF technology file can be uploaded."
						);
						return prev;
					}
					hasTech = true;
				}
				if (file.isLibrary) {
					hasLibrary = true;
				}
			});
			if (!hasDef) {
				setAlertMessageOpen("Missing design DEF file.");
				return prev;
			}
			if (!hasTech) {
				setAlertMessageOpen("Missing LEF technology file.");
				return prev;
			}
			if (!hasLibrary) {
				setAlertMessageOpen(
					"At least one LEF library file should be uploaded."
				);
				return prev;
			}
			setAlertMessageOpen(false);
			setIsUploading(true);
			upload(prev)
				.then((design) => {
					setIsUploading(false);
					setDesign(design);
					logEvent("design", "upload");
				})
				.catch((err) => {
					const message = (err.response || {}).data || "Server error";
					setAlertMessageOpen(message);
					logException(
						{
							message: message,
							statusCode: (err.response || {}).status || 0,
						},
						false
					);
					setIsUploading(false);
				});
			return prev;
		});
	};
	const onSetTechFile = (ind) => (file, evt) => {
		if (evt.target.checked) {
			setUploadFiles((prev) => ({
				...prev,
				techID: file.id,
			}));
		}
	};
	const onSetLibraryFile = (ind) => (file, evt) => {
		setUploadFiles((prev) => ({
			...prev,
			files: [
				...prev.files.slice(0, ind),
				Object.assign(file, {
					isLibrary: evt.target.checked,
				}),
				...prev.files.slice(ind + 1),
			],
		}));
	};
	const onFileDelete = (ind) => () => {
		setUploadFiles((prev) => {
			const newState = { ...prev };
			const newFiles = [
				...prev.files.slice(0, ind),
				...prev.files.slice(ind + 1),
			];
			let firstLEF = false;
			let techFound = false;
			for (let i = 0; i < newFiles.length; i++) {
				if (!firstLEF && newFiles[i].type == "lef") {
					firstLEF = newFiles[i];
				}
				if (prev.techID == newFiles[i].id) {
					techFound = true;
					break;
				}
			}
			newState.files = newFiles;
			if (!techFound) {
				if (firstLEF) {
					newState.techID = firstLEF.id;
				} else {
					newState.techID = -1;
				}
			}
			return newState;
		});
	};
	return (
		<Paper className={classes.uploadPaper} elevation={3}>
			{alertMessageOpen && (
				<Alert onClose={onAlertMessageClose} severity="error">
					{alertMessageOpen}
				</Alert>
			)}
			<Grid
				container
				spacing={0}
				direction="column"
				justify="flex-start"
				alignItems="center"
			>
				<Grid item className={classes.uploadBox}>
					<UploadDragAndDrop onFilesAdded={onFilesAdded} />
				</Grid>
				<Grid item className={classes.uploadFiles}>
					<List>
						{uploadFiles.files.map((file, ind) => (
							<React.Fragment key={ind}>
								<UploadFile
									file={file}
									isTech={uploadFiles.techID == file.id}
									libraryTechCheckbox={file.type == "lef"}
									designCheckbox={file.type == "def"}
									onSetTechFile={onSetTechFile(ind)}
									onSetLibraryFile={onSetLibraryFile(ind)}
									onFileDelete={onFileDelete(ind)}
								/>
								<Divider light />
							</React.Fragment>
						))}
					</List>
				</Grid>
				<Grid item>
					{" "}
					<Button color="primary" size="lg" onClick={onUploadStart}>
						Upload Design
					</Button>
				</Grid>
			</Grid>
		</Paper>
	);
}

Upload.propTypes = {
	setIsUploading: PropTypes.func,
	isUploading: PropTypes.bool,
};
