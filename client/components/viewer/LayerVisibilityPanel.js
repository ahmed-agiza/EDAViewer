import React from "react";
import Checkbox from "@material-ui/core/Checkbox";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import { makeStyles } from "@material-ui/core/styles";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import Tooltip from "@material-ui/core/Tooltip";

import styles from "./Viewer.styles";

const useStyles = makeStyles(styles);

export default function LayerVisibilityPanel(props) {
	const classes = useStyles();
	const {
		componentKey,
		style,
		onMouseDown,
		onMouseUp,
		onTouchEnd,
		layerVisibility,
		onChangeVisibility,
	} = props;
	return (
		<div
			key={componentKey}
			className={`${classes.panelLayers} ${props.className}`}
			style={style}
			onMouseDown={onMouseDown}
			onMouseUp={onMouseUp}
			onTouchEnd={onTouchEnd}
		>
			<List
				className={classes.root}
				dense
				subheader={
					<ListSubheader component="div">
						Layer Visibility
					</ListSubheader>
				}
			>
				{Object.keys(layerVisibility)
					.sort(
						(k1, k2) =>
							layerVisibility[k1].index -
							layerVisibility[k2].index
					)
					.map((layerName, index) => {
						const vis = layerVisibility[layerName];
						const value = vis.name;
						const labelId = `checkbox-list-label-${value}`;
						return (
							<ListItem
								key={index}
								button
								disabled={vis.disabled}
								className={classes.visiblityListItem}
								onClick={(evt) => {
									const checked = !vis.visible;
									onChangeVisibility(checked, layerName);
								}}
							>
								<ListItemIcon>
									<Checkbox
										edge="start"
										checked={vis.visible}
										tabIndex={-1}
										disableRipple
										className={
											classes.visiblityListCheckbox
										}
										title={
											vis.disabled
												? "Not supported yet"
												: ""
										}
										checkedIcon={<VisibilityIcon />}
										icon={<VisibilityOffIcon />}
										inputProps={{
											"aria-labelledby": labelId,
										}}
									/>
								</ListItemIcon>
								<ListItemText id={labelId} primary={vis.name} />
							</ListItem>
						);
					})}
			</List>
		</div>
	);
}
