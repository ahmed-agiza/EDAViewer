/** Database Enums, corresponds to server/opendb/opendb.go */
export const PortDirection = {
	Input: 0,
	Output: 1,
	InOut: 2,
	FeedThru: 3,
};

export const Orientation = {
	R0: 0,
	R90: 1,
	R180: 2,
	R270: 3,
	MY: 4,
	MYR90: 5,
	MX: 6,
	MXR90: 7,
};

export const LayerType = {
	Routing: 0,
	Cut: 1,
	Masterslice: 2,
	Overlap: 3,
	Implant: 4,
	None: 5,
};

export const Direction = {
	None: 0,
	Horizontal: 1,
	Vertical: 2,
};

export const MasterType = {
	Block: 0,
	Core: 1,
	Pad: 2,
	Endcap: 3,
};

// This is enum is only defines for rendering
export const ChipSide = {
	Top: 0,
	Right: 1,
	Bottom: 2,
	Left: 3,
};
