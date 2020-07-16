import React from "react";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import DeveloperBoardIcon from "@material-ui/icons/DeveloperBoard";
import logo from "assets/img/logo_transparent_trim.png";
import classNames from "classnames";
import Button from "components/common/Button";
import Footer from "components/common/Footer";
import Header from "components/common/Header";
import Layout from "components/common/Layout";
import Parallax from "components/common/Parallax";
import Upload from "components/common/Upload";
import { Element } from "react-scroll";
import Contact from "./Contact";
import Features from "./Features";
import styles from "./Landing.styles.js";
const useStyles = makeStyles(styles);

export default function Landing(props) {
	const classes = useStyles();

	return (
		<Layout>
			<div id="section-home">
				<Header
					brand={
						<img
							src={logo}
							alt="EDAV"
							width="150"
							height="auto"
						></img>
					}
					fixed
					color="primary"
				/>
				<Parallax id="home-parallax">
					<div className={classes.container}>
						<Grid
							container
							direction="row"
							justify="center"
							alignItems="center"
						>
							<Grid item sm={6} xs={12}>
								<div className={classes.brand}>
									<h1 className={classes.brandTitle}>
										Render EDA Design Files Online
									</h1>
									<h3 className={classes.subtitle}>
										Upload design LEF/DEF files to view in
										your browser.
									</h3>
								</div>
							</Grid>
							<Grid item sm={6} xs={12}>
								<div className={classes.brand}>
									<Upload />
									<div className={classes.exampleDesign}>
										<Button simple href="/example">
											<DeveloperBoardIcon fontSize="large" />{" "}
											Try Example Design
										</Button>
									</div>
								</div>
							</Grid>
						</Grid>
					</div>
				</Parallax>

				<div className={classNames(classes.main, classes.mainRaised)}>
					<Element name="section-features">
						<Features />
					</Element>
					<Element name="section-contact">
						<Contact />
					</Element>
				</div>
				<Footer />
			</div>
		</Layout>
	);
}
