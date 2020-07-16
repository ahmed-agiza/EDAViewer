import palette from "google-palette";
import { LayerType } from "utils/enums";

function generateHatchAttributes(
	PIXI,
	{ startX, startY, endX, endY, angle },
	{ color, lineThickness, alpha = 1.0, alternateColor = "white" },
	config = {}
) {
	let squareSize = endX - startX;

	let src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${squareSize}" height="${
		2 * lineThickness
	}" version="1.1">
			<rect width="${squareSize}" height="${lineThickness}" fill="${encodeURIComponent(
		color
	)}"/>
			<rect width="${squareSize}" height="${lineThickness}" y="${lineThickness}" fill="${encodeURIComponent(
		alternateColor
	)}"/>
		</svg>`.replace(/\n/gm, "");
	if (config.renderSimpleWireShapes) {
		src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${1}" height="${1}" version="1.1">
					<rect width="${1}" height="${1}" fill="${encodeURIComponent(color)}"/>
				</svg>`;
	}
	if (!PIXI) {
		return { src, angle, alpha };
	}
	const texture = PIXI.Texture.from(src);
	return {
		texture,
		alpha,
		matrix: PIXI.Matrix.IDENTITY.rotate(angle),
	};
}

export function generateRightHatchAttributes(
	PIXI,
	{ width, height },
	{ color, lineThickness, alpha },
	config
) {
	return generateHatchAttributes(
		PIXI,
		{
			startX: 0,
			startY: 0,
			endX: Math.max(width, height),
			endY: Math.max(width, height),
			angle: Math.PI / 4,
		},
		{ color, lineThickness, alpha },
		config
	);
}

export function generateLeftHatchAttributes(
	PIXI,
	{ width, height },
	{ color, lineThickness, alpha },
	config
) {
	return generateHatchAttributes(
		PIXI,
		{
			startX: 0,
			startY: 0,
			endX: Math.max(width, height),
			endY: Math.max(width, height),
			angle: -Math.PI / 4,
		},
		{ color, lineThickness, alpha },
		config
	);
}

export function generateVerticalHatchAttributes(
	PIXI,
	{ width, height },
	{ color, lineThickness, alpha },
	config
) {
	return generateHatchAttributes(
		PIXI,
		{
			startX: 0,
			startY: 0,
			endX: Math.max(width, height),
			endY: Math.max(width, height),
			angle: Math.PI / 2,
		},
		{ color, lineThickness, alpha },
		config
	);
}

export function generateHorizontalHatchAttributes(
	PIXI,
	{ width, height },
	{ color, lineThickness, alpha },
	config
) {
	return generateHatchAttributes(
		PIXI,
		{
			startX: 0,
			startY: 0,
			endX: 0,
			endY: Math.max(width, height),
			angle: 0,
		},
		{ color, lineThickness, alpha },
		config
	);
}

