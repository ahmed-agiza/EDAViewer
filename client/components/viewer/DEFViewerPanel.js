import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import dynamic from "next/dynamic";
import AutoSizer from "react-virtualized-auto-sizer";
import styles from "./Viewer.styles";
const DEFViewer = dynamic(() => import("./DEFViewer"), {
	ssr: false,
});
const useStyles = makeStyles(styles);

const DEFViewerPanel = (props) => {
	const classes = useStyles();

	const {
		componentKey,
		style,
		className,
		onMouseDown,
		onMouseUp,
		onTouchEnd,
	} = props;

	return (
		<div
			key={componentKey}
			className={`${classes.defViewer} ${className}`}
			style={{ ...style }}
			onMouseDown={onMouseDown}
			onMouseUp={onMouseUp}
			onTouchEnd={onTouchEnd}
		>
			<AutoSizer>
				{({ height, width }) => {
					return (
						<DEFViewer {...props} width={width} height={height} />
					);
				}}
			</AutoSizer>
		</div>
	);
};

export default dynamic(() => Promise.resolve(DEFViewerPanel), {
	ssr: false,
});
