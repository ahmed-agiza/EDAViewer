import React from "react";
import Collapse from "@material-ui/core/Collapse";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import { makeStyles } from "@material-ui/core/styles";
import InputField from "components/common/InputField";
import ClearIcon from "@material-ui/icons/Clear";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import InfoIcon from "@material-ui/icons/InfoOutlined";
import SearchIcon from "@material-ui/icons/Search";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeTree as Tree } from "react-vtree";
import styles from "./Viewer.styles";

const useStyles = makeStyles(styles);

function treeWalker(design, componentsExplorer, searchQuery) {
	const componentsKeys = Object.keys(componentsExplorer).sort(
		(k1, k2) => componentsExplorer[k2].index - componentsExplorer[k1].index
	);
	return function* (refresh) {
		const stack = componentsKeys.map((key) => ({
			icon: componentsExplorer[key].icon,
			nestingLevel: 0,
			id: key,
			parentId: null,
			name:
				componentsExplorer[key].name +
				` (${
					searchQuery
						? "*"
						: design[componentsExplorer[key].key].length
				})`,
			node: componentsExplorer[key],
		}));

		while (stack.length !== 0) {
			const el = stack.pop();
			const children = design[el.node.key] || [];
			const { id, name, nestingLevel, isHeader, parentId, node } = el;

			const isOpened = yield refresh
				? {
						id,
						isLeaf: children.length === 0,
						isOpenByDefault: false,
						name,
						nestingLevel,
						icon: el.icon,
						isHeader,
						parentId,
						node,
				  }
				: id;

			if (children.length !== 0 && isOpened) {
				for (let i = children.length - 1; i >= 0; i--) {
					if (
						!searchQuery ||
						children[i].Name.search(searchQuery.trim()) > -1
					) {
						stack.push({
							nestingLevel: nestingLevel + 1,
							node: children[i],
							id: id + "_" + children[i].ID,
							name:
								typeof el.node.childrenKey === "function"
									? el.node.childrenKey(children[i])
									: children[i][el.node.childrenKey],
							icon: children[i].icon,
							parentId: id,
							isHeader: false,
						});
					}
				}
			}
		}
	};
}
export default function ComponentsExplorerPanel(props) {
	const classes = useStyles();

	const {
		componentKey,
		style,
		className,
		onMouseDown,
		onMouseUp,
		onTouchEnd,
		design,
		componentsExplorer,
		clickHandlers,
	} = props;

	const Node = ({
		data: {
			isLeaf,
			name,
			nestingLevel,
			isHeader,
			icon,
			infoIcon,
			node,
			parentId,
		},
		isOpen,
		style,
		toggle,
	}) => {
		if (isHeader) {
			return (
				<ListSubheader style={style} component="div">
					{name}
				</ListSubheader>
			);
		}
		const clickHandlerAttrs = {};
		if (parentId && clickHandlers[parentId]) {
			clickHandlerAttrs["onDoubleClick"] = () =>
				clickHandlers[parentId](node);
		}
		return (
			<ListItem
				button
				dense
				{...clickHandlerAttrs}
				style={{
					...style,
					alignItems: "center",
					display: "flex",
					paddingLeft: 10 + nestingLevel * 15 + (isLeaf ? 24 : 0),
				}}
				onClick={toggle}
				title={name}
			>
				{icon && <ListItemIcon>{icon}</ListItemIcon>}
				<ListItemText primary={name} />
				{!isLeaf && (isOpen ? <ExpandLess /> : <ExpandMore />)}
				{isLeaf && infoIcon && (
					<IconButton
						edge="end"
						aria-label="view-more"
						className={classes.infoIcon}
					>
						<InfoIcon fontSize="small" />
					</IconButton>
				)}
			</ListItem>
		);
	};
	const [searchExpanded, setSearchExpanded] = React.useState(false);
	const [searhQuery, setSearchQuery] = React.useState("");
	const onSearchChange = (e) => {
		setSearchQuery(e.target.value);
	};
	const onSearchClicked = () => {
		setSearchExpanded((prev) => {
			if (prev) {
				setSearchQuery("");
			}
			return !prev;
		});
	};
	return (
		<div
			key={componentKey}
			className={`${classes.panelComponents} ${className}`}
			style={style}
			onMouseDown={onMouseDown}
			onMouseUp={onMouseUp}
			onTouchEnd={onTouchEnd}
		>
			<Divider className={classes.panelSeperator} />
			<Divider className={classes.panelSeperator} />
			<ListSubheader className={classes.componentsExplorerHeader}>
				<span style={{ userSelect: "none" }}>Design Components</span>
				{!searchExpanded && (
					<IconButton
						edge="end"
						aria-label="search"
						onClick={onSearchClicked}
						title={"Find component"}
					>
						<SearchIcon />
					</IconButton>
				)}
			</ListSubheader>
			<Collapse in={searchExpanded} timeout="auto" unmountOnExit>
				<div className={classes.componentsExplorerSearch}>
					<InputField
						formControlProps={{
							className: classes.componentsExplorerSearchField,
						}}
						inputProps={{
							placeholder: "Search…",
							"aria-label": "search",
							value: searhQuery,
							onChange: onSearchChange,
						}}
					/>
					{searchExpanded && (
						<IconButton
							edge="end"
							aria-label="close search"
							onClick={onSearchClicked}
							title={"Close search"}
						>
							<ClearIcon />
						</IconButton>
					)}
				</div>
			</Collapse>
			<AutoSizer>
				{({ height, width }) => {
					return (
						<Tree
							treeWalker={treeWalker(
								design,
								componentsExplorer,
								searhQuery
							)}
							itemSize={40}
							height={height}
							width={width}
							style={{
								willChange: "unset",
							}}
						>
							{Node}
						</Tree>
					);
				}}
			</AutoSizer>
		</div>
	);
}
