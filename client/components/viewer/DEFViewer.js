import React, { useEffect, useImperativeHandle, useRef } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";
import dynamic from "next/dynamic";
import { Viewport } from "pixi-viewport";
import * as PIXI from "pixi.js";
import PropTypes from "prop-types";
import { ChipSide, PortDirection } from "utils/enums";
import { generateSquareHatchAttributes } from "utils/textures";
import { convertRectCoords, transformRect } from "utils/transform";
import ExportDesignDialog from "./ExportDesignDialog";
import styles from "./Viewer.styles";

const useStyles = makeStyles(styles);

function createChipContainer(design, meta) {
	const { config } = meta;
	const die = design.Die;
	const { x, y, width, height } = convertRectCoords(config, die);
	const container = new PIXI.Container();
	const chipBox = new PIXI.Graphics();

	chipBox.lineStyle(
		config.shapes.chip.strokeWidth,
		PIXI.utils.string2hex(config.shapes.chip.stroke)
	);
	chipBox.drawRect(x, y, width, height);

	container.addChild(chipBox);
	return container;
}

function installClickHandlers(obj, onClick, onDoubleClick, config) {
	obj.interactive = true;
	obj.__clicked = false;
	obj.__timeout = null;
	obj.click = function () {
		clearTimeout(this.__timeout);
		if (this.__clicked) {
			this.__clicked = false;
			if (onDoubleClick) {
				onDoubleClick();
			}
		} else {
			this.__clicked = true;
			this.__timeout = setTimeout(
				() => (this.__clicked = false),
				config.doubleClickTimeout
			);
			if (onClick) {
				onClick();
			}
		}
	}.bind(obj);
}

