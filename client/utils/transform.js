import { Orientation } from "./enums";

// Design Rect to canvas Rect coordinates
export function convertRectCoords(
	config,
	{ XMin: minX, YMin: minY, XMax: maxX, YMax: maxY }
) {
	const x = minX * config.scaleFactorX + config.originOffsetX;
	const y = config.height - maxY * config.scaleFactorY + config.originOffsetY;
	const width = (maxX - minX) * config.scaleFactorX;
	const height = (maxY - minY) * config.scaleFactorY;
	return { x, y, width, height };
}

// Get transformed point relative to origin and orientation
export function transformPoint(point, orientation, origin) {
	const { x, y } = point;
	let transformedX = x,
		transformedY = y;
	let tempX, tempY;
	switch (orientation) {
		case Orientation.R0:
			break;
		case Orientation.R90:
			// rotate 90
			tempX = -transformedY;
			tempY = transformedX;
			transformedX = tempX;
			transformedY = tempY;
			break;
		case Orientation.R180:
			// rotate 180
			tempX = -transformedX;
			tempY = -transformedY;
			transformedX = tempX;
			transformedY = tempY;
			break;

		case Orientation.R270:
			// rotate 270
			tempX = transformedY;
			tempY = -transformedX;
			transformedX = tempX;
			transformedY = tempY;
			break;

		case Orientation.MY:
			transformedX = -transformedX;
			break;

		case Orientation.MYR90:
			transformedX = -transformedX;
			// rotate 90
			tempX = -transformedY;
			tempY = transformedX;
			transformedX = tempX;
			transformedY = tempY;
			break;

		case Orientation.MX:
			transformedY = -transformedY;
			break;

		case Orientation.MXR90:
			transformedY = -transformedY;
			// rotate 90
			tempX = -transformedY;
			tempY = transformedX;
			transformedX = tempX;
			transformedY = tempY;
			break;
	}
	const { x: offsetX, y: offsetY } = origin;
	transformedX += offsetX || 0;
	transformedY += offsetY || 0;
	return { x: transformedX, y: transformedY };
}

// Get transformed rect relative to origin and orientation
export function transformRect(rect, orientation, origin) {
	const lowerLeft = { x: rect.XMin, y: rect.YMin };
	const upperRight = { x: rect.XMax, y: rect.YMax };
	const lowerLeftTransformed = transformPoint(lowerLeft, orientation, origin);
	const upperRightTransformed = transformPoint(
		upperRight,
		orientation,
		origin
	);
	let newXMin, newYMin, newXMax, newYMax;
	if (lowerLeftTransformed.x < upperRightTransformed.x) {
		newXMin = lowerLeftTransformed.x;
		newXMax = upperRightTransformed.x;
	} else {
		newXMax = lowerLeftTransformed.x;
		newXMin = upperRightTransformed.x;
	}
	if (lowerLeftTransformed.y < upperRightTransformed.y) {
		newYMin = lowerLeftTransformed.y;
		newYMax = upperRightTransformed.y;
	} else {
		newYMax = lowerLeftTransformed.y;
		newYMin = upperRightTransformed.y;
	}

	return {
		...rect,
		XMin: newXMin,
		YMin: newYMin,
		XMax: newXMax,
		YMax: newYMax,
	};
}
