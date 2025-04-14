import { generateId } from "./fileSystemUtils"

export const fetchFileSystem = () => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve([
				{ id: generateId(), dir: "build", type: "folder" },
				{
					id: generateId(),
					dir: "package.json",
					type: "file",
					content:
            '{\n  "name": "file-tree",\n  "version": "1.0.0",\n  "description": "",\n  "main": "index.js",\n  "scripts": {\n    "start": "react-scripts start",\n    "build": "react-scripts build",\n    "test": "react-scripts test",\n    "eject": "react-scripts eject"\n  },\n  "keywords": [],\n  "author": "",\n  "license": "ISC",\n  "dependencies": {\n    "react": "^16.13.1",\n    "react-dom": "^16.13.1",\n    "react-scripts": "3.4.1"\n  },\n  "devDependencies": {}\n}\n',
				},
				{ id: generateId(), dir: "src/hooks", type: "folder" },
				{
					id: generateId(),
					dir: "src/components/FileTree.js",
					type: "file",
					content:
            'import React from "react";\nimport FileTreeNode from "./FileTreeNode";\n\nconst FileTree = ({ data }) => {\n  return (\n    <div>\n      {data.map((node) => (\n        <FileTreeNode key={node.id} node={node} />\n      ))}\n    </div>\n  );\n};\n\nexport default FileTree;\n',
				},
				{
					id: generateId(),
					dir: "src/components/FileTreeNode.js",
					type: "file",
					content:
            'import React from "react";\nimport FileTree from "./FileTree";\n\nconst FileTreeNode = ({ node }) => {\n  return (\n    <div>\n      {node.type === "folder" ? (\n        <div>\n          <div>{node.name}</div>\n          <FileTree data={node.children} />\n        </div>\n      ) : (\n        <div>{node.name}</div>\n      )}\n    </div>\n  );\n};\n\nexport default FileTreeNode;\n',
				},
				{
					id: generateId(),
					dir: "src/components/common/utils.js",
					type: "file",
					content:
            'export const getHierarchyFromArr = (arr) => {\n  const pathArrByPath = _.reduce(arr, (acc, dir) => {\n    const pathArr = dir.dir.split("/");\n    acc[dir.dir] = pathArr;\n    return acc;\n  }, {});\n\n  const pathDetailByPath = _.keyBy(arr, "dir");\n  const root = {\n    name: "root",\n    children: [],\n    type: "folder"\n  };\n\n  const createHierarchy = (pathArr, level = 0, node = root, dir = "") => {\n    if (pathArr.length === 1 && pathArr[0] === dir) return;\n    const groupByFolder = _.groupBy(pathArr, (dir) => pathArrByPath[dir][level]);\n    _.keys(groupByFolder).forEach((key) => {\n      const childPath = dir ? `${dir}/${key}` : key;\n      let child = {\n        name: key,\n        dir: childPath,\n      };\n      if (pathDetailByPath[child.dir]) {\n        child = { ...child, ...pathDetailByPath[child.dir] };\n      }\n      if (child.type !== "file") {\n        child.type = "folder";\n        child.children = [];\n        createHierarchy(groupByFolder[key], level + 1, child, childPath);\n      }\n      node.children.push(child);\n    });\n  };\n\n  createHierarchy(_.keys(pathArrByPath));\n  return root;\n};\n',
				},
				{
					id: generateId(),
					dir: "src/App.js",
					type: "file",
					content:
            'import React from "react";\nimport FileTree from "./components/FileTree";\nimport { data } from "./data";\n\nfunction App() {\n  return (\n    <div className="App">\n      <FileTree data={data} />\n    </div>\n  );\n}\n\nexport default App;\n',
				},
				{
					id: generateId(),
					dir: "src/index.js",
					type: "file",
					content:
            'import React from "react";\nimport ReactDOM from "react-dom";\nimport "./index.css";\nimport App from "./App";\nimport * as serviceWorker from "./serviceWorker";\n\nReactDOM.render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n  document.getElementById("root")\n);\n\nserviceWorker.unregister();\n',
				},
				{
					id: generateId(),
					dir: "public/index.html",
					type: "file",
					content:
            '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8" />\n    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    <meta name="theme-color" content="#000000" />\n    <meta\n      name="description"\n      content="Web site created using create-react-app"\n    />\n    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />\n    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />\n    <title>React App</title>\n  </head>\n  <body>\n    <noscript>You need to enable JavaScript to run this app.</noscript>\n    <div id="root"></div>\n  </body>\n</html>\n',
				},
				{
					id: generateId(),
					dir: "public/favicon.ico",
					type: "file",
					content: "favicon.ico",
				},
			])
		}, 1000) // Simulate a 1-second delay
	})
}
