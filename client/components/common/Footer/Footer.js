import { List, ListItem } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Favorite from "@material-ui/icons/Favorite";
import classNames from "classnames";
import Link from "next/link";
import PropTypes from "prop-types";
import React from "react";
import styles from "./Footer.styles.js";

const useStyles = makeStyles(styles);

export default function Footer(props) {
	const classes = useStyles();
	const { whiteFont } = props;
	const footerClasses = classNames({
		[classes.footer]: true,
		[classes.footerWhiteFont]: whiteFont,
	});
	const aClasses = classNames({
		[classes.a]: true,
		[classes.footerWhiteFont]: whiteFont,
	});
	return (
		<footer className={footerClasses}>
			<div className={classes.container}>
				<div className={classes.left}>
					<List className={classes.list}>
						<ListItem className={classes.inlineBlock}>
							<a
								href="https://github.com/ahmed-agiza/EDAViewer"
								className={classes.block}
								target="_blank"
							>
								GitHub
							</a>
						</ListItem>
						<ListItem className={classes.inlineBlock}>
							<a
								href="https://github.com/ahmed-agiza/EDAViewer/blob/master/LICENSE"
								className={classes.block}
								target="_blank"
							>
								License
							</a>
						</ListItem>
						<ListItem className={classes.inlineBlock}>
							<Link href="/privacy">
								<a className={classes.block}>Privacy Policy</a>
							</Link>
						</ListItem>
						<ListItem className={classes.inlineBlock}>
							<a
								href="https://github.com/ahmed-agiza/EDAViewer/issues/new"
								className={classes.block}
								target="_blank"
							>
								Contact Us
							</a>
						</ListItem>
					</List>
				</div>
				<div className={classes.right}>
					&copy; {1900 + new Date().getYear()}, made with{" "}
					<Favorite className={classes.icon} /> by{" "}
					<a
						href="https://github.com/ahmed-agiza"
						className={aClasses}
						target="_blank"
					>
						Ahmed Agiza
					</a>{" "}
					for open-source EDA.
				</div>
			</div>
		</footer>
	);
}

Footer.propTypes = {
	whiteFont: PropTypes.bool,
};
