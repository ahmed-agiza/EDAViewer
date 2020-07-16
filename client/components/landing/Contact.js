import React from "react";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Button from "components/common/Button";
import styles from "./Landing.styles.js";

const useStyles = makeStyles(styles);

export default function Contact() {
	const classes = useStyles();
	return (
		<div className={classes.section} id="section-contact">
			<div className={classes.container}>
				<Grid className={`${classes.grid} ${classes.textCenter}`}>
					<Grid
						item
						className={classes.gridItem}
						xs={12}
						sm={12}
						md={8}
					>
						<h2>Want a new feature or found a bug?</h2>
						<h4>
							Feel free to a open a GitHub issue to request a new
							feature or report a bug!
						</h4>
					</Grid>
					<Grid
						item
						className={classes.gridItem}
						xs={12}
						sm={8}
						md={6}
					>
						<Button
							color="primary"
							size="lg"
							href="https://github.com/ahmed-agiza/EDAViewer/issues/new?assignees=&labels=&template=feature_request.md&title="
							target="_blank"
						>
							Request a Feature
						</Button>
						<Button
							color="primary"
							size="lg"
							href="https://github.com/ahmed-agiza/EDAViewer/issues/new?assignees=&labels=&template=feature_request.md&title="
							target="_blank"
						>
							Report a Bug
						</Button>
					</Grid>
				</Grid>
				<br />
				<br />
				<Grid className={`${classes.grid} classes.textCenter`}>
					<Grid
						item
						className={classes.gridItem}
						xs={12}
						sm={12}
						md={8}
					>
						<h2>Want to contribute?</h2>
						<h4>
							Community contributions are welcome, you can open a
							pull request with any new features/fixes you would
							like to provide.
						</h4>
					</Grid>
					<Grid
						item
						className={classes.gridItem}
						xs={12}
						sm={8}
						md={10}
					>
						<Button
							size="lg"
							href="https://github.com/ahmed-agiza/EDAViewer/fork"
							target="_blank"
						>
							Fork Repository
						</Button>
						<Button
							size="lg"
							href="https://github.com/ahmed-agiza/EDAViewer/compare"
							target="_blank"
						>
							Pull Request
						</Button>
					</Grid>
				</Grid>
				<div className={classes.textCenter + " " + classes.sharingArea}>
					<Grid className={`${classes.grid}`}>
						<h3>Thank you for supporting us!</h3>
					</Grid>
					<Button
						href="https://twitter.com/intent/tweet?url=https://edaviewer.com"
						color="twitter"
						rel="nofollow"
					>
						<i className={classes.socials + " fab fa-twitter"} />{" "}
						Tweet
					</Button>
					<Button
						href="https://www.facebook.com/sharer/sharer.php?u=https://edaviewer.com"
						color="facebook"
						rel="nofollow"
					>
						<i
							className={
								classes.socials + " fab fa-facebook-square"
							}
						/>{" "}
						Share
					</Button>

					<Button
						href="https://github.com/ahmed-agiza/EDAViewer/stargazers"
						color="github"
					>
						<i className={classes.socials + " fab fa-github"} />{" "}
						Star
					</Button>
				</div>
			</div>
		</div>
	);
}