export function generateSquareHatchAttributes(
	PIXI,
	{},
	{ color, squareSize, alpha = 1.0, alternateColor = "white" },
	config = {}
) {
	let rectsStr = "";
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			rectsStr += `<rect width="${squareSize}" x="${i * squareSize}" y="${
				j * squareSize
			}" height="${squareSize}" fill="${encodeURIComponent(
				i == 1 && j == 1 ? color : alternateColor
			)}"/>`;
		}
	}
	let src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${
		3 * squareSize
	}" height="${squareSize * 3}" version="1.1">${rectsStr}</svg>`.replace(
		/\n/gm,
		""
	);
	if (config.renderSimpleWireShapes) {
		src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${1}" height="${1}" version="1.1">
					<rect width="${1}" height="${1}" fill="${encodeURIComponent(color)}"/>
		</svg>`;
	}
	if (!PIXI) {
		return { src, alpha };
	}
	const texture = PIXI.Texture.from(src);
	return {
		texture,
		alpha,
	};
}

export function generateMetalLayerColors(config, layers) {
	// Prepare color palettes for metal layers
	const layerMap = {};
	const metalLayerColors = {};
	let startLayer = false;
	let endLayer = false;

	let routingLayerCount = 0;
	let cutLayerCount = 0;
	let mastersliceLayerCount = 0;
	let overlapLayerCount = 0;
	let implantLayerCount = 0;
	let noneLayerCount = 0;
	let maxLayerTypeCount = 0;

	layers.forEach((layer, ind) => {
		layerMap[layer.ID] = { ...layer };
		if (!startLayer && !layer.BottomLayer) {
			startLayer = layerMap[layer.ID];
		}
		if (!endLayer && !layer.UpperLayer) {
			endLayer = layerMap[layer.ID];
		}
		if (layer.Type === LayerType.Routing) {
			routingLayerCount++;
			maxLayerTypeCount = Math.max(maxLayerTypeCount, routingLayerCount);
		} else if (layer.Type === LayerType.Cut) {
			cutLayerCount++;
			maxLayerTypeCount = Math.max(maxLayerTypeCount, cutLayerCount);
		} else if (layer.Type === LayerType.Masterslice) {
			mastersliceLayerCount++;
		} else if (layer.Type === LayerType.Overlap) {
			overlapLayerCount++;
			maxLayerTypeCount = Math.max(maxLayerTypeCount, overlapLayerCount);
		} else if (layer.Type === LayerType.Implant) {
			implantLayerCount++;
			maxLayerTypeCount = Math.max(maxLayerTypeCount, implantLayerCount);
		} else if (layer.Type === LayerType.None) {
			noneLayerCount++;
			maxLayerTypeCount = Math.max(maxLayerTypeCount, noneLayerCount);
		}
	});

	for (let k in layerMap) {
		if (layerMap[k].BottomLayer) {
			layerMap[k].BottomLayer = layerMap[layerMap[k].BottomLayer.ID];
		}
		if (layerMap[k].UpperLayer) {
			layerMap[k].UpperLayer = layerMap[layerMap[k].UpperLayer.ID];
		}
	}
	const layerColorPalette = palette(
		[config.layerColorPalette],
		maxLayerTypeCount
	);
	const masterslicePalette = palette(
		[config.mastersliceLayerColorPalette],
		mastersliceLayerCount
	);
	let routingLayerToggle = 0;
	let prevRoutingColor;
	layers.forEach((layer, ind) => {
		if (layer.Type === LayerType.Routing) {
			if (routingLayerToggle) {
				metalLayerColors[layer.ID] = {
					color:
						"#" +
						(config.sameColorConsecutiveLayers
							? prevRoutingColor
							: layerColorPalette[ind % routingLayerCount]),
					attributesFunc: generateRightHatchAttributes,
				};
				routingLayerToggle = 0;
			} else {
				prevRoutingColor = layerColorPalette[ind % routingLayerCount];
				metalLayerColors[layer.ID] = {
					color: "#" + prevRoutingColor,
					attributesFunc: generateLeftHatchAttributes,
				};
				routingLayerToggle = 1;
			}
		} else if (layer.Type === LayerType.Cut) {
			metalLayerColors[layer.ID] = {
				color: "#" + layerColorPalette[ind % cutLayerCount],
				attributesFunc: generateSquareHatchAttributes,
			};
		} else if (layer.Type === LayerType.Masterslice) {
			metalLayerColors[layer.ID] = {
				color: "#" + masterslicePalette[ind % mastersliceLayerCount],
				attributesFunc: generateRightHatchAttributes,
			};
		} else if (layer.Type === LayerType.Overlap) {
			metalLayerColors[layer.ID] = {
				color: "#" + layerColorPalette[ind % overlapLayerCount],
				attributesFunc: generateVerticalHatchAttributes,
			};
		} else if (layer.Type === LayerType.Implant) {
			metalLayerColors[layer.ID] = {
				color: "#" + layerColorPalette[ind % implantLayerCount],
				attributesFunc: generateHorizontalHatchAttributes,
			};
		} else if (layer.Type === LayerType.None) {
			metalLayerColors[layer.ID] = {
				color: "#" + layerColorPalette[ind % noneLayerCount],
				attributesFunc: generateVerticalHatchAttributes,
			};
		}
	});
	return metalLayerColors;
}
