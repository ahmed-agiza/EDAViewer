import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { makeStyles } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import AssistantPhotoIcon from "@material-ui/icons/AssistantPhoto";
import HomeIcon from "@material-ui/icons/Home";
import ListAltIcon from "@material-ui/icons/ListAlt";
import Button from "components/common/Button";
import styles from "./Header.styles.js";
import { Link } from "react-scroll";

const useStyles = makeStyles(styles);

export default function HeaderLinks(props) {
	const classes = useStyles();
	return (
		<List className={classes.list}>
			<ListItem className={classes.listItem}>
				<Button
					color="transparent"
					className={classes.navLink}
					component={Link}
					to={"section-home"}
				>
					<HomeIcon className={classes.icons}>unarchive</HomeIcon>{" "}
					Home
				</Button>
			</ListItem>
			<ListItem className={classes.listItem}>
				<Button
					color="transparent"
					className={classes.navLink}
					component={Link}
					to={"section-features"}
					offset={-60}
				>
					<ListAltIcon className={classes.icons}>
						unarchive
					</ListAltIcon>{" "}
					Features
				</Button>
			</ListItem>
			<ListItem className={classes.listItem}>
				<Button
					color="transparent"
					className={classes.navLink}
					component={Link}
					to={"section-contact"}
				>
					<AssistantPhotoIcon className={classes.icons} /> Contribute
				</Button>
			</ListItem>
			<ListItem className={classes.listItem}>
				<Tooltip
					id="github-tooltip"
					title="Check the source code on GitHub"
					placement={"top"}
					classes={{ tooltip: classes.tooltip }}
				>
					<Button
						color="transparent"
						href="https://github.com/ahmed-agiza/EDAViewer"
						target="_blank"
						className={classes.navLink}
					>
						<i className={classes.socialIcons + " fab fa-github"} />
					</Button>
				</Tooltip>
			</ListItem>
		</List>
	);
}
