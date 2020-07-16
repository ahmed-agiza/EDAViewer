import React from "react";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import CodeIcon from "@material-ui/icons/Code";
import Filter8Icon from "@material-ui/icons/Filter8";
import Lock from "@material-ui/icons/LockOutlined";
import CameraIcon from "@material-ui/icons/Camera";
import screenshot from "assets/img/EditorScreenshot.png";
import styles from "./Landing.styles.js";
const useStyles = makeStyles(styles);

export default function Features() {
	const classes = useStyles();
	return (
		<div className={classes.section} id="section-features">
			<div className={classes.featuresSection}>
				<h1 className={classes.title}>Features</h1>
				<Grid
					container
					spacing={2}
					direction="row"
					justify="center"
					className={classes.featuresContainer}
				>
					<Grid
						item
						md={3}
						sm={8}
						xs={12}
						className={classes.featureGrid}
					>
						<Paper>
							<Grid
								container
								className={classes.feature}
								spacing={5}
								direction="row"
								justify="center"
								alignItems="stretch"
							>
								<Grid item xs={12}>
									<Filter8Icon fontSize="large"></Filter8Icon>
								</Grid>
								<Grid item xs={12}>
									<h2 className={classes.featureTitle}>
										LEF/DEF v5.8
									</h2>
								</Grid>
								<Grid item xs={12}>
									<div className={classes.featureBody}>
										EDAV uses{" "}
										<a
											href="https://github.com/The-OpenROAD-Project/OpenDB"
											rel="nofollow"
										>
											OpenDB
										</a>{" "}
										parsers, which supports LEF/DEF version
										5.8.
									</div>
								</Grid>
							</Grid>
						</Paper>
					</Grid>
					<Grid item md={3} sm={8} xs={12}>
						<Paper>
							<Grid
								container
								className={classes.feature}
								spacing={5}
								direction="row"
								justify="center"
								alignItems="center"
							>
								<Grid item xs={12}>
									<Lock fontSize="large" />
								</Grid>
								<Grid item xs={12}>
									<h2 className={classes.featureTitle}>
										Privacy
									</h2>
								</Grid>
								<Grid item xs={12}>
									<div className={classes.featureBody}>
										Your design is only available on the
										server for parsing, then it is
										permanently destroyed.
									</div>
								</Grid>
							</Grid>
						</Paper>
					</Grid>
					<Grid item md={3} sm={8} xs={12}>
						<Paper>
							<Grid
								container
								className={classes.feature}
								spacing={5}
								direction="row"
								justify="center"
								alignItems="center"
							>
								<Grid item xs={12}>
									<CodeIcon fontSize="large" />
								</Grid>
								<Grid item xs={12}>
									<h2 className={classes.featureTitle}>
										Open-Source
									</h2>
								</Grid>
								<Grid item xs={12}>
									<div className={classes.featureBody}>
										EDAV is open-source and available for
										the public on{" "}
										<a
											href="https://github.com/ahmed-agiza/EDAViewer"
											rel="nofollow"
										>
											GitHub
										</a>
										.
									</div>
								</Grid>
							</Grid>
						</Paper>
					</Grid>
					<Grid item md={3} sm={8} xs={12}>
						<Paper>
							<Grid
								container
								className={classes.feature}
								spacing={5}
								direction="row"
								justify="center"
								alignItems="center"
							>
								<Grid item xs={12}>
									<CameraIcon fontSize="large" />
								</Grid>
								<Grid item xs={12}>
									<h2 className={classes.featureTitle}>
										WebGL
									</h2>
								</Grid>
								<Grid item xs={12}>
									<div className={classes.featureBody}>
										EDAV uses WebGL for high-performance
										rendering with fallback to HTML5 canvas.
									</div>
								</Grid>
							</Grid>
						</Paper>
					</Grid>
				</Grid>
			</div>
			<div className={classes.screenshot}>
				<h1 className={classes.screenshotTitle}>Intuitive Interface</h1>
				<img
					src={screenshot}
					className={classes.screenshotImg}
					alt="Intuitive Interface"
				></img>
			</div>
		</div>
	);
}
