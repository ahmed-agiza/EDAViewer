import React from "react";
import getConfig from "next/config";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import Paper from "@material-ui/core/Paper";
import Switch from "@material-ui/core/Switch";
import Draggable from "react-draggable";
import { DefaultViewerSettings } from "utils/defaults";

const { publicRuntimeConfig } = getConfig();

function PaperComponent(props) {
	return (
		<Draggable
			handle="#draggable-dialog-title"
			cancel={'[class*="MuiDialogContent-root"]'}
		>
			<Paper {...props} />
		</Draggable>
	);
}

export default function SettingsDialog(props) {
	const {
		open,
		onClose,
		settings: initialSettings,
		setSettings: saveSettings,
		onSetDirtyLayers,
	} = props;
	const [settings, setSettings] = React.useState(
		Object.assign({}, initialSettings, { dirty: false })
	);
	const [persist, setPersist] = React.useState(false);
	const saveAndClose = () => {
		const dirty = settings.dirty;
		delete settings.dirty;
		if (dirty) {
			saveSettings(settings);
			setTimeout(() => onSetDirtyLayers());
		}
		if (persist) {
			localStorage.setItem(
				publicRuntimeConfig.localStorageKey,
				JSON.stringify(settings)
			);
		}
		onClose();
	};
	const onResetSettings = () => {
		setSettings({ ...DefaultViewerSettings, dirty: true });
	};

	const colorControlsOptions = [
		{
			key: "cell",
			name: "Cell Color",
			innerKey: "fill",
			title: "Cell fill color",
		},
		{
			key: "port",
			name: "Port Color",
			innerKey: "fill",
			title: "Top-level port fill color",
		},
		{
			key: "row",
			name: "Row Color",
			innerKey: "stroke",
			title: "Placement row stroke color",
		},
		{
			key: "gcell",
			name: "G-Cell Color",
			innerKey: "stroke",
			title: "G-Cell stroke color",
		},
		{
			key: "text",
			name: "Text Color",
			innerKey: "fill",
			title: "Components labels text color",
		},
	];
	const colorControls = colorControlsOptions.map((ctrl, ind) => (
		<React.Fragment key={ctrl.name + ind}>
			<FormControl>
				<InputLabel htmlFor={`${ctrl.name}-color`}>
					{ctrl.name}
				</InputLabel>
				<Input
					id={`${ctrl.name}-color`}
					type="color"
					value={settings.shapes[ctrl.key][ctrl.innerKey]}
					aria-describedby={`${ctrl.name}-color-helper-tex`}
					title={ctrl.title || ctrl.name}
					onChange={(evt) => {
						const color = evt.target.value;
						setSettings((prev) => {
							return {
								...prev,
								shapes: {
									...prev.shapes,
									[ctrl.key]: {
										...prev.shapes[ctrl.key],
										[ctrl.innerKey]: color,
									},
								},
								dirty: true,
							};
						});
					}}
				/>
			</FormControl>
			<br />
		</React.Fragment>
	));
	const toggleControlsOptions = [
		{
			name: "Display component names",
			key: "displayNames",
		},
		{
			name: "Display viewport borders",
			key: "viewportBorder",
		},
		{
			name: "Disable port direction indicators",
			key: "disablePortIndicators",
		},
		{
			name: "Disable metal layer patterns",
			key: "renderSimpleWireShapes",
		},
	];
	const toggleControls = toggleControlsOptions.map((ctrl, ind) => (
		<FormControlLabel
			key={ind}
			control={
				<Switch
					checked={settings[ctrl.key]}
					name={ctrl.name}
					color="primary"
					onChange={(evt) => {
						const checked = evt.target.checked;
						setSettings((prev) => {
							return {
								...prev,
								[ctrl.key]: checked,
								dirty: true,
							};
						});
					}}
				/>
			}
			label={ctrl.name}
		/>
	));

	return (
		<div>
			<Dialog
				open={open}
				onClose={onClose}
				PaperComponent={PaperComponent}
				aria-labelledby="draggable-dialog-title"
			>
				<DialogTitle style={{ cursor: "move" }}>Settings</DialogTitle>
				<DialogContent>
					<FormGroup>
						{colorControls}
						{toggleControls}
						<FormControlLabel
							control={
								<Switch
									checked={persist}
									name={"Persist settings for future designs"}
									color="primary"
									onChange={(evt) => {
										const checked = evt.target.checked;
										setPersist(checked);
									}}
								/>
							}
							label={"Persist settings for future designs"}
						/>
					</FormGroup>
				</DialogContent>
				<DialogActions>
					<Button autoFocus onClick={onClose} color="primary">
						Cancel
					</Button>
					<Button autoFocus onClick={onResetSettings} color="primary">
						Reset Defaults
					</Button>
					<Button onClick={saveAndClose} color="primary">
						Save
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