function createCellsContainer(design, meta) {
	const cells = design.Instances;
	const { pins, geometries, config } = meta;
	const { onCellClicked, onCellDoubleClicked } = meta.handlers;
	const showCellShapes = meta.layerVisibility.cellShapes.visible;
	const container = new PIXI.Container();
	const fill = PIXI.utils.string2hex(config.shapes.cell.fill);
	const fillOpacity = config.shapes.cell.opacity;
	const textColor = config.shapes.text.fill;

	cells.forEach((cell) => {
		const { x, y, width, height } = convertRectCoords(
			config,
			cell.BoundingBox
		);
		const cellBox = new PIXI.Graphics();
		installClickHandlers(
			cellBox,
			onCellClicked ? () => onCellClicked(cell) : null,
			onCellDoubleClicked ? () => onCellDoubleClicked(cell) : null,
			config
		);

		cellBox.beginFill(fill, fillOpacity);
		cellBox.lineStyle(
			config.shapes.cell.strokeWidth,
			PIXI.utils.string2hex(config.shapes.cell.stroke)
		);
		cellBox.drawRect(0, 0, width, height);
		container.addChild(cellBox);

		if (showCellShapes) {
			cell.Pins.forEach((pin) => {
				pins[pin.ID].Geometries.forEach((geom) => {
					geometries[geom.ID].Boxes.forEach((box) => {
						const transformedBox = transformRect(
							box,
							cell.Orientation,
							{
								x: cell.Origin.X,
								y: cell.Origin.Y,
							}
						);
						const {
							x: boxX,
							y: boxY,
							width: boxWidth,
							height: boxHeight,
						} = convertRectCoords(config, transformedBox);
						const {
							attributesFunc,
							color: layerColor,
						} = config.metalLayerColors[box.Layer.ID];
						const shapeBox = new PIXI.Graphics();

						shapeBox.beginTextureFill(
							attributesFunc(
								PIXI,
								{
									width: boxWidth,
									height: boxHeight,
								},
								{
									color: layerColor,
									lineThickness:
										config.shapes.layer.hatchLineThickness,
									alpha: config.shapes.pinShape.opacity,
								},
								config
							)
						);
						shapeBox.lineStyle(
							config.shapes.pinShape.strokeWidth,
							PIXI.utils.string2hex(layerColor)
						);
						shapeBox.drawRect(
							boxX - x,
							boxY - y,
							boxWidth,
							boxHeight
						);
						cellBox.addChild(shapeBox);
					});
				});
			});
			(cell.Obstructions.Boxes || []).forEach((box) => {
				const transformedBox = transformRect(box, cell.Orientation, {
					x: cell.Origin.X,
					y: cell.Origin.Y,
				});
				const {
					x: boxX,
					y: boxY,
					width: boxWidth,
					height: boxHeight,
				} = convertRectCoords(config, transformedBox);
				const {
					attributesFunc,
					color: layerColor,
				} = config.metalLayerColors[box.Layer.ID];
				const shapeBox = new PIXI.Graphics();

				shapeBox.beginTextureFill(
					attributesFunc(
						PIXI,
						{
							width: boxWidth,
							height: boxHeight,
						},
						{
							color: layerColor,
							lineThickness:
								config.shapes.layer.hatchLineThickness,
							alpha: config.shapes.obstruction.opacity,
						},
						config
					)
				);
				shapeBox.lineStyle(
					config.shapes.obstruction.strokeWidth,
					PIXI.utils.string2hex(layerColor)
				);
				shapeBox.drawRect(boxX - x, boxY - y, boxWidth, boxHeight);
				cellBox.addChild(shapeBox);
			});
		}
		if (config.displayNames) {
			const textStyle = new PIXI.TextStyle({
				fontSize: config.shapes.text.fontSize,
				cacheAsBitmap: true,
				trim: true,
				fill: textColor,
			});
			let ellipsisText = cell.Name;
			let metrics = PIXI.TextMetrics.measureText(ellipsisText, textStyle);
			if (metrics.width + config.shapes.text.padding > width) {
				let trimIndex = 0;
				ellipsisText = "..." + cell.Name.substr(trimIndex);
				metrics = PIXI.TextMetrics.measureText(ellipsisText, textStyle);
				while (metrics.width + config.shapes.text.padding > width) {
					trimIndex++;
					if (trimIndex > cell.Name.length) {
						break;
					}
					ellipsisText = "..." + cell.Name.substr(trimIndex);
					metrics = PIXI.TextMetrics.measureText(
						ellipsisText,
						textStyle
					);
				}
			}

			const text = new PIXI.Text(ellipsisText, textStyle);
			text.resolution = 2;
			text.anchor.set(0.5, 0.5);
			text.position.set(width / 2, height / 2);
			cellBox.addChild(text);
		}
		cellBox.position.set(x, y);
	});
	return container;
}
function createWiresContainer(design, meta) {
	const wires = design.Nets;
	const { config, geometries, vias, layerVisibility } = meta;
	const {
		onWireClicked,
		onWireDoubleClicked,
		onViaClicked,
		onViaDoubleClicked,
	} = meta.handlers;
	const showVias = layerVisibility.vias.visible;
	const showSegments = layerVisibility.wires.visible;
	const showSpecial = layerVisibility.specialWires.visible;

	const container = new PIXI.Container();
	const wireShapes = [];
	wires.forEach((wire) => {
		if (!wire.IsRouted) {
			return;
		}
		if (wire.IsSpecial && !showSpecial) {
			return;
		}
		let rects;
		if (!wire.IsSpecial) {
			rects = (wire.Edges || []).map((edge) => edge.Rect);
		} else {
			rects = [];
			(wire.SpecialBoxes || []).forEach((sbox) => {
				rects.push(...geometries[sbox.ID].Boxes);
			});
		}
		let layerId;
		rects.forEach((rect, ind) => {
			const { x, y, width, height } = convertRectCoords(config, rect);
			layerId = -1;
			if (wire.IsSpecial) {
				if (rect.Layer) {
					layerId = rect.Layer.ID;
				} else if (rect.Via) {
					let via = vias[rect.Via.ID];
					layerId = (via.CutLayer || via.BottomLayer || via.TopLayer)
						.ID;
				}
			} else {
				layerId = wire.Edges[ind].Layer.ID;
			}
			if (layerId == -1) {
				layerId = 1;
			}

			const {
				attributesFunc,
				color: layerColor,
			} = config.metalLayerColors[layerId];

			const isVia = wire.IsSpecial
				? rect.Via != null
				: wire.Edges[ind].Via != null;
			if (isVia) {
				if (!showVias) {
					return;
				}

				const shapeBox = new PIXI.Graphics();

				installClickHandlers(
					shapeBox,
					onViaClicked
						? () =>
								onViaClicked(
									vias[(rect.Via || wire.Edges[ind].Via).ID]
								)
						: null,
					onViaDoubleClicked
						? () =>
								onViaDoubleClicked(
									vias[(rect.Via || wire.Edges[ind].Via).ID]
								)
						: null,
					config
				);

				shapeBox.beginTextureFill(
					generateSquareHatchAttributes(
						PIXI,
						{
							width,
							height,
						},
						{
							color: layerColor,
							squareSize: config.shapes.via.hatchSquareLength,
							alpha: config.shapes.wire.opacity,
						},
						config
					)
				);
				shapeBox.lineStyle(
					config.shapes.via.strokeWidth,
					PIXI.utils.string2hex(layerColor)
				);
				shapeBox.drawRect(x, y, width, height);

				wireShapes.push({
					layerId,
					shape: shapeBox,
				});
			} else {
				if (!showSegments) {
					return;
				}
				const shapeBox = new PIXI.Graphics();

				installClickHandlers(
					shapeBox,
					onWireClicked ? () => onWireClicked(wire) : null,
					onWireDoubleClicked
						? () => onWireDoubleClicked(wire)
						: null,
					config
				);

				shapeBox.beginTextureFill(
					attributesFunc(
						PIXI,
						{
							width,
							height,
						},
						{
							color: layerColor,
							lineThickness:
								config.shapes.layer.hatchLineThickness,
							alpha: config.shapes.wire.opacity,
						},
						config
					)
				);
				shapeBox.lineStyle(
					config.shapes.wire.strokeWidth,
					PIXI.utils.string2hex(layerColor)
				);
				shapeBox.drawRect(x, y, width, height);

				wireShapes.push({
					layerId,
					shape: shapeBox,
				});
			}
		});
	});
	wireShapes.sort((s1, s2) =>
		config.sortLayerBottomToTop
			? s1.layerId - s2.layerId
			: s2.layerId - s1.layerId
	);
	wireShapes.forEach((shapeWrapper) =>
		container.addChild(shapeWrapper.shape)
	);
	return container;
}
function createPortsContainer(design, meta) {
	const { config, geometries, layerVisibility } = meta;
	const { onPortClicked, onPortDoubleClicked } = meta.handlers;
	const ports = design.BlockPins;
	const showSpecial = layerVisibility.specialWires.visible;
	const showPorts = layerVisibility.ports.visible;
	const disablePortIndicators = config.disablePortIndicators;
	const { width: stageWidth, height: stageHeight } = config;
	const container = new PIXI.Container();
	ports.forEach((port) => {
		const isInput = port.Direction == PortDirection.Input;
		const isOutput = port.Direction == PortDirection.Output;
		const isInOut = port.Direction == PortDirection.InOut;
		if (
			(port.IsSpecial && !showSpecial) ||
			(!port.IsSpecial && !showPorts)
		) {
			return;
		}
		(port.Geometries || []).forEach((geom) => {
			geometries[geom.ID].Boxes.forEach((box, ind) => {
				let { x, y, width, height } = convertRectCoords(config, box);
				let minDiff = Math.abs(x - 0);
				let chipSide = ChipSide.Left;

				if (Math.abs(x - stageWidth) < minDiff) {
					chipSide = ChipSide.Right;
					minDiff = Math.abs(x - stageWidth);
				}
				if (Math.abs(y) < minDiff) {
					chipSide = ChipSide.Top;
					minDiff = Math.abs(y);
				}
				if (Math.abs(y - stageHeight) < minDiff) {
					chipSide = ChipSide.Bottom;
					minDiff = Math.abs(y - stageHeight);
				}

				const fill = PIXI.utils.string2hex(config.shapes.port.fill);
				const fillOpacity = config.shapes.port.opacity;
				const shapePoly = new PIXI.Graphics();
				installClickHandlers(
					shapePoly,
					onPortClicked ? () => onPortClicked(port) : null,
					onPortDoubleClicked
						? () => onPortDoubleClicked(port)
						: null,
					config
				);
				shapePoly.lineStyle(
					config.shapes.port.strokeWidth,
					PIXI.utils.string2hex(config.shapes.port.stroke)
				);
				shapePoly.beginFill(fill, fillOpacity);

				shapePoly.drawRect(x, y, width, height);

				if (!disablePortIndicators) {
					if (isInput) {
						if (chipSide === ChipSide.Top) {
							shapePoly.drawPolygon([
								x,
								y + height,
								x + width / 2,
								y + height + config.portIndicatorExtension,
								x + width,
								y + height,
							]);
						} else if (chipSide === ChipSide.Bottom) {
							shapePoly.drawPolygon([
								x,
								y,
								x + width / 2,
								y - config.portIndicatorExtension,
								x + width,
								y,
							]);
						} else if (chipSide === ChipSide.Left) {
							shapePoly.drawPolygon([
								x + width,
								y,
								x + width + config.portIndicatorExtension,
								y + height / 2,
								x + width,
								y + height,
							]);
						} else if (chipSide === ChipSide.Right) {
							shapePoly.drawPolygon([
								x,
								y,
								x - config.portIndicatorExtension,
								y + height / 2,
								x,
								y + height,
							]);
						}
					} else if (isOutput) {
						if (chipSide === ChipSide.Top) {
							shapePoly.drawPolygon([
								x,
								y,
								x + width / 2,
								y - config.portIndicatorExtension,
								x + width,
								y,
							]);
						} else if (chipSide === ChipSide.Bottom) {
							shapePoly.drawPolygon([
								x,
								y + height,
								x + width / 2,
								y + height + config.portIndicatorExtension,
								x + width,
								y + height,
							]);
						} else if (chipSide === ChipSide.Left) {
							shapePoly.drawPolygon([
								x,
								y,
								x - config.portIndicatorExtension,
								y + height / 2,
								x,
								y + height,
							]);
						} else if (chipSide === ChipSide.Right) {
							shapePoly.drawPolygon([
								x + width,
								y,
								x + width + config.portIndicatorExtension,
								y + height / 2,
								x + width,
								y + height,
							]);
						}
					} else if (isInOut) {
						if (
							chipSide === ChipSide.Top ||
							chipSide === ChipSide.Bottom
						) {
							shapePoly.drawPolygon([
								x,
								y + height,
								x + width / 2,
								y + height + config.portIndicatorExtension,
								x + width,
								y + height,
							]);
							shapePoly.drawPolygon([
								x,
								y,
								x + width / 2,
								y - config.portIndicatorExtension,
								x + width,
								y,
							]);
						} else if (
							chipSide === ChipSide.Left ||
							chipSide === ChipSide.Right
						) {
							shapePoly.drawPolygon([
								x + width,
								y,
								x + width + config.portIndicatorExtension,
								y + height / 2,
								x + width,
								y + height,
							]);
							shapePoly.drawPolygon([
								x,
								y,
								x - config.portIndicatorExtension,
								y + height / 2,
								x,
								y + height,
							]);
						}
					}
				}

				shapePoly.endFill();
				container.addChild(shapePoly);
			});
		});
	});

	return container;
}

