import React from "react";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import InboxIcon from "@material-ui/icons/MoveToInbox";
import DraftsIcon from "@material-ui/icons/Drafts";
import SendIcon from "@material-ui/icons/Send";
import ImageIcon from "@material-ui/icons/Image";
import styles from "./Viewer.styles";
const useStyles = makeStyles(styles);

const StyledMenu = withStyles({
	paper: { fontSize: "12px" },
})((props) => (
	<Menu
		elevation={2}
		getContentAnchorEl={null}
		anchorOrigin={{
			vertical: "bottom",
			horizontal: "center",
		}}
		transformOrigin={{
			vertical: "top",
			horizontal: "center",
		}}
		{...props}
	/>
));

export default function ExportDesignMenu(props) {
	const classes = useStyles();

	const { open, onClose, anchorElelement, onExport } = props;
	return (
		<StyledMenu
			anchorEl={anchorElelement}
			keepMounted
			open={open}
			onClose={onClose}
		>
			<MenuItem
				className={classes.menuItem}
				onClick={() => onExport("png")}
			>
				<ListItemIcon>
					<ImageIcon />
				</ListItemIcon>
				<ListItemText disableTypography primary="PNG Image" />
			</MenuItem>
			<MenuItem
				className={classes.menuItem}
				onClick={() => onExport("jpeg")}
			>
				<ListItemIcon>
					<ImageIcon />
				</ListItemIcon>
				<ListItemText disableTypography primary="JPEG Image" />
			</MenuItem>
		</StyledMenu>
	);
}
