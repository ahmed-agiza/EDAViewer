import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import Popover from "@material-ui/core/Popover";
import { makeStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Close from "@material-ui/icons/Close";
import InfoIcon from "@material-ui/icons/Info";
import MoreIcon from "@material-ui/icons/MoreVert";
import ResetIcon from "@material-ui/icons/RotateLeft";
import SaveIcon from "@material-ui/icons/Save";
import SettingsIcon from "@material-ui/icons/Settings";
import ZoomIn from "@material-ui/icons/ZoomIn";
import ZoomOut from "@material-ui/icons/ZoomOut";
import ZoomOutMap from "@material-ui/icons/ZoomOutMap";
import logo from "assets/img/logo_transparent_icon.png";
import Button from "components/common/Button";
import ConfirmationDialog from "components/common/ConfirmationDialog";
import PopupState, { bindPopover, bindTrigger } from "material-ui-popup-state";
import Router from "next/router";
import ExportDesignMenu from "./ExportDesignMenu";
import SettingsDialog from "./SettingsDialog";
import styles from "./Viewer.styles";

const useStyles = makeStyles(styles);

const ViewerToolbar = (props) => {
	const classes = useStyles();

	const {
		componentKey,
		style,
		design,
		onMouseDown,
		onMouseUp,
		onTouchEnd,
		settings,
		setSettings,
		setExportDialogOpen,
		setExportDialogType,
		setDesign,
		selectedComponentName,
		onSetDirtyLayers,
		viewport,
	} = props;

	const [settingsOpen, setSettingsOpen] = React.useState(false);
	const onSettingsOpen = () => {
		setSettingsOpen(true);
	};
	const onSettingsClose = () => {
		setSettingsOpen(false);
	};

	const [exitPromptOpen, setExitPromptOpen] = React.useState(false);
	const onExitPromptOpen = () => {
		setExitPromptOpen(true);
	};
	const onExitPromptAccept = () => {
		setDesign(null);
		Router.push("/");
	};
	const onExitPromptCancel = () => {
		setExitPromptOpen(false);
	};

	const [exportMenuOpen, setExportMenuOpen] = React.useState(false);
	const [exportAnchorEl, setExportAnchorEl] = React.useState(null);
	const onExportOpen = (evt) => {
		setExportAnchorEl(evt.currentTarget);
		setExportMenuOpen(true);
	};
	const onExportClose = () => {
		setExportMenuOpen(false);
	};
	const onExport = (type) => {
		setExportMenuOpen(false);
		setExportDialogType(type);
		setExportDialogOpen(true);
	};
	const onZoomIn = () => {
		viewport.current.zoomIn();
	};
	const onZoomOut = () => {
		viewport.current.zoomOut();
	};
	const onFit = () => {
		viewport.current.fit();
	};
	const onReset = () => {
		viewport.current.reset();
	};
	const designName = design.Name;
	const cellCount = design.Instances.length;
	const pinCount = design.InstancePins.length;
	const wireCount = design.Nets.length;
	const portCount = design.BlockPins.length;
	const metalCount = design.Layers.length;
	const percision = 2;
	let coreArea = design.CoreArea || "N/A";
	let cellArea = design.DesignArea || "N/A";
	let util = design.Utilization || "N/A";
	if (coreArea != "N/A") {
		coreArea = (
			<React.Fragment>
				{(coreArea * 10e12).toFixed(percision) + " "}&#181;m{" "}
				<sup>2</sup>
			</React.Fragment>
		);
	}
	if (cellArea != "N/A") {
		cellArea = (
			<React.Fragment>
				{(cellArea * 10e12).toFixed(percision) + " "}&#181;m{" "}
				<sup>2</sup>
			</React.Fragment>
		);
	}
	if (util != "N/A") {
		util = (100.0 * util).toFixed(percision) + "%";
	}

	return (
		<AppBar
			key={componentKey}
			className={`${classes.appBar} ${props.className || ""}`}
			style={{ ...style }}
			onMouseDown={onMouseDown}
			onMouseUp={onMouseUp}
			onTouchEnd={onTouchEnd}
			variant="outlined"
			position="static"
		>
			<SettingsDialog
				open={settingsOpen}
				onClose={onSettingsClose}
				settings={settings}
				setSettings={setSettings}
				onSetDirtyLayers={onSetDirtyLayers}
			/>
			<ConfirmationDialog
				title={"Exit Viewer"}
				message={"Are you sure you want to exit?"}
				open={exitPromptOpen}
				onAccept={onExitPromptAccept}
				onCancel={onExitPromptCancel}
			/>
			<Toolbar className={classes.viewerToolBar}>
				<Button simple onClick={onExitPromptOpen}>
					<img src={logo} alt="EDAV" width="50" height="auto"></img>
				</Button>
				<p className={classes.designName}>{designName}</p>
				<div className={classes.grow1} />
				<div className={classes.sectionDesktop}>
					<IconButton
						aria-label="Reset"
						title="Reset"
						color="inherit"
						onClick={onReset}
					>
						<ResetIcon />
					</IconButton>
					<IconButton
						aria-label="Zoom In"
						title="Zoom In"
						color="inherit"
						onClick={onZoomIn}
					>
						<ZoomIn />
					</IconButton>
					<IconButton
						aria-label="Zoom Out"
						title="Zoom Out"
						color="inherit"
						onClick={onZoomOut}
					>
						<ZoomOut />
					</IconButton>
					<IconButton
						edge="end"
						aria-label="Fit"
						title="Fit"
						aria-haspopup="true"
						color="inherit"
						onClick={onFit}
					>
						<ZoomOutMap />
					</IconButton>
				</div>
				<div className={classes.sectionMobile}>
					<IconButton
						aria-label="show more"
						aria-haspopup="true"
						color="inherit"
					>
						<MoreIcon />
					</IconButton>
				</div>
				<div className={classes.grow2} />
				<p className={classes.toolbarText}>
					{selectedComponentName && (
						<span>{selectedComponentName}</span>
					)}
				</p>
				<div className={classes.grow2} />
				<div>
					<ExportDesignMenu
						open={exportMenuOpen}
						onClose={onExportClose}
						anchorElelement={exportAnchorEl}
						onExport={onExport}
					/>
					<Button
						variant="contained"
						color="primary"
						className={classes.toolbarButton}
						startIcon={<SaveIcon>Export Image</SaveIcon>}
						onClick={onExportOpen}
					>
						Export Image
					</Button>
					<PopupState
						variant="popover"
						popupId="design-stats-popup-popover"
					>
						{(popupState) => (
							<React.Fragment>
								<Button
									variant="contained"
									color="primary"
									{...bindTrigger(popupState)}
									className={classes.toolbarButton}
									startIcon={
										<InfoIcon>Design Stats</InfoIcon>
									}
								>
									Design Stats
								</Button>
								<Popover
									{...bindPopover(popupState)}
									anchorOrigin={{
										vertical: "bottom",
										horizontal: "center",
									}}
									transformOrigin={{
										vertical: "top",
										horizontal: "center",
									}}
								>
									<Box p={2}>
										<Typography>
											Design: <b>{designName}</b>
											<br />
											Cells: <b>{cellCount}</b>
											<br />
											<span title="Number of cell pins">
												Pins: <b>{pinCount}</b>{" "}
											</span>
											<br />
											<span title="Number of top-level ports">
												Ports: <b>{portCount}</b>
											</span>
											<br />
											Wires: <b>{wireCount}</b>
											<br />
											Metal Layers: <b>{metalCount}</b>
											<br />
											Core Area: <b>{coreArea}</b>
											<br />
											<span title="Total area of standard cells in the design">
												Design Area: <b>{cellArea}</b>
											</span>
											<br />
											Utilization: <b>{util}</b>
											<br />
										</Typography>
									</Box>
								</Popover>
							</React.Fragment>
						)}
					</PopupState>
					<IconButton
						edge="end"
						aria-label="Settings"
						title="Settings"
						aria-haspopup="true"
						color="inherit"
						onClick={onSettingsOpen}
					>
						<SettingsIcon />
					</IconButton>
				</div>
				<IconButton
					edge="end"
					aria-label="Exit"
					title="Exit"
					aria-haspopup="true"
					color="inherit"
					onClick={onExitPromptOpen}
				>
					<Close />
				</IconButton>
			</Toolbar>
		</AppBar>
	);
};

export default ViewerToolbar;