function createTracksContainer(design, meta) {
	const tracks = design.Tracks;
	const boundingBox = design.Die;
	const { config } = meta;

	const { width, height } = convertRectCoords(config, boundingBox);

	const container = new PIXI.Container();

	const horizontalLines = [];
	const verticalLines = [];
	tracks.forEach((track) => {
		for (let i = 0; i < track.GridY.length; i++) {
			const offset =
				track.GridY[i] * config.scaleFactorY +
				config.originOffsetY +
				config.shapes.track.strokeWidth / 2;
			horizontalLines.push({
				points: [
					config.shapes.track.strokeWidth,
					offset,
					width + config.shapes.track.strokeWidth,
					offset,
				],
				layerId: track.Layer.ID,
			});
		}
		for (let i = 0; i < track.GridX.length; i++) {
			const offset =
				track.GridX[i] * config.scaleFactorX +
				config.originOffsetX +
				config.shapes.track.strokeWidth / 2;
			verticalLines.push({
				points: [
					offset,
					config.shapes.track.strokeWidth,
					offset,
					height + config.shapes.track.strokeWidth,
				],
				layerId: track.Layer.ID,
			});
		}
	});
	verticalLines
		.concat(horizontalLines)
		.forEach(({ points: lineCoords, layerId }) => {
			const line = new PIXI.Graphics();
			line.lineStyle(
				config.shapes.track.strokeWidth,
				PIXI.utils.string2hex(config.metalLayerColors[layerId].color)
			)
				.moveTo(lineCoords[0], lineCoords[1])
				.lineTo(lineCoords[2], lineCoords[3]);
			container.addChild(line);
		});

	return container;
}
function createRowsContainer(design, meta) {
	const rows = design.Rows;
	const { config } = meta;

	const container = new PIXI.Container();
	rows.forEach((row) => {
		const { x, y, width, height } = convertRectCoords(
			config,
			row.BoundingBox
		);
		const rowBox = new PIXI.Graphics();
		rowBox.lineStyle(
			config.shapes.row.strokeWidth,
			PIXI.utils.string2hex(config.shapes.row.stroke)
		);
		rowBox.drawRect(x, y, width, height);
		container.addChild(rowBox);
	});
	return container;
}
function createGCellsContainer(design, meta) {
	const container = new PIXI.Container();
	const gcells = design.GCell;
	const boundingBox = design.Die;
	const { config } = meta;
	if (!gcells) {
		return container;
	}
	const { width, height } = convertRectCoords(config, boundingBox);

	const horizontalLines = [];
	for (let i = 0; i < gcells.GridYPatternOrigins.length; i++) {
		const origin =
			gcells.GridYPatternOrigins[i] * config.scaleFactorY +
			config.originOffsetY;
		const lineCount = gcells.GridYPatternLineCounts[i] - 1;
		for (let j = 0; j < lineCount; j++) {
			const offset =
				origin +
				j *
					(gcells.GridYPatternSteps[i] * config.scaleFactorY +
						config.originOffsetY) +
				config.shapes.gcell.strokeWidth / 2;
			horizontalLines.push([
				config.shapes.gcell.strokeWidth,
				offset,
				width + config.shapes.gcell.strokeWidth,
				offset,
			]);
		}
	}
	const verticalLines = [];
	for (let i = 0; i < gcells.GridXPatternOrigins.length; i++) {
		const origin =
			gcells.GridXPatternOrigins[i] * config.scaleFactorX +
			config.originOffsetX;
		const lineCount = gcells.GridXPatternLineCounts[i] - 1;
		for (let j = 0; j < lineCount; j++) {
			const offset =
				origin +
				j *
					(gcells.GridXPatternSteps[i] * config.scaleFactorX +
						config.originOffsetX) +
				config.shapes.gcell.strokeWidth / 2;
			verticalLines.push([
				offset,
				config.shapes.gcell.strokeWidth,
				offset,
				height + config.shapes.gcell.strokeWidth,
			]);
		}
	}
	verticalLines.concat(horizontalLines).forEach((lineCoords) => {
		const line = new PIXI.Graphics();
		line.lineStyle(
			config.shapes.gcell.strokeWidth,
			PIXI.utils.string2hex(config.shapes.gcell.stroke)
		)
			.moveTo(lineCoords[0], lineCoords[1])
			.lineTo(lineCoords[2], lineCoords[3]);
		container.addChild(line);
	});

	return container;
}
function createDesignApp(design, meta, appRef, canvasRef) {
	const { config, layerVisibility } = meta;
	const { onResetDirtyLayers, setIsLoading } = meta.handlers;
	return () => {
		if (!canvasRef) {
			return;
		}
		setIsLoading(true);
		if (
			appRef.current.app &&
			(appRef.current.width != config.width ||
				appRef.current.height != config.height)
		) {
			meta.handlers.resetViewport(false);
		}
		let runClearLayers = false;
		let isFirstRun = false;
		if (!appRef.current.app) {
			appRef.current.app = new PIXI.Application({
				view: canvasRef.current,
				width: config.width,
				height: config.height,
				backgroundColor: PIXI.utils.string2hex(config.shapes.chip.fill),
			});

			appRef.current.viewport = new Viewport({
				screenWidth: config.width,
				screenHeight: config.height,
				worldWidth: config.width,
				worldHeight: config.height,
				interaction: appRef.current.app.renderer.plugins.interaction,
			});
			appRef.current.app.stage.addChild(appRef.current.viewport);
			appRef.current.viewport.drag().pinch().wheel();
			if (!config.transparentBackground) {
				const bg = new PIXI.Graphics()
					.beginFill(PIXI.utils.string2hex(config.shapes.chip.fill))
					.drawRect(0, 0, config.width, config.height)
					.endFill();
				appRef.current.viewport.addChild(bg);
			}
			appRef.current.width = config.width;
			appRef.current.height = config.height;
			isFirstRun = true;
		}

		if (layerVisibility.rows.dirty || isFirstRun) {
			runClearLayers = true;
			if (appRef.current.rows) {
				appRef.current.viewport.removeChild(appRef.current.rows);
				appRef.current.rows.destroy(true);
				appRef.current.rows = null;
			}
			if (layerVisibility.rows.visible) {
				appRef.current.rows = createRowsContainer(design, meta);
			}
		}
		if (
			layerVisibility.cells.dirty ||
			layerVisibility.cellShapes.dirty ||
			isFirstRun
		) {
			runClearLayers = true;
			if (appRef.current.cells) {
				appRef.current.viewport.removeChild(appRef.current.cells);
				appRef.current.cells.destroy(true);
				appRef.current.cells = null;
			}
			if (layerVisibility.cells.visible) {
				appRef.current.cells = createCellsContainer(design, meta);
			}
		}
		if (
			layerVisibility.wires.dirty ||
			layerVisibility.vias.dirty ||
			layerVisibility.specialWires.dirty ||
			isFirstRun
		) {
			runClearLayers = true;
			if (appRef.current.wires) {
				appRef.current.viewport.removeChild(appRef.current.wires);
				appRef.current.wires.destroy(true);
				appRef.current.wires = null;
			}
			if (
				layerVisibility.wires.visible ||
				layerVisibility.vias.visible ||
				layerVisibility.specialWires.visible
			) {
				appRef.current.wires = createWiresContainer(design, meta);
			}
		}
		if (layerVisibility.gcells.dirty || isFirstRun) {
			runClearLayers = true;
			if (appRef.current.gcells) {
				appRef.current.viewport.removeChild(appRef.current.gcells);
				appRef.current.gcells.destroy(true);
				appRef.current.gcells = null;
			}
			if (layerVisibility.gcells.visible) {
				appRef.current.gcells = createGCellsContainer(design, meta);
			}
		}
		if (layerVisibility.tracks.dirty || isFirstRun) {
			runClearLayers = true;
			if (appRef.current.tracks) {
				appRef.current.viewport.removeChild(appRef.current.tracks);
				appRef.current.tracks.destroy(true);
				appRef.current.tracks = null;
			}
			if (layerVisibility.tracks.visible) {
				appRef.current.tracks = createTracksContainer(design, meta);
			}
		}

		if (!appRef.current.chip) {
			appRef.current.chip = createChipContainer(design, meta);
		}
		if (
			layerVisibility.ports.dirty ||
			layerVisibility.specialWires.dirty ||
			isFirstRun
		) {
			runClearLayers = true;
			if (appRef.current.ports) {
				appRef.current.viewport.removeChild(appRef.current.ports);
				appRef.current.ports.destroy(true);
				appRef.current.ports = null;
			}
			if (
				layerVisibility.ports.visible ||
				layerVisibility.specialWires.visible
			) {
				appRef.current.ports = createPortsContainer(design, meta);
			}
		}
		const layers = [
			"rows",
			"cells",
			"wires",
			"gcells",
			"tracks",
			"chip",
			"ports",
		];
		layers.forEach((layer) => {
			if (appRef.current[layer]) {
				appRef.current.viewport.addChild(appRef.current[layer]);
			}
		});
		setIsLoading(false);
		if (runClearLayers) {
			onResetDirtyLayers();
		}
	};
}

