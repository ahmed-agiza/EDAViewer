import React from "react";
import Button from "@material-ui/core/Button";
import makeStyles from "@material-ui/core/styles/makeStyles";
import classNames from "classnames";
import PropTypes from "prop-types";
import styles from "./Button.styles.js";

const makeComponentStyles = makeStyles(() => ({
	...styles,
}));

const RegularButton = React.forwardRef((props, ref) => {
	const {
		color,
		round,
		children,
		fullWidth,
		disabled,
		simple,
		size,
		block,
		link,
		justIcon,
		className,
		...rest
	} = props;

	const classes = makeComponentStyles();

	const btnClasses = classNames({
		[classes.button]: true,
		[classes[size]]: size,
		[classes[color]]: color,
		[classes.round]: round,
		[classes.fullWidth]: fullWidth,
		[classes.disabled]: disabled,
		[classes.simple]: simple,
		[classes.block]: block,
		[classes.link]: link,
		[classes.justIcon]: justIcon,
		[className]: className,
	});
	return (
		<Button {...rest} ref={ref} classes={{ root: btnClasses }}>
			{children}
		</Button>
	);
});

RegularButton.propTypes = {
	color: PropTypes.oneOf([
		"primary",
		"info",
		"success",
		"warning",
		"danger",
		"rose",
		"white",
		"facebook",
		"twitter",
		"google",
		"github",
		"transparent",
	]),
	size: PropTypes.oneOf(["sm", "lg"]),
	simple: PropTypes.bool,
	round: PropTypes.bool,
	fullWidth: PropTypes.bool,
	disabled: PropTypes.bool,
	block: PropTypes.bool,
	link: PropTypes.bool,
	justIcon: PropTypes.bool,
	children: PropTypes.node,
	className: PropTypes.string,
};

export default RegularButton;
