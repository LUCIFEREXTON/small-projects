import { v4 as uuidv4 } from "uuid"
import _ from "lodash"

// Generate a unique ID for a new node
export const generateId = () => uuidv4()

export const addSuffixInFileName = (fileName, suffix) => {
	const fileParts = fileName.split(".")
	if (fileParts.length > 1) {
		const ext = fileParts.pop()
		return `${fileParts.join(".")}${suffix}.${ext}`
	}
	return `${fileName}${suffix}`
}

export const getHierarchyFromArr = (arr) => {
	const pathArrByPath = _.reduce(
		arr,
		(acc, path) => {
			const pathArr = path.dir.split("/")
			acc[path.dir] = pathArr
			return acc
		},
		{}
	)

	const pathDetailByPath = _.keyBy(arr, "dir")
	const root = {
		id: "root",
		name: "root",
		children: [],
		type: "folder",
	}

	const createHierarchy = (pathArr, level = 0, node = root, path = "") => {
		if (pathArr.length === 1 && pathArr[0] === path) return
		const groupByFolder = _.groupBy(
			pathArr,
			(path) => pathArrByPath[path][level]
		)
		_.keys(groupByFolder).forEach((key) => {
			const childPath = path ? `${path}/${key}` : key
			let child = {
				name: key,
				path: childPath,
			}
			if (pathDetailByPath[child.path]) {
				child = { ...child, ...pathDetailByPath[child.path] }
			}
			if (child.type !== "file") {
				child.type = "folder"
				child.children = []
				createHierarchy(groupByFolder[key], level + 1, child, childPath)
			}
			if (!child.id) {
				child.id = generateId()
			}
			node.children.push(child)
		})
	}

	createHierarchy(_.keys(pathArrByPath))
	return root
}

export const getArrFromHierarchy = (hierarchy) => {
	const files = []

	const traverseHierarchy = (node, parentPath = '') => {
		const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name

		if (node.type === 'file') {
			files.push({
				id: node.id,
				name: node.name,
				dir: currentPath,
				type: 'file',
				content: node.content,
			})
		} else if (node.type === 'folder' && node.children) {
			node.children.forEach(child => traverseHierarchy(child, currentPath))
		}
	}

	hierarchy.children.forEach(child => traverseHierarchy(child))

	return files
}
