import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import cloneDeep from "clone-deep";
import { DesignContext } from "components/common/Context";
import Layout from "components/common/Layout";
import getConfig from "next/config";
import dynamic from "next/dynamic";
import GridLayout, { WidthProvider } from "react-grid-layout";
import AutoSizer from "react-virtualized-auto-sizer";
import {
	DefaultComponentsExplorer,
	DefaultLayerVisibility,
	DefaultLayout,
	DefaultViewerSettings,
} from "utils/defaults";
import {
	Direction,
	LayerType,
	MasterType,
	Orientation,
	PortDirection,
} from "utils/enums";
import { generateMetalLayerColors } from "utils/textures";
import ComponentDialog from "./ComponentDialog";
import {
	CellDialog,
	LayerDialog,
	PortDialog,
	ViaDialog,
	WireDialog,
} from "./ComponentDialogGenerator";
import ComponentsExplorerPanel from "./ComponentsExplorerPanel";
import DEFViewerPanel from "./DEFViewerPanel";
import LayerVisibilityPanel from "./LayerVisibilityPanel";
import styles from "./Viewer.styles.js";
import ViewerToolbar from "./ViewerToolbar";

const { publicRuntimeConfig } = getConfig();

const GridLayoutWithWidth = WidthProvider(GridLayout);

const useStyles = makeStyles(styles);

