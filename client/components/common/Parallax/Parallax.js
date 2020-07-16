import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import PropTypes from "prop-types";
import styles from "./Parallax.styles.js";

const useStyles = makeStyles(styles);

export default function Parallax(props) {
	let windowScrollTop;
	// if (window.innerWidth >= 768) {
	//   windowScrollTop = window.pageYOffset / 3;
	// } else {
	//   windowScrollTop = 0;
	// }
	const [transform, setTransform] = React.useState("translate3d(0,0px,0)");
	React.useEffect(() => {
		if (window.innerWidth >= 768) {
			window.addEventListener("scroll", resetTransform);
		}
		return function cleanup() {
			if (window.innerWidth >= 768) {
				window.removeEventListener("scroll", resetTransform);
			}
		};
	});
	const resetTransform = () => {
		var windowScrollTop = window.pageYOffset / 3;
		setTransform("translate3d(0," + windowScrollTop + "px,0)");
	};
	const {
		filter,
		className,
		children,
		style,
		image,
		small,
		id,
		responsive,
	} = props;
	const classes = useStyles();
	const parallaxClasses = classNames({
		[classes.parallax]: true,
		[classes.filter]: filter,
		[classes.small]: small,
		[classes.parallaxResponsive]: responsive,
		[className]: className !== undefined,
	});
	return (
		<div
			className={parallaxClasses}
			style={{
				...style,
				transform: transform,
			}}
			id={id}
		>
			{children}
		</div>
	);
}

Parallax.propTypes = {
	className: PropTypes.string,
	filter: PropTypes.bool,
	children: PropTypes.node,
	style: PropTypes.object,
	image: PropTypes.string,
	id: PropTypes.string,
	small: PropTypes.bool,
	// this will add a min-height of 660px on small screens
	responsive: PropTypes.bool,
};
