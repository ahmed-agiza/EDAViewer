import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Menu from "@material-ui/icons/Menu";
import classNames from "classnames";
import Link from "next/link";
import PropTypes from "prop-types";
import styles from "./Header.styles.js";
import HeaderLinks from "./HeaderLinks";

const useStyles = makeStyles(styles);

export default function Header(props) {
	const classes = useStyles();
	const [mobileOpen, setMobileOpen] = React.useState(false);

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen);
	};

	const { color, leftLinks, brand, fixed, absolute } = props;
	const rightLinks = <HeaderLinks />;
	const appBarClasses = classNames({
		[classes.appBar]: true,
		[classes[color]]: color,
		[classes.absolute]: absolute,
		[classes.fixed]: fixed,
	});
	const brandComponent = (
		<Link href="/" as="/">
			<Button className={classes.title}>{brand}</Button>
		</Link>
	);
	return (
		<AppBar elevation={0} className={appBarClasses}>
			<Toolbar className={classes.container}>
				{leftLinks !== undefined ? brandComponent : null}
				<div className={classes.flex}>
					{leftLinks !== undefined ? (
						<Hidden smDown implementation="css">
							{leftLinks}
						</Hidden>
					) : (
						brandComponent
					)}
				</div>
				<Hidden smDown implementation="css">
					{rightLinks}
				</Hidden>
				<Hidden mdUp>
					<IconButton
						color="inherit"
						aria-label="open drawer"
						onClick={handleDrawerToggle}
					>
						<Menu />
					</IconButton>
				</Hidden>
			</Toolbar>
			<Hidden mdUp implementation="js">
				<Drawer
					variant="temporary"
					anchor={"right"}
					open={mobileOpen}
					classes={{
						paper: classes.drawerPaper,
					}}
					onClose={handleDrawerToggle}
				>
					<div className={classes.appResponsive}>
						{leftLinks}
						{rightLinks}
					</div>
				</Drawer>
			</Hidden>
		</AppBar>
	);
}

Header.defaultProp = {
	color: "white",
};

Header.propTypes = {
	color: PropTypes.oneOf([
		"primary",
		"info",
		"success",
		"warning",
		"danger",
		"transparent",
		"white",
		"rose",
		"dark",
	]),
	leftLinks: PropTypes.node,
	brand: PropTypes.node,
	fixed: PropTypes.bool,
	absolute: PropTypes.bool,
};