const DEFViewer = (props) => {
	const {
		design,
		layerVisibility,
		onResetDirtyLayers,
		settings,
		zoom,
		width,
		height,
		metalLayerColors,
		setSelectedComponentName,
		exportDialogOpen,
		exportDialogType,
		setExportDialogOpen,
		forwardedRef,
		showCellDialog,
		showViaDialog,
		showWireDialog,
		showPortDialog,
	} = props;
	const classes = useStyles();

	const [isLoading, setIsLoading] = React.useState(true);

	const {
		Geometries: geometries,
		InstancePins: pins,
		RoutingVias: routingVias,
		ViaDefinitions: viaDefs,
		Die: die,
	} = design;

	const geometryMap = {};
	geometries.forEach((geom) => {
		geometryMap[geom.ID] = geom;
	});

	const pinMap = {};
	pins.forEach((pin) => {
		pinMap[pin.ID] = pin;
	});
	const viaMap = {};
	routingVias.forEach((via) => {
		viaMap[via.ID] = via;
	});
	viaDefs.forEach((via) => {
		viaMap[via.ID] = via;
	});

	const scaleFactorX =
		(width - settings.shapes.chip.strokeWidth * 2) / (die.XMax - die.XMin);
	const scaleFactorY =
		(height - settings.shapes.chip.strokeWidth * 2) / (die.YMax - die.YMin);

	const originOffsetX =
		-die.XMin * scaleFactorX + settings.shapes.chip.strokeWidth;
	const originOffsetY =
		die.YMin * scaleFactorY - settings.shapes.chip.strokeWidth;

	const internalConfig = {
		width,
		height,
		scaleFactorX,
		scaleFactorY,
		originOffsetX,
		originOffsetY,
		metalLayerColors,
	};
	const config = Object.assign({}, internalConfig, settings);

	const appRef = useRef({
		app: null,
		viewport: null,
		chip: null,
		cells: null,
		wires: null,
		ports: null,
		gcells: null,
		rows: null,
		tracks: null,
		width,
		height,
	});
	const ref = React.createRef();

	const onCellClicked = (cell) => {
		setSelectedComponentName(
			<span>
				Cell: <b>{cell.Name}</b>
			</span>
		);
	};
	const onCellDoubleClicked = (cell) => showCellDialog(cell);
	const onWireClicked = (wire) => {
		setSelectedComponentName(
			<span>
				Wire: <b>{wire.Name}</b>
			</span>
		);
	};
	const onWireDoubleClicked = (wire) => showWireDialog(wire);
	const onViaClicked = (via) => {
		setSelectedComponentName(
			<span>
				Via: <b>{via.Name}</b>
			</span>
		);
	};
	const onViaDoubleClicked = (via) => showViaDialog(via);
	const onPortClicked = (port) => {
		setSelectedComponentName(
			<span>
				Port: <b>{port.Name}</b>
			</span>
		);
	};
	const onPortDoubleClicked = (port) => showPortDialog(port);
	const onExportCancel = () => {
		setExportDialogOpen(false);
	};
	const onExport = () => {
		setExportDialogOpen(false);
		if (appRef.current.app) {
			const extract = appRef.current.app.renderer.plugins.extract;
			const tempLink = document.createElement("a");
			document.body.append(tempLink);
			tempLink.download = design.Name + "." + exportDialogType;
			tempLink.href = extract.base64(
				appRef.current.viewport,
				"image/" + exportDialogType
			);
			tempLink.click();
			tempLink.remove();
		}
	};
	const resetViewport = (clearState = true) => {
		if (!appRef.current.viewport) {
			return;
		}

		["tracks", "rows", "gcells", "ports", "wires", "cells", "chip"].forEach(
			(layer) => {
				if (appRef.current[layer]) {
					appRef.current.viewport.removeChild(appRef.current[layer]);
					appRef.current[layer].destroy(true);
					appRef.current[layer] = null;
				}
			}
		);
		appRef.current.app.stage.removeChild(appRef.current.viewport);
		appRef.current.viewport.destroy(true);
		appRef.current.viewport = null;
		appRef.current.app.stage.destroy(true);
		appRef.current.app.destroy(false, true);
		appRef.current.app = null;
		if (clearState) {
			setSelectedComponentName(null);
			onResetDirtyLayers();
		}
	};

	useEffect(
		createDesignApp(
			design,
			{
				config,
				layerVisibility,
				pins: pinMap,
				vias: viaMap,
				geometries: geometryMap,
				handlers: {
					resetViewport,
					onResetDirtyLayers,
					onCellClicked,
					onCellDoubleClicked,
					onWireClicked,
					onWireDoubleClicked,
					onViaClicked,
					onViaDoubleClicked,
					onPortClicked,
					onPortDoubleClicked,
					setIsLoading,
				},
			},
			appRef,
			ref
		),
		[
			layerVisibility,
			zoom,
			settings,
			internalConfig.width,
			internalConfig.height,
		]
	);
	useImperativeHandle(forwardedRef, () => ({
		zoomIn: () => {
			if (appRef.current.viewport) {
				appRef.current.viewport.setZoom(
					appRef.current.viewport.scaled * config.scaleStepFactor,
					true
				);
			}
		},
		zoomOut: () => {
			if (appRef.current.viewport) {
				appRef.current.viewport.setZoom(
					appRef.current.viewport.scaled / config.scaleStepFactor,
					true
				);
			}
		},
		fit: () => {
			if (appRef.current.viewport) {
				appRef.current.viewport.setZoom(1);
				appRef.current.viewport.position.set(0, 0);
			}
		},
		reset: () => {
			resetViewport();
		},
	}));
	return (
		<React.Fragment>
			<ExportDesignDialog
				open={exportDialogOpen}
				type={exportDialogType}
				onExport={onExport}
				onCancel={onExportCancel}
			/>
			{isLoading && (
				<div
					className={classes.viewerProgressBar}
					style={{ width, height }}
				>
					<CircularProgress className={classes.progress} />
				</div>
			)}
			<canvas
				id="defviewer"
				ref={ref}
				width={width}
				height={height}
				className={classes.defViewerCanvas}
				style={{
					...(config.viewportBorder
						? { border: "1px dashed #0000006e" }
						: {}),
				}}
			></canvas>
		</React.Fragment>
	);
};

DEFViewer.propTypes = {
	width: PropTypes.number.isRequired,
	height: PropTypes.number.isRequired,
	design: PropTypes.object.isRequired,
	componentsExplorer: PropTypes.object,
	layerVisibility: PropTypes.object.isRequired,
};

export default dynamic(() => Promise.resolve(DEFViewer), {
	ssr: false,
});