function Viewer(props) {
	const classes = useStyles();
	const { design, setDesign } = React.useContext(DesignContext);

	const [layerVisibility, setLayerVisibility] = React.useState(
		DefaultLayerVisibility
	);

	const [componentsExplorer, setComponentsExplorer] = React.useState(
		DefaultComponentsExplorer
	);

	const [selectedComponentName, setSelectedComponentName] = React.useState(
		null
	);

	const [settings, setSettings] = React.useState(
		Object.assign(
			cloneDeep(DefaultViewerSettings),
			JSON.parse(
				localStorage.getItem(publicRuntimeConfig.localStorageKey) ||
					"{}"
			)
		)
	);
	const [exportDialogOpen, setExportDialogOpen] = React.useState(false);
	const [exportDialogType, setExportDialogType] = React.useState("png");
	const [layout, setLayout] = React.useState(DefaultLayout);
	const [displayedComponent, setDisplayedComponent] = React.useState({
		open: false,
		title: "",
		body: "",
	});

	const layerMap = {};
	design.Layers.forEach((layer) => (layerMap[layer.ID] = layer));
	const geometryMap = {};
	design.Geometries.forEach((geom) => {
		geometryMap[geom.ID] = geom;
	});
	const viaMap = {};
	design.RoutingVias.forEach((via) => {
		viaMap[via.ID] = via;
	});
	design.ViaDefinitions.forEach((via) => {
		viaMap[via.ID] = via;
	});
	const metalLayerColors = generateMetalLayerColors(settings, design.Layers);

	const names = {
		Orientation: {},
		MasterType: {},
		LayerType: {},
		PortDirection: {},
		Direction: {},
	};
	for (let k in Orientation) {
		names.Orientation[Orientation[k]] = k;
	}
	for (let k in MasterType) {
		names.MasterType[MasterType[k]] = k;
	}
	for (let k in LayerType) {
		names.LayerType[LayerType[k]] = k;
	}
	for (let k in PortDirection) {
		names.PortDirection[PortDirection[k]] = k;
	}
	for (let k in Direction) {
		names.Direction[Direction[k]] = k;
	}

	const onChangeVisibility = (checked, layerName) => {
		setTimeout(() => {
			setLayerVisibility((current) => {
				const newVis = { ...current };
				newVis[layerName].visible = checked;
				newVis[layerName].dirty = true;
				return newVis;
			});
		}, 0);
	};
	const onResetDirtyLayers = () => {
		setLayerVisibility((current) => {
			const newVis = { ...current };
			for (let k in newVis) {
				newVis[k].dirty = false;
			}
			return newVis;
		});
	};
	const onSetDirtyLayers = () => {
		setLayerVisibility((current) => {
			const newVis = { ...current };
			for (let k in newVis) {
				newVis[k].dirty = true;
			}
			return newVis;
		});
	};
	const onLayoutChange = (layout) => {
		setLayout(layout);
	};

	/** Setup component dialog */
	const showCellDialog = (cell) => {
		setDisplayedComponent((prev) => ({
			...prev,
			open: true,
			...CellDialog(cell, names),
		}));
	};
	const showViaDialog = (via) => {
		setDisplayedComponent((prev) => ({
			...prev,
			open: true,
			...ViaDialog(via, names, layerMap),
		}));
	};
	const showWireDialog = (wire) => {
		setDisplayedComponent((prev) => ({
			...prev,
			open: true,
			...WireDialog(wire, names, geometryMap, layerMap),
		}));
	};
	const showPortDialog = (port) => {
		setDisplayedComponent((prev) => ({
			...prev,
			open: true,
			...PortDialog(port, names),
		}));
	};
	const showLayerDialog = (layer) => {
		setDisplayedComponent((prev) => ({
			...prev,
			open: true,
			...LayerDialog(layer, names, metalLayerColors, layerMap, settings),
		}));
	};
	const onCloseComponentDialog = () => {
		setDisplayedComponent((prev) => ({ ...prev, open: false }));
	};
	/** End setup component dialog */

	const viewport = React.createRef();

	return (
		<Layout>
			<div className={classes.root}>
				<ComponentDialog
					title={displayedComponent.title}
					open={displayedComponent.open}
					body={displayedComponent.body}
					onCancel={onCloseComponentDialog}
				/>
				<div className={classes.viewer}>
					<ViewerToolbar
						key="toolbar"
						componentKey="toolbar"
						design={design}
						settings={settings}
						setSettings={setSettings}
						selectedComponentName={selectedComponentName}
						setExportDialogOpen={setExportDialogOpen}
						setExportDialogType={setExportDialogType}
						setDesign={setDesign}
						onSetDirtyLayers={onSetDirtyLayers}
						viewport={viewport}
					/>
					<div style={{ height: "100%" }}>
						<AutoSizer disableWidth>
							{({ height }) => {
								const toolbarHeight = 64;
								height = height - toolbarHeight;
								return (
									<GridLayoutWithWidth
										autoSize={false}
										layout={layout}
										onLayoutChange={onLayoutChange}
										containerPadding={[0, 0]}
										margin={[0, 0]}
										rowHeight={Math.floor(height / 12)}
									>
										<LayerVisibilityPanel
											key="layers"
											componentKey="layers"
											layerVisibility={layerVisibility}
											onChangeVisibility={
												onChangeVisibility
											}
										/>
										<ComponentsExplorerPanel
											key="components"
											design={design}
											componentsExplorer={
												componentsExplorer
											}
											clickHandlers={{
												cells: showCellDialog,
												routingVias: showViaDialog,
												viaDefinitions: showViaDialog,
												wires: showWireDialog,
												ports: showPortDialog,
												layers: showLayerDialog,
											}}
										/>

										<DEFViewerPanel
											key="edaviewer"
											design={design}
											settings={settings}
											layerVisibility={layerVisibility}
											onResetDirtyLayers={
												onResetDirtyLayers
											}
											setSelectedComponentName={
												setSelectedComponentName
											}
											metalLayerColors={metalLayerColors}
											exportDialogOpen={exportDialogOpen}
											exportDialogType={exportDialogType}
											setExportDialogOpen={
												setExportDialogOpen
											}
											forwardedRef={viewport}
											showCellDialog={showCellDialog}
											showViaDialog={showViaDialog}
											showWireDialog={showWireDialog}
											showPortDialog={showPortDialog}
										/>
									</GridLayoutWithWidth>
								);
							}}
						</AutoSizer>
					</div>
				</div>
			</div>
		</Layout>
	);
}

export default dynamic(() => Promise.resolve(Viewer), {
	ssr: false,
});
