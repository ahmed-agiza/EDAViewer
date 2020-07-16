import React from "react";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { LayerType } from "utils/enums";

export const CellDialog = (cell, names) => ({
	title: "Cell: " + cell.Name,
	body: (
		<Box>
			<Typography>
				<span>
					Name: <b>{cell.Name}</b>{" "}
				</span>
				<br />
				<span>
					Master: <b>{cell.Master}</b>{" "}
				</span>
				<br />
				<span>
					Is Placed: <b>{`${cell.IsPlaced ? "Yes" : "No"}`}</b>{" "}
				</span>
				<br />
				<span>
					Location:{" "}
					<b>{`(${cell.Location.X}, ${cell.Location.Y})`}</b>{" "}
				</span>
				<br />
				<span>
					Orientation: <b>{names.Orientation[cell.Orientation]}</b>{" "}
				</span>
				<br />
				<span>
					Type: <b>{names.MasterType[cell.MasterType]}</b>{" "}
				</span>
				<br />
				<span>
					Number of Pins: <b>{cell.Pins.length}</b>{" "}
				</span>
				<br />
			</Typography>
		</Box>
	),
});
export const ViaDialog = (via, names, layerMap) => ({
	title: "Via: " + via.Name,
	body: (
		<Box>
			<Typography>
				<span>
					Name: <b>{via.Name}</b>{" "}
				</span>
				{via.TopLayer && (
					<React.Fragment>
						<br />
						<span>
							Upper Layer: <b>{layerMap[via.TopLayer.ID].Name}</b>{" "}
						</span>
					</React.Fragment>
				)}
				{via.CutLayer && (
					<React.Fragment>
						<br />
						<span>
							Cut Layer: <b>{layerMap[via.CutLayer.ID].Name}</b>{" "}
						</span>
					</React.Fragment>
				)}
				{via.BottomLayer && (
					<React.Fragment>
						<br />
						<span>
							Bottom Layer:{" "}
							<b>{layerMap[via.BottomLayer.ID].Name}</b>{" "}
						</span>
					</React.Fragment>
				)}
			</Typography>
		</Box>
	),
});
export const WireDialog = (wire, names, geometryMap, layerMap) => {
	let numSegments = 0;
	let numVias = 0;
	let layers = [];
	if (wire.IsSpecial) {
		wire.SpecialBoxes.forEach((sbox) => {
			geometryMap[sbox.ID].Boxes.forEach((box) => {
				const isVia = box.Via != null;
				if (isVia) {
					numVias++;
					layers.push(viaMap[box.Via.ID].Name);
				} else {
					numSegments++;
					layers.push(layerMap[box.Layer.ID].Name);
				}
			});
		});
	} else {
		wire.Edges.forEach((edge) => {
			const isVia = edge.Via != null;
			layers.push(layerMap[edge.Layer.ID].Name);
			if (isVia) {
				numVias++;
			} else {
				numSegments++;
			}
		});
	}
	let layersText = "";
	if (layers.length <= 4) {
		layersText = layers.join(", ");
	} else {
		layersText = [...layers.slice(0, 2), "...", ...layers.slice(-2)].join(
			", "
		);
	}
	return {
		title: "Wire: " + wire.Name,
		body: (
			<Box>
				<Typography>
					<span>
						Name: <b>{wire.Name}</b>{" "}
					</span>
					<br />
					<span>
						Is Routed: <b>{wire.IsRouted ? "Yes" : "No"}</b>{" "}
					</span>
					<br />
					<span>
						Is Special: <b>{wire.IsSpecial ? "Yes" : "No"}</b>{" "}
					</span>
					<br />
					<span>
						Layers: <b>{layersText}</b>{" "}
					</span>
					<br />
					<span>
						Number of segments: <b>{numSegments}</b>{" "}
					</span>
					<br />
					<span>
						Number of vias: <b>{numVias}</b>{" "}
					</span>
					<br />
					<span>
						Number of pins: <b>{wire.Pins.length}</b>{" "}
					</span>
				</Typography>
			</Box>
		),
	};
};

export const PortDialog = (port, names) => ({
	title: "Port: " + port.Name,
	body: (
		<Box>
			<Typography>
				<span>
					Name: <b>{port.Name}</b>{" "}
				</span>
				<br />
				<span>
					Direction: <b>{names.PortDirection[port.Direction]}</b>{" "}
				</span>
			</Typography>
		</Box>
	),
});
export const LayerDialog = (
	layer,
	names,
	metalLayerColors,
	layerMap,
	settings
) => {
	const { src: colorImg, angle } = metalLayerColors[layer.ID].attributesFunc(
		false,
		{
			width: 16,
			height: 16,
		},
		{
			color: metalLayerColors[layer.ID].color,
			lineThickness: settings.shapes.layer.hatchLineThickness,
			alpha: settings.shapes.pinShape.opacity,
		},
		settings
	);
	return {
		title: "Metal Layer: " + layer.Name,
		body: (
			<Box>
				<Typography>
					<span>
						Name: <b>{layer.Name}</b>{" "}
					</span>
					<br />
					<span>
						Type: <b>{names.LayerType[layer.Type]}</b>{" "}
					</span>
					<br />
					<span>
						Direction: <b>{names.Direction[layer.Direction]}</b>{" "}
					</span>
					<br />
					<span>
						Width: <b>{layer.Width}</b>{" "}
					</span>
					<br />
					<span>
						Spacing: <b>{layer.Spacing}</b>{" "}
					</span>
					{layer.UpperLayer && (
						<React.Fragment>
							<br />
							<span>
								Upper Layer:{" "}
								<b>{layerMap[layer.UpperLayer.ID].Name}</b>{" "}
							</span>
						</React.Fragment>
					)}
					{layer.LowerLayer && (
						<React.Fragment>
							<br />
							<span>
								Lower Layer:{" "}
								<b>{layerMap[layer.LowerLayer.ID].Name}</b>{" "}
							</span>
						</React.Fragment>
					)}
					<br />
					{layer.Type != LayerType.Cut && (
						<span
							style={{
								display: "flex",
								alignItems: "center",
							}}
						>
							Color:{" "}
							<div
								style={{
									marginLeft: 4,
									height: 16,
									width: 16,
									background: `url('${colorImg}') 0 0 repeat`,
									border: "1px solid",
									transform: `rotate(${
										(angle * 180) / Math.PI
									}deg)`,
								}}
							></div>
						</span>
					)}
				</Typography>
			</Box>
		),
	};
};
