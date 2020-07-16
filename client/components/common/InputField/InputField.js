import React from "react";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import { makeStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import PropTypes from "prop-types";
import styles from "./InputField.styles.js";

const useStyles = makeStyles(styles);

export default function InputField(props) {
	const classes = useStyles();
	const {
		formControlProps,
		labelText,
		id,
		labelProps,
		inputProps,
		error,
		white,
		inputRootCustomClasses,
		success,
	} = props;

	const labelClasses = classNames({
		[" " + classes.labelRootError]: error,
		[" " + classes.labelRootSuccess]: success && !error,
	});
	const underlineClasses = classNames({
		[classes.underlineError]: error,
		[classes.underlineSuccess]: success && !error,
		[classes.underline]: true,
		[classes.whiteUnderline]: white,
	});
	const marginTop = classNames({
		[inputRootCustomClasses]: inputRootCustomClasses !== undefined,
	});
	const inputClasses = classNames({
		[classes.input]: true,
		[classes.whiteInput]: white,
	});
	var formControlClasses;
	if (formControlProps !== undefined) {
		formControlClasses = classNames(
			formControlProps.className,
			classes.formControl
		);
	} else {
		formControlClasses = classes.formControl;
	}
	return (
		<FormControl {...formControlProps} className={formControlClasses}>
			{labelText !== undefined ? (
				<InputLabel
					className={classes.labelRoot + " " + labelClasses}
					htmlFor={id}
					{...labelProps}
				>
					{labelText}
				</InputLabel>
			) : null}
			<Input
				classes={{
					input: inputClasses,
					root: marginTop,
					disabled: classes.disabled,
					underline: underlineClasses,
				}}
				id={id}
				{...inputProps}
			/>
		</FormControl>
	);
}

InputField.propTypes = {
	labelText: PropTypes.node,
	labelProps: PropTypes.object,
	id: PropTypes.string,
	inputProps: PropTypes.object,
	formControlProps: PropTypes.object,
	inputRootCustomClasses: PropTypes.string,
	error: PropTypes.bool,
	success: PropTypes.bool,
	white: PropTypes.bool,
};
