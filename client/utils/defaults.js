import ViaIcon from "@material-ui/icons/BorderVertical";
import LayersIcon from "@material-ui/icons/Layers";
import WireIcon from "@material-ui/icons/LinearScale";
import SiteIcon from "@material-ui/icons/SelectAll";
import ViaDefIcon from "@material-ui/icons/SettingsEthernet";
import PortIcon from "@material-ui/icons/TabUnselected";
import CellIcon from "@material-ui/icons/ViewAgenda";
import RowsIcon from "@material-ui/icons/ViewHeadline";

export const DefaultLayerVisibility = {
	cells: { name: "Cells", visible: true, index: 0, dirty: false },
	ports: { name: "Ports", visible: true, index: 1, dirty: false },
	wires: { name: "Wires", visible: true, index: 2, dirty: false },
	vias: { name: "Vias", visible: true, index: 3, dirty: false },
	tracks: {
		name: "Tracks",
		visible: false,
		index: 4,
		disabled: false,
		dirty: false,
	},
	rows: {
		name: "Rows",
		visible: false,
		index: 5,
		disabled: false,
		dirty: false,
	},
	gcells: {
		name: "G-Cells",
		visible: false,
		index: 6,
		disabled: false,
		dirty: false,
	},
	specialWires: {
		name: "Special Wires",
		visible: false,
		index: 7,
		disabled: false,
		dirty: false,
	},
	cellShapes: {
		name: "Cell Shapes",
		visible: false,
		index: 8,
		dirty: false,
	},
};

export const DefaultComponentsExplorer = {
	sites: {
		name: "Sites",
		key: "Sites",
		index: 0,
		childrenKey: "Name",
		icon: <SiteIcon />,
	},
	ports: {
		name: "Ports",
		key: "BlockPins",
		index: 1,
		childrenKey: "Name",
		icon: <PortIcon />,
	},
	cells: {
		name: "Cells",
		key: "Instances",
		index: 2,
		childrenKey: (child) => `${child.Name} (${child.Master})`,
		icon: <CellIcon />,
	},
	wires: {
		name: "Wires",
		key: "Nets",
		index: 3,
		childrenKey: "Name",
		icon: <WireIcon />,
	},
	routingVias: {
		name: "Routing Vias",
		key: "RoutingVias",
		index: 4,
		childrenKey: "Name",
		icon: <ViaIcon />,
	},
	viaDefinitions: {
		name: "Via Definitions",
		key: "ViaDefinitions",
		index: 5,
		childrenKey: "Name",
		icon: <ViaDefIcon />,
	},
	rows: {
		name: "Rows",
		key: "Rows",
		index: 6,
		expanded: true,
		childrenKey: "Name",
		icon: <RowsIcon />,
	},
	layers: {
		name: "Metal Layers",
		key: "Layers",
		index: 7,
		expanded: true,
		childrenKey: "Name",
		icon: <LayersIcon />,
	},
};

export const DefaultLayout = [
	// {
	// 	i: "toolbar",
	// 	x: 0,
	// 	y: 0,
	// 	w: 12,
	// 	h: 1,
	// 	static: true,
	// 	isDraggable: false,
	// 	isResizable: true,
	// },
	{
		i: "layers",
		x: 10,
		y: 0,
		w: 2,
		h: 6,
		isDraggable: false,
		isResizable: true,
	},
	{
		i: "components",
		x: 10,
		y: 6,
		w: 2,
		h: 6,
		isDraggable: false,
		isResizable: true,
	},
	{
		i: "edaviewer",
		x: 0,
		y: 0,
		w: 10,
		h: 12,
		isDraggable: false,
		isResizable: true,
	},
];

export const DefaultViewerSettings = {
	shapes: {
		chip: {
			stroke: "black",
			strokeWidth: 2,
			fill: "#ffffff",
		},
		cell: {
			fill: "#cccccc",
			stroke: "black",
			opacity: 1.0,
			strokeWidth: 1,
		},
		pinShape: {
			opacity: 0.7,
			strokeWidth: 1,
		},
		obstruction: {
			opacity: 0.7,
			strokeWidth: 1,
		},
		port: {
			fill: "#ffff00",
			stroke: "black",
			opacity: 1.0,
			strokeWidth: 1,
		},
		wire: {
			stroke: "black",
			opacity: 0.9,
			strokeWidth: 1,
		},
		via: {
			opacity: 1.0,
			strokeWidth: 1,
			hatchSquareLength: 1,
		},
		row: {
			stroke: "#b4b4b4",
			strokeWidth: 1,
		},
		gcell: {
			stroke: "#19ab1e",
			strokeWidth: 2,
		},
		track: {
			strokeWidth: 1,
		},
		text: {
			fill: "#000000",
			fontSize: "12px",
			padding: 2,
		},
		layer: {
			hatchLineThickness: 1,
		},
	},
	displayNames: true,
	disablePortIndicators: true,
	portIndicatorExtension: 8,
	sameColorConsecutiveLayers: false,
	sortLayerBottomToTop: true,
	viewportBorder: true,
	renderSimpleWireShapes: false,
	transparentBackground: false,
	doubleClickTimeout: 500, //ms
	scaleStepFactor: 1.1,
	layerColorPalette: "cb-Spectral",
	mastersliceLayerColorPalette: "rainbow",
};
