import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react"
import { useHistory, useParams } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"
import { createFileExplorer, deleteFileExplorer, fetchFileExplorer, updateFileExplorer } from "../apis"
import { addSuffixInFileName, getArrFromHierarchy, getHierarchyFromArr } from "../utils/fileSystemUtils"

const FileSystemContext = createContext()

export const useFileSystem = () => useContext(FileSystemContext)

export const FileSystemProvider = ({ children }) => {
	const { id } = useParams()
	const history = useHistory()

	const [explorer, setExplorer] = useState({ name: 'Untitled' })
	const [fileSystem, setFileSystem] = useState({
		id: "root",
		name: "Root",
		type: "folder",
		children: [],
	})
	const [deletedFiles, setDeletedFiles] = useState([])
	const [selectedFile, setSelectedFile] = useState(null)

	const handleExplorerRes = (res) => {
		setExplorer(res.data)
		const initialData = res.data.files
		if (initialData && initialData.length > 0) {
			setFileSystem(getHierarchyFromArr(initialData))
		}
		return res
	}

	useEffect(() => {
		if (id) {
			fetchFileExplorer(id).then(handleExplorerRes).catch(res => {
				history.push(`/${window.root_url}`)
			})
		}
	}, [id])

	const createExplorer = useCallback((name) => {
		const filesArr = getArrFromHierarchy(fileSystem)
		const stringifiedFiles = JSON.stringify(filesArr)
		const data = {
			name,
			files: stringifiedFiles,
		}
		return createFileExplorer(data).then(res => {
			history.push(`/${window.root_url}/${res.data.gid}`)
		})
	}, [fileSystem])

	const updateExplorer = useCallback((name) => {
		const data = {}
		if (name) data.name = name
		const filesArr = getArrFromHierarchy(fileSystem)
		data.files = JSON.stringify(filesArr)
		return updateFileExplorer(explorer.gid, data).then(handleExplorerRes)
	}, [fileSystem, explorer])

	const deleteExplorer = useCallback(() => {
		return deleteFileExplorer(explorer.gid).then(() => {
			history.push(`/${window.root_url}`)
		})
	}, [explorer])

	const findNode = useCallback(
		(id, node = fileSystem, includeDeleted = false) => {
			if (node.id === id && (includeDeleted || !node.deleted)) return node
			if (node.children) {
				for (let child of node.children) {
					if (includeDeleted || !child.deleted) {
						const found = findNode(id, child, includeDeleted)
						if (found) return found
					}
				}
			}
			return null
		},
		[fileSystem]
	)

	const createNodeAtPath = useCallback((path, isFile = true) => {
		const pathParts = path.split("/").filter((part) => part.trim() !== "")
		let fileName = isFile ? pathParts.pop() : null
		const recoveredIds = []
		let newDeletedFiles = {}
		const pushActions = []
		const assignActions = []
		let createFile = true

		setFileSystem((prevSystem) => {
			const updatedSystem = { ...prevSystem }
			let currentNode = updatedSystem

			pathParts.forEach((part) => {
				let foundIndex = currentNode.children.findIndex(
					(c) => c.name === part && c.type === "folder"
				)
				let child
				if (foundIndex === -1) {
					child = {
						id: uuidv4(),
						name: part,
						type: "folder",
						children: [],
						isExpanded: true,
						deleted: false,
						isNew: true,
						path,
					}
					pushActions.push([currentNode.children, child])
				} else {
					child = currentNode.children[foundIndex]
					assignActions.push([currentNode.children[foundIndex], { ...child, deleted: false }])
					recoveredIds.push(child.id)
				}
				currentNode = child
			})

			if (isFile) {
				const foundFileIndex = currentNode.children.findIndex(
					(child) => child.name === fileName
				)
				if (foundFileIndex !== -1) {
					const foundFile = { ...currentNode.children[foundFileIndex] }
					if (foundFile.deleted) {
						const deletedFileName = addSuffixInFileName(
							foundFile.name,
							"(Deleted)"
						)
						assignActions.push([currentNode.children[foundFileIndex], {
							...foundFile,
							name: deletedFileName,
						}])
						newDeletedFiles[foundFile.id] = deletedFileName
					} else {
						createFile = false
					}
				}
				pushActions.push([currentNode.children, {
					id: uuidv4(),
					name: fileName,
					type: "file",
					content: " ",
					isNew: true,
					deleted: false,
					path
				}])
			}
			if (createFile) {
				for (let i = 0; i < pushActions.length; i++) {
					pushActions[i][0].push(pushActions[i][1])
				}
				for (let i = 0; i < assignActions.length; i++) {
					assignActions[i][0] = assignActions[i][1]
				}
			}
			return updatedSystem
		})
		if (createFile) {
			setDeletedFiles((prevFiles) => {
				const newFiles = prevFiles.filter((f) => !recoveredIds.includes(f.id))
				return newFiles.map((f) =>
					newDeletedFiles[f.id]
						? {
							...f,
							name: newDeletedFiles[f.id],
						}
						: f
				)
			})
		} else {
			alert(`${isFile ? 'File' : 'Folder'} already exist`)
		}
	}, [])

	const addFile = useCallback(
		(basePath = "") => {
			const fileName = window.prompt(
				"Enter the name for the new file:",
				"New File"
			)
			if (fileName) {
				const fullPath = basePath ? `${basePath}/${fileName}` : fileName
				createNodeAtPath(fullPath, true)
			}
		},
		[createNodeAtPath]
	)

	const addFolder = useCallback(
		(basePath = "") => {
			const folderName = window.prompt(
				"Enter the name for the new folder:",
				"New Folder"
			)
			if (folderName) {
				const fullPath = basePath ? `${basePath}/${folderName}` : folderName
				createNodeAtPath(fullPath, false)
			}
		},
		[createNodeAtPath]
	)

	const deleteNode = useCallback((id) => {
		let deletedNode
		setFileSystem((prevSystem) => {
			const updatedSystem = { ...prevSystem }
			const deleteRecursive = (node, path = "") => {
				let foundIndex = -1
				node.children.forEach((child, index) => {
					if (foundIndex !== -1) return
					if (child.id === id) {
						foundIndex = index
					} else if (child.type === "folder") {
						deleteRecursive(child, path ? `${path}/${child.name}` : child.name)
					}
				})
				if (foundIndex !== -1) {
					node.children[foundIndex] = {
						...node.children[foundIndex],
						deleted: true,
					}
					deletedNode = {
						name: node.children[foundIndex].name,
						id: node.children[foundIndex].id,
						path,
					}
				}
			}
			deleteRecursive(updatedSystem)
			return updatedSystem
		})
		if (deletedNode) {
			setDeletedFiles((prev) => [...prev, deletedNode])
		}
	}, [])

	const recoverFile = useCallback(
		(id) => {
			const fileToRecover = deletedFiles.find((file) => file.id === id)
			if (fileToRecover) {
				const fileIdToRecover = [fileToRecover.id]
				setFileSystem((prevSystem) => {
					const updatedSystem = { ...prevSystem }
					let parts = fileToRecover.path.split("/")
					parts.push(fileToRecover.name)
					parts = parts.filter((part) => part.trim() !== "")
					let currentLevel = updatedSystem
					for (let i = 0; i < parts.length; i++) {
						const part = parts[i]
						const index = currentLevel.children.findIndex(
							(child) => child.name === part
						)
						currentLevel.children[index] = {
							...currentLevel.children[index],
							deleted: false,
						}
						fileIdToRecover.push(currentLevel.children[index].id)
						currentLevel = currentLevel.children[index]
					}
					return updatedSystem
				})

				setDeletedFiles((prev) =>
					prev.filter((file) => !fileIdToRecover.includes(file.id))
				)
			}
		},
		[deletedFiles]
	)

	const updateFileContent = useCallback((id, newContent) => {
		setFileSystem((prevSystem) => {
			const updatedSystem = { ...prevSystem }
			const updateNodeContent = (node) => {
				if (node.id === id) {
					if (!node.originalContent) {
						node.originalContent = node.content
					}
					node.content = newContent
					node.isModified = node.content !== node.originalContent
					return true
				}
				if (node.children) {
					for (let child of node.children) {
						if (updateNodeContent(child)) {
							return true
						}
					}
				}
				return false
			}
			updateNodeContent(updatedSystem)
			return updatedSystem
		})
	}, [])

	const renameFile = useCallback((id, name) => {
		setFileSystem((prevSystem) => {
			const updatedSystem = { ...prevSystem }
			const updateNodeContent = (node) => {
				if (node.id === id) {
					node.name = name
					const pathArr = node.path.split("/")
					pathArr.pop()
					pathArr.push(name)
					node.path = pathArr.join("/")
					return true
				}
				if (node.children) {
					for (let child of node.children) {
						if (updateNodeContent(child)) {
							return true
						}
					}
				}
				return false
			}
			updateNodeContent(updatedSystem)
			return updatedSystem
		})
	}, [])

	const isFileModified = useCallback(
		(id) => {
			const file = findNode(id)
			return file ? file.isModified : false
		},
		[findNode]
	)

	const resetFileContent = useCallback((id) => {
		setFileSystem((prevSystem) => {
			const updatedSystem = { ...prevSystem }
			const resetNodeContent = (node) => {
				if (node.id === id) {
					if (node.originalContent) {
						node.content = node.originalContent
						node.isModified = false
						delete node.originalContent
					}
					return true
				}
				if (node.children) {
					for (let child of node.children) {
						if (resetNodeContent(child)) {
							return true
						}
					}
				}
				return false
			}
			resetNodeContent(updatedSystem)
			return updatedSystem
		})
	}, [])

	const toggleNode = useCallback(
		(id, state) => {
			setFileSystem((prevSystem) => {
				const updatedSystem = { ...prevSystem }
				const node = findNode(id, updatedSystem)
				if (node && node.type === "folder") {
					node.isExpanded = !state
				}
				return updatedSystem
			})
		},
		[findNode]
	)

	const selectNode = useCallback(
		(id, type) => {
			if (type === "file") setSelectedFile(findNode(id, fileSystem, true))
		},
		[findNode]
	)

	const value = {
		fileSystem,
		addFile,
		addFolder,
		deleteNode,
		updateFileContent,
		selectNode,
		toggleNode,
		deletedCount: deletedFiles.length,
		deletedFiles,
		recoverFile,
		selectedFile,
		isFileModified,
		resetFileContent,
		renameFile,
		createExplorer,
		updateExplorer,
		deleteExplorer,
		explorer,
	}

	return (
		<FileSystemContext.Provider value={value}>
			{children}
		</FileSystemContext.Provider>
	)
}

export default FileSystemContext
