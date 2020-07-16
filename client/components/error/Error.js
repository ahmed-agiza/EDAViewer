import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "components/common/Button";
import styles from "./Error.styles.js";
import Router from "next/router";
import Grid from "@material-ui/core/Grid";
import Layout from "components/common/Layout";
import { logException } from "utils/analytics";

const useStyles = makeStyles(styles);

export default function ViewerError(props) {
	const statusCode = props.statusCode || 500;
	const classes = useStyles();
	const message =
		statusCode === 404
			? "Page does not exist or unavailable :/"
			: props.message || "Unexpected error has occurred! :/";
	const goBackToHome = () => {
		Router.push("/");
	};
	React.useEffect(() => {
		logException({ message, statusCode }, false);
	}, []);
	return (
		<Layout>
			<Grid
				container
				direction="row"
				justify="center"
				alignItems="center"
				className={`${classes.container} ${classes.root}`}
			>
				<Grid item xs={12}>
					<h1 className={classes.code}>{statusCode}</h1>
				</Grid>
				<Grid item xs={12}>
					<h1 className={classes.message}>{message}</h1>
				</Grid>
				<Grid item xs={12}>
					<div className={classes.home}>
						<Button
							color="primary"
							size="lg"
							onClick={goBackToHome}
						>
							Go Back to Home
						</Button>
					</div>
				</Grid>
			</Grid>
		</Layout>
	);
}
