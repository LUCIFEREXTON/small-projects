import React, { useCallback, useState } from "react"

const FileTreeNode = ({
	node,
	onAddFile,
	onAddFolder,
	onDelete,
	onToggle,
	onSelect,
	onDiffSelect,
	isModified,
	renameFile,
	onSelectForComparison,
}) => {
	const [contextMenuPosition, setContextMenuPosition] = useState(null)

	const handleContextMenu = useCallback((event) => {
		event.preventDefault()
		setContextMenuPosition({ x: event.clientX, y: event.clientY })
	}, [])

	const handleCloseContextMenu = useCallback(() => {
		setContextMenuPosition(null)
	}, [])

	const handleAddFile = useCallback(
		(e) => {
			e.stopPropagation()
			onAddFile(node.path)
			handleCloseContextMenu()
		},
		[node.path, onAddFile]
	)

	const handleAddFolder = useCallback(
		(e) => {
			e.stopPropagation()
			onAddFolder(node.path)
			handleCloseContextMenu()
		},
		[node.path, onAddFolder]
	)

	const handleDelete = useCallback(
		(e) => {
			e.stopPropagation()
			onDelete(node.id)
			handleCloseContextMenu()
		},
		[node.id, onDelete]
	)

	const handleSelect = useCallback(
		(e) => {
			e.stopPropagation()
			if (node.type === "file") {
				onSelect(node.id, node.type)
			} else {
				onToggle(node.id, node.isExpanded)
			}
			handleCloseContextMenu()
		},
		[node.id, node.type, node.isExpanded, onSelect, onToggle]
	)

	const handleDiffSelect = useCallback(
		(e) => {
			e.stopPropagation()
			onDiffSelect(node)
			handleCloseContextMenu()
		},
		[node.id, onDiffSelect]
	)

	const handleSelectForDiff = useCallback(
		(e) => {
			e.stopPropagation()
			onSelectForComparison(node)
			handleCloseContextMenu()
		},
		[onSelectForComparison]
	)

	const handleRename = useCallback(() => {
		const name = window.prompt("What you want to name this")
		if (name) {
			renameFile(node.id, name)
		}
	}, [node.id, renameFile])

	if (node.deleted) return null

	return (
		<div
			className={`file-tree-node ${node.type} ${node.isExpanded ? "expanded" : ""
			} ${isModified ? "modified" : ""}`}
			onContextMenu={handleContextMenu}
			onClick={handleSelect}
		>
			<div className="node-content">
				<span className="icon" onClick={handleSelect}>
					{node.type === "folder" ? (node.isExpanded ? "📂" : "📁") : "📄"}
				</span>
				<span className="name">{node.name}</span>
			</div>
			{node.type === "folder" && node.isExpanded && node.children && (
				<div className="children">
					{node.children.map((childNode) => (
						<FileTreeNode
							key={childNode.id}
							node={childNode}
							onAddFile={onAddFile}
							onAddFolder={onAddFolder}
							onDelete={onDelete}
							onToggle={onToggle}
							onSelect={onSelect}
							onDiffSelect={onDiffSelect}
							isModified={isModified}
							renameFile={renameFile}
						/>
					))}
				</div>
			)}
			{contextMenuPosition && (
				<div
					className="context-menu"
					style={{
						position: "fixed",
						top: contextMenuPosition.y,
						left: contextMenuPosition.x,
					}}
				>
					<button onClick={handleRename}>Rename</button>
					{node.type === "folder" && (
            <>
              <button onClick={handleAddFile}>Add File</button>
              <button onClick={handleAddFolder}>Add Folder</button>
            </>
					)}
					<button onClick={handleDelete}>Delete</button>
					{isModified && node.type === "file" && (
						<button onClick={handleDiffSelect}>Show Diff</button>
					)}
					<button onClick={handleSelectForDiff}>Compare</button>
				</div>
			)}
			{contextMenuPosition && (
				<div
					className="context-menu-overlay"
					onClick={handleCloseContextMenu}
				/>
			)}
		</div>
	)
}

export default FileTreeNode
